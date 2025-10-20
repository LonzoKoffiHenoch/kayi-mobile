import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  User, 
  AuthTokens, 
  AuthState, 
  AuthActions,
  LoginRequest,
  RegisterRequest,
  VerifySmsRequest,
  ResendSmsRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  UpdateProfileRequest
} from '@/features/auth';
import {asyncStorage, secureStorage} from "@/core";

// Initial state
const initialState: AuthState = {
  // User & Authentication
  user: null,
  tokens: null,
  isAuthenticated: false,
  
  // Loading States
  isLoading: false,
  isLoggingIn: false,
  isRegistering: false,
  isVerifying: false,
  
  // Error States
  error: null,
  loginError: null,
  registerError: null,
  verificationError: null,
  
  // Session Management
  lastActivity: Date.now(),
  sessionExpiresAt: null,
  
  // Device & Security
  deviceId: null,
  biometricEnabled: false,
  rememberMe: false,
};

// Create the auth store without persistence for now (to avoid MMKV issues)
export const useAuthStore = create<AuthState & AuthActions>((set, get) => ({
  ...initialState,

  // Authentication Actions
  login: async (credentials: LoginRequest) => {
    try {
      set({ isLoggingIn: true, loginError: null, error: null });
      
      // Import authApi dynamically to avoid circular dependency
      const { authApi } = await import('../services/authApi');
      const response = await authApi.login(credentials);
      
      if (response.success && response.data) {
        const { user, tokens } = response.data;
        
        // Update store state
        get().setTokens(tokens);
        get().setUser(user);
        get().updateLastActivity();
        
        set({ isLoggingIn: false });
      }
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Erreur de connexion';
      set({ 
        loginError: errorMessage,
        error: errorMessage,
        isLoggingIn: false 
      });
      throw error;
    }
  },

  register: async (data: RegisterRequest) => {
    try {
      set({ isRegistering: true, registerError: null, error: null });
      
      // Import authApi dynamically to avoid circular dependency
      const { authApi } = await import('../services/authApi');
      const response = await authApi.register(data);
      
      set({ isRegistering: false });
      return response;
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Erreur d\'inscription';
      set({ 
        registerError: errorMessage,
        error: errorMessage,
        isRegistering: false 
      });
      throw error;
    }
  },

  logout: async () => {
    try {
      set({ isLoading: true });
      
      // Clear secure storage
      await secureStorage.clearTokens();
      
      // Clear AsyncStorage auth data
      await asyncStorage.remove('auth_user');
      await asyncStorage.remove('auth_session');
      
      // Reset store state
      set({
        ...initialState,
        isLoading: false,
      });
      
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if there's an error
      set({
        ...initialState,
        isLoading: false,
      });
    }
  },

  // SMS Verification Actions
  verifySms: async (data: VerifySmsRequest) => {
    try {
      set({ isVerifying: true, verificationError: null, error: null });
      
      // This will be implemented when we create the API service
      throw new Error('SMS verification API not implemented yet');
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Erreur de vérification';
      set({ 
        verificationError: errorMessage,
        error: errorMessage,
        isVerifying: false 
      });
      throw error;
    }
  },

  resendSms: async (data: ResendSmsRequest) => {
    try {
      set({ isLoading: true, error: null });
      
      // This will be implemented when we create the API service
      throw new Error('Resend SMS API not implemented yet');
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Erreur de renvoi SMS';
      set({ 
        error: errorMessage,
        isLoading: false 
      });
      throw error;
    }
  },

  // Password Management Actions
  forgotPassword: async (data: ForgotPasswordRequest) => {
    try {
      set({ isLoading: true, error: null });
      
      // This will be implemented when we create the API service
      throw new Error('Forgot password API not implemented yet');
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Erreur de récupération';
      set({ 
        error: errorMessage,
        isLoading: false 
      });
      throw error;
    }
  },

  resetPassword: async (data: ResetPasswordRequest) => {
    try {
      set({ isLoading: true, error: null });
      
      // This will be implemented when we create the API service
      throw new Error('Reset password API not implemented yet');
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Erreur de réinitialisation';
      set({ 
        error: errorMessage,
        isLoading: false 
      });
      throw error;
    }
  },

  changePassword: async (data: ChangePasswordRequest) => {
    try {
      set({ isLoading: true, error: null });
      
      // This will be implemented when we create the API service
      throw new Error('Change password API not implemented yet');
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Erreur de modification';
      set({ 
        error: errorMessage,
        isLoading: false 
      });
      throw error;
    }
  },

  // Profile Management Actions
  updateProfile: async (data: UpdateProfileRequest) => {
    try {
      set({ isLoading: true, error: null });
      
      // This will be implemented when we create the API service
      throw new Error('Update profile API not implemented yet');
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Erreur de mise à jour';
      set({ 
        error: errorMessage,
        isLoading: false 
      });
      throw error;
    }
  },

  refreshProfile: async () => {
    try {
      set({ isLoading: true, error: null });
      
      // This will be implemented when we create the API service
      throw new Error('Refresh profile API not implemented yet');
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Erreur de rafraîchissement';
      set({ 
        error: errorMessage,
        isLoading: false 
      });
      throw error;
    }
  },

  // Token Management Actions
  setTokens: (tokens: AuthTokens) => {
    set({ 
      tokens,
      sessionExpiresAt: tokens.expiresAt,
      isAuthenticated: true 
    });
    
    // Store tokens securely
    secureStorage.setTokens(tokens.accessToken, tokens.refreshToken);
  },

  clearTokens: () => {
    set({ 
      tokens: null,
      sessionExpiresAt: null,
      isAuthenticated: false 
    });
    
    // Clear secure storage
    secureStorage.clearTokens();
  },

  refreshTokens: async () => {
    try {
      set({ isLoading: true });
      
      // This will be implemented when we create the API service
      throw new Error('Refresh tokens API not implemented yet');
      
    } catch (error: any) {
      console.error('Token refresh failed:', error);
      // If refresh fails, logout user
      get().logout();
      throw error;
    }
  },

  // State Management Actions
  setUser: (user: User) => {
    set({ user, isAuthenticated: true });
    
    // Store user data in AsyncStorage
    asyncStorage.set('auth_user', user);
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  clearError: () => {
    set({ 
      error: null,
      loginError: null,
      registerError: null,
      verificationError: null 
    });
  },

  clearAuth: () => {
    set({
      ...initialState,
      deviceId: get().deviceId, // Keep device ID
    });
    
    // Clear storage
    secureStorage.clearTokens();
    asyncStorage.remove('auth_user');
    asyncStorage.remove('auth_session');
  },

  // Session Management Actions
  updateLastActivity: () => {
    const lastActivity = Date.now();
    set({ lastActivity });
    
    // Store session info
    asyncStorage.set('auth_session', {
      lastActivity,
      deviceId: get().deviceId,
    });
  },

  checkSession: (): boolean => {
    const state = get();
    const now = Date.now();
    
    // Check if session is expired
    if (state.sessionExpiresAt && now > state.sessionExpiresAt) {
      return false;
    }
    
    // Check if user has been inactive for too long (24 hours)
    const maxInactivity = 24 * 60 * 60 * 1000; // 24 hours
    if (now - state.lastActivity > maxInactivity) {
      return false;
    }
    
    return state.isAuthenticated && state.tokens !== null;
  },

  // Device & Security Actions
  setDeviceId: (deviceId: string) => {
    set({ deviceId });
  },

  enableBiometric: async () => {
    try {
      // This will be implemented with biometric library
      set({ biometricEnabled: true });
    } catch (error) {
      console.error('Failed to enable biometric:', error);
      throw error;
    }
  },

  disableBiometric: async () => {
    try {
      await secureStorage.removeBiometricToken();
      set({ biometricEnabled: false });
    } catch (error) {
      console.error('Failed to disable biometric:', error);
      throw error;
    }
  },

  authenticateWithBiometric: async () => {
    try {
      // This will be implemented with biometric library
      throw new Error('Biometric authentication not implemented yet');
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      throw error;
    }
  },
}));

// Selectors for easy access to specific state
export const useAuth = () => useAuthStore((state) => ({
  user: state.user,
  isAuthenticated: state.isAuthenticated,
  isLoading: state.isLoading,
  error: state.error,
}));

export const useAuthActions = () => useAuthStore((state) => ({
  login: state.login,
  register: state.register,
  logout: state.logout,
  verifySms: state.verifySms,
  resendSms: state.resendSms,
  forgotPassword: state.forgotPassword,
  resetPassword: state.resetPassword,
  changePassword: state.changePassword,
  updateProfile: state.updateProfile,
  refreshProfile: state.refreshProfile,
  clearError: state.clearError,
  updateLastActivity: state.updateLastActivity,
}));

export const useAuthLoading = () => useAuthStore((state) => ({
  isLoggingIn: state.isLoggingIn,
  isRegistering: state.isRegistering,
  isVerifying: state.isVerifying,
  isLoading: state.isLoading,
}));

export const useAuthErrors = () => useAuthStore((state) => ({
  error: state.error,
  loginError: state.loginError,
  registerError: state.registerError,
  verificationError: state.verificationError,
}));