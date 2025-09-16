import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../core/api/apiClient';
import { API_ENDPOINTS } from '../../../core/api/endpoints';
import { ApiResponse } from '../../../core/types/common.types';
import {
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  LoginResponse,
  VerifySmsRequest,
  VerifyResponse,
  ResendSmsRequest,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  RefreshTokenRequest,
  RefreshTokenResponse,
  AuthUser,
} from '../types/auth.types';
import { useAuthStore } from '../stores/authStore';

export const AUTH_QUERY_KEYS = {
  all: ['auth'] as const,
  profile: () => [...AUTH_QUERY_KEYS.all, 'profile'] as const,
} as const;

export const useRegisterMutation = () => {
  const queryClient = useQueryClient();
  const setError = useAuthStore((state) => state.setError);

  return useMutation({
    mutationFn: async (data: RegisterRequest): Promise<ApiResponse<RegisterResponse>> => {
      const response = await apiClient.post<ApiResponse<RegisterResponse>>(
        API_ENDPOINTS.AUTH.REGISTER,
        data
      );
      return response.data;
    },
    onSuccess: (response) => {
      // Clear any previous errors
      setError(null);
      
      // Optionally store user data temporarily (without tokens)
      if (response.data.user) {
        // Don't set as authenticated yet - wait for SMS verification
        console.log('Registration successful, awaiting SMS verification');
      }
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Erreur lors de l\'inscription';
      setError(errorMessage);
      console.error('Registration error:', error);
    },
    retry: 1, // Retry once on failure
    retryDelay: 1000,
  });
};

/**
 * Mutation de connexion
 */
export const useLoginMutation = () => {
  const queryClient = useQueryClient();
  const { login, setError } = useAuthStore();

  return useMutation({
    mutationFn: async (data: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
      const response = await apiClient.post<ApiResponse<LoginResponse>>(
        API_ENDPOINTS.AUTH.LOGIN,
        data
      );
      return response.data;
    },
    onSuccess: (response) => {
      setError(null);
      
      const { user, tokens, requiresSmsVerification } = response.data;
      
      if (!requiresSmsVerification) {
        // Login complete, store user and tokens
        login(user, tokens);
        
        // Prefetch user profile
        queryClient.prefetchQuery({
          queryKey: AUTH_QUERY_KEYS.profile(),
          queryFn: () => fetchProfile(),
        });
      } else {
        // Need SMS verification, don't set as fully authenticated
        console.log('Login requires SMS verification');
      }
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Erreur lors de la connexion';
      setError(errorMessage);
      console.error('Login error:', error);
    },
    retry: 1,
    retryDelay: 1000,
  });
};

/**
 * Mutation de vérification SMS
 */
export const useVerifySmsMutation = () => {
  const queryClient = useQueryClient();
  const { login, setError } = useAuthStore();

  return useMutation({
    mutationFn: async (data: VerifySmsRequest): Promise<ApiResponse<VerifyResponse>> => {
      const response = await apiClient.post<ApiResponse<VerifyResponse>>(
        API_ENDPOINTS.AUTH.VERIFY_SMS,
        data
      );
      return response.data;
    },
    onSuccess: (response) => {
      setError(null);
      
      const { user, tokens, verified } = response.data;
      
      if (verified) {
        // SMS verification successful, complete authentication
        login(user, tokens);
        
        // Prefetch user profile
        queryClient.prefetchQuery({
          queryKey: AUTH_QUERY_KEYS.profile(),
          queryFn: () => fetchProfile(),
        });
      }
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Code SMS invalide';
      setError(errorMessage);
      console.error('SMS verification error:', error);
    },
    retry: false, // Don't retry SMS verification
  });
};

/**
 * Mutation de renvoi SMS
 */
export const useResendSmsMutation = () => {
  const setError = useAuthStore((state) => state.setError);

  return useMutation({
    mutationFn: async (data: ResendSmsRequest): Promise<ApiResponse<{ sent: boolean; expiresIn: number }>> => {
      const response = await apiClient.post<ApiResponse<{ sent: boolean; expiresIn: number }>>(
        API_ENDPOINTS.AUTH.RESEND_SMS,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      setError(null);
      console.log('SMS resent successfully');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Erreur lors du renvoi du SMS';
      setError(errorMessage);
      console.error('Resend SMS error:', error);
    },
    retry: 1,
    retryDelay: 2000,
  });
};

/**
 * Mutation mot de passe oublié
 */
export const useForgotPasswordMutation = () => {
  const setError = useAuthStore((state) => state.setError);

  return useMutation({
    mutationFn: async (data: ForgotPasswordRequest): Promise<ApiResponse<ForgotPasswordResponse>> => {
      const response = await apiClient.post<ApiResponse<ForgotPasswordResponse>>(
        API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      setError(null);
      console.log('Password reset SMS sent');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Erreur lors de la demande de réinitialisation';
      setError(errorMessage);
      console.error('Forgot password error:', error);
    },
    retry: 1,
    retryDelay: 1000,
  });
};

/**
 * Mutation réinitialisation mot de passe
 */
export const useResetPasswordMutation = () => {
  const setError = useAuthStore((state) => state.setError);

  return useMutation({
    mutationFn: async (data: ResetPasswordRequest): Promise<ApiResponse<{ success: boolean }>> => {
      const response = await apiClient.post<ApiResponse<{ success: boolean }>>(
        API_ENDPOINTS.AUTH.RESET_PASSWORD,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      setError(null);
      console.log('Password reset successful');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Erreur lors de la réinitialisation';
      setError(errorMessage);
      console.error('Reset password error:', error);
    },
    retry: false,
  });
};

/**
 * Mutation refresh token
 */
export const useRefreshTokenMutation = () => {
  const { setTokens, logout, setError } = useAuthStore();

  return useMutation({
    mutationFn: async (data: RefreshTokenRequest): Promise<ApiResponse<RefreshTokenResponse>> => {
      const response = await apiClient.post<ApiResponse<RefreshTokenResponse>>(
        API_ENDPOINTS.AUTH.REFRESH,
        data
      );
      return response.data;
    },
    onSuccess: (response) => {
      setError(null);
      
      const { tokens, user } = response.data;
      
      // Update tokens
      setTokens(tokens);
      
      // Update user if provided
      if (user) {
        useAuthStore.getState().setUser(user);
      }
    },
    onError: (error: any) => {
      console.error('Token refresh error:', error);
      
      // If refresh fails, logout user
      logout();
      setError('Session expirée, veuillez vous reconnecter');
    },
    retry: false, // Don't retry token refresh
  });
};

/**
 * Mutation déconnexion
 */
export const useLogoutMutation = () => {
  const queryClient = useQueryClient();
  const { logout, setError } = useAuthStore();

  return useMutation({
    mutationFn: async (): Promise<ApiResponse<{ success: boolean }>> => {
      const response = await apiClient.post<ApiResponse<{ success: boolean }>>(API_ENDPOINTS.AUTH.LOGOUT);
      return response.data;
    },
    onSuccess: () => {
      // Clear all auth data
      logout();
      
      // Clear all cached queries
      queryClient.clear();
      
      setError(null);
      console.log('Logout successful');
    },
    onError: (error: any) => {
      console.error('Logout error:', error);
      
      // Even if API call fails, clear local auth data
      logout();
      queryClient.clear();
    },
    retry: false,
  });
};

// ===== QUERIES =====

/**
 * Function pour récupérer le profil
 */
const fetchProfile = async (): Promise<AuthUser> => {
  const response = await apiClient.get<ApiResponse<AuthUser>>(API_ENDPOINTS.AUTH.PROFILE);
  return response.data.data;
};

/**
 * Query pour le profil utilisateur
 */
export const useProfileQuery = () => {
  const { isAuthenticated, phoneVerified } = useAuthStore();
  const setError = useAuthStore((state) => state.setError);

  return useQuery({
    queryKey: AUTH_QUERY_KEYS.profile(),
    queryFn: fetchProfile,
    enabled: isAuthenticated && phoneVerified, // Only fetch if authenticated and verified
    staleTime: 5 * 60 * 1000, // 5 minutes
    // cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    onSuccess: (data: Partial<AuthUser>) => {
      // Update user data in store
      useAuthStore.getState().updateUser(data);
      setError(null);
    },
    onError: (error: any) => {
      console.error('Profile fetch error:', error);

      if (error.response?.status === 401) {
        // Unauthorized, likely token expired
        useAuthStore.getState().logout();
        setError('Session expirée, veuillez vous reconnecter');
      } else {
        setError('Erreur lors du chargement du profil');
      }
    },
  });
};

// ===== UTILITIES =====

/**
 * Utility pour invalider les caches d'authentification
 */
export const invalidateAuthQueries = () => {
  const queryClient = useQueryClient();
  queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.all });
};

/**
 * Utility pour prefetch le profil
 */
export const prefetchProfile = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated, phoneVerified } = useAuthStore.getState();
  
  if (isAuthenticated && phoneVerified) {
    queryClient.prefetchQuery({
      queryKey: AUTH_QUERY_KEYS.profile(),
      queryFn: fetchProfile,
      staleTime: 5 * 60 * 1000,
    });
  }
};

/**
 * Configuration TanStack Query par défaut pour les mutations auth
 */
export const authMutationDefaults = {
  retry: (failureCount: number, error: any) => {
    // Don't retry on 4xx errors (client errors)
    if (error.response?.status >= 400 && error.response?.status < 500) {
      return false;
    }
    // Retry up to 3 times for network errors
    return failureCount < 3;
  },
  retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
};