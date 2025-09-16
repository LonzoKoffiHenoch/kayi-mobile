// Types de base
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

// Types API standards (alignés avec backend NestJS)
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  success: false;
  message: string;
  error: string;
  statusCode: number;
  timestamp: string;
}

// Types géographiques Côte d'Ivoire
export enum Commune {
  COCODY = 'COCODY',
  PLATEAU = 'PLATEAU',
  MARCORY = 'MARCORY',
  TREICHVILLE = 'TREICHVILLE',
  YOPOUGON = 'YOPOUGON',
  ABOBO = 'ABOBO',
  ADJAME = 'ADJAME',
  ATTECOUBE = 'ATTECOUBE',
  KOUMASSI = 'KOUMASSI',
  PORT_BOUET = 'PORT_BOUET',
}

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
  commune?: Commune;
  neighborhood?: string;
}

// Types langues
export type SupportedLanguage = 'fr' | 'en' | 'baule' | 'dioula';

export interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
}

// Types utilisateur
export enum UserRole {
  TENANT = 'TENANT',
  LANDLORD = 'LANDLORD',
  AGENT = 'AGENT',
  ADMIN = 'ADMIN',
}

export interface User extends BaseEntity {
  email?: string;
  phone: string;
  firstName: string;
  lastName: string;
  preferredLanguage: SupportedLanguage;
  role: UserRole;
  verified: boolean;
  nationalId?: string;
  commune?: Commune;
  neighborhood?: string;
  monthlyIncome?: number;
  profilePicture?: string;
}

// Types Mobile Money
export enum MobileMoneyOperator {
  ORANGE_MONEY = 'ORANGE_MONEY',
  MTN_MONEY = 'MTN_MONEY',
  MOOV_MONEY = 'MOOV_MONEY',
}

export interface MobileMoneyAccount extends BaseEntity {
  userId: string;
  operator: MobileMoneyOperator;
  phoneNumber: string;
  accountName: string;
  verified: boolean;
  isActive: boolean;
  isPrimary: boolean;
  lastBalance?: number;
}

// Types navigation Expo Router
export type RootStackParamList = {
  // Auth Stack
  '(auth)': undefined;
  '(auth)/welcome': undefined;
  '(auth)/login': undefined;
  '(auth)/register': undefined;
  '(auth)/verify-sms': { phone: string };
  '(auth)/forgot-password': undefined;
  
  // Main Tabs
  '(tabs)': undefined;
  '(tabs)/home': undefined;
  '(tabs)/search': undefined;
  '(tabs)/favorites': undefined;
  '(tabs)/profile': undefined;
  
  // Property Stack
  'property/[id]': { id: string };
  'property/create': undefined;
  'property/edit/[id]': { id: string };
  
  // Mobile Money Stack
  'mobile-money/accounts': undefined;
  'mobile-money/connect': undefined;
  'mobile-money/payment': { propertyId?: string; amount?: number };
  
  // FLEX-RENT Stack
  'flex-rent/simulation/[propertyId]': { propertyId: string };
  'flex-rent/application/[simulationId]': { simulationId: string };
  
  // Modal
  modal: undefined;
};

// Types formulaires
export interface FormError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: FormError[];
}

// Types état application
export interface AppState {
  isLoading: boolean;
  error: string | null;
  networkStatus: 'online' | 'offline' | 'unknown';
  language: SupportedLanguage;
  theme: 'light' | 'dark';
  isFirstLaunch: boolean;
  onboardingCompleted: boolean;
}