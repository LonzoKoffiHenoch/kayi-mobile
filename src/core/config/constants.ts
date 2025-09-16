// API Configuration
export const API_CONFIG = {
  TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

// Cache Configuration (TTL in milliseconds)
export const CACHE_TTL = {
  SHORT: 5 * 60 * 1000, // 5 minutes
  MEDIUM: 30 * 60 * 1000, // 30 minutes
  LONG: 24 * 60 * 60 * 1000, // 24 hours
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  // MMKV Keys
  USER_PREFERENCES: 'user_preferences',
  LAST_SYNC: 'last_sync',
  OFFLINE_DATA: 'offline_data',
  SEARCH_HISTORY: 'search_history',
  FAVORITE_PROPERTIES: 'favorite_properties',
  
  // SecureStore Keys
  JWT_ACCESS_TOKEN: 'jwt_access_token',
  JWT_REFRESH_TOKEN: 'jwt_refresh_token',
  BIOMETRIC_TOKEN: 'biometric_token',
} as const;

// Côte d'Ivoire Communes
export const COTE_DIVOIRE_COMMUNES = {
  ABIDJAN: {
    ABOBO: 'Abobo',
    ADJAME: 'Adjamé',
    ATTECOUBE: 'Attécoubé',
    COCODY: 'Cocody',
    KOUMASSI: 'Koumassi',
    MARCORY: 'Marcory',
    PLATEAU: 'Plateau',
    PORT_BOUET: 'Port-Bouët',
    TREICHVILLE: 'Treichville',
    YOPOUGON: 'Yopougon',
  },
  BOUAKE: {
    BOUAKE_CENTRE: 'Bouaké Centre',
    KOKO: 'Koko',
    NIMBO: 'Nimbo',
  },
  YAMOUSSOUKRO: {
    YAMOUSSOUKRO_CENTRE: 'Yamoussoukro Centre',
  },
  SAN_PEDRO: {
    SAN_PEDRO_CENTRE: 'San-Pédro Centre',
  },
  DALOA: {
    DALOA_CENTRE: 'Daloa Centre',
  },
} as const;

// Mobile Money Operators in Côte d'Ivoire
export const MOBILE_MONEY_OPERATORS = {
  ORANGE_MONEY: {
    name: 'Orange Money',
    code: 'OM',
    color: '#FF7900',
    prefixes: ['07', '77', '87'],
  },
  MTN_MONEY: {
    name: 'MTN Money',
    code: 'MTN',
    color: '#FFCC00',
    prefixes: ['05', '55', '65'],
  },
  MOOV_MONEY: {
    name: 'Moov Money',
    code: 'MOOV',
    color: '#00B4CC',
    prefixes: ['01', '02', '03'],
  },
  WAVE: {
    name: 'Wave',
    code: 'WAVE',
    color: '#00D4AA',
    prefixes: ['70'],
  },
} as const;

// Property Price Ranges (in CFA)
export const PRICE_RANGES = {
  STUDIO: {
    MIN: 25000,
    MAX: 80000,
  },
  ONE_BEDROOM: {
    MIN: 50000,
    MAX: 150000,
  },
  TWO_BEDROOM: {
    MIN: 80000,
    MAX: 250000,
  },
  THREE_BEDROOM: {
    MIN: 120000,
    MAX: 400000,
  },
  FOUR_PLUS_BEDROOM: {
    MIN: 200000,
    MAX: 800000,
  },
  VILLA: {
    MIN: 300000,
    MAX: 2000000,
  },
} as const;

// Property Types
export const PROPERTY_TYPES = {
  STUDIO: 'Studio',
  APARTMENT: 'Appartement',
  VILLA: 'Villa',
  HOUSE: 'Maison',
  DUPLEX: 'Duplex',
  OFFICE: 'Bureau',
  SHOP: 'Boutique',
  WAREHOUSE: 'Entrepôt',
} as const;

// Amenities
export const AMENITIES = {
  PARKING: 'Parking',
  SECURITY: 'Sécurité',
  GARDEN: 'Jardin',
  POOL: 'Piscine',
  BALCONY: 'Balcon',
  AIR_CONDITIONING: 'Climatisation',
  FURNISHED: 'Meublé',
  INTERNET: 'Internet',
  WATER: 'Eau courante',
  ELECTRICITY: 'Électricité',
  GENERATOR: 'Groupe électrogène',
} as const;

// App Configuration
export const APP_CONFIG = {
  MIN_SEARCH_CHARS: 2,
  DEBOUNCE_DELAY: 300, // milliseconds
  IMAGE_QUALITY: 0.8,
  MAX_IMAGES_PER_PROPERTY: 10,
  GEOLOCATION_TIMEOUT: 15000, // 15 seconds
  GEOLOCATION_MAX_AGE: 300000, // 5 minutes
} as const;

// Languages
export const SUPPORTED_LANGUAGES = {
  FR: 'fr',
  EN: 'en',
} as const;

// Error Codes
export const ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  AUTH_ERROR: 'AUTH_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  NOT_FOUND: 'NOT_FOUND',
} as const;