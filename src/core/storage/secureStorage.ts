import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';

import { 
  ISecureStorage, 
  AuthStorageData, 
  BiometricOptions, 
  SecureStorageItem 
} from '../types/storage.types';
import { STORAGE_KEYS } from '../../config/constants';

class SecureStorageService implements ISecureStorage {
  private readonly serviceName = 'KayiHouseApp';
  
  constructor() {
    this.initializeBiometrics();
  }

  private async initializeBiometrics(): Promise<void> {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      
      if (__DEV__) {
        console.log('🔒 Biometric status:', { hasHardware, isEnrolled });
      }
    } catch (error) {
      if (__DEV__) {
        console.error('❌ Biometric initialization error:', error);
      }
    }
  }

  private async authenticateWithBiometrics(options?: BiometricOptions): Promise<boolean> {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        if (__DEV__) {
          console.warn('⚠️ Biometric authentication not available');
        }
        return true; // Fallback à l'authentification normale
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: options?.promptMessage || 'Authentifiez-vous pour accéder à vos données',
        cancelLabel: options?.cancelButtonText || 'Annuler',
        fallbackLabel: options?.fallbackButtonText || 'Utiliser le code',
        disableDeviceFallback: options?.disableDeviceFallback || false,
      });

      return result.success;
    } catch (error) {
      if (__DEV__) {
        console.error('❌ Biometric authentication error:', error);
      }
      return false;
    }
  }

  private createSecureStoreOptions(requiresAuth?: boolean): SecureStore.SecureStoreOptions {
    const options: SecureStore.SecureStoreOptions = {
      keychainService: this.serviceName,
    };

    if (requiresAuth) {
      options.requireAuthentication = true;
      options.authenticationPrompt = 'Authentifiez-vous pour accéder à cette donnée sécurisée';
    }

    return options;
  }

  async setItem(key: string, value: string, options?: BiometricOptions): Promise<void> {
    try {
      if (options && Object.keys(options).length > 0) {
        const authenticated = await this.authenticateWithBiometrics(options);
        if (!authenticated) {
          throw new Error('Authentication required to store secure data');
        }
      }

      const item: SecureStorageItem = {
        key,
        value,
        requiresAuth: !!options,
        timestamp: Date.now(),
      };

      const secureOptions = this.createSecureStoreOptions(!!options);
      await SecureStore.setItemAsync(key, JSON.stringify(item), secureOptions);

      if (__DEV__) {
        console.log(`🔒 Secure storage SET: ${key}`);
      }
    } catch (error) {
      if (__DEV__) {
        console.error(`❌ Secure storage SET error for ${key}:`, error);
      }
      throw new Error(`Failed to store secure data for key: ${key}`);
    }
  }

  async getItem(key: string, options?: BiometricOptions): Promise<string | null> {
    try {
      const secureOptions = this.createSecureStoreOptions(!!options);
      const storedData = await SecureStore.getItemAsync(key, secureOptions);

      if (!storedData) {
        return null;
      }

      try {
        const item: SecureStorageItem = JSON.parse(storedData);
        
        // Vérifier si l'authentification biométrique est requise
        if (item.requiresAuth && options) {
          const authenticated = await this.authenticateWithBiometrics(options);
          if (!authenticated) {
            throw new Error('Authentication required to access secure data');
          }
        }

        if (__DEV__) {
          console.log(`🔒 Secure storage GET: ${key}`);
        }

        return item.value;
      } catch (parseError) {
        // Fallback pour données stockées en format ancien
        if (__DEV__) {
          console.warn(`⚠️ Legacy data format for ${key}, migrating...`);
        }
        return storedData;
      }
    } catch (error) {
      if ((error as Error).message?.includes('UserCancel') || (error as Error).message?.includes('Authentication')) {
        throw error; // Propager les erreurs d'authentification
      }

      if (__DEV__) {
        console.error(`❌ Secure storage GET error for ${key}:`, error);
      }
      return null;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
      
      if (__DEV__) {
        console.log(`🔒 Secure storage DELETE: ${key}`);
      }
    } catch (error) {
      if (__DEV__) {
        console.error(`❌ Secure storage DELETE error for ${key}:`, error);
      }
      // Ne pas throw ici car l'item peut ne pas exister
    }
  }

  async clear(): Promise<void> {
    try {
      // SecureStore n'a pas de méthode clear globale
      // On doit supprimer chaque clé individuellement
      const keysToDelete = Object.values(STORAGE_KEYS);
      
      await Promise.allSettled(
        keysToDelete.map(key => this.removeItem(key))
      );

      if (__DEV__) {
        console.log('🔒 Secure storage CLEARED');
      }
    } catch (error) {
      if (__DEV__) {
        console.error('❌ Secure storage CLEAR error:', error);
      }
      throw error;
    }
  }

  // Auth-specific methods
  async setAuthTokens(tokens: AuthStorageData): Promise<void> {
    try {
      const tokenData = JSON.stringify(tokens);
      
      // Stocker avec authentification biométrique si disponible
      const biometricOptions: BiometricOptions = {
        promptMessage: 'Authentifiez-vous pour sauvegarder vos informations de connexion',
        cancelButtonText: 'Annuler',
        fallbackButtonText: 'Utiliser le code',
      };

      await this.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
      await this.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
      await this.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify({
        userId: tokens.userId,
        expiresAt: tokens.expiresAt,
      }), biometricOptions);

      if (__DEV__) {
        console.log('🔒 Auth tokens stored successfully');
      }
    } catch (error) {
      if (__DEV__) {
        console.error('❌ Error storing auth tokens:', error);
      }
      throw error;
    }
  }

  async getAuthTokens(): Promise<AuthStorageData | null> {
    try {
      const [accessToken, refreshToken, userData] = await Promise.all([
        this.getItem(STORAGE_KEYS.ACCESS_TOKEN),
        this.getItem(STORAGE_KEYS.REFRESH_TOKEN),
        this.getItem(STORAGE_KEYS.USER_DATA),
      ]);

      if (!accessToken || !refreshToken || !userData) {
        return null;
      }

      const parsedUserData = JSON.parse(userData);
      
      const tokens: AuthStorageData = {
        accessToken,
        refreshToken,
        userId: parsedUserData.userId,
        expiresAt: parsedUserData.expiresAt,
      };

      // Vérifier si le token n'est pas expiré
      if (tokens.expiresAt && tokens.expiresAt < Date.now()) {
        if (__DEV__) {
          console.warn('⚠️ Access token expired');
        }
        // Ne pas retourner null immédiatement, laisser le refresh token faire son travail
      }

      return tokens;
    } catch (error) {
      if (__DEV__) {
        console.error('❌ Error retrieving auth tokens:', error);
      }
      return null;
    }
  }

  async clearAuthTokens(): Promise<void> {
    try {
      await Promise.all([
        this.removeItem(STORAGE_KEYS.ACCESS_TOKEN),
        this.removeItem(STORAGE_KEYS.REFRESH_TOKEN),
        this.removeItem(STORAGE_KEYS.USER_DATA),
      ]);

      if (__DEV__) {
        console.log('🔒 Auth tokens cleared');
      }
    } catch (error) {
      if (__DEV__) {
        console.error('❌ Error clearing auth tokens:', error);
      }
      throw error;
    }
  }

  // Bulk operations pour performance
  async setBulkItems(items: Array<{ key: string; value: string; options?: BiometricOptions }>): Promise<void> {
    try {
      await Promise.all(
        items.map(item => this.setItem(item.key, item.value, item.options))
      );
    } catch (error) {
      if (__DEV__) {
        console.error('❌ Bulk set error:', error);
      }
      throw error;
    }
  }

  async getBulkItems(keys: string[]): Promise<Record<string, string | null>> {
    try {
      const results = await Promise.allSettled(
        keys.map(key => this.getItem(key))
      );

      const bulkResult: Record<string, string | null> = {};
      keys.forEach((key, index) => {
        const result = results[index];
        bulkResult[key] = result.status === 'fulfilled' ? result.value : null;
      });

      return bulkResult;
    } catch (error) {
      if (__DEV__) {
        console.error('❌ Bulk get error:', error);
      }
      throw error;
    }
  }

  // Migration helper pour format de données
  async migrateDataFormat(key: string, migrationFn: (oldValue: string) => string): Promise<void> {
    try {
      const oldValue = await this.getItem(key);
      if (oldValue) {
        const newValue = migrationFn(oldValue);
        await this.setItem(key, newValue);
        
        if (__DEV__) {
          console.log(`🔒 Migrated data format for ${key}`);
        }
      }
    } catch (error) {
      if (__DEV__) {
        console.error(`❌ Migration error for ${key}:`, error);
      }
    }
  }

  // Check biometric availability
  async isBiometricAvailable(): Promise<boolean> {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      return hasHardware && isEnrolled;
    } catch (error) {
      return false;
    }
  }

  // Get supported biometric types
  async getSupportedBiometrics(): Promise<LocalAuthentication.AuthenticationType[]> {
    try {
      return await LocalAuthentication.supportedAuthenticationTypesAsync();
    } catch (error) {
      return [];
    }
  }
}

// Export singleton instance
export const secureStorage = new SecureStorageService();
export default secureStorage;