import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { env } from '../config/env';
import { API_CONFIG, ERROR_CODES } from '../config/constants';
import { secureStorage } from '../storage/secureStorage';

interface ApiError {
  code: string;
  message: string;
  details?: any;
}

interface RetryConfig {
  retries: number;
  retryDelay: number;
}

class ApiClient {
  private static instance: ApiClient;
  private client: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }> = [];

  private constructor() {
    this.client = axios.create({
      baseURL: env.apiBaseUrl,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  private setupInterceptors(): void {
    // Request interceptor for adding auth token
    this.client.interceptors.request.use(
      async (config) => {
        const accessToken = await secureStorage.getAccessToken();
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(this.handleError(error));
      }
    );

    // Response interceptor for token refresh and error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        // Handle 401 errors (unauthorized)
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // Queue the request while refresh is in progress
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            }).then((token) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              return this.client(originalRequest);
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const refreshToken = await secureStorage.getRefreshToken();
            if (refreshToken) {
              const response = await this.refreshAccessToken(refreshToken);
              const newAccessToken = response.data.accessToken;
              
              await secureStorage.setAccessToken(newAccessToken);
              
              // Process failed queue
              this.processQueue(null, newAccessToken);
              
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
              }
              
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            this.processQueue(refreshError, null);
            await secureStorage.clearTokens();
            // Redirect to login or show auth error
            throw this.handleError(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(this.handleError(error));
      }
    );
  }

  private async refreshAccessToken(refreshToken: string): Promise<AxiosResponse> {
    return axios.post(`${env.apiBaseUrl}/auth/refresh`, {
      refreshToken,
    });
  }

  private processQueue(error: any, token: string | null): void {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });
    
    this.failedQueue = [];
  }

  private handleError(error: any): ApiError {
    if (axios.isAxiosError(error)) {
      // Network error
      if (!error.response) {
        return {
          code: ERROR_CODES.NETWORK_ERROR,
          message: 'Erreur de connexion réseau',
          details: error.message,
        };
      }

      // Timeout error
      if (error.code === 'ECONNABORTED') {
        return {
          code: ERROR_CODES.TIMEOUT_ERROR,
          message: 'Délai d\'attente dépassé',
          details: error.message,
        };
      }

      // HTTP error responses
      const status = error.response.status;
      const data = error.response.data;

      switch (status) {
        case 401:
          return {
            code: ERROR_CODES.AUTH_ERROR,
            message: data?.message || 'Erreur d\'authentification',
            details: data,
          };
        case 400:
          return {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: data?.message || 'Données invalides',
            details: data,
          };
        case 404:
          return {
            code: ERROR_CODES.NOT_FOUND,
            message: data?.message || 'Ressource non trouvée',
            details: data,
          };
        case 500:
        default:
          return {
            code: ERROR_CODES.SERVER_ERROR,
            message: data?.message || 'Erreur serveur',
            details: data,
          };
      }
    }

    // Generic error
    return {
      code: ERROR_CODES.SERVER_ERROR,
      message: 'Une erreur inattendue s\'est produite',
      details: error,
    };
  }

  private async retryRequest<T>(
    requestFn: () => Promise<T>,
    config: RetryConfig = { retries: API_CONFIG.RETRY_ATTEMPTS, retryDelay: API_CONFIG.RETRY_DELAY }
  ): Promise<T> {
    try {
      return await requestFn();
    } catch (error) {
      if (config.retries > 0 && this.isRetryableError(error)) {
        await this.delay(config.retryDelay);
        return this.retryRequest(requestFn, {
          retries: config.retries - 1,
          retryDelay: config.retryDelay * 2, // Exponential backoff
        });
      }
      throw error;
    }
  }

  private isRetryableError(error: any): boolean {
    if (axios.isAxiosError(error)) {
      // Retry on network errors or 5xx server errors
      return !error.response || (error.response.status >= 500 && error.response.status < 600);
    }
    return false;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Public API methods
  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.retryRequest(async () => {
      const response = await this.client.get<T>(url, config);
      return response.data;
    });
  }

  public async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.retryRequest(async () => {
      const response = await this.client.post<T>(url, data, config);
      return response.data;
    });
  }

  public async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.retryRequest(async () => {
      const response = await this.client.put<T>(url, data, config);
      return response.data;
    });
  }

  public async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.retryRequest(async () => {
      const response = await this.client.patch<T>(url, data, config);
      return response.data;
    });
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.retryRequest(async () => {
      const response = await this.client.delete<T>(url, config);
      return response.data;
    });
  }

  // Upload file with progress
  public async uploadFile<T>(
    url: string,
    file: FormData,
    onUploadProgress?: (progressEvent: any) => void
  ): Promise<T> {
    const response = await this.client.post<T>(url, file, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
    return response.data;
  }

  // Get raw axios instance if needed
  public getAxiosInstance(): AxiosInstance {
    return this.client;
  }
}

export const apiClient = ApiClient.getInstance();
export type { ApiError, RetryConfig };