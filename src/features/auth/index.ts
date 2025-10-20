// Main auth hook
export { useAuth, useAuthUser, useAuthLoading, useAuthErrors, useRequireAuth } from './hooks/useAuth';

// Store
export { useAuthStore, useAuth as useAuthState, useAuthActions, useAuthLoading as useAuthLoadingState, useAuthErrors as useAuthErrorsState } from './stores/authStore';

// API services
export {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useVerifySmsMutation,
  useResendSmsMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
  useUpdateProfileMutation,
  useProfileQuery,
  useAuthStatus,
  authApi,
} from './services/authApi';

// Validation
export {
  loginSchema,
  registerSchema,
  smsVerificationSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  updateProfileSchema,
  phoneSchema,
  passwordSchema,
  validatePhoneInput,
  validatePasswordStrength,
  formatCIPhone,
  getPhoneOperator,
} from './validation/authSchemas';

// Types
export type {
  User,
  UserRole,
  UserStatus,
  AuthTokens,
  AuthResponse,
  AuthState,
  AuthActions,
  LoginRequest,
  RegisterRequest,
  VerifySmsRequest,
  ResendSmsRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  UpdateProfileRequest,
  LoginFormData,
  RegisterFormData,
  SmsVerificationFormData,
  ForgotPasswordFormData,
  ResetPasswordFormData,
  ChangePasswordFormData,
  UpdateProfileFormData,
  PhoneValidation,
  AuthError,
  RouteProtection,
  BiometricConfig,
  DeviceInfo,
} from './types/auth.types';