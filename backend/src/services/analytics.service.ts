import prisma from '../config/database';

export class AnalyticsService {
  async getUrlAnalytics(urlId: string, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [totalClicks, uniqueVisitors, clicksByDate, topCountries, topDevices, topBrowsers, topReferers] =
      await Promise.all([
        // Total clicks
        prisma.click.count({ where: { urlId } }),

        // Unique visitors
        prisma.click.groupBy({
          by: ['ipHash'],
          where: { urlId },
          _count: true,
        }),

        // Clicks by date
        prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`
          SELECT DATE(clicked_at) as date, COUNT(*) as count
          FROM clicks
          WHERE url_id = ${urlId} AND clicked_at >= ${startDate}
          GROUP BY DATE(clicked_at)
          ORDER BY date ASC
        `,

        // Top countries
        prisma.click.groupBy({
          by: ['countryCode'],
          where: {
            urlId,
            clickedAt: { gte: startDate },
            countryCode: { not: null },
          },
          _count: true,
          orderBy: { _count: { countryCode: 'desc' } },
          take: 10,
        }),

        // Top devices
        prisma.click.groupBy({
          by: ['deviceType'],
          where: {
            urlId,
            clickedAt: { gte: startDate },
            deviceType: { not: null },
          },
          _count: true,
          orderBy: { _count: { deviceType: 'desc' } },
        }),

        // Top browsers
        prisma.click.groupBy({
          by: ['browser'],
          where: {
            urlId,
            clickedAt: { gte: startDate },
            browser: { not: null },
          },
          _count: true,
          orderBy: { _count: { browser: 'desc' } },
          take: 10,
        }),

        // Top referers
        prisma.click.groupBy({
          by: ['referer'],
          where: {
            urlId,
            clickedAt: { gte: startDate },
            referer: { not: null },
          },
          _count: true,
          orderBy: { _count: { referer: 'desc' } },
          take: 10,
        }),
      ]);

    return {
      totalClicks,
      uniqueVisitors: uniqueVisitors.length,
      clicksByDate: clicksByDate.map((item) => ({
        date: item.date,
        count: Number(item.count),
      })),
      topCountries: topCountries.map((item) => ({
        country: item.countryCode,
        count: item._count,
      })),
      topDevices: topDevices.map((item) => ({
        device: item.deviceType,
        count: item._count,
      })),
      topBrowsers: topBrowsers.map((item) => ({
        browser: item.browser,
        count: item._count,
      })),
      topReferers: topReferers
        .filter((item) => item.referer)
        .map((item) => ({
          referer: item.referer,
          count: item._count,
        })),
    };
  }

  async getRecentClicks(urlId: string, limit = 50) {
    const clicks = await prisma.click.findMany({
      where: { urlId },
      orderBy: { clickedAt: 'desc' },
      take: limit,
      select: {
        countryCode: true,
        city: true,
        browser: true,
        os: true,
        deviceType: true,
        referer: true,
        clickedAt: true,
      },
    });

    return clicks;
  }

  async exportAnalytics(urlId: string) {
    const clicks = await prisma.click.findMany({
      where: { urlId },
      orderBy: { clickedAt: 'desc' },
    });

    // Convert to CSV
    const headers = ['Date', 'Country', 'City', 'Browser', 'OS', 'Device', 'Referer'];
    const rows = clicks.map((click) => [
      click.clickedAt.toISOString(),
      click.countryCode || '',
      click.city || '',
      click.browser || '',
      click.os || '',
      click.deviceType || '',
      click.referer || '',
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    return csv;
  }
}
