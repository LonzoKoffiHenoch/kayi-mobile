import AsyncStorage from '@react-native-async-storage/async-storage';
import { CACHE_TTL, STORAGE_KEYS } from '../config/constants';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl?: number;
}

class AsyncStorageService {
  private static instance: AsyncStorageService;

  private constructor() {}

  public static getInstance(): AsyncStorageService {
    if (!AsyncStorageService.instance) {
      AsyncStorageService.instance = new AsyncStorageService();
    }
    return AsyncStorageService.instance;
  }

  /**
   * Set a value in storage with optional TTL
   */
  public async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      const item: CacheItem<T> = {
        data: value,
        timestamp: Date.now(),
        ttl,
      };
      await AsyncStorage.setItem(key, JSON.stringify(item));
    } catch (error) {
      console.error(`Error setting AsyncStorage key ${key}:`, error);
    }
  }

  /**
   * Get a value from storage, checking TTL if applicable
   */
  public async get<T>(key: string): Promise<T | null> {
    try {
      const rawValue = await AsyncStorage.getItem(key);
      if (!rawValue) {
        return null;
      }

      const item: CacheItem<T> = JSON.parse(rawValue);
      
      // Check TTL if set
      if (item.ttl) {
        const isExpired = Date.now() - item.timestamp > item.ttl;
        if (isExpired) {
          await this.remove(key);
          return null;
        }
      }

      return item.data;
    } catch (error) {
      console.error(`Error getting AsyncStorage key ${key}:`, error);
      return null;
    }
  }

  /**
   * Remove a value from storage
   */
  public async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing AsyncStorage key ${key}:`, error);
    }
  }

  /**
   * Check if a key exists and is not expired
   */
  public async has(key: string): Promise<boolean> {
    const value = await this.get(key);
    return value !== null;
  }

  /**
   * Clear all storage
   */
  public async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing AsyncStorage:', error);
    }
  }

  /**
   * Get all keys
   */
  public async getAllKeys(): Promise<string[]> {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      console.error('Error getting all AsyncStorage keys:', error);
      return [];
    }
  }

  /**
   * Set user preferences
   */
  public async setUserPreferences(preferences: Record<string, any>): Promise<void> {
    await this.set(STORAGE_KEYS.USER_PREFERENCES, preferences);
  }

  /**
   * Get user preferences
   */
  public async getUserPreferences(): Promise<Record<string, any> | null> {
    return await this.get(STORAGE_KEYS.USER_PREFERENCES);
  }

  /**
   * Set search history
   */
  public async setSearchHistory(history: string[]): Promise<void> {
    await this.set(STORAGE_KEYS.SEARCH_HISTORY, history, CACHE_TTL.LONG);
  }

  /**
   * Get search history
   */
  public async getSearchHistory(): Promise<string[] | null> {
    return await this.get(STORAGE_KEYS.SEARCH_HISTORY);
  }

  /**
   * Add to search history
   */
  public async addToSearchHistory(query: string, maxItems: number = 10): Promise<void> {
    const currentHistory = await this.getSearchHistory() || [];
    
    // Remove if already exists
    const filteredHistory = currentHistory.filter(item => item !== query);
    
    // Add to beginning
    const newHistory = [query, ...filteredHistory].slice(0, maxItems);
    
    await this.setSearchHistory(newHistory);
  }

  /**
   * Set favorite properties
   */
  public async setFavoriteProperties(propertyIds: string[]): Promise<void> {
    await this.set(STORAGE_KEYS.FAVORITE_PROPERTIES, propertyIds);
  }

  /**
   * Get favorite properties
   */
  public async getFavoriteProperties(): Promise<string[] | null> {
    return await this.get(STORAGE_KEYS.FAVORITE_PROPERTIES);
  }

  /**
   * Add property to favorites
   */
  public async addToFavorites(propertyId: string): Promise<void> {
    const favorites = await this.getFavoriteProperties() || [];
    if (!favorites.includes(propertyId)) {
      await this.setFavoriteProperties([...favorites, propertyId]);
    }
  }

  /**
   * Remove property from favorites
   */
  public async removeFromFavorites(propertyId: string): Promise<void> {
    const favorites = await this.getFavoriteProperties() || [];
    await this.setFavoriteProperties(favorites.filter(id => id !== propertyId));
  }

  /**
   * Check if property is in favorites
   */
  public async isFavorite(propertyId: string): Promise<boolean> {
    const favorites = await this.getFavoriteProperties() || [];
    return favorites.includes(propertyId);
  }

  /**
   * Set last sync timestamp
   */
  public async setLastSync(timestamp: number = Date.now()): Promise<void> {
    await this.set(STORAGE_KEYS.LAST_SYNC, timestamp);
  }

  /**
   * Get last sync timestamp
   */
  public async getLastSync(): Promise<number | null> {
    return await this.get(STORAGE_KEYS.LAST_SYNC);
  }

  /**
   * Set offline data
   */
  public async setOfflineData<T>(data: T, ttl: number = CACHE_TTL.MEDIUM): Promise<void> {
    await this.set(STORAGE_KEYS.OFFLINE_DATA, data, ttl);
  }

  /**
   * Get offline data
   */
  public async getOfflineData<T>(): Promise<T | null> {
    return await this.get(STORAGE_KEYS.OFFLINE_DATA);
  }

  /**
   * Synchronous get for Zustand persist (returns cached value)
   * Note: This is a fallback for Zustand persistence compatibility
   */
  public getSync<T>(key: string): T | null {
    // For Zustand persistence, we'll use a simple approach
    // This is not ideal but necessary for compatibility
    return null;
  }

  /**
   * Synchronous set for Zustand persist
   */
  public setSync<T>(key: string, value: T): void {
    // Store asynchronously but don't wait
    this.set(key, value);
  }

  /**
   * Synchronous remove for Zustand persist
   */
  public removeSync(key: string): void {
    // Remove asynchronously but don't wait
    this.remove(key);
  }
}

export const asyncStorage = AsyncStorageService.getInstance();
export type { CacheItem };