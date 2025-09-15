import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import * as Device from 'expo-device';
import * as Network from 'expo-network';

import { ENV } from '../../config/env';
import { APP_CONSTANTS, STORAGE_KEYS } from '../../config/constants';
import { secureStorage } from '../storage/secureStorage';
import {
  ApiResponse,
  ApiError,
  RequestConfig,
  UploadConfig,
  UploadProgress,
  RefreshTokenResponse,
  AuthTokens,
  NetworkInfo,
  QueuedRequest,
} from '../types/api.types';
import { API_ENDPOINTS } from './endpoints';

class ApiClient {
  private axiosInstance: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (error?: any) => void;
    config: AxiosRequestConfig;
  }> = [];

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: ENV.API_BASE_URL,
      timeout: ENV.API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': `KayiHouse/${ENV.APP_VERSION} (${Device.osName} ${Device.osVersion})`,
        'X-Client-Platform': Device.osName || 'unknown',
        'X-Client-Version': ENV.APP_VERSION,
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor - injection automatique JWT
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        try {
          // Ajouter token d'authentification si disponible
          const authTokens = await secureStorage.getAuthTokens();
          if (authTokens?.accessToken && config.headers) {
            config.headers.Authorization = `Bearer ${authTokens.accessToken}`;
          }

          // Ajouter network info pour analytics
          const networkState = await Network.getNetworkStateAsync();
          if (config.headers) {
            config.headers['X-Network-Type'] = networkState.type || 'unknown';
            config.headers['X-Network-Connected'] = String(networkState.isConnected);
          }

          if (__DEV__) {
            console.log('🔵 API Request:', {
              method: config.method?.toUpperCase(),
              url: config.url,
              params: config.params,
              headers: this.sanitizeHeaders(config.headers),
            });
          }

          return config;
        } catch (error) {
          if (__DEV__) {
            console.error('❌ Request interceptor error:', error);
          }
          return config;
        }
      },
      (error) => {
        if (__DEV__) {
          console.error('❌ Request interceptor error:', error);
        }
        return Promise.reject(error);
      }
    );

    // Response interceptor - format backend NestJS + refresh token
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        if (__DEV__) {
          console.log('🟢 API Response:', {
            status: response.status,
            url: response.config.url,
            data: this.sanitizeResponseData(response.data),
          });
        }

        // Valider le format de réponse NestJS
        if (response.data && typeof response.data === 'object') {
          if (response.data.success !== undefined) {
            return response.data; // Format NestJS valide
          }
          // Wrapper pour réponses non-standardisées
          return {
            success: true,
            message: 'Success',
            data: response.data,
            timestamp: new Date().toISOString(),
          };
        }

        return response.data;
      },
      async (error) => {
        const originalRequest = error.config;

        if (__DEV__) {
          console.error('🔴 API Error:', {
            status: error.response?.status,
            url: error.config?.url,
            message: error.message,
            data: error.response?.data,
          });
        }

        // Gestion refresh token sur 401
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // Mettre en queue si refresh en cours
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject, config: originalRequest });
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const refreshed = await this.refreshToken();
            if (refreshed) {
              this.processQueue(null);
              return this.axiosInstance(originalRequest);
            }
          } catch (refreshError) {
            this.processQueue(refreshError);
            await secureStorage.clearAuthTokens();
            throw this.createApiError(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        // Retry automatique sur timeout/network errors
        if (this.shouldRetry(error) && !originalRequest._retryCount) {
          originalRequest._retryCount = 0;
        }

        if (originalRequest._retryCount < APP_CONSTANTS.RETRY_ATTEMPTS) {
          originalRequest._retryCount++;
          const delay = APP_CONSTANTS.RETRY_DELAY * Math.pow(2, originalRequest._retryCount - 1);
          
          if (__DEV__) {
            console.log(`🔄 Retrying request (${originalRequest._retryCount}/${APP_CONSTANTS.RETRY_ATTEMPTS}) in ${delay}ms`);
          }

          await this.delay(delay);
          return this.axiosInstance(originalRequest);
        }

        throw this.createApiError(error);
      }
    );
  }

  private shouldRetry(error: any): boolean {
    return (
      error.code === 'ECONNABORTED' || // Timeout
      error.code === 'NETWORK_ERROR' || // Network error
      !error.response || // No response (network issue)
      error.response.status >= 500 // Server error
    );
  }

  private async refreshToken(): Promise<boolean> {
    try {
      const authTokens = await secureStorage.getAuthTokens();
      if (!authTokens?.refreshToken) {
        return false;
      }

      const response = await axios.post<RefreshTokenResponse>(
        `${ENV.API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`,
        { refreshToken: authTokens.refreshToken }
      );

      if (response.data.success) {
        const newTokens: AuthTokens = {
          accessToken: response.data.data.accessToken,
          refreshToken: response.data.data.refreshToken,
          expiresAt: Date.now() + response.data.data.expiresIn * 1000,
        };

        await secureStorage.setAuthTokens({
          ...newTokens,
          userId: authTokens.userId,
        });

        return true;
      }

      return false;
    } catch (error) {
      if (__DEV__) {
        console.error('❌ Token refresh failed:', error);
      }
      return false;
    }
  }

  private processQueue(error: any): void {
    this.failedQueue.forEach(({ resolve, reject, config }) => {
      if (error) {
        reject(error);
      } else {
        resolve(this.axiosInstance(config));
      }
    });

    this.failedQueue = [];
  }

  private createApiError(error: any): ApiError {
    const apiError: ApiError = {
      success: false,
      message: error.response?.data?.message || error.message || 'Une erreur est survenue',
      error: error.response?.data?.error || error.code || 'UNKNOWN_ERROR',
      statusCode: error.response?.status || 0,
      timestamp: new Date().toISOString(),
    };

    if (error.response?.data?.details) {
      apiError.details = error.response.data.details;
    }

    return apiError;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private sanitizeHeaders(headers: any): any {
    if (!headers) return headers;
    
    const sanitized = { ...headers };
    if (sanitized.Authorization) {
      sanitized.Authorization = 'Bearer ***';
    }
    return sanitized;
  }

  private sanitizeResponseData(data: any): any {
    if (!data || typeof data !== 'object') return data;
    
    const sanitized = { ...data };
    if (sanitized.data && typeof sanitized.data === 'object') {
      // Masquer les données sensibles dans les logs
      if (sanitized.data.accessToken) sanitized.data.accessToken = '***';
      if (sanitized.data.refreshToken) sanitized.data.refreshToken = '***';
    }
    return sanitized;
  }

  // Public API methods
  async get<T>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    const response = await this.axiosInstance.get(url, config);
    return response as unknown as ApiResponse<T>;
  }

  async post<T>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    const response = await this.axiosInstance.post(url, data, config);
    return response as unknown as ApiResponse<T>;
  }

  async put<T>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    const response = await this.axiosInstance.put(url, data, config);
    return response as unknown as ApiResponse<T>;
  }

  async delete<T>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    const response = await this.axiosInstance.delete(url, config);
    return response as unknown as ApiResponse<T>;
  }

  async upload<T>(
    url: string,
    data: FormData | any,
    config?: UploadConfig
  ): Promise<ApiResponse<T>> {
    const uploadConfig: any = {
      ...config,
      headers: {
        ...config?.headers,
        'Content-Type': 'multipart/form-data',
      },
      timeout: config?.timeout || APP_CONSTANTS.DEFAULT_TIMEOUT * 3, // Plus long timeout pour upload
    };

    if (config?.onUploadProgress) {
      uploadConfig.onUploadProgress = (progressEvent: any) => {
        const total = progressEvent.total || 0;
        const loaded = progressEvent.loaded || 0;
        const progress: UploadProgress = {
          loaded,
          total,
          percentage: total > 0 ? Math.round((loaded * 100) / total) : 0,
        };
        config.onUploadProgress!(progress);
      };
    }

    const response = await this.axiosInstance.post(url, data, uploadConfig);
    return response as unknown as ApiResponse<T>;
  }

  // Network utilities
  async checkNetworkStatus(): Promise<NetworkInfo> {
    try {
      const networkState = await Network.getNetworkStateAsync();
      return {
        isConnected: networkState.isConnected || false,
        type: networkState.type === Network.NetworkStateType.WIFI ? 'wifi' :
              networkState.type === Network.NetworkStateType.CELLULAR ? 'cellular' :
              networkState.type === Network.NetworkStateType.NONE ? 'none' : 'unknown',
        isInternetReachable: networkState.isInternetReachable || false,
      };
    } catch (error) {
      if (__DEV__) {
        console.error('❌ Network status check failed:', error);
      }
      return {
        isConnected: false,
        type: 'unknown',
        isInternetReachable: false,
      };
    }
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.axiosInstance.get('/health', { timeout: 5000 });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  // Cancel requests
  createCancelToken() {
    return axios.CancelToken.source();
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
export default apiClient;