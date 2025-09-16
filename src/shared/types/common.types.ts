import { SUPPORTED_LANGUAGES, ERROR_CODES } from '../../core/config/constants';

// Base Entity
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  errors?: ValidationError[];
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  code: string;
  errors?: ValidationError[];
  details?: any;
}

// Pagination
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: PaginationMeta;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Validation
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

// Language Support
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[keyof typeof SUPPORTED_LANGUAGES];

// Coordinates & Location
export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface LocationInfo {
  coordinates: Coordinates;
  address?: string;
  commune?: string;
  district?: string;
  city?: string;
  country?: string;
}

// Côte d'Ivoire Communes
export enum Commune {
  // Abidjan
  ABOBO = 'Abobo',
  ADJAME = 'Adjamé',
  ATTECOUBE = 'Attécoubé',
  COCODY = 'Cocody',
  KOUMASSI = 'Koumassi',
  MARCORY = 'Marcory',
  PLATEAU = 'Plateau',
  PORT_BOUET = 'Port-Bouët',
  TREICHVILLE = 'Treichville',
  YOPOUGON = 'Yopougon',
  
  // Other cities
  BOUAKE_CENTRE = 'Bouaké Centre',
  KOKO = 'Koko',
  NIMBO = 'Nimbo',
  YAMOUSSOUKRO_CENTRE = 'Yamoussoukro Centre',
  SAN_PEDRO_CENTRE = 'San-Pédro Centre',
  DALOA_CENTRE = 'Daloa Centre',
}

// Property Related Types
export enum PropertyType {
  STUDIO = 'Studio',
  APARTMENT = 'Appartement',
  VILLA = 'Villa',
  HOUSE = 'Maison',
  DUPLEX = 'Duplex',
  OFFICE = 'Bureau',
  SHOP = 'Boutique',
  WAREHOUSE = 'Entrepôt',
}

export enum ListingType {
  RENT = 'rent',
  SALE = 'sale',
}

export interface PriceRange {
  min: number;
  max: number;
}

export interface PropertyFeatures {
  bedrooms?: number;
  bathrooms?: number;
  area?: number; // in square meters
  parking?: boolean;
  garden?: boolean;
  pool?: boolean;
  security?: boolean;
  furnished?: boolean;
  airConditioning?: boolean;
  internet?: boolean;
  generator?: boolean;
}

// File & Media Types
export interface FileInfo {
  id: string;
  url: string;
  name: string;
  size: number;
  mimeType: string;
  thumbnail?: string;
}

export interface ImageInfo extends FileInfo {
  width: number;
  height: number;
  alt?: string;
}

// User Related Types
export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: ImageInfo;
  isVerified: boolean;
  language: SupportedLanguage;
  location?: LocationInfo;
  createdAt: string;
  updatedAt: string;
}

// Authentication Types
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  acceptTerms: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface AuthResponse extends ApiResponse {
  data: {
    user: UserProfile;
    tokens: AuthTokens;
  };
}

// Search & Filter Types
export interface SearchFilters {
  type?: PropertyType;
  listingType?: ListingType;
  commune?: Commune;
  priceRange?: PriceRange;
  bedrooms?: number;
  bathrooms?: number;
  area?: PriceRange;
  features?: Partial<PropertyFeatures>;
  location?: {
    coordinates: Coordinates;
    radius: number; // in kilometers
  };
}

export interface SearchParams extends PaginationParams {
  query?: string;
  filters?: SearchFilters;
}

// Contact & Communication
export interface ContactInfo {
  name: string;
  email?: string;
  phone?: string;
  message: string;
  propertyId?: string;
}

// Error Types
export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];

export interface AppError {
  code: ErrorCode;
  message: string;
  details?: any;
  timestamp: string;
}

// Utility Types
export interface SelectOption<T = string> {
  label: string;
  value: T;
  disabled?: boolean;
}

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export interface AsyncData<T> extends LoadingState {
  data: T | null;
}

// Form Types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' | 'checkbox' | 'radio';
  required?: boolean;
  placeholder?: string;
  options?: SelectOption[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    custom?: (value: any) => string | undefined;
  };
}

// Device & Platform
export interface DeviceInfo {
  platform: 'ios' | 'android' | 'web';
  version: string;
  model?: string;
  isTablet: boolean;
  screenDimensions: {
    width: number;
    height: number;
  };
}

// Notification Types
export interface NotificationData {
  id: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  createdAt: string;
  read: boolean;
}

// Analytics Events
export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp: string;
  userId?: string;
}

// App State
export interface AppState {
  isOnline: boolean;
  isActive: boolean;
  language: SupportedLanguage;
  theme: 'light' | 'dark' | 'system';
}

// Deep Linking
export interface DeepLinkData {
  screen: string;
  params?: Record<string, any>;
}

// Cache Types
export interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl?: number;
}

export interface CacheOptions {
  ttl?: number;
  key: string;
  forceRefresh?: boolean;
}