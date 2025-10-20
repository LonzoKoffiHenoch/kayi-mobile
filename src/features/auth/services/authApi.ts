import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../core/api/apiClient';
import { mockAuthApi } from '../../../core/api/mockApi';
import { env } from '../../../core/config/env';
import { 
  LoginRequest,
  RegisterRequest,
  VerifySmsRequest,
  ResendSmsRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  UpdateProfileRequest,
  AuthResponse,
  SmsVerificationResponse,
  ProfileResponse,
  User,
  AuthTokens,
} from '../types/auth.types';
import { useAuthStore } from '../stores/authStore';

// API endpoints
const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  VERIFY_SMS: '/auth/verify-sms',
  RESEND_SMS: '/auth/resend-sms',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  CHANGE_PASSWORD: '/auth/change-password',
  REFRESH_TOKEN: '/auth/refresh',
  LOGOUT: '/auth/logout',
  PROFILE: '/auth/profile',
  UPDATE_PROFILE: '/auth/profile',
};

// Query keys
export const AUTH_QUERY_KEYS = {
  profile: ['auth', 'profile'] as const,
  user: (id: string) => ['auth', 'user', id] as const,
};

// Check if we should use mock API
const shouldUseMockApi = () => {
  return process.env.EXPO_PUBLIC_USE_MOCK_API === 'true';
};

// API functions
const authApi = {
  // Authentication
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    if (shouldUseMockApi()) {
      return await mockAuthApi.login(data);
    }
    return await apiClient.post<AuthResponse>(AUTH_ENDPOINTS.LOGIN, data);
  },

  register: async (data: RegisterRequest): Promise<{ success: boolean; message: string; phone: string }> => {
    if (shouldUseMockApi()) {
      return await mockAuthApi.register(data);
    }
    return await apiClient.post(AUTH_ENDPOINTS.REGISTER, data);
  },

  logout: async (): Promise<{ success: boolean; message: string }> => {
    if (shouldUseMockApi()) {
      return await mockAuthApi.logout();
    }
    return await apiClient.post(AUTH_ENDPOINTS.LOGOUT);
  },

  // SMS Verification
  verifySms: async (data: VerifySmsRequest): Promise<SmsVerificationResponse> => {
    if (shouldUseMockApi()) {
      return await mockAuthApi.verifySms(data);
    }
    return await apiClient.post<SmsVerificationResponse>(AUTH_ENDPOINTS.VERIFY_SMS, data);
  },

  resendSms: async (data: ResendSmsRequest): Promise<{ success: boolean; message: string }> => {
    if (shouldUseMockApi()) {
      return await mockAuthApi.resendSms();
    }
    return await apiClient.post(AUTH_ENDPOINTS.RESEND_SMS, data);
  },

  // Password Management
  forgotPassword: async (data: ForgotPasswordRequest): Promise<{ success: boolean; message: string }> => {
    if (shouldUseMockApi()) {
      // Return success for mock
      return { success: true, message: 'Instructions envoyées par SMS' };
    }
    return await apiClient.post(AUTH_ENDPOINTS.FORGOT_PASSWORD, data);
  },

  resetPassword: async (data: ResetPasswordRequest): Promise<{ success: boolean; message: string }> => {
    if (shouldUseMockApi()) {
      // Return success for mock
      return { success: true, message: 'Mot de passe réinitialisé avec succès' };
    }
    return await apiClient.post(AUTH_ENDPOINTS.RESET_PASSWORD, data);
  },

  changePassword: async (data: ChangePasswordRequest): Promise<{ success: boolean; message: string }> => {
    if (shouldUseMockApi()) {
      // Return success for mock
      return { success: true, message: 'Mot de passe modifié avec succès' };
    }
    return await apiClient.put(AUTH_ENDPOINTS.CHANGE_PASSWORD, data);
  },

  // Profile Management
  getProfile: async (): Promise<ProfileResponse> => {
    if (shouldUseMockApi()) {
      return await mockAuthApi.getProfile();
    }
    return await apiClient.get<ProfileResponse>(AUTH_ENDPOINTS.PROFILE);
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<ProfileResponse> => {
    if (shouldUseMockApi()) {
      // Return updated profile for mock
      const profile = await mockAuthApi.getProfile();
      return {
        ...profile,
        data: {
          user: { ...profile.data.user, ...data }
        }
      };
    }
    return await apiClient.put<ProfileResponse>(AUTH_ENDPOINTS.UPDATE_PROFILE, data);
  },

  // Token Management
  refreshToken: async (): Promise<{ tokens: AuthTokens }> => {
    if (shouldUseMockApi()) {
      return await mockAuthApi.refreshToken();
    }
    return await apiClient.post(AUTH_ENDPOINTS.REFRESH_TOKEN);
  },
};

// Mutation hooks
export const useLoginMutation = () => {
  const setTokens = useAuthStore((state) => state.setTokens);
  const setUser = useAuthStore((state) => state.setUser);
  const updateLastActivity = useAuthStore((state) => state.updateLastActivity);

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (response) => {
      if (response.success && response.data) {
        const { user, tokens } = response.data;
        
        // Update auth store
        setTokens(tokens);
        setUser(user);
        updateLastActivity();
      }
    },
    onError: (error) => {
      console.error('Login error:', error);
    },
  });
};

export const useRegisterMutation = () => {
  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (response) => {
      console.log('Registration successful:', response);
    },
    onError: (error) => {
      console.error('Registration error:', error);
    },
  });
};

export const useLogoutMutation = () => {
  const queryClient = useQueryClient();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      // Clear auth state
      clearAuth();
      
      // Clear all cached queries
      queryClient.clear();
    },
    onError: (error) => {
      console.error('Logout error:', error);
      // Force logout even if API call fails
      clearAuth();
      queryClient.clear();
    },
  });
};

export const useVerifySmsMutation = () => {
  const setTokens = useAuthStore((state) => state.setTokens);
  const setUser = useAuthStore((state) => state.setUser);
  const updateLastActivity = useAuthStore((state) => state.updateLastActivity);

  return useMutation({
    mutationFn: authApi.verifySms,
    onSuccess: (response) => {
      if (response.success && response.data) {
        const { verified, user, tokens } = response.data;
        
        if (verified && user && tokens) {
          // Auto-login after successful verification
          setTokens(tokens);
          setUser(user);
          updateLastActivity();
        }
      }
    },
    onError: (error) => {
      console.error('SMS verification error:', error);
    },
  });
};

export const useResendSmsMutation = () => {
  return useMutation({
    mutationFn: authApi.resendSms,
    onSuccess: (response) => {
      console.log('SMS resent successfully:', response);
    },
    onError: (error) => {
      console.error('Resend SMS error:', error);
    },
  });
};

export const useForgotPasswordMutation = () => {
  return useMutation({
    mutationFn: authApi.forgotPassword,
    onSuccess: (response) => {
      console.log('Forgot password successful:', response);
    },
    onError: (error) => {
      console.error('Forgot password error:', error);
    },
  });
};

export const useResetPasswordMutation = () => {
  return useMutation({
    mutationFn: authApi.resetPassword,
    onSuccess: (response) => {
      console.log('Password reset successful:', response);
    },
    onError: (error) => {
      console.error('Reset password error:', error);
    },
  });
};

export const useChangePasswordMutation = () => {
  return useMutation({
    mutationFn: authApi.changePassword,
    onSuccess: (response) => {
      console.log('Password changed successfully:', response);
    },
    onError: (error) => {
      console.error('Change password error:', error);
    },
  });
};

export const useUpdateProfileMutation = () => {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: authApi.updateProfile,
    onSuccess: (response) => {
      if (response.success && response.data) {
        const { user } = response.data;
        
        // Update auth store
        setUser(user);
        
        // Invalidate profile query
        queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.profile });
      }
    },
    onError: (error) => {
      console.error('Update profile error:', error);
    },
  });
};

// Query hooks
export const useProfileQuery = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: AUTH_QUERY_KEYS.profile,
    queryFn: authApi.getProfile,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on auth errors
      if (error?.response?.status === 401) {
        return false;
      }
      return failureCount < 2;
    },
  });
};

// Token refresh mutation
export const useRefreshTokenMutation = () => {
  const setTokens = useAuthStore((state) => state.setTokens);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  return useMutation({
    mutationFn: authApi.refreshToken,
    onSuccess: (response) => {
      if (response.tokens) {
        setTokens(response.tokens);
      }
    },
    onError: (error) => {
      console.error('Token refresh error:', error);
      // Clear auth if refresh fails
      clearAuth();
    },
  });
};

// Helper function to check if user is authenticated and profile is loaded
export const useAuthStatus = () => {
  const { user, isAuthenticated } = {
    user: useAuthStore.getState().user,
    isAuthenticated: useAuthStore.getState().isAuthenticated,
  };

  const { data: profileData, isLoading: isProfileLoading, error: profileError } = useProfileQuery();

  return {
    isAuthenticated,
    user: profileData?.data?.user || user,
    isLoading: isProfileLoading,
    hasError: !!profileError,
    needsVerification: user?.status === 'pending_verification',
  };
};

// Helper function to prefetch user data
export const usePrefetchAuth = () => {
  const queryClient = useQueryClient();

  return {
    prefetchProfile: () => {
      queryClient.prefetchQuery({
        queryKey: AUTH_QUERY_KEYS.profile,
        queryFn: authApi.getProfile,
        staleTime: 5 * 60 * 1000,
      });
    },
  };
};

// Export the raw API functions for use in the auth store
export { authApi };