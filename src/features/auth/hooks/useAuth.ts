import {useCallback, useEffect} from 'react';
import {useAuthStore} from '../stores/authStore';
import {
    authApi,
    useAuthStatus,
    useChangePasswordMutation,
    useForgotPasswordMutation,
    useLoginMutation,
    useLogoutMutation,
    useRegisterMutation,
    useResendSmsMutation,
    useResetPasswordMutation,
    useUpdateProfileMutation,
    useVerifySmsMutation,
} from '../services/authApi';
import {
    ChangePasswordRequest,
    ForgotPasswordRequest,
    LoginRequest,
    RegisterRequest,
    ResendSmsRequest,
    ResetPasswordRequest,
    UpdateProfileRequest,
    VerifySmsRequest,
} from '../types/auth.types';


export const useAuth = () => {
  // Auth store state
  const [
    user,
    isAuthenticated,
    tokens,
    sessionExpiresAt,
    deviceId,
    biometricEnabled,
    rememberMe,
    lastActivity,
  ] = [useAuthStore.getState().user,

      useAuthStore.getState().isAuthenticated,
      useAuthStore.getState().tokens,
      useAuthStore.getState().sessionExpiresAt,
      useAuthStore.getState().deviceId,
      useAuthStore.getState().biometricEnabled,
      useAuthStore.getState().rememberMe,
      useAuthStore.getState().lastActivity,
  ]

  // Auth store actions
  const [
    setTokens,
    setUser,
    clearAuth,
    clearError,
    updateLastActivity,
    checkSession,
    setDeviceId,
    enableBiometric,
    disableBiometric,
    authenticateWithBiometric,
  ] = [useAuthStore.getState().setTokens,
      useAuthStore.getState().setUser,
      useAuthStore.getState().clearAuth,
      useAuthStore.getState().clearError,
      useAuthStore.getState().updateLastActivity,
      useAuthStore.getState().checkSession,
      useAuthStore.getState().setDeviceId,
      useAuthStore.getState().enableBiometric,
      useAuthStore.getState().disableBiometric,
      useAuthStore.getState().authenticateWithBiometric,
  ]

  // Loading states from store
  const [
    isLoading,
    isLoggingIn,
    isRegistering,
    isVerifying,
  ] = [useAuthStore.getState().isLoading,useAuthStore.getState().isLoggingIn,useAuthStore.getState().isRegistering,useAuthStore.getState().isVerifying];

  // Error states from store
  const [
    error,
    loginError,
    registerError,
    verificationError,
  ] = [useAuthStore.getState().error,
      useAuthStore.getState().loginError,
      useAuthStore.getState().registerError,
      useAuthStore.getState().verificationError,
 ]

  // TanStack Query mutations
  const loginMutation = useLoginMutation();
  const registerMutation = useRegisterMutation();
  const logoutMutation = useLogoutMutation();
  const verifySmsMutation = useVerifySmsMutation();
  const resendSmsMutation = useResendSmsMutation();
  const forgotPasswordMutation = useForgotPasswordMutation();
  const resetPasswordMutation = useResetPasswordMutation();
  const changePasswordMutation = useChangePasswordMutation();
  const updateProfileMutation = useUpdateProfileMutation();

  // Auth status from combined store and API
  const authStatus = useAuthStatus();

  // Session management
  useEffect(() => {
    if (isAuthenticated) {
      const interval = setInterval(() => {
        const isValid = checkSession();
        if (!isValid) {
          clearAuth();
        }
      }, 60000); // Check every minute

      return () => clearInterval(interval);
    }
  }, [isAuthenticated, checkSession, clearAuth]);

  // Authentication methods
  const login = useCallback(async (credentials: LoginRequest) => {
    try {
      clearError();
      const result = await loginMutation.mutateAsync(credentials);
      return result;
    } catch (error) {
      throw error;
    }
  }, [loginMutation, clearError]);

  const register = useCallback(async (data: RegisterRequest) => {
    try {
      clearError();
      const result = await registerMutation.mutateAsync(data);
      return result;
    } catch (error) {
      throw error;
    }
  }, [registerMutation, clearError]);

  const logout = useCallback(async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (error) {
      // Force logout even if API call fails
      clearAuth();
      throw error;
    }
  }, [logoutMutation, clearAuth]);

  // SMS verification methods
  const verifySms = useCallback(async (data: VerifySmsRequest) => {
    try {
      clearError();
      const result = await verifySmsMutation.mutateAsync(data);
      return result;
    } catch (error) {
      throw error;
    }
  }, [verifySmsMutation, clearError]);

  const resendSms = useCallback(async (data: ResendSmsRequest) => {
    try {
      clearError();
      const result = await resendSmsMutation.mutateAsync(data);
      return result;
    } catch (error) {
      throw error;
    }
  }, [resendSmsMutation, clearError]);

  // Password management methods
  const forgotPassword = useCallback(async (data: ForgotPasswordRequest) => {
    try {
      clearError();
      const result = await forgotPasswordMutation.mutateAsync(data);
      return result;
    } catch (error) {
      throw error;
    }
  }, [forgotPasswordMutation, clearError]);

  const resetPassword = useCallback(async (data: ResetPasswordRequest) => {
    try {
      clearError();
        return await resetPasswordMutation.mutateAsync(data);
    } catch (error) {
      throw error;
    }
  }, [resetPasswordMutation, clearError]);

  const changePassword = useCallback(async (data: ChangePasswordRequest) => {
    try {
      clearError();
        return await changePasswordMutation.mutateAsync(data);
    } catch (error) {
      throw error;
    }
  }, [changePasswordMutation, clearError]);

  // Profile management methods
  const updateProfile = useCallback(async (data: UpdateProfileRequest) => {
    try {
      clearError();
        return await updateProfileMutation.mutateAsync(data);
    } catch (error) {
      throw error;
    }
  }, [updateProfileMutation, clearError]);

  // Token management
  const refreshTokens = useCallback(async () => {
    try {
      const result = await authApi.refreshToken();
      if (result.tokens) {
        setTokens(result.tokens);
      }
      return result;
    } catch (error) {
      clearAuth();
      throw error;
    }
  }, [setTokens, clearAuth]);

  // Utility methods
  const isSessionValid = useCallback(() => {
    return checkSession();
  }, [checkSession]);

  const getTimeUntilExpiry = useCallback(() => {
    if (!sessionExpiresAt) return null;
    return Math.max(0, sessionExpiresAt - Date.now());
  }, [sessionExpiresAt]);

  const refreshActivity = useCallback(() => {
    updateLastActivity();
  }, [updateLastActivity]);

  // Biometric methods
  const setupBiometric = useCallback(async () => {
    try {
      await enableBiometric();
      return true;
    } catch (error) {
      console.error('Failed to setup biometric:', error);
      return false;
    }
  }, [enableBiometric]);

  const removeBiometric = useCallback(async () => {
    try {
      await disableBiometric();
      return true;
    } catch (error) {
      console.error('Failed to remove biometric:', error);
      return false;
    }
  }, [disableBiometric]);

  const loginWithBiometric = useCallback(async () => {
    try {
      await authenticateWithBiometric();
      return true;
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      return false;
    }
  }, [authenticateWithBiometric]);

  // Return the unified auth interface
  return {
    // State
    user: authStatus.user || user,
    isAuthenticated: authStatus.isAuthenticated,
    tokens,
    deviceId,
    biometricEnabled,
    rememberMe,
    lastActivity,
    sessionExpiresAt,

    // Loading states
    isLoading: isLoading || authStatus.isLoading,
    isLoggingIn: isLoggingIn || loginMutation.isPending,
    isRegistering: isRegistering || registerMutation.isPending,
    isVerifying: isVerifying || verifySmsMutation.isPending,
    isUpdatingProfile: updateProfileMutation.isPending,
    isChangingPassword: changePasswordMutation.isPending,
    isForgettingPassword: forgotPasswordMutation.isPending,
    isResettingPassword: resetPasswordMutation.isPending,
    isResendingSms: resendSmsMutation.isPending,
    isLoggingOut: logoutMutation.isPending,

    // Error states
    error: error || loginMutation.error?.message || registerMutation.error?.message,
    loginError: loginError || loginMutation.error?.message,
    registerError: registerError || registerMutation.error?.message,
    verificationError: verificationError || verifySmsMutation.error?.message,

    // Status checks
    needsVerification: authStatus.needsVerification,
    hasError: authStatus.hasError,
    isSessionValid: isSessionValid(),

    // Authentication methods
    login,
    register,
    logout,
    verifySms,
    resendSms,
    forgotPassword,
    resetPassword,
    changePassword,
    updateProfile,
    refreshTokens,

    // Utility methods
    clearError,
    refreshActivity,
    getTimeUntilExpiry,
    setDeviceId,

    // Biometric methods
    setupBiometric,
    removeBiometric,
    loginWithBiometric,

    // Raw mutation objects (for advanced usage)
    mutations: {
      login: loginMutation,
      register: registerMutation,
      logout: logoutMutation,
      verifySms: verifySmsMutation,
      resendSms: resendSmsMutation,
      forgotPassword: forgotPasswordMutation,
      resetPassword: resetPasswordMutation,
      changePassword: changePasswordMutation,
      updateProfile: updateProfileMutation,
    },
  };
};

// Convenience hooks for specific use cases
export const useAuthUser = () => {
  const { user } = useAuth();
  return user;
};

export const useAuthLoading = () => {
  const { 
    isLoading, 
    isLoggingIn, 
    isRegistering, 
    isVerifying,
    isUpdatingProfile,
    isChangingPassword,
    isForgettingPassword,
    isResettingPassword,
    isResendingSms,
    isLoggingOut,
  } = useAuth();
  
  return {
    isLoading,
    isLoggingIn,
    isRegistering,
    isVerifying,
    isUpdatingProfile,
    isChangingPassword,
    isForgettingPassword,
    isResettingPassword,
    isResendingSms,
    isLoggingOut,
    isAnyLoading: isLoading || isLoggingIn || isRegistering || isVerifying || 
                  isUpdatingProfile || isChangingPassword || isForgettingPassword || 
                  isResettingPassword || isResendingSms || isLoggingOut,
  };
};

export const useAuthErrors = () => {
  const { 
    error,
    loginError,
    registerError,
    verificationError,
    hasError,
    clearError,
  } = useAuth();
  
  return {
    error,
    loginError,
    registerError,
    verificationError,
    hasError,
    clearError,
    hasAnyError: !!(error || loginError || registerError || verificationError),
  };
};

export const useRequireAuth = () => {
  const { isAuthenticated, user } = useAuth();
  
  return {
    isAuthenticated,
    isVerified: user?.isPhoneVerified || false,
    requiresVerification: !user?.isPhoneVerified,
    canAccess: isAuthenticated && user?.isPhoneVerified,
  };
};