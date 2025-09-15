import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

import { 
  ILocalStorage, 
  CacheItem, 
  CacheConfig, 
  PropertyCacheItem, 
  SearchHistoryItem, 
  FavoriteItem,
  SQLiteConfig,
  DatabaseSchema
} from '../types/storage.types';
import { APP_CONSTANTS, STORAGE_KEYS } from '../../config/constants';

class LocalStorageService implements ILocalStorage {
  private db: SQLite.SQLiteDatabase | null = null;
  private readonly dbConfig: SQLiteConfig = {
    databaseName: 'kayi_house.db',
    version: 1,
    enableFK: true,
    enableWAL: Platform.OS === 'ios', // WAL mode pour iOS seulement
  };

  constructor() {
    this.initializeDatabase();
  }

  private async initializeDatabase(): Promise<void> {
    try {
      this.db = await SQLite.openDatabaseAsync(this.dbConfig.databaseName);
      
      if (this.dbConfig.enableFK) {
        await this.db.execAsync('PRAGMA foreign_keys = ON;');
      }
      
      if (this.dbConfig.enableWAL && Platform.OS === 'ios') {
        await this.db.execAsync('PRAGMA journal_mode = WAL;');
      }

      await this.createTables();
      
      if (__DEV__) {
        console.log('📦 Local storage database initialized');
      }
    } catch (error) {
      if (__DEV__) {
        console.error('❌ Database initialization error:', error);
      }
      // Continuer sans SQLite, utiliser seulement AsyncStorage
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) return;

    try {
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS properties (
          id TEXT PRIMARY KEY,
          data TEXT NOT NULL,
          images TEXT,
          last_updated INTEGER NOT NULL,
          view_count INTEGER DEFAULT 0,
          ttl INTEGER NOT NULL
        );

        CREATE TABLE IF NOT EXISTS search_history (
          id TEXT PRIMARY KEY,
          query TEXT NOT NULL,
          filters TEXT,
          timestamp INTEGER NOT NULL,
          result_count INTEGER
        );

        CREATE TABLE IF NOT EXISTS favorites (
          property_id TEXT,
          user_id TEXT,
          timestamp INTEGER NOT NULL,
          synced INTEGER DEFAULT 0,
          PRIMARY KEY (property_id, user_id)
        );

        CREATE TABLE IF NOT EXISTS cache_metadata (
          key TEXT PRIMARY KEY,
          size INTEGER DEFAULT 0,
          access_count INTEGER DEFAULT 0,
          last_access INTEGER NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_properties_updated ON properties(last_updated);
        CREATE INDEX IF NOT EXISTS idx_search_timestamp ON search_history(timestamp);
        CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
        CREATE INDEX IF NOT EXISTS idx_cache_access ON cache_metadata(last_access);
      `);

      if (__DEV__) {
        console.log('📦 Database tables created/verified');
      }
    } catch (error) {
      if (__DEV__) {
        console.error('❌ Table creation error:', error);
      }
    }
  }

  // AsyncStorage wrapper methods
  async setItem<T>(key: string, value: T, config?: CacheConfig): Promise<void> {
    try {
      const cacheItem: CacheItem<T> = {
        data: value,
        timestamp: Date.now(),
        ttl: config?.ttl || APP_CONSTANTS.CACHE_DURATION,
        size: this.calculateSize(value),
      };

      // Compression pour gros objets
      let serializedData = JSON.stringify(cacheItem);
      if (config?.enableCompression && serializedData.length > 10000) {
        // Simple compression - en production, utiliser une vraie lib de compression
        serializedData = this.compressData(serializedData);
      }

      await AsyncStorage.setItem(key, serializedData);

      // Mettre à jour metadata cache
      await this.updateCacheMetadata(key, cacheItem.size || 0);

      // Vérifier et nettoyer le cache si nécessaire
      await this.enforceStorageLimit();

      if (__DEV__) {
        console.log(`📦 Local storage SET: ${key} (${this.formatSize(cacheItem.size || 0)})`);
      }
    } catch (error) {
      if (__DEV__) {
        console.error(`❌ Local storage SET error for ${key}:`, error);
      }
      throw error;
    }
  }

  async getItem<T>(key: string): Promise<T | null> {
    try {
      const serializedData = await AsyncStorage.getItem(key);
      if (!serializedData) {
        return null;
      }

      let cacheItem: CacheItem<T>;
      try {
        // Tenter décompression si données compressées
        const decompressed = this.decompressData(serializedData);
        cacheItem = JSON.parse(decompressed);
      } catch {
        // Fallback pour données non compressées
        cacheItem = JSON.parse(serializedData);
      }

      // Vérifier expiration
      const now = Date.now();
      if (cacheItem.timestamp + cacheItem.ttl < now) {
        if (__DEV__) {
          console.warn(`⚠️ Cache expired for ${key}, removing...`);
        }
        await this.removeItem(key);
        return null;
      }

      // Mettre à jour metadata d'accès
      await this.updateCacheMetadata(key, cacheItem.size || 0);

      if (__DEV__) {
        console.log(`📦 Local storage GET: ${key}`);
      }

      return cacheItem.data;
    } catch (error) {
      if (__DEV__) {
        console.error(`❌ Local storage GET error for ${key}:`, error);
      }
      return null;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
      await this.removeCacheMetadata(key);

      if (__DEV__) {
        console.log(`📦 Local storage DELETE: ${key}`);
      }
    } catch (error) {
      if (__DEV__) {
        console.error(`❌ Local storage DELETE error for ${key}:`, error);
      }
    }
  }

  async clear(): Promise<void> {
    try {
      // Nettoyer AsyncStorage (seulement nos clés)
      const allKeys = await AsyncStorage.getAllKeys();
      const ourKeys = allKeys.filter(key => 
        Object.values(STORAGE_KEYS).includes(key as any) ||
        key.startsWith('kayi_')
      );
      
      if (ourKeys.length > 0) {
        await AsyncStorage.multiRemove(ourKeys);
      }

      // Nettoyer SQLite
      if (this.db) {
        await this.db.execAsync(`
          DELETE FROM properties;
          DELETE FROM search_history;
          DELETE FROM favorites;
          DELETE FROM cache_metadata;
        `);
      }

      if (__DEV__) {
        console.log('📦 Local storage CLEARED');
      }
    } catch (error) {
      if (__DEV__) {
        console.error('❌ Local storage CLEAR error:', error);
      }
      throw error;
    }
  }

  // SQLite specialized cache methods
  async cacheProperty(property: PropertyCacheItem): Promise<void> {
    if (!this.db) {
      // Fallback AsyncStorage
      await this.setItem(`property_${property.id}`, property, {
        ttl: 24 * 60 * 60 * 1000, // 24h pour properties
      });
      return;
    }

    try {
      const now = Date.now();
      const ttl = now + (24 * 60 * 60 * 1000); // 24h

      await this.db.runAsync(
        `INSERT OR REPLACE INTO properties (id, data, images, last_updated, view_count, ttl)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          property.id,
          JSON.stringify(property.data),
          property.images ? JSON.stringify(property.images) : null,
          property.lastUpdated,
          property.viewCount || 0,
          ttl
        ]
      );

      if (__DEV__) {
        console.log(`📦 Property cached: ${property.id}`);
      }
    } catch (error) {
      if (__DEV__) {
        console.error(`❌ Property cache error for ${property.id}:`, error);
      }
    }
  }

  async getCachedProperty(id: string): Promise<PropertyCacheItem | null> {
    if (!this.db) {
      // Fallback AsyncStorage
      return await this.getItem(`property_${id}`);
    }

    try {
      const now = Date.now();
      const result = await this.db.getFirstAsync(
        `SELECT * FROM properties WHERE id = ? AND ttl > ?`,
        [id, now]
      ) as any;

      if (!result) {
        return null;
      }

      // Incrémenter view_count
      await this.db.runAsync(
        `UPDATE properties SET view_count = view_count + 1 WHERE id = ?`,
        [id]
      );

      const property: PropertyCacheItem = {
        id: result.id,
        data: JSON.parse(result.data),
        images: result.images ? JSON.parse(result.images) : undefined,
        lastUpdated: result.last_updated,
        viewCount: result.view_count + 1,
      };

      return property;
    } catch (error) {
      if (__DEV__) {
        console.error(`❌ Get cached property error for ${id}:`, error);
      }
      return null;
    }
  }

  async addToSearchHistory(item: SearchHistoryItem): Promise<void> {
    if (!this.db) {
      // Fallback AsyncStorage
      const history = await this.getItem<SearchHistoryItem[]>('search_history') || [];
      history.unshift(item);
      // Garder seulement les 50 dernières recherches
      const trimmedHistory = history.slice(0, 50);
      await this.setItem('search_history', trimmedHistory);
      return;
    }

    try {
      await this.db.runAsync(
        `INSERT OR REPLACE INTO search_history (id, query, filters, timestamp, result_count)
         VALUES (?, ?, ?, ?, ?)`,
        [
          item.id,
          item.query,
          item.filters ? JSON.stringify(item.filters) : null,
          item.timestamp,
          item.resultCount || 0
        ]
      );

      // Nettoyer l'historique ancien (garder 50 entrées)
      await this.db.runAsync(
        `DELETE FROM search_history WHERE id NOT IN (
          SELECT id FROM search_history ORDER BY timestamp DESC LIMIT 50
        )`
      );

      if (__DEV__) {
        console.log(`📦 Search history added: ${item.query}`);
      }
    } catch (error) {
      if (__DEV__) {
        console.error('❌ Add search history error:', error);
      }
    }
  }

  async getSearchHistory(limit: number = 20): Promise<SearchHistoryItem[]> {
    if (!this.db) {
      // Fallback AsyncStorage
      const history = await this.getItem<SearchHistoryItem[]>('search_history') || [];
      return history.slice(0, limit);
    }

    try {
      const results = await this.db.getAllAsync(
        `SELECT * FROM search_history ORDER BY timestamp DESC LIMIT ?`,
        [limit]
      ) as any[];

      return results.map(result => ({
        id: result.id,
        query: result.query,
        filters: result.filters ? JSON.parse(result.filters) : undefined,
        timestamp: result.timestamp,
        resultCount: result.result_count,
      }));
    } catch (error) {
      if (__DEV__) {
        console.error('❌ Get search history error:', error);
      }
      return [];
    }
  }

  async addToFavorites(propertyId: string, userId: string): Promise<void> {
    if (!this.db) {
      // Fallback AsyncStorage
      const favorites = await this.getItem<FavoriteItem[]>(`favorites_${userId}`) || [];
      const existing = favorites.find(f => f.propertyId === propertyId);
      if (!existing) {
        favorites.push({
          propertyId,
          userId,
          timestamp: Date.now(),
          synced: false,
        });
        await this.setItem(`favorites_${userId}`, favorites);
      }
      return;
    }

    try {
      await this.db.runAsync(
        `INSERT OR IGNORE INTO favorites (property_id, user_id, timestamp, synced)
         VALUES (?, ?, ?, ?)`,
        [propertyId, userId, Date.now(), 0]
      );

      if (__DEV__) {
        console.log(`📦 Added to favorites: ${propertyId}`);
      }
    } catch (error) {
      if (__DEV__) {
        console.error('❌ Add to favorites error:', error);
      }
    }
  }

  async removeFromFavorites(propertyId: string, userId: string): Promise<void> {
    if (!this.db) {
      // Fallback AsyncStorage
      const favorites = await this.getItem<FavoriteItem[]>(`favorites_${userId}`) || [];
      const filtered = favorites.filter(f => f.propertyId !== propertyId);
      await this.setItem(`favorites_${userId}`, filtered);
      return;
    }

    try {
      await this.db.runAsync(
        `DELETE FROM favorites WHERE property_id = ? AND user_id = ?`,
        [propertyId, userId]
      );

      if (__DEV__) {
        console.log(`📦 Removed from favorites: ${propertyId}`);
      }
    } catch (error) {
      if (__DEV__) {
        console.error('❌ Remove from favorites error:', error);
      }
    }
  }

  async getFavorites(userId: string): Promise<FavoriteItem[]> {
    if (!this.db) {
      // Fallback AsyncStorage
      return await this.getItem<FavoriteItem[]>(`favorites_${userId}`) || [];
    }

    try {
      const results = await this.db.getAllAsync(
        `SELECT * FROM favorites WHERE user_id = ? ORDER BY timestamp DESC`,
        [userId]
      ) as any[];

      return results.map(result => ({
        propertyId: result.property_id,
        userId: result.user_id,
        timestamp: result.timestamp,
        synced: result.synced === 1,
      }));
    } catch (error) {
      if (__DEV__) {
        console.error('❌ Get favorites error:', error);
      }
      return [];
    }
  }

  // Cache management utilities
  private async updateCacheMetadata(key: string, size: number): Promise<void> {
    try {
      const metadata = {
        size,
        access_count: 1,
        last_access: Date.now(),
      };
      await this.setItem(`_meta_${key}`, metadata);
    } catch (error) {
      // Ignore metadata errors
    }
  }

  private async removeCacheMetadata(key: string): Promise<void> {
    try {
      await this.removeItem(`_meta_${key}`);
    } catch (error) {
      // Ignore metadata errors
    }
  }

  private async enforceStorageLimit(): Promise<void> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const ourKeys = allKeys.filter(key => key.startsWith('kayi_'));
      
      if (ourKeys.length === 0) return;

      let totalSize = 0;
      const keysSizes: Array<{ key: string; size: number; lastAccess: number }> = [];

      for (const key of ourKeys) {
        if (key.startsWith('_meta_')) continue;
        
        const item = await this.getItem(key);
        if (item) {
          const size = this.calculateSize(item);
          totalSize += size;
          keysSizes.push({
            key,
            size,
            lastAccess: Date.now(), // Approximation
          });
        }
      }

      // Si on dépasse la limite, nettoyer les plus anciens (LRU)
      if (totalSize > APP_CONSTANTS.OFFLINE_STORAGE_LIMIT) {
        keysSizes.sort((a, b) => a.lastAccess - b.lastAccess);
        
        let sizeToRemove = totalSize - APP_CONSTANTS.OFFLINE_STORAGE_LIMIT;
        const keysToRemove: string[] = [];

        for (const { key, size } of keysSizes) {
          if (sizeToRemove <= 0) break;
          keysToRemove.push(key);
          sizeToRemove -= size;
        }

        if (keysToRemove.length > 0) {
          await AsyncStorage.multiRemove(keysToRemove);
          
          if (__DEV__) {
            console.log(`📦 Cache cleanup: removed ${keysToRemove.length} items`);
          }
        }
      }
    } catch (error) {
      if (__DEV__) {
        console.error('❌ Storage limit enforcement error:', error);
      }
    }
  }

  // Utility methods
  private calculateSize(data: any): number {
    try {
      return new Blob([JSON.stringify(data)]).size;
    } catch {
      // Fallback approximation
      return JSON.stringify(data).length * 2;
    }
  }

  private formatSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  private compressData(data: string): string {
    // Simple compression placeholder - en production, utiliser lz-string ou similaire
    return data;
  }

  private decompressData(data: string): string {
    // Simple decompression placeholder
    return data;
  }

  // Database health check
  async getDatabaseStats(): Promise<{
    properties: number;
    searchHistory: number;
    favorites: number;
    totalSize: string;
  }> {
    if (!this.db) {
      return {
        properties: 0,
        searchHistory: 0,
        favorites: 0,
        totalSize: '0 B',
      };
    }

    try {
      const [propertiesCount, historyCount, favoritesCount] = await Promise.all([
        this.db.getFirstAsync('SELECT COUNT(*) as count FROM properties') as Promise<{ count: number }>,
        this.db.getFirstAsync('SELECT COUNT(*) as count FROM search_history') as Promise<{ count: number }>,
        this.db.getFirstAsync('SELECT COUNT(*) as count FROM favorites') as Promise<{ count: number }>,
      ]);

      // Approximation de la taille totale
      const totalSize = (propertiesCount.count * 1000) + 
                       (historyCount.count * 100) + 
                       (favoritesCount.count * 50);

      return {
        properties: propertiesCount.count,
        searchHistory: historyCount.count,
        favorites: favoritesCount.count,
        totalSize: this.formatSize(totalSize),
      };
    } catch (error) {
      if (__DEV__) {
        console.error('❌ Database stats error:', error);
      }
      return {
        properties: 0,
        searchHistory: 0,
        favorites: 0,
        totalSize: '0 B',
      };
    }
  }
}

// Export singleton instance
export const localStorage = new LocalStorageService();
export default localStorage;