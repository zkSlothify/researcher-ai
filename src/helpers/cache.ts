// cache.ts

interface CacheEntry<T> {
    value: T;
    expiresAt: number | null;
  }
  
  export class Cache {
    private store: Record<string, CacheEntry<any>> = {};
  
    /**
     * Sets a value in the cache.
     * @param key The cache key.
     * @param value The value to cache.
     * @param ttlSeconds Optional time-to-live in seconds.
     */
    public set<T>(key: string, value: T, ttlSeconds?: number): void {
      let expiresAt: number | null = null;
      if (ttlSeconds) {
        expiresAt = Date.now() + ttlSeconds * 1000;
      }
      this.store[key] = { value, expiresAt };
    }
  
    /**
     * Gets a value from the cache.
     * @param key The cache key.
     * @returns The cached value or undefined if not found or expired.
     */
    public get<T>(key: string): T | undefined {
      const entry = this.store[key];
      if (!entry) {
        return undefined;
      }
      if (entry.expiresAt && Date.now() > entry.expiresAt) {
        // The entry has expired.
        delete this.store[key];
        return undefined;
      }
      return entry.value;
    }
  
    /**
     * Deletes a value from the cache.
     * @param key The cache key.
     */
    public del(key: string): void {
      delete this.store[key];
    }
  
    /**
     * Clears the entire cache.
     */
    public clear(): void {
      this.store = {};
    }
}

export class TwitterCache {
    private cache: Cache;
  
    constructor() {
      this.cache = new Cache();
    }
  
    private getCacheKey(account: string, date: string): string {
      return `twitter:${account}:${date}`;
    }
    
    private getCursorKey(account: string): string {
      return `twitter:${account}:cursor`;
    }
  
    public set(account: string, date: string, data: any, ttlSeconds?: number): void {
      const key = this.getCacheKey(account, date);
      this.cache.set(key, data, ttlSeconds);
    }
  
    public get(account: string, date: string): any | undefined {
      const key = this.getCacheKey(account, date);
      return this.cache.get(key);
    }
    
    public setCursor(account: string, cursor: string): void {
      const key = this.getCursorKey(account);
      this.cache.set(key, cursor, 300);
    }
    
    public getCursor(account: string): string | undefined {
      const key = this.getCursorKey(account);
      return this.cache.get(key);
    }
  
    public clear(): void {
      this.cache.clear();
    }
}