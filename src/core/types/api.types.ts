// Types API alignés avec backend NestJS
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
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiError {
  success: false;
  message: string;
  error: string;
  statusCode: number;
  timestamp: string;
  details?: any;
}

// Configuration des requêtes
export interface RequestConfig {
  timeout?: number;
  headers?: Record<string, string>;
  params?: Record<string, any>;
  data?: any;
  withAuth?: boolean;
  retry?: number;
  retryDelay?: number;
}

// Upload progress
export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadConfig extends RequestConfig {
  onUploadProgress?: (progress: UploadProgress) => void;
  maxFileSize?: number;
  allowedTypes?: string[];
}

// Auth tokens
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface RefreshTokenResponse extends ApiResponse {
  data: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
}

// Query parameters génériques
export interface QueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
  filter?: Record<string, any>;
}

// Search specific
export interface PropertySearchParams extends QueryParams {
  commune?: string;
  minPrice?: number;
  maxPrice?: number;
  propertyType?: string;
  bedrooms?: number;
  bathrooms?: number;
  latitude?: number;
  longitude?: number;
  radius?: number;
}

// Mobile Money transaction
export interface MobileMoneyTransactionRequest {
  amount: number;
  currency: 'XOF';
  operator: 'ORANGE_MONEY' | 'MTN_MONEY' | 'MOOV_MONEY';
  phoneNumber: string;
  reference?: string;
  description?: string;
}

export interface MobileMoneyTransactionResponse extends ApiResponse {
  data: {
    transactionId: string;
    status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
    amount: number;
    operator: string;
    phoneNumber: string;
    reference?: string;
    externalReference?: string;
  };
}

// Network status for offline handling
export interface NetworkInfo {
  isConnected: boolean;
  type: 'wifi' | 'cellular' | 'none' | 'unknown';
  isInternetReachable: boolean;
}

// Request queue item for offline sync
export interface QueuedRequest {
  id: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: any;
  config?: RequestConfig;
  timestamp: number;
  retryCount: number;
  priority: 'low' | 'normal' | 'high';
}