import prisma from '../config/database';
import redis from '../config/redis';
import {
  generateShortCode,
  isValidUrl,
  normalizeUrl,
  isValidCustomAlias,
  isMaliciousDomain,
} from '../utils/url.utils';
import bcrypt from 'bcrypt';

export interface CreateUrlDto {
  url: string;
  customAlias?: string;
  expiresAt?: string;
  password?: string;
  userId?: string;
}

export class UrlService {
  async createShortUrl(data: CreateUrlDto) {
    const { url, customAlias, expiresAt, password } = data;

    if (!isValidUrl(url)) throw new Error('Invalid URL provided');
    if (isMaliciousDomain(url)) throw new Error('Malicious domain detected');

    const normalizedUrl = normalizeUrl(url);

    let shortCode: string;
    if (customAlias) {
      if (!isValidCustomAlias(customAlias)) {
        throw new Error('Invalid custom alias. Must be 3-20 characters (alphanumeric, - and _)');
      }
      const existing = await prisma.url.findUnique({ where: { shortCode: customAlias } });
      if (existing) throw new Error('Custom alias already taken');
      shortCode = customAlias;
    } else {
      shortCode = generateShortCode();
      let attempts = 0;
      while (await this.shortCodeExists(shortCode) && attempts < 5) {
        shortCode = generateShortCode();
        attempts++;
      }
    }

    let passwordHash: string | undefined;
    if (password) passwordHash = await bcrypt.hash(password, 10);

    const urlRecord = await prisma.url.create({
      data: {
        shortCode,
        originalUrl: normalizedUrl,
        userId: null, // без авторизации
        passwordHash,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      },
    });

    await this.cacheUrl(shortCode, normalizedUrl, !!passwordHash);

    return {
      id: urlRecord.id,
      shortCode: urlRecord.shortCode,
      shortUrl: `${process.env.BASE_URL}/${urlRecord.shortCode}`,
      originalUrl: urlRecord.originalUrl,
      createdAt: urlRecord.createdAt,
      expiresAt: urlRecord.expiresAt,
      qrCodeUrl: `${process.env.BASE_URL}/api/qr/${urlRecord.shortCode}`,
    };
  }

  async getOriginalUrl(shortCode: string): Promise<{ url: string; id: string; passwordProtected: boolean } | null> {
    const cached = await redis.get(`short:${shortCode}`);
    if (cached) {
      const [url, isActive, passwordProtected] = cached.split('|');
      if (isActive === 'true') {
        const urlRecord = await prisma.url.findUnique({ where: { shortCode }, select: { id: true } });
        return { url, id: urlRecord?.id || '', passwordProtected: passwordProtected === 'true' };
      }
    }

    const urlRecord = await prisma.url.findUnique({ where: { shortCode } });
    if (!urlRecord || !urlRecord.isActive) return null;

    if (urlRecord.expiresAt && new Date() > urlRecord.expiresAt) {
      await prisma.url.update({ where: { id: urlRecord.id }, data: { isActive: false } });
      return null;
    }

    await this.cacheUrl(shortCode, urlRecord.originalUrl, !!urlRecord.passwordHash);

    return {
      url: urlRecord.originalUrl,
      id: urlRecord.id,
      passwordProtected: !!urlRecord.passwordHash,
    };
  }

  private async cacheUrl(shortCode: string, url: string, passwordProtected: boolean) {
    await redis.setex(`short:${shortCode}`, 86400, `${url}|true|${passwordProtected}`);
  }

  private async shortCodeExists(shortCode: string): Promise<boolean> {
    const existing = await prisma.url.findUnique({ where: { shortCode } });
    return !!existing;
  }

  // Показываем ВСЕ ссылки (без авторизации)
  async getUserUrls(_userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [urls, total] = await Promise.all([
      prisma.url.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: { _count: { select: { clicks: true } } },
      }),
      prisma.url.count(),
    ]);

    return {
      urls: urls.map((url) => ({
        ...url,
        shortUrl: `${process.env.BASE_URL}/${url.shortCode}`,
        clickCount: url._count.clicks,
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateUrl(id: string, _userId: string, data: { originalUrl?: string; isActive?: boolean }) {
    const url = await prisma.url.findFirst({ where: { id } });
    if (!url) throw new Error('URL not found');

    const updated = await prisma.url.update({ where: { id }, data });
    await redis.del(`short:${updated.shortCode}`);
    return updated;
  }

  async deleteUrl(id: string, _userId: string) {
    const url = await prisma.url.findFirst({ where: { id } });
    if (!url) throw new Error('URL not found');

    await prisma.url.delete({ where: { id } });
    await redis.del(`short:${url.shortCode}`);
    return { success: true };
  }
}
