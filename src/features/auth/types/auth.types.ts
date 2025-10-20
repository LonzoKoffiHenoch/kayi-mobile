import { BaseEntity, SupportedLanguage, LocationInfo, ImageInfo } from '../../../shared/types/common.types';

// User Role Enum
export enum UserRole {
  TENANT = 'tenant',           // Locataire
  LANDLORD = 'landlord',       // Propriétaire/Bailleur
  AGENT = 'agent',             // Agent immobilier
  ADMIN = 'admin',             // Administrateur
}

// User Status
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING_VERIFICATION = 'pending_verification',
}

// Enhanced User Interface
export interface User extends BaseEntity {
  firstName: string;
  lastName: string;
  phone: string;               // Primary identifier (format: +225XXXXXXXX)
  email?: string;              // Optional email
  avatar?: ImageInfo;
  role: UserRole;
  status: UserStatus;
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  language: SupportedLanguage;
  location?: LocationInfo;
  
  // Profile completion
  profileCompletion: number;   // Percentage (0-100)
  
  // Landlord specific fields
  companyName?: string;        // For agents/landlords
  licenseNumber?: string;      // For verified agents
  
  // Preferences
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  
  // Verification
  verification: {
    documents: boolean;
    identity: boolean;
    address: boolean;
  };
  
  lastLoginAt?: string;
}

// Authentication Request Types
export interface LoginRequest {
    identifier: string;               // Format: +225XXXXXXXX
  password: string;
  // rememberMe?: boolean;
  // deviceId?: string;           // For device tracking
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  phone: string;               // Format: +225XXXXXXXX
  password: string;
  confirmPassword: string;
  role: UserRole;
  email?: string;
  acceptTerms: boolean;
  acceptPrivacy: boolean;
  language?: SupportedLanguage;
}

export interface VerifySmsRequest {
  phone: string;
  code: string;
  type: 'registration' | 'login' | 'password_reset';
}

export interface ResendSmsRequest {
  phone: string;
  type: 'registration' | 'login' | 'password_reset';
}

export interface ForgotPasswordRequest {
  phone: string;
}

export interface ResetPasswordRequest {
  phone: string;
  code: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  companyName?: string;
  location?: LocationInfo;
  language?: SupportedLanguage;
  notifications?: Partial<User['notifications']>;
}

// Authentication Response Types
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;           // Timestamp
  tokenType: 'Bearer';
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    tokens: AuthTokens;
    isNewUser?: boolean;       // For registration flow
  };
}

export interface SmsVerificationResponse {
  success: boolean;
  message: string;
  data: {
    verified: boolean;
    user?: User;               // If verification completes registration
    tokens?: AuthTokens;       // If auto-login after verification
  };
}

export interface ProfileResponse {
  success: boolean;
  data: {
    user: User;
  };
}

// Auth Store State
export interface AuthState {
  // User & Authentication
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  
  // Loading States
  isLoading: boolean;
  isLoggingIn: boolean;
  isRegistering: boolean;
  isVerifying: boolean;
  
  // Error States
  error: string | null;
  loginError: string | null;
  registerError: string | null;
  verificationError: string | null;
  
  // Session Management
  lastActivity: number;
  sessionExpiresAt: number | null;
  
  // Device & Security
  deviceId: string | null;
  biometricEnabled: boolean;
  rememberMe: boolean;
}

// Auth Store Actions
export interface AuthActions {
  // Authentication
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  
  // SMS Verification
  verifySms: (data: VerifySmsRequest) => Promise<void>;
  resendSms: (data: ResendSmsRequest) => Promise<void>;
  
  // Password Management
  forgotPassword: (data: ForgotPasswordRequest) => Promise<void>;
  resetPassword: (data: ResetPasswordRequest) => Promise<void>;
  changePassword: (data: ChangePasswordRequest) => Promise<void>;
  
  // Profile Management
  updateProfile: (data: UpdateProfileRequest) => Promise<void>;
  refreshProfile: () => Promise<void>;
  
  // Token Management
  setTokens: (tokens: AuthTokens) => void;
  clearTokens: () => void;
  refreshTokens: () => Promise<void>;
  
  // State Management
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  clearAuth: () => void;
  
  // Session Management
  updateLastActivity: () => void;
  checkSession: () => boolean;
  
  // Device & Security
  setDeviceId: (deviceId: string) => void;
  enableBiometric: () => Promise<void>;
  disableBiometric: () => Promise<void>;
  authenticateWithBiometric: () => Promise<void>;
}

// Form Types
export interface LoginFormData {
  phone: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterFormData {
  firstName: string;
  lastName: string;
  phone: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  email?: string;
  acceptTerms: boolean;
  acceptPrivacy: boolean;
}

export interface SmsVerificationFormData {
  code: string;
}

export interface ForgotPasswordFormData {
  phone: string;
}

export interface ResetPasswordFormData {
  code: string;
  newPassword: string;
  confirmPassword: string;
}

// Validation Types
export interface PhoneValidation {
  isValid: boolean;
  operator: 'Orange' | 'MTN' | 'Moov' | 'Wave' | null;
  formattedPhone: string;
}

// Error Types
export interface AuthError {
  code: string;
  message: string;
  field?: string;
  details?: any;
}

// Route Protection
export interface RouteProtection {
  requireAuth: boolean;
  requiredRole?: UserRole;
  redirectTo?: string;
}

// Biometric Types
export interface BiometricConfig {
  enabled: boolean;
  type: 'fingerprint' | 'face' | 'iris' | null;
  fallbackToPassword: boolean;
}

// Device Info
export interface DeviceInfo {
  id: string;
  name: string;
  platform: 'ios' | 'android';
  version: string;
  lastActiveAt: string;
  isCurrent: boolean;
}