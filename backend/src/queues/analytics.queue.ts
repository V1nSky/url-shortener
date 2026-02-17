// Упрощённая очередь без Redis/BullMQ — пишем аналитику напрямую в БД
import prisma from '../config/database';

export interface ClickData {
  urlId: string;
  ipHash: string;
  countryCode?: string;
  city?: string;
  userAgent?: string;
  browser?: string;
  os?: string;
  deviceType?: string;
  referer?: string;
}

export const analyticsQueue = {
  async add(_name: string, data: ClickData) {
    // Пишем асинхронно, не блокируя редирект
    setImmediate(async () => {
      try {
        await prisma.click.create({ data });
      } catch (err) {
        console.error('Analytics write error:', err);
      }
    });
  },
};
