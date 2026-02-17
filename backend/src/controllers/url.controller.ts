import { Request, Response } from 'express';
import { UrlService } from '../services/url.service';
import { AnalyticsService } from '../services/analytics.service';
import { QRCodeService } from '../services/qrcode.service';
import { analyticsQueue } from '../queues/analytics.queue';
import { parseUserAgent, getGeoLocation, getClientIp } from '../utils/analytics.utils';
import { hashIP } from '../utils/url.utils';
import prisma from '../config/database';

const urlService = new UrlService();
const analyticsService = new AnalyticsService();
const qrCodeService = new QRCodeService();

export class UrlController {
  // Create short URL
  async createShortUrl(req: Request, res: Response) {
    try {
      const { url, customAlias, expiresAt, password } = req.body;

      const result = await urlService.createShortUrl({
        url,
        customAlias,
        expiresAt,
        password,
        userId: undefined, // Add userId from auth when implemented
      });

      res.status(201).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // Redirect to original URL
  async redirect(req: Request, res: Response) {
    try {
      const { shortCode } = req.params;

      const urlData = await urlService.getOriginalUrl(shortCode);

      if (!urlData) {
        return res.status(404).send('URL not found or expired');
      }

      // Collect analytics data
      const clientIp = getClientIp(req);
      const ipHash = hashIP(clientIp);
      const userAgent = req.headers['user-agent'] || '';
      const { browser, os, deviceType } = parseUserAgent(userAgent);
      const { countryCode, city } = getGeoLocation(clientIp);
      const referer = req.headers['referer'] || req.headers['referrer'];

      // Queue analytics processing (async)
      await analyticsQueue.add('click', {
        urlId: urlData.id,
        ipHash,
        countryCode,
        city,
        userAgent,
        browser,
        os,
        deviceType,
        referer,
      });

      // Redirect (301 for permanent, browser will cache)
      res.redirect(301, urlData.url);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get user's URLs
  async getUserUrls(req: Request, res: Response) {
    try {
      const userId = 'demo-user'; // Replace with actual auth
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await urlService.getUserUrls(userId, page, limit);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get URL details
  async getUrlDetails(req: Request, res: Response) {
    try {
      const { id } = req.params;
      // Add authorization check here

      const url = await prisma.url.findUnique({
        where: { id },
        include: {
          _count: {
            select: { clicks: true },
          },
        },
      });

      if (!url) {
        return res.status(404).json({ error: 'URL not found' });
      }

      res.json({
        ...url,
        clickCount: url._count.clicks,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get analytics
  async getAnalytics(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const days = parseInt(req.query.days as string) || 30;

      const analytics = await analyticsService.getUrlAnalytics(id, days);
      res.json(analytics);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Update URL
  async updateUrl(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = 'demo-user'; // Replace with actual auth
      const { originalUrl, isActive } = req.body;

      const updated = await urlService.updateUrl(id, userId, {
        originalUrl,
        isActive,
      });

      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // Delete URL
  async deleteUrl(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = 'demo-user'; // Replace with actual auth

      await urlService.deleteUrl(id, userId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // Generate QR Code
  async generateQRCode(req: Request, res: Response) {
    try {
      const { shortCode } = req.params;
      const format = (req.query.format as 'png' | 'svg') || 'png';
      const size = parseInt(req.query.size as string) || 300;

      const shortUrl = `${process.env.BASE_URL}/${shortCode}`;
      const qrCode = await qrCodeService.generateQRCode(shortUrl, { format, size });

      if (format === 'svg') {
        res.setHeader('Content-Type', 'image/svg+xml');
        res.send(qrCode);
      } else {
        res.setHeader('Content-Type', 'image/png');
        res.send(qrCode);
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Export analytics as CSV
  async exportAnalytics(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const csv = await analyticsService.exportAnalytics(id);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=analytics-${id}.csv`);
      res.send(csv);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
