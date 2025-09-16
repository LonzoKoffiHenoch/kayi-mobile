/**
 * KAYI House Authentication Feature
 * Export barrel for the complete authentication system
 */

// ===== COMPONENTS =====
export * from './components';

// ===== HOOKS =====
export { useAuth } from './hooks/useAuth';
export { useLogin } from './hooks/useLogin';
export { useRegister } from './hooks/useRegister';
export { useSmsVerification } from './hooks/useSmsVerification';

// ===== STORES =====
export { useAuthStore, authSelectors } from './stores/authStore';

// ===== SERVICES =====
export * from './services/authApi';
export { default as authService } from './services/authService';

// ===== TYPES =====
export * from './types/auth.types';