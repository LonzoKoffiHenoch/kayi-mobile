import { create } from 'zustand';
import { createJSONStorage, persist, subscribeWithSelector } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthState, AuthUser, AuthTokens } from '../types/auth.types';
import { SupportedLanguage } from '../../../core/types/common.types';

const secureStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(name);
    } catch (error) {
      console.error('SecureStore getItem error:', error);
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(name, value);
    } catch (error) {
      console.error('SecureStore setItem error:', error);
    }
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(name);
    } catch (error) {
      console.error('SecureStore removeItem error:', error);
    }
  },
};

// ===== ASYNC STORAGE ADAPTER =====
const asyncStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(name);
    } catch (error) {
      console.error('AsyncStorage getItem error:', error);
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(name, value);
    } catch (error) {
      console.error('AsyncStorage setItem error:', error);
    }
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(name);
    } catch (error) {
      console.error('AsyncStorage removeItem error:', error);
    }
  },
};

// ===== STORE ACTIONS =====
interface AuthActions {
  // User management
  setUser: (user: AuthUser | null) => void;
  updateUser: (updates: Partial<AuthUser>) => void;
  
  // Token management
  setTokens: (tokens: AuthTokens | null) => void;
  
  // Auth state
  setAuthenticated: (isAuthenticated: boolean) => void;
  setLoading: (isLoading: boolean) => void;
  setInitialized: (isInitialized: boolean) => void;
  setPhoneVerified: (phoneVerified: boolean) => void;
  
  // Error handling
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Preferences
  setLanguage: (language: SupportedLanguage) => void;
  setBiometricEnabled: (enabled: boolean) => void;
  setRememberMe: (remember: boolean) => void;
  
  // Session management
  updateLastActivity: () => void;
  setSessionExpiresAt: (expiresAt: Date | null) => void;
  
  // Auth actions
  login: (user: AuthUser, tokens: AuthTokens) => void;
  logout: () => Promise<void>;
  clearAuth: () => Promise<void>;
  
  // Hydration
  hydrate: () => Promise<void>;
  
  // Utility
  isTokenExpired: () => boolean;
  shouldRefreshToken: () => boolean;
  getAuthHeader: () => string | null;
}

// ===== INITIAL STATE =====
const initialState: AuthState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  phoneVerified: false,
  error: null,
  lastError: null,
  language: 'fr',
  biometricEnabled: false,
  rememberMe: false,
  lastActivityAt: null,
  sessionExpiresAt: null,
};

// ===== STORE DEFINITION =====
export const useAuthStore = create<AuthState & AuthActions>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        ...initialState,

        // ===== USER MANAGEMENT =====
        setUser: (user) => {
          set({
            user,
            isAuthenticated: !!user,
            phoneVerified: user?.phoneVerified ?? false,
            lastActivityAt: new Date(),
          });
        },

        updateUser: (updates) => {
          const currentUser = get().user;
          if (currentUser) {
            const updatedUser = { ...currentUser, ...updates };
            set({
              user: updatedUser,
              phoneVerified: updatedUser.phoneVerified,
              lastActivityAt: new Date(),
            });
          }
        },

        // ===== TOKEN MANAGEMENT =====
        setTokens: (tokens) => {
          set({
            tokens,
            sessionExpiresAt: tokens ? new Date(tokens.expiresAt) : null,
            lastActivityAt: new Date(),
          });
        },

        // ===== AUTH STATE =====
        setAuthenticated: (isAuthenticated) => {
          set({ isAuthenticated, lastActivityAt: new Date() });
        },

        setLoading: (isLoading) => {
          set({ isLoading });
        },

        setInitialized: (isInitialized) => {
          set({ isInitialized });
        },

        setPhoneVerified: (phoneVerified) => {
          set({ phoneVerified, lastActivityAt: new Date() });
        },

        // ===== ERROR HANDLING =====
        setError: (error) => {
          set({
            error,
            lastError: error ? new Date() : null,
          });
        },

        clearError: () => {
          set({ error: null });
        },

        // ===== PREFERENCES =====
        setLanguage: (language) => {
          set({ language, lastActivityAt: new Date() });
        },

        setBiometricEnabled: (biometricEnabled) => {
          set({ biometricEnabled, lastActivityAt: new Date() });
        },

        setRememberMe: (rememberMe) => {
          set({ rememberMe, lastActivityAt: new Date() });
        },

        // ===== SESSION MANAGEMENT =====
        updateLastActivity: () => {
          set({ lastActivityAt: new Date() });
        },

        setSessionExpiresAt: (sessionExpiresAt) => {
          set({ sessionExpiresAt });
        },

        // ===== AUTH ACTIONS =====
        login: (user, tokens) => {
          set({
            user,
            tokens,
            isAuthenticated: true,
            phoneVerified: user.phoneVerified,
            error: null,
            lastActivityAt: new Date(),
            sessionExpiresAt: new Date(tokens.expiresAt),
          });
        },

        logout: async () => {
          try {
            // Clear sensitive data from secure storage
            await secureStorage.removeItem('auth-tokens');
            
            // Reset auth state
            set({
              user: null,
              tokens: null,
              isAuthenticated: false,
              phoneVerified: false,
              error: null,
              lastActivityAt: null,
              sessionExpiresAt: null,
            });
          } catch (error) {
            console.error('Logout error:', error);
            set({ error: 'Erreur lors de la déconnexion' });
          }
        },

        clearAuth: async () => {
          try {
            // Clear all auth-related storage
            await Promise.all([
              secureStorage.removeItem('auth-tokens'),
              asyncStorage.removeItem('auth-user-preferences'),
            ]);

            // Reset to initial state
            set({
              ...initialState,
              isInitialized: true, // Keep initialized flag
            });
          } catch (error) {
            console.error('Clear auth error:', error);
          }
        },

        // ===== HYDRATION =====
        hydrate: async () => {
          try {
            set({ isLoading: true });

            // Load tokens from secure storage
            const tokensData = await secureStorage.getItem('auth-tokens');
            
            // Load user preferences from async storage
            const preferencesData = await asyncStorage.getItem('auth-user-preferences');

            if (tokensData) {
              const tokens: AuthTokens = JSON.parse(tokensData);
              
              // Check if token is still valid
              const isExpired = new Date() >= new Date(tokens.expiresAt);
              
              if (!isExpired) {
                set({
                  tokens,
                  sessionExpiresAt: new Date(tokens.expiresAt),
                });
              } else {
                // Token expired, clear it
                await secureStorage.removeItem('auth-tokens');
              }
            }

            if (preferencesData) {
              const preferences = JSON.parse(preferencesData);
              set({
                language: preferences.language || 'fr',
                biometricEnabled: preferences.biometricEnabled || false,
                rememberMe: preferences.rememberMe || false,
              });
            }

            set({ isInitialized: true });
          } catch (error) {
            console.error('Hydration error:', error);
            set({ error: 'Erreur lors du chargement des données' });
          } finally {
            set({ isLoading: false });
          }
        },

        // ===== UTILITY METHODS =====
        isTokenExpired: () => {
          const { tokens } = get();
          if (!tokens) return true;
          return new Date() >= new Date(tokens.expiresAt);
        },

        shouldRefreshToken: () => {
          const { tokens } = get();
          if (!tokens) return false;
          
          // Refresh 5 minutes before expiry
          const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);
          return fiveMinutesFromNow >= new Date(tokens.expiresAt);
        },

        getAuthHeader: () => {
          const { tokens } = get();
          if (!tokens || get().isTokenExpired()) return null;
          return `${tokens.tokenType} ${tokens.access}`;
        },
      }),
      {
        name: 'kayi-auth-store',
        storage: createJSONStorage(() => asyncStorage),
        partialize: (state) => ({
          // Only persist non-sensitive preferences
          language: state.language,
          biometricEnabled: state.biometricEnabled,
          rememberMe: state.rememberMe,
          isInitialized: state.isInitialized,
        }),
        version: 1,
        migrate: (persistedState, version) => {
          // Handle store migration if structure changes
          if (version === 0) {
            // Migration from version 0 to 1
            return {
              ...persistedState,
              // Add new fields with default values
            };
          }
          return persistedState as AuthState & AuthActions;
        },
      }
    )
  )
);

// ===== SEPARATE PERSISTENCE FOR SENSITIVE DATA =====

// Persist tokens separately in secure storage
useAuthStore.subscribe(
  (state) => state.tokens,
  async (tokens) => {
    try {
      if (tokens) {
        await secureStorage.setItem('auth-tokens', JSON.stringify(tokens));
      } else {
        await secureStorage.removeItem('auth-tokens');
      }
    } catch (error) {
      console.error('Token persistence error:', error);
    }
  }
);

// Persist user data separately
useAuthStore.subscribe(
  (state) => ({ user: state.user }),
  async ({ user }) => {
    try {
      if (user) {
        // Only persist non-sensitive user data
        const userToStore = {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          email: user.email,
          role: user.role,
          preferredLanguage: user.preferredLanguage,
          phoneVerified: user.phoneVerified,
          profileComplete: user.profileComplete,
          commune: user.commune,
          neighborhood: user.neighborhood,
        };
        await asyncStorage.setItem('auth-user-data', JSON.stringify(userToStore));
      } else {
        await asyncStorage.removeItem('auth-user-data');
      }
    } catch (error) {
      console.error('User data persistence error:', error);
    }
  }
);

// ===== SELECTORS =====
export const authSelectors = {
  // Basic selectors
  user: (state: AuthState) => state.user,
  tokens: (state: AuthState) => state.tokens,
  isAuthenticated: (state: AuthState) => state.isAuthenticated,
  isLoading: (state: AuthState) => state.isLoading,
  error: (state: AuthState) => state.error,
  
  // Computed selectors
  isLoggedIn: (state: AuthState) => state.isAuthenticated && !!state.user && state.phoneVerified,
  requiresVerification: (state: AuthState) => state.isAuthenticated && !!state.user && !state.phoneVerified,
  userDisplayName: (state: AuthState) => 
    state.user ? `${state.user.firstName} ${state.user.lastName}` : null,
  userPhone: (state: AuthState) => state.user?.phone || null,
  
  // Session selectors
  isSessionActive: (state: AuthState) => {
    if (!state.sessionExpiresAt) return false;
    return new Date() < state.sessionExpiresAt;
  },
  
  // Permission selectors
  canAccessApp: (state: AuthState) => 
    state.isAuthenticated && state.phoneVerified && !!state.user,
};

export default useAuthStore;