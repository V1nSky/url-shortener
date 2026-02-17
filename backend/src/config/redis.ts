// In-memory cache (замена Redis — не требует установки)
interface CacheEntry {
  value: string;
  expiresAt: number;
}

const store = new Map<string, CacheEntry>();

// Чистим устаревшие записи каждые 5 минут
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.expiresAt < now) store.delete(key);
  }
}, 5 * 60 * 1000);

const redis = {
  async get(key: string): Promise<string | null> {
    const entry = store.get(key);
    if (!entry) return null;
    if (entry.expiresAt < Date.now()) { store.delete(key); return null; }
    return entry.value;
  },
  async set(key: string, value: string): Promise<void> {
    store.set(key, { value, expiresAt: Date.now() + 24 * 60 * 60 * 1000 });
  },
  async setex(key: string, ttlSeconds: number, value: string): Promise<void> {
    store.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
  },
  async del(key: string): Promise<void> {
    store.delete(key);
  },
};

console.log('✅ In-memory cache ready (Redis не нужен)');

export default redis;
