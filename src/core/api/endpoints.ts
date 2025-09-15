// API Endpoints organisés par modules - Aligné avec backend NestJS

export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    VERIFY_SMS: '/auth/verify-sms',
    REFRESH: '/auth/refresh',
    PROFILE: '/auth/profile',
    LOGOUT: '/auth/logout',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    CHANGE_PASSWORD: '/auth/change-password',
    RESEND_SMS: '/auth/resend-sms',
  },

  // User Profile
  USER: {
    PROFILE: '/user/profile',
    UPDATE: '/user/profile',
    UPLOAD_AVATAR: '/user/avatar',
    SETTINGS: '/user/settings',
    NOTIFICATIONS: '/user/notifications',
    DELETE_ACCOUNT: '/user/delete',
    VERIFY_IDENTITY: '/user/verify-identity',
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
    SIMILAR: (id: string) => `/properties/${id}/similar`,
    UPLOAD_IMAGES: (id: string) => `/properties/${id}/images`,
    DELETE_IMAGE: (propertyId: string, imageId: string) => `/properties/${propertyId}/images/${imageId}`,
    CONTACT_OWNER: (id: string) => `/properties/${id}/contact`,
    REPORT: (id: string) => `/properties/${id}/report`,
    VIEWS: (id: string) => `/properties/${id}/views`,
    STATS: '/properties/stats',
  },

  // Mobile Money
  MOBILE_MONEY: {
    // Account management
    ACCOUNTS: '/mobile-money/accounts',
    CONNECT: '/mobile-money/connect',
    VERIFY: '/mobile-money/verify',
    DISCONNECT: (accountId: string) => `/mobile-money/accounts/${accountId}/disconnect`,
    
    // Balance and transactions
    BALANCE: (accountId: string) => `/mobile-money/accounts/${accountId}/balance`,
    TRANSACTIONS: '/mobile-money/transactions',
    TRANSACTION_DETAIL: (transactionId: string) => `/mobile-money/transactions/${transactionId}`,
    HISTORY: (accountId: string) => `/mobile-money/accounts/${accountId}/history`,
    
    // Payments
    PAYMENT: '/mobile-money/payment',
    PAYMENT_CALLBACK: '/mobile-money/payment/callback',
    PAYMENT_STATUS: (paymentId: string) => `/mobile-money/payments/${paymentId}/status`,
    
    // Operators
    OPERATORS: '/mobile-money/operators',
    OPERATOR_STATUS: (operator: string) => `/mobile-money/operators/${operator}/status`,
  },

  // FLEX-RENT
  FLEX_RENT: {
    // Simulation
    SIMULATE: '/flex-rent/simulate',
    SIMULATION_DETAIL: (simulationId: string) => `/flex-rent/simulations/${simulationId}`,
    
    // Applications
    APPLY: '/flex-rent/apply',
    APPLICATION_STATUS: (applicationId: string) => `/flex-rent/applications/${applicationId}`,
    APPLICATIONS: '/flex-rent/applications',
    
    // Contracts
    CONTRACTS: '/flex-rent/contracts',
    CONTRACT_DETAIL: (contractId: string) => `/flex-rent/contracts/${contractId}`,
    CONTRACT_DOCUMENT: (contractId: string) => `/flex-rent/contracts/${contractId}/document`,
    
    // Installments
    INSTALLMENTS: (contractId: string) => `/flex-rent/contracts/${contractId}/installments`,
    INSTALLMENT_PAYMENT: (contractId: string, installmentId: string) => 
      `/flex-rent/contracts/${contractId}/installments/${installmentId}/payment`,
    
    // Credit scoring
    CREDIT_SCORE: '/flex-rent/credit-score',
    CREDIT_REPORT: '/flex-rent/credit-report',
    
    // Documents
    UPLOAD_DOCUMENTS: '/flex-rent/documents',
    DOCUMENT_STATUS: (documentId: string) => `/flex-rent/documents/${documentId}`,
  },

  // Notifications
  NOTIFICATIONS: {
    LIST: '/notifications',
    MARK_READ: (id: string) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/read-all',
    DELETE: (id: string) => `/notifications/${id}`,
    SETTINGS: '/notifications/settings',
    
    // Push notifications
    REGISTER_TOKEN: '/notifications/push/register',
    UNREGISTER_TOKEN: '/notifications/push/unregister',
  },

  // Location and Geo
  LOCATION: {
    COMMUNES: '/location/communes',
    NEIGHBORHOODS: (commune: string) => `/location/communes/${commune}/neighborhoods`,
    GEOCODE: '/location/geocode',
    REVERSE_GEOCODE: '/location/reverse-geocode',
    
    // Points of interest
    NEARBY_POI: '/location/nearby',
    POI_CATEGORIES: '/location/poi-categories',
  },

  // Support and Help
  SUPPORT: {
    TICKETS: '/support/tickets',
    CREATE_TICKET: '/support/tickets',
    TICKET_DETAIL: (ticketId: string) => `/support/tickets/${ticketId}`,
    FAQ: '/support/faq',
    FAQ_CATEGORIES: '/support/faq/categories',
    
    // Feedback
    FEEDBACK: '/support/feedback',
    RATING: '/support/rating',
  },

  // Analytics (for internal use)
  ANALYTICS: {
    EVENTS: '/analytics/events',
    USER_BEHAVIOR: '/analytics/user-behavior',
    PROPERTY_VIEWS: '/analytics/property-views',
    SEARCH_TRENDS: '/analytics/search-trends',
  },

  // Administrative
  ADMIN: {
    USERS: '/admin/users',
    USER_DETAIL: (userId: string) => `/admin/users/${userId}`,
    PROPERTIES: '/admin/properties',
    PROPERTY_APPROVE: (id: string) => `/admin/properties/${id}/approve`,
    PROPERTY_REJECT: (id: string) => `/admin/properties/${id}/reject`,
    
    // Statistics
    STATS: '/admin/stats',
    REPORTS: '/admin/reports',
  },

  // External integrations
  EXTERNAL: {
    // Orange Money
    ORANGE_MONEY_TOKEN: '/external/orange-money/token',
    ORANGE_MONEY_PAYMENT: '/external/orange-money/payment',
    
    // MTN Money  
    MTN_MONEY_TOKEN: '/external/mtn-money/token',
    MTN_MONEY_PAYMENT: '/external/mtn-money/payment',
    
    // Moov Money
    MOOV_MONEY_TOKEN: '/external/moov-money/token',
    MOOV_MONEY_PAYMENT: '/external/moov-money/payment',
    
    // SMS Gateway
    SMS_SEND: '/external/sms/send',
    SMS_STATUS: (messageId: string) => `/external/sms/status/${messageId}`,
  },
} as const;

// Helper functions pour construire des URLs dynamiques
export const buildUrl = (template: string, params: Record<string, string | number>): string => {
  let url = template;
  for (const [key, value] of Object.entries(params)) {
    url = url.replace(`:${key}`, String(value));
  }
  return url;
};

// Helper pour ajouter query params
export const addQueryParams = (url: string, params: Record<string, any>): string => {
  const validParams = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');
  
  if (!validParams) return url;
  
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}${validParams}`;
};

// Types pour validation endpoints
export type AuthEndpoint = keyof typeof API_ENDPOINTS.AUTH;
export type PropertyEndpoint = keyof typeof API_ENDPOINTS.PROPERTIES;
export type MobileMoneyEndpoint = keyof typeof API_ENDPOINTS.MOBILE_MONEY;
export type FlexRentEndpoint = keyof typeof API_ENDPOINTS.FLEX_RENT;