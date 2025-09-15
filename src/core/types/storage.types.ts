// Types pour les services de storage

// Secure Storage
export interface SecureStorageItem {
  key: string;
  value: string;
  requiresAuth?: boolean;
  timestamp?: number;
}

export interface AuthStorageData {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  userId: string;
}

export interface BiometricOptions {
  promptMessage?: string;
  cancelButtonText?: string;
  fallbackButtonText?: string;
  disableDeviceFallback?: boolean;
}

// Local Storage (AsyncStorage)
export interface CacheItem<T = any> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in ms
  size?: number; // Size in bytes
}

export interface CacheConfig {
  ttl?: number;
  maxSize?: number;
  enableCompression?: boolean;
  evictionPolicy?: 'LRU' | 'FIFO';
}

export interface PropertyCacheItem {
  id: string;
  data: any;
  images?: string[]; // Base64 encoded images for offline
  lastUpdated: number;
  viewCount: number;
}

export interface SearchHistoryItem {
  id: string;
  query: string;
  filters?: Record<string, any>;
  timestamp: number;
  resultCount?: number;
}

export interface FavoriteItem {
  propertyId: string;
  userId: string;
  timestamp: number;
  synced: boolean;
}

// SQLite Schema types
export interface DatabaseSchema {
  version: number;
  tables: {
    properties: PropertyCacheItem;
    search_history: SearchHistoryItem;
    favorites: FavoriteItem;
    queue: QueuedRequest;
  };
}

export interface SQLiteConfig {
  databaseName: string;
  version: number;
  enableFK?: boolean;
  enableWAL?: boolean;
}

// Storage Service Interfaces
export interface ISecureStorage {
  setItem(key: string, value: string, options?: BiometricOptions): Promise<void>;
  getItem(key: string, options?: BiometricOptions): Promise<string | null>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
  
  // Auth specific methods
  setAuthTokens(tokens: AuthStorageData): Promise<void>;
  getAuthTokens(): Promise<AuthStorageData | null>;
  clearAuthTokens(): Promise<void>;
}

export interface ILocalStorage {
  setItem<T>(key: string, value: T, config?: CacheConfig): Promise<void>;
  getItem<T>(key: string): Promise<T | null>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
  
  // Specialized cache methods
  cacheProperty(property: PropertyCacheItem): Promise<void>;
  getCachedProperty(id: string): Promise<PropertyCacheItem | null>;
  addToSearchHistory(item: SearchHistoryItem): Promise<void>;
  getSearchHistory(limit?: number): Promise<SearchHistoryItem[]>;
  addToFavorites(propertyId: string, userId: string): Promise<void>;
  removeFromFavorites(propertyId: string, userId: string): Promise<void>;
  getFavorites(userId: string): Promise<FavoriteItem[]>;
}

// Import from existing api.types to avoid circular dependency
import type { QueuedRequest } from './api.types';