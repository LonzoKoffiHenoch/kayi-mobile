/**
 * KAYI House useLogin Hook
 * Hook pour la gestion de la connexion
 */

import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { router } from 'expo-router';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLoginMutation } from '../services/authApi';
import { useAuth } from './useAuth';
import authService from '../services/authService';
import { LoginRequest, BiometricAuthResult } from '../types/auth.types';

// ===== VALIDATION SCHEMA =====
const loginSchema = z.object({
  identifier: z.string()
    .min(1, 'Numéro de téléphone ou email requis')
    .refine((value) => {
      // Vérifier si c'est un email ou un téléphone
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailRegex.test(value)) {
        return true; // Email valide
      }
      
      // Sinon, valider comme téléphone
      const phoneValidation = authService.validatePhoneFormat(value);
      return phoneValidation.isValid;
    }, 'Format de téléphone ou email invalide'),
  
  password: z.string()
    .min(1, 'Mot de passe requis')
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  
  rememberMe: z.boolean().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// ===== TYPES =====
export interface UseLoginOptions {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  enableBiometric?: boolean;
  autoNavigate?: boolean;
}

export interface UseLoginReturn {
  // Form management
  form: ReturnType<typeof useForm<LoginFormData>>;
  isValid: boolean;
  
  // Submit handling
  handleSubmit: () => Promise<void>;
  isLoading: boolean;
  
  // Error handling
  error: string | null;
  clearError: () => void;
  
  // Phone formatting
  formatPhoneInput: (value: string) => string;
  
  // Biometric auth
  isBiometricAvailable: boolean;
  biometricType: string | null;
  handleBiometricAuth: () => Promise<BiometricAuthResult>;
  
  // Navigation
  navigateToRegister: () => void;
  navigateToForgotPassword: () => void;
  
  // Utilities
  prefillPhone: (phone: string) => void;
  getLastUsedPhone: () => Promise<string | null>;
}

// ===== HOOK IMPLEMENTATION =====
export const useLogin = (options: UseLoginOptions = {}): UseLoginReturn => {
  const {
    onSuccess,
    onError,
    enableBiometric = true,
    autoNavigate = true,
  } = options;
  
  // State
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState<string | null>(null);
  
  // Hooks
  const { login, clearError: clearAuthError, error: authError } = useAuth();
  const loginMutation = useLoginMutation();
  
  // Form setup
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: '',
      password: '',
      rememberMe: false,
    },
    mode: 'onChange',
  });
  
  const { handleSubmit: formHandleSubmit, formState, setValue, getValues, clearErrors } = form;
  const { isValid, errors } = formState;
  
  // ===== BIOMETRIC SETUP =====
  React.useEffect(() => {
    if (enableBiometric) {
      checkBiometricAvailability();
    }
  }, [enableBiometric]);
  
  const checkBiometricAvailability = async () => {
    try {
      const isAvailable = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
      
      setIsBiometricAvailable(isAvailable && isEnrolled);
      
      if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        setBiometricType('Face ID');
      } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        setBiometricType('Touch ID');
      } else {
        setBiometricType('Biométrie');
      }
    } catch (error) {
      console.error('Biometric check error:', error);
      setIsBiometricAvailable(false);
    }
  };
  
  // ===== FORM SUBMISSION =====
  const handleSubmit = useCallback(async () => {
    try {
      clearAuthError();
      clearErrors();
      
      const data = getValues();
      
      // Format phone if needed
      let identifier = data.identifier;
      if (!identifier.includes('@')) {
        const phoneValidation = authService.validatePhoneFormat(identifier);
        if (phoneValidation.isValid) {
          identifier = phoneValidation.formatted;
        }
      }
      
      // Prepare login request (simple format for API compatibility)
      const loginRequest = {
        identifier,
        password: data.password,
      };
      
      // Submit login
      const response = await loginMutation.mutateAsync(loginRequest);
      
      if (response.data.requiresSmsVerification) {
        // Navigate to SMS verification
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        
        if (autoNavigate) {
          router.push({
            pathname: '/(auth)/verify-sms',
            params: { 
              phone: authService.formatPhoneForDisplay(identifier),
              purpose: 'login',
            },
          });
        }
      } else {
        // Login complete
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        const { user, tokens } = response.data;
        login(user, tokens);
        
        // Save last used phone
        if (!identifier.includes('@')) {
          await saveLastUsedPhone(identifier);
        }
        
        // Navigation
        if (autoNavigate) {
          router.replace('/(tabs)/home');
        }
        
        onSuccess?.();
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      const errorMessage = authService.parseApiError(error);
      onError?.(errorMessage);
    }
  }, [
    clearAuthError,
    clearErrors,
    getValues,
    loginMutation,
    login,
    autoNavigate,
    onSuccess,
    onError,
  ]);
  
  // ===== BIOMETRIC AUTHENTICATION =====
  const handleBiometricAuth = useCallback(async (): Promise<BiometricAuthResult> => {
    try {
      if (!isBiometricAvailable) {
        return {
          success: false,
          error: 'Authentification biométrique non disponible',
        };
      }
      
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authentifiez-vous pour vous connecter à KAYI House',
        cancelLabel: 'Annuler',
        fallbackLabel: 'Utiliser le mot de passe',
        disableDeviceFallback: false,
      });
      
      if (result.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        // Load saved credentials and auto-login
        const lastPhone = await getLastUsedPhone();
        if (lastPhone) {
          setValue('identifier', lastPhone);
          // Note: In a real app, you'd need to securely store and retrieve the password
          // For now, we'll just navigate to the form with phone prefilled
        }
        
        return { success: true };
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        
        return {
          success: false,
          error: result.error || 'Authentification biométrique échouée',
        };
      }
    } catch (error: any) {
      console.error('Biometric auth error:', error);
      
      return {
        success: false,
        error: 'Erreur lors de l\'authentification biométrique',
      };
    }
  }, [isBiometricAvailable, setValue]);
  
  // ===== PHONE FORMATTING =====
  const formatPhoneInput = useCallback((value: string): string => {
    // Don't format if it looks like an email
    if (value.includes('@')) {
      return value;
    }
    
    // Format as phone
    return authService.formatPhoneForDisplay(value);
  }, []);
  
  // ===== NAVIGATION =====
  const navigateToRegister = useCallback(() => {
    router.push('/(auth)/register');
  }, []);
  
  const navigateToForgotPassword = useCallback(() => {
    const identifier = getValues('identifier');
    
    router.push({
      pathname: '/(auth)/forgot-password',
      params: identifier ? { identifier } : {},
    });
  }, [getValues]);
  
  // ===== UTILITIES =====
  const prefillPhone = useCallback((phone: string) => {
    const formatted = authService.formatPhoneForDisplay(phone);
    setValue('identifier', formatted);
  }, [setValue]);
  
  const saveLastUsedPhone = async (phone: string) => {
    try {
      await AsyncStorage.setItem('last-login-phone', phone);
    } catch (error) {
      console.error('Error saving last used phone:', error);
    }
  };
  
  const getLastUsedPhone = async (): Promise<string | null> => {
    try {
      const phone = await AsyncStorage.getItem('last-login-phone');
      return phone ? authService.formatPhoneForDisplay(phone) : null;
    } catch (error) {
      console.error('Error getting last used phone:', error);
      return null;
    }
  };
  
  // ===== ERROR HANDLING =====
  const error = authError || loginMutation.error?.message || null;
  
  const clearError = useCallback(() => {
    clearAuthError();
    clearErrors();
  }, [clearAuthError, clearErrors]);
  
  // ===== LOADING STATE =====
  const isLoading = loginMutation.isPending;
  
  // ===== AUTO-LOAD LAST PHONE =====
  React.useEffect(() => {
    const loadLastPhone = async () => {
      const lastPhone = await getLastUsedPhone();
      if (lastPhone && !getValues('identifier')) {
        prefillPhone(lastPhone);
      }
    };
    
    loadLastPhone();
  }, []);
  
  // ===== RETURN OBJECT =====
  return {
    // Form management
    form,
    isValid,
    
    // Submit handling
    handleSubmit: formHandleSubmit(handleSubmit),
    isLoading,
    
    // Error handling
    error,
    clearError,
    
    // Phone formatting
    formatPhoneInput,
    
    // Biometric auth
    isBiometricAvailable,
    biometricType,
    handleBiometricAuth,
    
    // Navigation
    navigateToRegister,
    navigateToForgotPassword,
    
    // Utilities
    prefillPhone,
    getLastUsedPhone,
  };
};

export default useLogin;