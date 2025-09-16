/**
 * KAYI House useSmsVerification Hook
 * Hook pour la gestion de la vérification SMS
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Clipboard } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useVerifySmsMutation, useResendSmsMutation } from '../services/authApi';
import { useAuth } from './useAuth';
import authService from '../services/authService';
import { 
  VerifySmsRequest, 
  ResendSmsRequest, 
  SmsVerificationState,
  AUTH_CONSTANTS,
} from '../types/auth.types';

// ===== TYPES =====
export interface UseSmsVerificationOptions {
  phone: string;
  purpose: 'registration' | 'login' | 'password_reset';
  onSuccess?: () => void;
  onError?: (error: string) => void;
  autoNavigate?: boolean;
  enablePaste?: boolean;
  enableAutoSubmit?: boolean;
}

export interface UseSmsVerificationReturn {
  // Code management
  code: string;
  setCode: (code: string) => void;
  clearCode: () => void;
  
  // Code validation
  isCodeValid: boolean;
  isCodeComplete: boolean;
  
  // Submit handling
  handleSubmit: () => Promise<void>;
  handleAutoSubmit: (code: string) => Promise<void>;
  isSubmitting: boolean;
  
  // Resend functionality
  canResend: boolean;
  resendCountdown: number;
  handleResend: () => Promise<void>;
  isResending: boolean;
  
  // Error handling
  error: string | null;
  clearError: () => void;
  hasError: boolean;
  
  // Attempts tracking
  attempts: number;
  maxAttempts: number;
  attemptsRemaining: number;
  isLocked: boolean;
  
  // Clipboard functionality
  handlePaste: () => Promise<void>;
  canPaste: boolean;
  
  // Visual feedback
  shouldShake: boolean;
  clearShake: () => void;
  
  // State
  isExpired: boolean;
  expiresAt: Date | null;
  timeRemaining: number;
  
  // Navigation
  navigateBack: () => void;
  navigateToResend: () => void;
  
  // Utilities
  formatPhoneDisplay: string;
  getSuccessMessage: () => string;
}

// ===== HOOK IMPLEMENTATION =====
export const useSmsVerification = (options: UseSmsVerificationOptions): UseSmsVerificationReturn => {
  const {
    phone,
    purpose,
    onSuccess,
    onError,
    autoNavigate = true,
    enablePaste = true,
    enableAutoSubmit = true,
  } = options;
  
  // State
  const [state, setState] = useState<SmsVerificationState>({
    phone,
    purpose,
    codeLength: AUTH_CONSTANTS.SMS_CODE_LENGTH,
    expiresAt: new Date(Date.now() + AUTH_CONSTANTS.SMS_EXPIRY_MINUTES * 60 * 1000),
    canResend: false,
    resendCountdown: AUTH_CONSTANTS.SMS_RESEND_COUNTDOWN,
    attempts: 0,
    maxAttempts: AUTH_CONSTANTS.MAX_SMS_ATTEMPTS,
    isVerifying: false,
    error: null,
  });
  
  const [code, setCodeState] = useState('');
  const [shouldShake, setShouldShake] = useState(false);
  const [canPaste, setCanPaste] = useState(false);
  
  // Refs
  const countdownInterval = useRef<NodeJS.Timeout | null>(null);
  const expiryInterval = useRef<NodeJS.Timeout | null>(null);
  
  // Hooks
  const { login, clearError: clearAuthError, error: authError } = useAuth();
  const verifyMutation = useVerifySmsMutation();
  const resendMutation = useResendSmsMutation();
  
  // ===== COUNTDOWN TIMER =====
  useEffect(() => {
    if (state.resendCountdown > 0 && !state.canResend) {
      countdownInterval.current = setInterval(() => {
        setState(prev => {
          const newCountdown = prev.resendCountdown - 1;
          
          if (newCountdown <= 0) {
            return {
              ...prev,
              resendCountdown: 0,
              canResend: true,
            };
          }
          
          return {
            ...prev,
            resendCountdown: newCountdown,
          };
        });
      }, 1000);
    } else {
      if (countdownInterval.current) {
        clearInterval(countdownInterval.current);
        countdownInterval.current = null;
      }
    }
    
    return () => {
      if (countdownInterval.current) {
        clearInterval(countdownInterval.current);
      }
    };
  }, [state.resendCountdown, state.canResend]);
  
  // ===== EXPIRY TIMER =====
  useEffect(() => {
    if (state.expiresAt) {
      const checkExpiry = () => {
        if (new Date() >= state.expiresAt!) {
          setState(prev => ({
            ...prev,
            error: 'Le code SMS a expiré. Veuillez demander un nouveau code.',
            canResend: true,
          }));
          
          if (expiryInterval.current) {
            clearInterval(expiryInterval.current);
            expiryInterval.current = null;
          }
        }
      };
      
      expiryInterval.current = setInterval(checkExpiry, 1000);
      
      return () => {
        if (expiryInterval.current) {
          clearInterval(expiryInterval.current);
        }
      };
    }
  }, [state.expiresAt]);
  
  // ===== CLIPBOARD CHECK =====
  useEffect(() => {
    if (enablePaste) {
      checkClipboard();
    }
  }, [enablePaste]);
  
  const checkClipboard = async () => {
    try {
      const clipboardContent = await Clipboard.getString();
      
      // Check if clipboard contains a valid SMS code
      const isValidCode = /^\d{6}$/.test(clipboardContent);
      setCanPaste(isValidCode);
    } catch (error) {
      console.error('Clipboard check error:', error);
      setCanPaste(false);
    }
  };
  
  // ===== CODE MANAGEMENT =====
  const setCode = useCallback((newCode: string) => {
    // Only allow digits and limit to code length
    const cleanCode = newCode.replace(/\D/g, '').slice(0, state.codeLength);
    setCodeState(cleanCode);
    
    // Clear error when user starts typing
    if (state.error) {
      setState(prev => ({ ...prev, error: null }));
      clearAuthError();
    }
    
    // Auto-submit if code is complete and auto-submit is enabled
    if (enableAutoSubmit && cleanCode.length === state.codeLength) {
      handleAutoSubmit(cleanCode);
    }
  }, [state.codeLength, state.error, enableAutoSubmit, clearAuthError]);
  
  const clearCode = useCallback(() => {
    setCodeState('');
    setState(prev => ({ ...prev, error: null }));
    clearAuthError();
  }, [clearAuthError]);
  
  // ===== VALIDATION =====
  const isCodeValid = code.length === state.codeLength && /^\d+$/.test(code);
  const isCodeComplete = code.length === state.codeLength;
  const hasError = !!state.error || !!authError;
  const isLocked = state.attempts >= state.maxAttempts;
  const isExpired = state.expiresAt ? new Date() >= state.expiresAt : false;
  
  // ===== SUBMIT HANDLING =====
  const handleSubmit = useCallback(async () => {
    if (!isCodeValid || state.isVerifying || isLocked) {
      return;
    }
    
    try {
      setState(prev => ({ ...prev, isVerifying: true, error: null }));
      clearAuthError();
      
      const request: VerifySmsRequest = {
        phone: authService.formatPhoneForApi(phone),
        code,
        purpose,
      };
      
      const response = await verifyMutation.mutateAsync(request);
      
      if (response.data.verified) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        // Handle successful verification based on purpose
        if (purpose === 'registration' || purpose === 'login') {
          const { user, tokens } = response.data;
          login(user, tokens);
          
          if (autoNavigate) {
            router.replace('/(tabs)/home');
          }
        } else if (purpose === 'password_reset') {
          if (autoNavigate) {
            router.push({
              pathname: '/(auth)/reset-password',
              params: { phone, code },
            });
          }
        }
        
        onSuccess?.();
      } else {
        throw new Error('Vérification échouée');
      }
    } catch (error: any) {
      console.error('SMS verification error:', error);
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setShouldShake(true);
      
      // Increment attempts
      setState(prev => ({
        ...prev,
        attempts: prev.attempts + 1,
        error: authService.parseApiError(error),
        isVerifying: false,
      }));
      
      // Clear code on error
      clearCode();
      
      onError?.(authService.parseApiError(error));
    }
  }, [
    isCodeValid,
    state.isVerifying,
    isLocked,
    clearAuthError,
    phone,
    code,
    purpose,
    verifyMutation,
    login,
    autoNavigate,
    onSuccess,
    onError,
    clearCode,
  ]);
  
  const handleAutoSubmit = useCallback(async (fullCode: string) => {
    // Use the provided code instead of state code for immediate submission
    if (fullCode.length === state.codeLength && /^\d+$/.test(fullCode)) {
      await handleSubmit();
    }
  }, [state.codeLength, handleSubmit]);
  
  // ===== RESEND HANDLING =====
  const handleResend = useCallback(async () => {
    if (!state.canResend || resendMutation.isPending) {
      return;
    }
    
    try {
      const request: ResendSmsRequest = {
        phone: authService.formatPhoneForApi(phone),
        purpose,
      };
      
      await resendMutation.mutateAsync(request);
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Reset state for new code
      setState(prev => ({
        ...prev,
        canResend: false,
        resendCountdown: AUTH_CONSTANTS.SMS_RESEND_COUNTDOWN,
        expiresAt: new Date(Date.now() + AUTH_CONSTANTS.SMS_EXPIRY_MINUTES * 60 * 1000),
        error: null,
        attempts: 0, // Reset attempts on resend
      }));
      
      clearCode();
    } catch (error: any) {
      console.error('Resend SMS error:', error);
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      const errorMessage = authService.parseApiError(error);
      setState(prev => ({ ...prev, error: errorMessage }));
      onError?.(errorMessage);
    }
  }, [state.canResend, resendMutation.isPending, phone, purpose, resendMutation, clearCode, onError]);
  
  // ===== CLIPBOARD HANDLING =====
  const handlePaste = useCallback(async () => {
    if (!enablePaste) return;
    
    try {
      const clipboardContent = await Clipboard.getString();
      const cleanCode = clipboardContent.replace(/\D/g, '').slice(0, state.codeLength);
      
      if (cleanCode.length === state.codeLength) {
        setCode(cleanCode);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (error) {
      console.error('Paste error:', error);
    }
  }, [enablePaste, state.codeLength, setCode]);
  
  // ===== ERROR HANDLING =====
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
    clearAuthError();
  }, [clearAuthError]);
  
  const clearShake = useCallback(() => {
    setShouldShake(false);
  }, []);
  
  // ===== NAVIGATION =====
  const navigateBack = useCallback(() => {
    if (purpose === 'registration') {
      router.back();
    } else if (purpose === 'login') {
      router.push('/(auth)/login');
    } else {
      router.push('/(auth)/forgot-password');
    }
  }, [purpose]);
  
  const navigateToResend = useCallback(() => {
    // Could navigate to a dedicated resend screen if needed
    handleResend();
  }, [handleResend]);
  
  // ===== COMPUTED VALUES =====
  const formatPhoneDisplay = authService.formatPhoneForDisplay(phone);
  const attemptsRemaining = Math.max(0, state.maxAttempts - state.attempts);
  const timeRemaining = state.expiresAt ? Math.max(0, state.expiresAt.getTime() - Date.now()) : 0;
  
  const getSuccessMessage = useCallback(() => {
    switch (purpose) {
      case 'registration':
        return 'Inscription réussie ! Bienvenue sur KAYI House.';
      case 'login':
        return 'Connexion réussie ! Bienvenue.';
      case 'password_reset':
        return 'Code vérifié. Vous pouvez maintenant réinitialiser votre mot de passe.';
      default:
        return 'Vérification réussie.';
    }
  }, [purpose]);
  
  // ===== CLEANUP =====
  useEffect(() => {
    return () => {
      if (countdownInterval.current) {
        clearInterval(countdownInterval.current);
      }
      if (expiryInterval.current) {
        clearInterval(expiryInterval.current);
      }
    };
  }, []);
  
  // ===== RETURN OBJECT =====
  return {
    // Code management
    code,
    setCode,
    clearCode,
    
    // Code validation
    isCodeValid,
    isCodeComplete,
    
    // Submit handling
    handleSubmit,
    handleAutoSubmit,
    isSubmitting: state.isVerifying || verifyMutation.isPending,
    
    // Resend functionality
    canResend: state.canResend,
    resendCountdown: state.resendCountdown,
    handleResend,
    isResending: resendMutation.isPending,
    
    // Error handling
    error: state.error || authError,
    clearError,
    hasError,
    
    // Attempts tracking
    attempts: state.attempts,
    maxAttempts: state.maxAttempts,
    attemptsRemaining,
    isLocked,
    
    // Clipboard functionality
    handlePaste,
    canPaste,
    
    // Visual feedback
    shouldShake,
    clearShake,
    
    // State
    isExpired,
    expiresAt: state.expiresAt,
    timeRemaining,
    
    // Navigation
    navigateBack,
    navigateToResend,
    
    // Utilities
    formatPhoneDisplay,
    getSuccessMessage,
  };
};

export default useSmsVerification;