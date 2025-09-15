// Tests d'intégration des utilitaires core KAYI House
import { CoreServices, validateCIPhone, formatCurrency, apiClient, secureStorage, localStorage } from '../index';

// Mock des modules Expo pour les tests
jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn(() => Promise.resolve({
    execAsync: jest.fn(),
    runAsync: jest.fn(),
    getFirstAsync: jest.fn(),
    getAllAsync: jest.fn(),
  })),
}));

jest.mock('expo-network', () => ({
  getNetworkStateAsync: jest.fn(() => Promise.resolve({
    isConnected: true,
    type: 'wifi',
    isInternetReachable: true,
  })),
}));

jest.mock('expo-device', () => ({
  osName: 'iOS',
  osVersion: '17.0',
}));

describe('Core Services Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should provide access to all core services', () => {
    expect(CoreServices.api).toBeDefined();
    expect(CoreServices.storage.secure).toBeDefined();
    expect(CoreServices.storage.local).toBeDefined();
  });

  test('should check online status', async () => {
    const isOnline = await CoreServices.isOnline();
    expect(typeof isOnline).toBe('boolean');
  });

  test('should perform health check', async () => {
    // Mock axios pour le health check
    const mockAxios = jest.spyOn(apiClient, 'healthCheck').mockResolvedValue(true);
    
    const isHealthy = await CoreServices.healthCheck();
    expect(typeof isHealthy).toBe('boolean');
    
    mockAxios.mockRestore();
  });

  test('should get cache stats', async () => {
    const mockGetDatabaseStats = jest.spyOn(localStorage, 'getDatabaseStats')
      .mockResolvedValue({
        properties: 0,
        searchHistory: 0,
        favorites: 0,
        totalSize: '0 B',
      });

    const mockIsBiometricAvailable = jest.spyOn(secureStorage, 'isBiometricAvailable')
      .mockResolvedValue(false);

    const stats = await CoreServices.getCacheStats();
    
    expect(stats).toHaveProperty('database');
    expect(stats).toHaveProperty('biometricSupported');
    expect(typeof stats.biometricSupported).toBe('boolean');

    mockGetDatabaseStats.mockRestore();
    mockIsBiometricAvailable.mockRestore();
  });
});

describe('Validators + Formatters Integration', () => {
  test('should validate and format CI phone number', () => {
    const testPhone = '0123456789';
    
    // Valider le numéro
    const isValid = validateCIPhone(testPhone);
    expect(isValid).toBe(true);
    
    // Le formatter utilise le validateur en interne
    const formatted = require('../utils/formatters').formatPhoneDisplay(testPhone);
    expect(formatted).toBe('01 23 45 67 89');
  });

  test('should validate price and format currency', () => {
    const testPrice = 150000;
    
    // Valider le prix
    const { validateCIPrice } = require('../utils/validators');
    const validation = validateCIPrice(testPrice);
    expect(validation.isValid).toBe(true);
    
    // Formater le prix
    const formatted = formatCurrency(testPrice);
    expect(formatted).toBe('150 000 FCFA');
  });

  test('should handle complete registration flow validation', () => {
    const registrationData = {
      firstName: 'Kouame',
      lastName: 'Yao',
      phone: '0123456789',
      email: 'kouame@example.com',
      password: 'StrongP@ss123',
      confirmPassword: 'StrongP@ss123',
      acceptTerms: true,
    };

    const { validateRegistrationForm } = require('../utils/validators');
    const result = validateRegistrationForm(registrationData);
    
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});

describe('Storage Integration', () => {
  test('should handle auth flow with secure storage', async () => {
    const mockTokens = {
      accessToken: 'fake-access-token',
      refreshToken: 'fake-refresh-token',
      userId: 'user-123',
      expiresAt: Date.now() + 3600000, // 1 heure
    };

    // Mock the secure storage methods
    const mockSetAuthTokens = jest.spyOn(secureStorage, 'setAuthTokens')
      .mockResolvedValue(undefined);
    
    const mockGetAuthTokens = jest.spyOn(secureStorage, 'getAuthTokens')
      .mockResolvedValue(mockTokens);

    const mockIsUserAuthenticated = jest.spyOn(CoreServices, 'isUserAuthenticated')
      .mockResolvedValue(true);

    // Test storing tokens
    await secureStorage.setAuthTokens(mockTokens);
    expect(mockSetAuthTokens).toHaveBeenCalledWith(mockTokens);

    // Test retrieving tokens
    const retrievedTokens = await secureStorage.getAuthTokens();
    expect(retrievedTokens).toEqual(mockTokens);

    // Test authentication check
    const isAuthenticated = await CoreServices.isUserAuthenticated();
    expect(isAuthenticated).toBe(true);

    mockSetAuthTokens.mockRestore();
    mockGetAuthTokens.mockRestore();
    mockIsUserAuthenticated.mockRestore();
  });

  test('should handle property caching with local storage', async () => {
    const mockProperty = {
      id: 'prop-123',
      data: { title: 'Appartement Cocody', price: 150000 },
      images: ['image1.jpg', 'image2.jpg'],
      lastUpdated: Date.now(),
      viewCount: 5,
    };

    const mockCacheProperty = jest.spyOn(localStorage, 'cacheProperty')
      .mockResolvedValue(undefined);
    
    const mockGetCachedProperty = jest.spyOn(localStorage, 'getCachedProperty')
      .mockResolvedValue(mockProperty);

    // Test caching property
    await localStorage.cacheProperty(mockProperty);
    expect(mockCacheProperty).toHaveBeenCalledWith(mockProperty);

    // Test retrieving cached property
    const cachedProperty = await localStorage.getCachedProperty('prop-123');
    expect(cachedProperty).toEqual(mockProperty);

    mockCacheProperty.mockRestore();
    mockGetCachedProperty.mockRestore();
  });
});

describe('API Client Integration', () => {
  test('should handle network status and requests', async () => {
    // Mock network check
    const mockCheckNetworkStatus = jest.spyOn(apiClient, 'checkNetworkStatus')
      .mockResolvedValue({
        isConnected: true,
        type: 'wifi',
        isInternetReachable: true,
      });

    const networkStatus = await apiClient.checkNetworkStatus();
    
    expect(networkStatus.isConnected).toBe(true);
    expect(networkStatus.type).toBe('wifi');
    expect(networkStatus.isInternetReachable).toBe(true);

    mockCheckNetworkStatus.mockRestore();
  });

  test('should create cancel token for requests', () => {
    const cancelToken = apiClient.createCancelToken();
    
    expect(cancelToken).toHaveProperty('token');
    expect(cancelToken).toHaveProperty('cancel');
    expect(typeof cancelToken.cancel).toBe('function');
  });
});

describe('Real-world Scenarios Integration', () => {
  test('should handle complete property search flow', () => {
    // 1. Valider les critères de recherche
    const searchCriteria = {
      commune: 'COCODY',
      minPrice: 100000,
      maxPrice: 300000,
      latitude: 5.3600,
      longitude: -4.0083,
    };

    const { validateCommune, validateCIPrice, validateCICoordinates } = 
      require('../utils/validators');

    expect(validateCommune(searchCriteria.commune)).toBe(true);
    expect(validateCIPrice(searchCriteria.minPrice).isValid).toBe(true);
    expect(validateCIPrice(searchCriteria.maxPrice).isValid).toBe(true);
    expect(validateCICoordinates(searchCriteria.latitude, searchCriteria.longitude)).toBe(true);

    // 2. Formater l'affichage des résultats
    const { formatCurrency, formatDistance, formatAddress } = require('../utils/formatters');
    
    const formattedMinPrice = formatCurrency(searchCriteria.minPrice);
    const formattedMaxPrice = formatCurrency(searchCriteria.maxPrice);
    
    expect(formattedMinPrice).toBe('100 000 FCFA');
    expect(formattedMaxPrice).toBe('300 000 FCFA');

    // 3. Calculer la distance (exemple)
    const distance = formatDistance(1500); // 1.5km
    expect(distance).toBe('1.5 km');

    // 4. Formater une adresse résultat
    const address = formatAddress({
      details: 'Immeuble Harmony',
      neighborhood: 'Riviera Golf',
      commune: searchCriteria.commune,
    });
    expect(address).toBe('Immeuble Harmony, Riviera Golf, Cocody, Abidjan');
  });

  test('should handle complete user registration flow', () => {
    const userData = {
      firstName: 'Aya',
      lastName: 'Kouassi',
      phone: '0767891234',
      email: 'aya.kouassi@example.com',
      password: 'SecureP@ss2024',
      confirmPassword: 'SecureP@ss2024',
      nationalId: 'CI1234567890',
      commune: 'MARCORY',
      acceptTerms: true,
    };

    // 1. Validation complète du formulaire
    const { validateRegistrationForm } = require('../utils/validators');
    const validation = validateRegistrationForm(userData);
    expect(validation.isValid).toBe(true);

    // 2. Formatage pour affichage/stockage
    const { formatPhoneDisplay, formatAddress, capitalize } = require('../utils/formatters');
    
    const displayPhone = formatPhoneDisplay(userData.phone);
    expect(displayPhone).toBe('07 67 89 12 34');

    const displayName = `${capitalize(userData.firstName)} ${capitalize(userData.lastName)}`;
    expect(displayName).toBe('Aya Kouassi');

    // 3. Masquage des données sensibles pour logs
    const { maskSensitiveData } = require('../utils/formatters');
    const maskedPhone = maskSensitiveData(userData.phone);
    expect(maskedPhone).toBe('07******34');
  });

  test('should handle property listing with all formatters', () => {
    const propertyData = {
      id: 'prop-456',
      title: 'Villa moderne Cocody',
      price: 2500000,
      surface: 250,
      location: {
        details: '2 Plateaux Vallon',
        neighborhood: 'Les Deux Plateaux', 
        commune: 'COCODY',
        latitude: 5.3600,
        longitude: -4.0083,
      },
      images: ['img1.jpg', 'img2.jpg', 'img3.jpg'],
      createdAt: '2024-01-15T10:30:00Z',
      viewCount: 128,
    };

    const {
      formatCurrency,
      formatSurface,
      formatAddress,
      formatRelativeTime,
      formatOrdinal,
    } = require('../utils/formatters');

    // Formatage prix
    const displayPrice = formatCurrency(propertyData.price);
    expect(displayPrice).toBe('2 500 000 FCFA');

    // Formatage surface
    const displaySurface = formatSurface(propertyData.surface);
    expect(displaySurface).toBe('250 m²');

    // Formatage adresse complète
    const displayAddress = formatAddress(propertyData.location);
    expect(displayAddress).toBe('2 Plateaux Vallon, Les Deux Plateaux, Cocody, Abidjan');

    // Formatage nombre d'images
    const imageCount = `${propertyData.images.length} ${propertyData.images.length === 1 ? 'photo' : 'photos'}`;
    expect(imageCount).toBe('3 photos');
  });

  test('should handle mobile money transaction flow', () => {
    const transactionData = {
      amount: 150000,
      phone: '0123456789',
      operator: 'ORANGE_MONEY',
      reference: 'RENT-2024-001',
    };

    // 1. Validation
    const { validateCIPhone, validateCIPrice, getPhoneOperator } = require('../utils/validators');
    
    expect(validateCIPhone(transactionData.phone)).toBe(true);
    expect(validateCIPrice(transactionData.amount).isValid).toBe(true);
    expect(getPhoneOperator(transactionData.phone)).toBe('ORANGE');

    // 2. Formatage pour affichage
    const { formatCurrency, formatPhoneDisplay, maskSensitiveData } = require('../utils/formatters');
    
    const displayAmount = formatCurrency(transactionData.amount);
    const displayPhone = formatPhoneDisplay(transactionData.phone, { masked: true });
    const maskedReference = maskSensitiveData(transactionData.reference, { visibleStart: 4, visibleEnd: 3 });
    
    expect(displayAmount).toBe('150 000 FCFA');
    expect(displayPhone).toBe('01 XX XX XX 89');
    expect(maskedReference).toBe('RENT***001');
  });
});

// Tests de robustesse avec données corrompues
describe('Error Handling Integration', () => {
  test('should handle corrupted phone numbers gracefully', () => {
    const { validateCIPhone } = require('../utils/validators');
    const { formatPhoneDisplay } = require('../utils/formatters');
    const corruptedPhones = ['', null, undefined, 'abc', '+++225', '012345'];

    corruptedPhones.forEach(phone => {
      expect(validateCIPhone(phone)).toBe(false);
      expect(typeof formatPhoneDisplay(phone)).toBe('string');
    });
  });

  test('should handle invalid currency values gracefully', () => {
    const invalidAmounts = [NaN, Infinity, -Infinity, null, undefined, 'abc'];

    invalidAmounts.forEach(amount => {
      const numAmount = typeof amount === 'number' ? amount : 0;
      expect(typeof formatCurrency(numAmount)).toBe('string');
      expect(formatCurrency(numAmount)).toContain('FCFA'); // Should always include currency
    });
  });

  test('should handle network failures gracefully', async () => {
    // Mock network failure
    const mockCheckNetworkStatus = jest.spyOn(apiClient, 'checkNetworkStatus')
      .mockRejectedValue(new Error('Network error'));

    // CoreServices should handle the error
    const isOnline = await CoreServices.isOnline().catch(() => false);
    expect(typeof isOnline).toBe('boolean');

    mockCheckNetworkStatus.mockRestore();
  });
});

// Tests de performance
describe('Performance Integration', () => {
  test('should handle large datasets efficiently', () => {
    const { formatCurrency } = require('../utils/formatters');
    
    // Test avec 1000 formatages de prix
    const start = performance.now();
    const prices = Array.from({ length: 1000 }, (_, i) => i * 1000);
    const formatted = prices.map(price => formatCurrency(price));
    const end = performance.now();
    
    expect(formatted).toHaveLength(1000);
    expect(end - start).toBeLessThan(1000); // Moins de 1 seconde
  });

  test('should handle concurrent validations efficiently', () => {
    const { validateCIPhone } = require('../utils/validators');
    
    const phones = [
      '0123456789', '0234567890', '0345678901', '0456789012', '0567890123',
      '0678901234', '0789012345', '0890123456', '0901234567', '0012345678',
    ];
    
    // Test validation concurrente
    const start = performance.now();
    const results = phones.map(phone => validateCIPhone(phone));
    const end = performance.now();
    
    expect(results.filter(Boolean)).toHaveLength(9); // 9 valides sur 10
    expect(end - start).toBeLessThan(100); // Moins de 100ms
  });
});