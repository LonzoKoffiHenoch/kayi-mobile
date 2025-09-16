import { BaseEntity, User, UserRole, SupportedLanguage, Commune } from '../../../core/types/common.types';

export interface AuthTokens {
  access: string;
  refresh: string;
  expiresAt: string;
  tokenType: 'Bearer';
}

export interface AuthUser extends User {
  phoneVerified: boolean;
  profileComplete: boolean;
  lastLoginAt?: string;
  deviceId?: string;
  biometricEnabled?: boolean;
}

// ===== REQUESTS =====

export interface RegisterRequest {
  // Step 1: Personal Info
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  
  // Step 2: Role & Location
  role: UserRole;
  commune?: Commune;
  preferredLanguage: SupportedLanguage;
  
  // Step 3: Security
  password: string;
  confirmPassword: string;
  termsAccepted: boolean;
}

export interface LoginRequest {
  identifier: string; // phone ou email
  password: string;
  deviceId?: string;
  biometric?: boolean;
  rememberMe?: boolean;
}

export interface VerifySmsRequest {
  phone: string;
  code: string;
  purpose: 'registration' | 'login' | 'password_reset';
}

export interface ResendSmsRequest {
  phone: string;
  purpose: 'registration' | 'login' | 'password_reset';
}

export interface ForgotPasswordRequest {
  identifier: string; // phone ou email
}

export interface ResetPasswordRequest {
  phone: string;
  code: string;
  newPassword: string;
  confirmPassword: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
  deviceId?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// ===== RESPONSES =====

export interface LoginResponse {
  user: AuthUser;
  tokens: AuthTokens;
  isNewDevice: boolean;
  requiresSmsVerification: boolean;
}

export interface RegisterResponse {
  user: Omit<AuthUser, 'phoneVerified'>; // Pas de tokens avant vérification SMS
  smsCodeSent: boolean;
  expiresIn: number; // en secondes
}

export interface VerifyResponse {
  user: AuthUser;
  tokens: AuthTokens;
  verified: boolean;
}

export interface RefreshTokenResponse {
  tokens: AuthTokens;
  user?: AuthUser; // Optionnel, envoyé si profil a changé
}

export interface ForgotPasswordResponse {
  smsCodeSent: boolean;
  expiresIn: number;
  phone: string; // Masqué partiellement
}

// ===== MULTI-STEP FORM =====

export interface RegisterFormData {
  // Step 1
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  
  // Step 2
  role: UserRole | null;
  commune: Commune | null;
  preferredLanguage: SupportedLanguage;
  
  // Step 3
  password: string;
  confirmPassword: string;
  termsAccepted: boolean;
}

export type RegisterStep = 1 | 2 | 3;

export interface RegisterStepValidation {
  step: RegisterStep;
  isValid: boolean;
  errors: string[];
}

// ===== AUTH STATE =====

export interface AuthState {
  // User data
  user: AuthUser | null;
  tokens: AuthTokens | null;
  
  // Status flags
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  phoneVerified: boolean;
  
  // Error handling
  error: string | null;
  lastError: Date | null;
  
  // Preferences
  language: SupportedLanguage;
  biometricEnabled: boolean;
  rememberMe: boolean;
  
  // Session info
  lastActivityAt: Date | null;
  sessionExpiresAt: Date | null;
}

// ===== SMS VERIFICATION =====

export interface SmsVerificationState {
  phone: string;
  purpose: 'registration' | 'login' | 'password_reset';
  codeLength: number;
  expiresAt: Date | null;
  canResend: boolean;
  resendCountdown: number;
  attempts: number;
  maxAttempts: number;
  isVerifying: boolean;
  error: string | null;
}

// ===== FORM VALIDATION =====

export interface PhoneValidationResult {
  isValid: boolean;
  formatted: string; // Format +225XXXXXXXX
  error?: string;
}

export interface PasswordStrength {
  score: number; // 0-4
  hasLowercase: boolean;
  hasUppercase: boolean;
  hasNumbers: boolean;
  hasSpecialChars: boolean;
  minLength: boolean;
  feedback: string[];
}

// ===== BIOMETRIC AUTH =====

export interface BiometricAuthOptions {
  promptMessage: string;
  cancelButtonText: string;
  fallbackLabel?: string;
  disableDeviceFallback?: boolean;
}

export interface BiometricAuthResult {
  success: boolean;
  error?: string;
  warningMessage?: string;
}

// ===== ERROR TYPES =====

export interface AuthError {
  code: string;
  message: string;
  field?: string;
  details?: any;
}

export type AuthErrorCode = 
  | 'INVALID_CREDENTIALS'
  | 'PHONE_NOT_VERIFIED'
  | 'SMS_CODE_INVALID'
  | 'SMS_CODE_EXPIRED'
  | 'PHONE_ALREADY_EXISTS'
  | 'EMAIL_ALREADY_EXISTS'
  | 'PASSWORD_TOO_WEAK'
  | 'TOKEN_EXPIRED'
  | 'TOKEN_INVALID'
  | 'NETWORK_ERROR'
  | 'SERVER_ERROR'
  | 'BIOMETRIC_NOT_AVAILABLE'
  | 'BIOMETRIC_CANCELED'
  | 'TOO_MANY_ATTEMPTS'
  | 'ACCOUNT_LOCKED';

// ===== LANGUAGE OPTIONS =====

export interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
  rtl?: boolean;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  {
    code: 'fr',
    name: 'Français',
    nativeName: 'Français',
    flag: '🇫🇷'
  },
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇬🇧'
  },
  {
    code: 'baule',
    name: 'Baoulé',
    nativeName: 'Baoulé',
    flag: '🇨🇮'
  },
  {
    code: 'dioula',
    name: 'Dioula',
    nativeName: 'Dioula',
    flag: '🇨🇮'
  }
];

// ===== USER TYPE OPTIONS =====

export interface UserTypeOption {
  value: UserRole;
  title: string;
  description: string;
  icon: string;
  color: string;
}

export const USER_TYPE_OPTIONS: UserTypeOption[] = [
  {
    value: UserRole.TENANT,
    title: 'Locataire',
    description: 'Je cherche un logement',
    icon: 'home-outline',
    color: '#3B82F6'
  },
  {
    value: UserRole.LANDLORD,
    title: 'Propriétaire',
    description: 'Je loue mes biens',
    icon: 'business-outline',
    color: '#10B981'
  },
  {
    value: UserRole.AGENT,
    title: 'Agent Immobilier',
    description: 'Je suis agent immobilier',
    icon: 'briefcase-outline',
    color: '#F59E0B'
  }
];

// ===== CONSTANTS =====

export const AUTH_CONSTANTS = {
  SMS_CODE_LENGTH: 6,
  SMS_EXPIRY_MINUTES: 15,
  SMS_RESEND_COUNTDOWN: 60,
  MAX_SMS_ATTEMPTS: 3,
  PASSWORD_MIN_LENGTH: 8,
  TOKEN_REFRESH_THRESHOLD: 5 * 60 * 1000, // 5 minutes en ms
  SESSION_TIMEOUT: 15 * 60 * 1000, // 15 minutes en ms
  PHONE_PREFIX_CI: '+225',
  BIOMETRIC_PROMPT_TIMEOUT: 30000, // 30 secondes
} as const;