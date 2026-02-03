import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_PREFIX = '@mito_cache:';
const CACHE_EXPIRY_MS = 1000 * 60 * 60 * 24; // 24 hours

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export const cacheService = {
  async set<T>(key: string, data: T): Promise<void> {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(entry));
  },

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(`${CACHE_PREFIX}${key}`);
      if (!value) return null;

      const entry: CacheEntry<T> = JSON.parse(value);
      const isExpired = Date.now() - entry.timestamp > CACHE_EXPIRY_MS;

      if (isExpired) {
        await this.remove(key);
        return null;
      }

      return entry.data;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  },

  async remove(key: string): Promise<void> {
    await AsyncStorage.removeItem(`${CACHE_PREFIX}${key}`);
  },

  async clear(): Promise<void> {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));
    await AsyncStorage.multiRemove(cacheKeys);
  },
};
