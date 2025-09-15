// Core utilities barrel export
// Centralize all core utilities for easy importing

// API Client and types
export { default as apiClient } from './api/apiClient';
import { default as apiClient } from './api/apiClient';
export { API_ENDPOINTS, buildUrl, addQueryParams } from './api/endpoints';
export type * from './types/api.types';
export type * from './types/storage.types';

// Storage services
export { default as secureStorage } from './storage/secureStorage';
import { default as secureStorage } from './storage/secureStorage';
export { default as localStorage } from './storage/localStorage';
import { default as localStorage } from './storage/localStorage';

// Validators (Côte d'Ivoire specific)
export {
  // Basic validators
  validateCIPhone,
  validateCICNI,
  validateCIPrice,
  validateCICoordinates,
  validateCommune,
  getPhoneOperator,
  
  // Form validators
  validateRegistrationForm,
  validateLoginForm,
  validatePropertyForm,
  
  // Debounced validators
  createDebouncedValidator,
  debouncedPhoneValidator,
  debouncedEmailValidator,
} from './utils/validators';

// Formatters (Côte d'Ivoire specific)
export {
  // Currency and numbers
  formatCurrency,
  formatPercentage,
  
  // Phone numbers
  formatPhoneDisplay,
  
  // Text and strings
  capitalize,
  titleCase,
  maskSensitiveData,
  truncateText,
  
  // Location and addresses
  formatAddress,
  formatDistance,
  
  // Time and dates
  formatRelativeTime,
  formatDuration,
  
  // Other formatters
  formatFileSize,
  formatOrdinal,
  formatSurface,
} from './utils/formatters';

// Core utilities combining multiple services
export class CoreServices {
  static readonly api = apiClient;
  static readonly storage = {
    secure: secureStorage,
    local: localStorage,
  };
  
  // Quick access methods
  static async isOnline(): Promise<boolean> {
    const networkInfo = await apiClient.checkNetworkStatus();
    return networkInfo.isConnected && networkInfo.isInternetReachable;
  }
  
  static async healthCheck(): Promise<boolean> {
    return await apiClient.healthCheck();
  }
  
  static async clearAllData(): Promise<void> {
    await Promise.allSettled([
      secureStorage.clear(),
      localStorage.clear(),
    ]);
  }
  
  static async getUserId(): Promise<string | null> {
    try {
      const authTokens = await secureStorage.getAuthTokens();
      return authTokens?.userId || null;
    } catch (error) {
      return null;
    }
  }
  
  static async isUserAuthenticated(): Promise<boolean> {
    try {
      const authTokens = await secureStorage.getAuthTokens();
      if (!authTokens?.accessToken || !authTokens?.expiresAt) {
        return false;
      }
      
      // Vérifier si le token n'est pas expiré (avec marge de 5 minutes)
      const now = Date.now();
      const expiration = authTokens.expiresAt;
      const margin = 5 * 60 * 1000; // 5 minutes en ms
      
      return expiration > (now + margin);
    } catch (error) {
      return false;
    }
  }
  
  static async getCacheStats() {
    try {
      const [databaseStats, biometricSupported] = await Promise.allSettled([
        localStorage.getDatabaseStats(),
        secureStorage.isBiometricAvailable(),
      ]);
      
      return {
        database: databaseStats.status === 'fulfilled' ? databaseStats.value : {
          properties: 0,
          searchHistory: 0,
          favorites: 0,
          totalSize: '0 B',
        },
        biometricSupported: biometricSupported.status === 'fulfilled' ? biometricSupported.value : false,
      };
    } catch (error) {
      return {
        database: {
          properties: 0,
          searchHistory: 0,
          favorites: 0,
          totalSize: '0 B',
        },
        biometricSupported: false,
      };
    }
  }
}

// Default export for convenience
export default CoreServices;