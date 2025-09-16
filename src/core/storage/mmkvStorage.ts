import { MMKV } from 'react-native-mmkv';
import { CACHE_TTL, STORAGE_KEYS } from '../config/constants';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl?: number;
}

class MMKVStorageService {
  private static instance: MMKVStorageService;
  private storage: MMKV;

  private constructor() {
    this.storage = new MMKV({
      id: 'kayi-house-storage',
      encryptionKey: 'kayi-house-encryption-key',
    });
  }

  public static getInstance(): MMKVStorageService {
    if (!MMKVStorageService.instance) {
      MMKVStorageService.instance = new MMKVStorageService();
    }
    return MMKVStorageService.instance;
  }

  /**
   * Set a value in storage with optional TTL
   */
  public set<T>(key: string, value: T, ttl?: number): void {
    try {
      const item: CacheItem<T> = {
        data: value,
        timestamp: Date.now(),
        ttl,
      };
      this.storage.set(key, JSON.stringify(item));
    } catch (error) {
      console.error(`Error setting MMKV key ${key}:`, error);
    }
  }

  /**
   * Get a value from storage, checking TTL if applicable
   */
  public get<T>(key: string): T | null {
    try {
      const rawValue = this.storage.getString(key);
      if (!rawValue) {
        return null;
      }

      const item: CacheItem<T> = JSON.parse(rawValue);
      
      // Check TTL if set
      if (item.ttl) {
        const isExpired = Date.now() - item.timestamp > item.ttl;
        if (isExpired) {
          this.remove(key);
          return null;
        }
      }

      return item.data;
    } catch (error) {
      console.error(`Error getting MMKV key ${key}:`, error);
      return null;
    }
  }

  /**
   * Remove a value from storage
   */
  public remove(key: string): void {
    try {
      this.storage.delete(key);
    } catch (error) {
      console.error(`Error removing MMKV key ${key}:`, error);
    }
  }

  /**
   * Check if a key exists and is not expired
   */
  public has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Clear all storage
   */
  public clear(): void {
    try {
      this.storage.clearAll();
    } catch (error) {
      console.error('Error clearing MMKV storage:', error);
    }
  }

  /**
   * Get all keys
   */
  public getAllKeys(): string[] {
    try {
      return this.storage.getAllKeys();
    } catch (error) {
      console.error('Error getting all MMKV keys:', error);
      return [];
    }
  }

  /**
   * Set user preferences
   */
  public setUserPreferences(preferences: Record<string, any>): void {
    this.set(STORAGE_KEYS.USER_PREFERENCES, preferences);
  }

  /**
   * Get user preferences
   */
  public getUserPreferences(): Record<string, any> | null {
    return this.get(STORAGE_KEYS.USER_PREFERENCES);
  }

  /**
   * Set search history
   */
  public setSearchHistory(history: string[]): void {
    this.set(STORAGE_KEYS.SEARCH_HISTORY, history, CACHE_TTL.LONG);
  }

  /**
   * Get search history
   */
  public getSearchHistory(): string[] | null {
    return this.get(STORAGE_KEYS.SEARCH_HISTORY);
  }

  /**
   * Add to search history
   */
  public addToSearchHistory(query: string, maxItems: number = 10): void {
    const currentHistory = this.getSearchHistory() || [];
    
    // Remove if already exists
    const filteredHistory = currentHistory.filter(item => item !== query);
    
    // Add to beginning
    const newHistory = [query, ...filteredHistory].slice(0, maxItems);
    
    this.setSearchHistory(newHistory);
  }

  /**
   * Set favorite properties
   */
  public setFavoriteProperties(propertyIds: string[]): void {
    this.set(STORAGE_KEYS.FAVORITE_PROPERTIES, propertyIds);
  }

  /**
   * Get favorite properties
   */
  public getFavoriteProperties(): string[] | null {
    return this.get(STORAGE_KEYS.FAVORITE_PROPERTIES);
  }

  /**
   * Add property to favorites
   */
  public addToFavorites(propertyId: string): void {
    const favorites = this.getFavoriteProperties() || [];
    if (!favorites.includes(propertyId)) {
      this.setFavoriteProperties([...favorites, propertyId]);
    }
  }

  /**
   * Remove property from favorites
   */
  public removeFromFavorites(propertyId: string): void {
    const favorites = this.getFavoriteProperties() || [];
    this.setFavoriteProperties(favorites.filter(id => id !== propertyId));
  }

  /**
   * Check if property is in favorites
   */
  public isFavorite(propertyId: string): boolean {
    const favorites = this.getFavoriteProperties() || [];
    return favorites.includes(propertyId);
  }

  /**
   * Set last sync timestamp
   */
  public setLastSync(timestamp: number = Date.now()): void {
    this.set(STORAGE_KEYS.LAST_SYNC, timestamp);
  }

  /**
   * Get last sync timestamp
   */
  public getLastSync(): number | null {
    return this.get(STORAGE_KEYS.LAST_SYNC);
  }

  /**
   * Set offline data
   */
  public setOfflineData<T>(data: T, ttl: number = CACHE_TTL.MEDIUM): void {
    this.set(STORAGE_KEYS.OFFLINE_DATA, data, ttl);
  }

  /**
   * Get offline data
   */
  public getOfflineData<T>(): T | null {
    return this.get(STORAGE_KEYS.OFFLINE_DATA);
  }
}

export const mmkvStorage = MMKVStorageService.getInstance();
export type { CacheItem };