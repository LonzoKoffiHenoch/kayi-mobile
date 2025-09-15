export const APP_CONSTANTS = {
  // Timeout et retry
  DEFAULT_TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  
  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  
  // Cache et storage
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
  TOKEN_REFRESH_THRESHOLD: 5 * 60 * 1000, // 5 minutes avant expiration
  OFFLINE_STORAGE_LIMIT: 50 * 1024 * 1024, // 50MB max offline
  
  // Images et médias
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_IMAGES_PER_PROPERTY: 10,
  IMAGE_QUALITY: 0.8,
  IMAGE_RESIZE_WIDTH: 1024,
  IMAGE_RESIZE_HEIGHT: 768,
  
  // Géolocalisation
  LOCATION_TIMEOUT: 15000,
  LOCATION_MAX_AGE: 300000, // 5 minutes
  LOCATION_HIGH_ACCURACY: true,
  
  // SMS et OTP
  SMS_CODE_LENGTH: 6,
  SMS_CODE_EXPIRY: 15 * 60 * 1000, // 15 minutes
  SMS_RESEND_DELAY: 60 * 1000, // 1 minute
  
  // Mobile Money
  MM_PIN_LENGTH: 4,
  MM_TRANSACTION_TIMEOUT: 120000, // 2 minutes
  MM_BALANCE_REFRESH_INTERVAL: 30000, // 30 secondes
  
  // FLEX-RENT
  MIN_INSTALLMENT_MONTHS: 3,
  MAX_INSTALLMENT_MONTHS: 24,
  SERVICE_FEE_RATE: 0.03, // 3% annuel
  MIN_SOLVABILITY_SCORE: 500,
  
  // Animation et UX
  ANIMATION_DURATION: 300,
  SPLASH_SCREEN_DURATION: 2000,
  TOAST_DURATION: 3000,
} as const;

export const CI_CONSTANTS = {
  COUNTRY_CODE: 'CI',
  PHONE_PREFIX: '+225',
  CURRENCY: 'FCFA',
  CURRENCY_SYMBOL: 'FCFA',
  TIMEZONE: 'Africa/Abidjan',
  
  // Communes populaires Abidjan
  POPULAR_COMMUNES: [
    'COCODY',
    'PLATEAU', 
    'MARCORY',
    'YOPOUGON',
  ] as const,
  
  // Opérateurs Mobile Money
  MM_OPERATORS: [
    {
      id: 'ORANGE_MONEY',
      name: 'Orange Money',
      shortName: 'OM',
      color: '#FF7900',
      ussd: '*144#',
      deepLink: 'orange-money://',
    },
    {
      id: 'MTN_MONEY',
      name: 'MTN Mobile Money',
      shortName: 'MTN',
      color: '#FFCE00',
      ussd: '*133#',
      deepLink: 'mtn-money://',
    },
    {
      id: 'MOOV_MONEY',
      name: 'Moov Money',
      shortName: 'MOOV',
      color: '#00B4D8',
      ussd: '*155#',
      deepLink: 'moov-money://',
    },
  ] as const,
  
  // Prix ranges typiques CI (FCFA)
  PRICE_RANGES: [
    { min: 0, max: 100000, label: 'Moins de 100k' },
    { min: 100000, max: 200000, label: '100k - 200k' },
    { min: 200000, max: 300000, label: '200k - 300k' },
    { min: 300000, max: 500000, label: '300k - 500k' },
    { min: 500000, max: 1000000, label: '500k - 1M' },
    { min: 1000000, max: null, label: 'Plus de 1M' },
  ] as const,
  
  // Langues supportées
  SUPPORTED_LANGUAGES: [
    { code: 'fr', name: 'Français', nativeName: 'Français', flag: '🇫🇷' },
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
    { code: 'baule', name: 'Baoulé', nativeName: 'Baoulé', flag: '🇨🇮' },
    { code: 'dioula', name: 'Dioula', nativeName: 'Dioula', flag: '🇨🇮' },
  ] as const,
} as const;

export const STORAGE_KEYS = {
  // Auth
  ACCESS_TOKEN: 'kayi_access_token',
  REFRESH_TOKEN: 'kayi_refresh_token',
  USER_DATA: 'kayi_user_data',
  BIOMETRIC_ENABLED: 'kayi_biometric_enabled',
  
  // App state
  LANGUAGE: 'kayi_language',
  ONBOARDING_COMPLETED: 'kayi_onboarding_completed',
  THEME: 'kayi_theme',
  
  // Cache
  PROPERTIES_CACHE: 'kayi_properties_cache',
  SEARCH_HISTORY: 'kayi_search_history',
  FAVORITES: 'kayi_favorites',
  RECENT_SEARCHES: 'kayi_recent_searches',
  
  // Mobile Money
  MM_ACCOUNTS: 'kayi_mm_accounts',
  MM_TRANSACTIONS_CACHE: 'kayi_mm_transactions',
  
  // Settings
  NOTIFICATION_SETTINGS: 'kayi_notification_settings',
  PRIVACY_SETTINGS: 'kayi_privacy_settings',
  LOCATION_PERMISSION: 'kayi_location_permission',
  CAMERA_PERMISSION: 'kayi_camera_permission',
} as const;

export const API_ENDPOINTS = {
  // Authentication - Aligné avec backend NestJS
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    VERIFY_SMS: '/auth/verify-sms',
    REFRESH: '/auth/refresh',
    PROFILE: '/auth/profile',
    LOGOUT: '/auth/logout',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },

  // Properties
  PROPERTIES: {
    LIST: '/properties',
    DETAIL: (id: string) => `/properties/${id}`,
    CREATE: '/properties',
    UPDATE: (id: string) => `/properties/${id}`,
    DELETE: (id: string) => `/properties/${id}`,
    SEARCH: '/properties/search',
    FAVORITES: '/properties/favorites',
    NEARBY: '/properties/nearby',
    UPLOAD_IMAGES: (id: string) => `/properties/${id}/images`,
  },

  // Mobile Money
  MOBILE_MONEY: {
    ACCOUNTS: '/mobile-money/accounts',
    CONNECT: '/mobile-money/connect',
    VERIFY: '/mobile-money/verify',
    BALANCE: (accountId: string) => `/mobile-money/${accountId}/balance`,
    TRANSACTIONS: '/mobile-money/transactions',
    PAYMENT: '/mobile-money/payment',
    HISTORY: (accountId: string) => `/mobile-money/${accountId}/history`,
  },

  // FLEX-RENT
  FLEX_RENT: {
    SIMULATE: '/flex-rent/simulate',
    APPLY: '/flex-rent/apply',
    CONTRACTS: '/flex-rent/contracts',
    INSTALLMENTS: (contractId: string) => `/flex-rent/${contractId}/installments`,
    PAYMENT: (contractId: string) => `/flex-rent/${contractId}/payment`,
  },

  // User Profile
  USER: {
    PROFILE: '/user/profile',
    UPDATE: '/user/profile',
    UPLOAD_AVATAR: '/user/avatar',
    SETTINGS: '/user/settings',
    DELETE_ACCOUNT: '/user/delete',
  },
} as const;