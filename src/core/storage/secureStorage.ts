import * as SecureStore from 'expo-secure-store';
import { STORAGE_KEYS } from '../config/constants';

interface TokenData {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

class SecureStorageService {
  private static instance: SecureStorageService;

  private constructor() {}

  public static getInstance(): SecureStorageService {
    if (!SecureStorageService.instance) {
      SecureStorageService.instance = new SecureStorageService();
    }
    return SecureStorageService.instance;
  }

  /**
   * Set a value in secure storage
   */
  public async setItem(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error(`Error setting secure storage key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Get a value from secure storage
   */
  public async getItem(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error(`Error getting secure storage key ${key}:`, error);
      return null;
    }
  }

  /**
   * Remove a value from secure storage
   */
  public async removeItem(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error(`Error removing secure storage key ${key}:`, error);
    }
  }

  /**
   * Check if a key exists in secure storage
   */
  public async hasItem(key: string): Promise<boolean> {
    const value = await this.getItem(key);
    return value !== null;
  }

  /**
   * Set JWT access token
   */
  public async setAccessToken(token: string): Promise<void> {
    await this.setItem(STORAGE_KEYS.JWT_ACCESS_TOKEN, token);
  }

  /**
   * Get JWT access token
   */
  public async getAccessToken(): Promise<string | null> {
    return await this.getItem(STORAGE_KEYS.JWT_ACCESS_TOKEN);
  }

  /**
   * Set JWT refresh token
   */
  public async setRefreshToken(token: string): Promise<void> {
    await this.setItem(STORAGE_KEYS.JWT_REFRESH_TOKEN, token);
  }

  /**
   * Get JWT refresh token
   */
  public async getRefreshToken(): Promise<string | null> {
    return await this.getItem(STORAGE_KEYS.JWT_REFRESH_TOKEN);
  }

  /**
   * Set both access and refresh tokens
   */
  public async setTokens(accessToken: string, refreshToken: string): Promise<void> {
    await Promise.all([
      this.setAccessToken(accessToken),
      this.setRefreshToken(refreshToken),
    ]);
  }

  /**
   * Get both access and refresh tokens
   */
  public async getTokens(): Promise<{ accessToken: string | null; refreshToken: string | null }> {
    const [accessToken, refreshToken] = await Promise.all([
      this.getAccessToken(),
      this.getRefreshToken(),
    ]);

    return { accessToken, refreshToken };
  }

  /**
   * Clear all JWT tokens
   */
  public async clearTokens(): Promise<void> {
    await Promise.all([
      this.removeItem(STORAGE_KEYS.JWT_ACCESS_TOKEN),
      this.removeItem(STORAGE_KEYS.JWT_REFRESH_TOKEN),
    ]);
  }

  /**
   * Set biometric token for quick authentication
   */
  public async setBiometricToken(token: string): Promise<void> {
    await this.setItem(STORAGE_KEYS.BIOMETRIC_TOKEN, token);
  }

  /**
   * Get biometric token
   */
  public async getBiometricToken(): Promise<string | null> {
    return await this.getItem(STORAGE_KEYS.BIOMETRIC_TOKEN);
  }

  /**
   * Remove biometric token
   */
  public async removeBiometricToken(): Promise<void> {
    await this.removeItem(STORAGE_KEYS.BIOMETRIC_TOKEN);
  }

  /**
   * Check if user has valid authentication tokens
   */
  public async hasValidTokens(): Promise<boolean> {
    const { accessToken, refreshToken } = await this.getTokens();
    return accessToken !== null && refreshToken !== null;
  }

  /**
   * Store complete token data with expiration
   */
  public async setTokenData(data: TokenData): Promise<void> {
    const tokenDataString = JSON.stringify(data);
    await this.setItem('token_data', tokenDataString);
    
    // Also store individual tokens for compatibility
    await this.setTokens(data.accessToken, data.refreshToken);
  }

  /**
   * Get complete token data
   */
  public async getTokenData(): Promise<TokenData | null> {
    try {
      const tokenDataString = await this.getItem('token_data');
      if (!tokenDataString) {
        return null;
      }
      
      return JSON.parse(tokenDataString) as TokenData;
    } catch (error) {
      console.error('Error parsing token data:', error);
      return null;
    }
  }

  /**
   * Check if access token is expired
   */
  public async isAccessTokenExpired(): Promise<boolean> {
    const tokenData = await this.getTokenData();
    if (!tokenData) {
      return true;
    }
    
    // Add 5 minute buffer before expiration
    const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds
    return Date.now() >= (tokenData.expiresAt - bufferTime);
  }

  /**
   * Clear all secure storage
   */
  public async clearAll(): Promise<void> {
    await Promise.all([
      this.clearTokens(),
      this.removeBiometricToken(),
      this.removeItem('token_data'),
    ]);
  }
}

export const secureStorage = SecureStorageService.getInstance();
export type { TokenData };