/**
 * KAYI House useAuth Hook
 * Hook principal pour la gestion de l'authentification
 */

import { useEffect, useCallback } from 'react';
import { useAuthStore, authSelectors } from '../stores/authStore';
import { 
  useProfileQuery, 
  useLogoutMutation, 
  useRefreshTokenMutation,
  invalidateAuthQueries
} from '../services/authApi';
import { AuthUser, AuthTokens } from '../types/auth.types';
import authService from '../services/authService';

// ===== TYPES =====
export interface UseAuthReturn {
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
  
  // Computed values
  isLoggedIn: boolean;
  requiresVerification: boolean;
  userDisplayName: string | null;
  userPhone: string | null;
  
  // Auth actions
  login: (user: AuthUser, tokens: AuthTokens) => void;
  logout: () => Promise<void>;
  clearAuth: () => Promise<void>;
  clearError: () => void;
  
  // Profile management
  updateUser: (updates: Partial<AuthUser>) => void;
  refreshProfile: () => void;
  
  // Token management
  refreshToken: () => Promise<boolean>;
  isTokenExpired: () => boolean;
  shouldRefreshToken: () => boolean;
  
  // Session management
  updateActivity: () => void;
  isSessionActive: boolean;
  
  // Preferences
  setLanguage: (language: string) => void;
  setBiometricEnabled: (enabled: boolean) => void;
  
  // Utilities
  getAuthHeader: () => string | null;
  canAccessApp: boolean;
}

// ===== HOOK IMPLEMENTATION =====
export const useAuth = (): UseAuthReturn => {
  // Store state
  const user = useAuthStore(authSelectors.user);
  const tokens = useAuthStore(authSelectors.tokens);
  const isAuthenticated = useAuthStore(authSelectors.isAuthenticated);
  const isLoading = useAuthStore(authSelectors.isLoading);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const phoneVerified = useAuthStore((state) => state.phoneVerified);
  const error = useAuthStore(authSelectors.error);
  const language = useAuthStore((state) => state.language);
  const biometricEnabled = useAuthStore((state) => state.biometricEnabled);
  
  // Store actions
  const {
    login: storeLogin,
    logout: storeLogout,
    clearAuth: storeClearAuth,
    clearError,
    updateUser: storeUpdateUser,
    setLanguage: storeSetLanguage,
    setBiometricEnabled: storeSetBiometricEnabled,
    updateLastActivity,
    hydrate,
    isTokenExpired: storeIsTokenExpired,
    shouldRefreshToken: storeShouldRefreshToken,
    getAuthHeader: storeGetAuthHeader,
  } = useAuthStore();
  
  // Computed values
  const isLoggedIn = authSelectors.isLoggedIn(useAuthStore.getState());
  const requiresVerification = authSelectors.requiresVerification(useAuthStore.getState());
  const userDisplayName = authSelectors.userDisplayName(useAuthStore.getState());
  const userPhone = authSelectors.userPhone(useAuthStore.getState());
  const isSessionActive = authSelectors.isSessionActive(useAuthStore.getState());
  const canAccessApp = authSelectors.canAccessApp(useAuthStore.getState());
  
  // API hooks
  const { data: profileData, refetch: refetchProfile } = useProfileQuery();
  const logoutMutation = useLogoutMutation();
  const refreshTokenMutation = useRefreshTokenMutation();
  
  // ===== AUTO-REFRESH TOKEN =====
  useEffect(() => {
    if (!isAuthenticated || !tokens) return;
    
    const checkTokenRefresh = () => {
      if (storeShouldRefreshToken() && !refreshTokenMutation.isPending) {
        refreshToken();
      }
    };
    
    // Check immediately
    checkTokenRefresh();
    
    // Check every minute
    const interval = setInterval(checkTokenRefresh, 60 * 1000);
    
    return () => clearInterval(interval);
  }, [isAuthenticated, tokens, storeShouldRefreshToken, refreshTokenMutation.isPending]);
  
  // ===== HYDRATION ON MOUNT =====
  useEffect(() => {
    if (!isInitialized) {
      hydrate();
    }
  }, [isInitialized, hydrate]);
  
  // ===== SESSION TIMEOUT =====
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const checkSessionTimeout = () => {
      if (!isSessionActive) {
        console.log('Session expired due to inactivity');
        logout();
      }
    };
    
    // Check every 5 minutes
    const interval = setInterval(checkSessionTimeout, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [isAuthenticated, isSessionActive]);
  
  // ===== AUTH ACTIONS =====
  
  const login = useCallback((user: AuthUser, tokens: AuthTokens) => {
    storeLogin(user, tokens);
    updateActivity();
    
    // Prefetch profile data
    if (user.phoneVerified) {
      refetchProfile();
    }
  }, [storeLogin, updateActivity, refetchProfile]);
  
  const logout = useCallback(async () => {
    try {
      // Call API logout
      await logoutMutation.mutateAsync();
      
      // Clear local data
      await storeLogout();
      
      // Clear profile cache
      invalidateAuthQueries();
      
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if API fails, clear local data
      await storeLogout();
    }
  }, [logoutMutation, storeLogout]);
  
  const clearAuth = useCallback(async () => {
    try {
      await storeClearAuth();
      await authService.clearAllUserData();
      invalidateAuthQueries();
      console.log('Auth data cleared');
    } catch (error) {
      console.error('Clear auth error:', error);
    }
  }, [storeClearAuth]);
  
  // ===== PROFILE MANAGEMENT =====
  
  const updateUser = useCallback((updates: Partial<AuthUser>) => {
    storeUpdateUser(updates);
    updateActivity();
  }, [storeUpdateUser, updateActivity]);
  
  const refreshProfile = useCallback(() => {
    if (isAuthenticated && phoneVerified) {
      refetchProfile();
    }
  }, [isAuthenticated, phoneVerified, refetchProfile]);
  
  // ===== TOKEN MANAGEMENT =====
  
  const refreshToken = useCallback(async (): Promise<boolean> => {
    if (!tokens?.refresh) {
      console.warn('No refresh token available');
      await logout();
      return false;
    }
    
    try {
      const deviceId = await authService.getDeviceId();
      
      await refreshTokenMutation.mutateAsync({
        refreshToken: tokens.refresh,
        deviceId,
      });
      
      console.log('Token refreshed successfully');
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      await logout();
      return false;
    }
  }, [tokens, refreshTokenMutation, logout]);
  
  const isTokenExpired = useCallback((): boolean => {
    return storeIsTokenExpired();
  }, [storeIsTokenExpired]);
  
  const shouldRefreshToken = useCallback((): boolean => {
    return storeShouldRefreshToken();
  }, [storeShouldRefreshToken]);
  
  // ===== SESSION MANAGEMENT =====
  
  const updateActivity = useCallback(() => {
    updateLastActivity();
  }, [updateLastActivity]);
  
  // ===== PREFERENCES =====
  
  const setLanguage = useCallback((language: string) => {
    storeSetLanguage(language as any);
    updateActivity();
  }, [storeSetLanguage, updateActivity]);
  
  const setBiometricEnabled = useCallback((enabled: boolean) => {
    storeSetBiometricEnabled(enabled);
    updateActivity();
  }, [storeSetBiometricEnabled, updateActivity]);
  
  // ===== UTILITIES =====
  
  const getAuthHeader = useCallback((): string | null => {
    return storeGetAuthHeader();
  }, [storeGetAuthHeader]);
  
  // ===== AUTO-ACTIVITY TRACKING =====
  useEffect(() => {
    if (isAuthenticated) {
      // Update activity on any interaction
      const handleActivity = () => updateActivity();
      
      // We could add event listeners here for user interactions
      // For now, just update periodically when authenticated
      const interval = setInterval(handleActivity, 5 * 60 * 1000); // Every 5 minutes
      
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, updateActivity]);
  
  // ===== RETURN OBJECT =====
  return {
    // User data
    user,
    tokens,
    
    // Status flags
    isAuthenticated,
    isLoading: isLoading || logoutMutation.isPending || refreshTokenMutation.isPending,
    isInitialized,
    phoneVerified,
    
    // Error handling
    error,
    
    // Computed values
    isLoggedIn,
    requiresVerification,
    userDisplayName,
    userPhone,
    
    // Auth actions
    login,
    logout,
    clearAuth,
    clearError,
    
    // Profile management
    updateUser,
    refreshProfile,
    
    // Token management
    refreshToken,
    isTokenExpired,
    shouldRefreshToken,
    
    // Session management
    updateActivity,
    isSessionActive,
    
    // Preferences
    setLanguage,
    setBiometricEnabled,
    
    // Utilities
    getAuthHeader,
    canAccessApp,
  };
};

// ===== CONVENIENCE HOOKS =====

/**
 * Hook pour récupérer uniquement l'utilisateur authentifié
 */
export const useAuthUser = () => {
  const { user, isLoggedIn } = useAuth();
  return isLoggedIn ? user : null;
};

/**
 * Hook pour vérifier les permissions
 */
export const useAuthPermissions = () => {
  const { user, isLoggedIn } = useAuth();
  
  return {
    isLoggedIn,
    isTenant: user?.role === 'TENANT',
    isLandlord: user?.role === 'LANDLORD',
    isAgent: user?.role === 'AGENT',
    isAdmin: user?.role === 'ADMIN',
    canCreateProperty: user?.role === 'LANDLORD' || user?.role === 'AGENT',
    canManageProperties: user?.role === 'LANDLORD' || user?.role === 'AGENT' || user?.role === 'ADMIN',
  };
};

/**
 * Hook pour le statut de chargement global
 */
export const useAuthLoading = () => {
  const { isLoading, isInitialized } = useAuth();
  return isLoading || !isInitialized;
};

export default useAuth;