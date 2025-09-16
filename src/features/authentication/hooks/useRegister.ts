/**
 * KAYI House useRegister Hook
 * Hook pour la gestion de l'inscription multi-étapes
 */

import React, { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useRegisterMutation } from '../services/authApi';
import { useAuth } from './useAuth';
import authService from '../services/authService';
import { 
  RegisterFormData, 
  RegisterStep, 
  RegisterStepValidation,
  RegisterRequest,
  USER_TYPE_OPTIONS,
} from '../types/auth.types';
import { UserRole, SupportedLanguage, Commune } from '../../../core/types/common.types';

// ===== VALIDATION SCHEMAS =====

// Step 1: Personal Info
const step1Schema = z.object({
  firstName: z.string()
    .min(1, 'Prénom requis')
    .min(2, 'Le prénom doit contenir au moins 2 caractères')
    .max(50, 'Le prénom ne peut pas dépasser 50 caractères')
    .regex(/^[a-zA-ZÀ-ÿ\s'\-]+$/, 'Le prénom contient des caractères invalides'),
  
  lastName: z.string()
    .min(1, 'Nom requis')
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(50, 'Le nom ne peut pas dépasser 50 caractères')
    .regex(/^[a-zA-ZÀ-ÿ\s'\-]+$/, 'Le nom contient des caractères invalides'),
  
  phone: z.string()
    .min(1, 'Numéro de téléphone requis')
    .refine((phone) => {
      const validation = authService.validatePhoneFormat(phone);
      return validation.isValid;
    }, 'Format de numéro de téléphone invalide'),
  
  email: z.string()
    .optional()
    .refine((email) => {
      if (!email) return true; // Email optionnel
      const validation = authService.validateEmail(email);
      return validation.isValid;
    }, 'Format d\'email invalide'),
});

// Step 2: Role & Location
const step2Schema = z.object({
  role: z.nativeEnum(UserRole, {
    errorMap: () => ({ message: 'Veuillez sélectionner votre rôle' })
  }),
  commune: z.nativeEnum(Commune).optional(),
  preferredLanguage: z.nativeEnum({ fr: 'fr', en: 'en', baule: 'baule', dioula: 'dioula' } as const)
    .default('fr' as SupportedLanguage),
});

// Step 3: Security
const step3Schema = z.object({
  password: z.string()
    .min(1, 'Mot de passe requis')
    .refine((password) => {
      const validation = authService.validatePasswordStrength(password);
      return validation.isValid;
    }, 'Le mot de passe ne respecte pas les critères de sécurité'),
  
  confirmPassword: z.string()
    .min(1, 'Confirmation de mot de passe requise'),
  
  termsAccepted: z.boolean()
    .refine((accepted) => accepted === true, 'Vous devez accepter les conditions d\'utilisation'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

// Combined schema
const registerSchema = step1Schema.merge(step2Schema).merge(step3Schema);

// ===== TYPES =====
export interface UseRegisterOptions {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  onStepChange?: (step: RegisterStep) => void;
  autoNavigate?: boolean;
  enableDraftSaving?: boolean;
}

export interface UseRegisterReturn {
  // Form management
  form: ReturnType<typeof useForm<RegisterFormData>>;
  currentStep: RegisterStep;
  
  // Step navigation
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (step: RegisterStep) => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
  handleNextStep: () => void;
  handlePreviousStep: () => void;
  
  // Step validation
  validateCurrentStep: () => Promise<boolean>;
  getStepValidation: (step: RegisterStep) => RegisterStepValidation;
  isStepValid: (step: RegisterStep) => boolean;
  
  // Submit handling
  handleSubmit: () => Promise<void>;
  isLoading: boolean;
  
  // Error handling
  error: string | null;
  clearError: () => void;
  
  // Progress
  progress: number;
  isComplete: boolean;
  isLastStep: boolean;
  
  // Draft management
  saveDraft: () => Promise<void>;
  loadDraft: () => Promise<void>;
  clearDraft: () => Promise<void>;
  hasDraft: boolean;
  
  // Utilities
  formatPhoneInput: (value: string) => string;
  formatNameInput: (value: string) => string;
  getPasswordStrength: (password: string) => any;
  getStepTitle: (step?: RegisterStep) => string;
  getStepSubtitle: (step?: RegisterStep) => string;
  
  // Navigation
  navigateToLogin: () => void;
}

// ===== HOOK IMPLEMENTATION =====
export const useRegister = (options: UseRegisterOptions = {}): UseRegisterReturn => {
  const {
    onSuccess,
    onError,
    onStepChange,
    autoNavigate = true,
    enableDraftSaving = true,
  } = options;
  
  // State
  const [currentStep, setCurrentStep] = useState<RegisterStep>(1);
  const [hasDraft, setHasDraft] = useState(false);
  
  // Hooks
  const { clearError: clearAuthError, error: authError } = useAuth();
  const registerMutation = useRegisterMutation();
  
  // Form setup
  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      role: null,
      commune: null,
      preferredLanguage: 'fr',
      password: '',
      confirmPassword: '',
      termsAccepted: false,
    },
    mode: 'onChange',
  });
  
  const { 
    watch, 
    trigger, 
    getValues, 
    setValue, 
    formState, 
    clearErrors,
    handleSubmit: formHandleSubmit,
  } = form;
  
  // ===== DRAFT MANAGEMENT =====
  useEffect(() => {
    if (enableDraftSaving) {
      loadDraft();
    }
  }, [enableDraftSaving]);
  
  // Auto-save draft when form changes
  useEffect(() => {
    if (enableDraftSaving) {
      const subscription = watch(() => {
        saveDraft();
      });
      return () => subscription.unsubscribe();
    }
  }, [watch, enableDraftSaving]);
  
  const saveDraft = useCallback(async () => {
    try {
      const formData = getValues();
      await authService.saveDraftData('register', formData);
      setHasDraft(true);
    } catch (error) {
      console.error('Error saving draft:', error);
    }
  }, [getValues]);
  
  const loadDraft = useCallback(async () => {
    try {
      const draftData = await authService.loadDraftData('register');
      if (draftData) {
        // Set form values from draft
        Object.entries(draftData).forEach(([key, value]) => {
          setValue(key as keyof RegisterFormData, value);
        });
        setHasDraft(true);
      }
    } catch (error) {
      console.error('Error loading draft:', error);
    }
  }, [setValue]);
  
  const clearDraft = useCallback(async () => {
    try {
      await authService.clearDraftData('register');
      setHasDraft(false);
    } catch (error) {
      console.error('Error clearing draft:', error);
    }
  }, []);
  
  // ===== STEP VALIDATION =====
  const getStepSchema = (step: RegisterStep) => {
    switch (step) {
      case 1: return step1Schema;
      case 2: return step2Schema;
      case 3: return step3Schema;
      default: return step1Schema;
    }
  };
  
  const validateCurrentStep = useCallback(async (): Promise<boolean> => {
    const stepSchema = getStepSchema(currentStep);
    const formData = getValues();
    
    try {
      stepSchema.parse(formData);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Set form errors
        error.errors.forEach((err) => {
          if (err.path.length > 0) {
            form.setError(err.path[0] as keyof RegisterFormData, {
              message: err.message,
            });
          }
        });
      }
      return false;
    }
  }, [currentStep, getValues, form]);
  
  const getStepValidation = useCallback((step: RegisterStep): RegisterStepValidation => {
    try {
      const stepSchema = getStepSchema(step);
      const formData = getValues();
      
      if (!formData) {
        return {
          step,
          isValid: false,
          errors: ['Données du formulaire non disponibles'],
        };
      }
      
      stepSchema.parse(formData);
      return {
        step,
        isValid: true,
        errors: [],
      };
    } catch (error) {
      const errors: string[] = [];
      if (error instanceof z.ZodError) {
        try {
          errors.push(...error.errors.map(err => err.message || 'Erreur de validation'));
        } catch (mapError) {
          errors.push('Erreur de validation');
        }
      } else {
        errors.push('Erreur de validation inconnue');
      }
      
      return {
        step,
        isValid: false,
        errors,
      };
    }
  }, [getValues]);
  
  const isStepValid = useCallback((step: RegisterStep): boolean => {
    try {
      const validation = getStepValidation(step);
      return validation && validation.isValid === true;
    } catch (error) {
      console.error('Error in isStepValid:', error);
      return false;
    }
  }, [getStepValidation]);
  
  // ===== STEP NAVIGATION =====
  const nextStep = useCallback(async () => {
    const isValid = await validateCurrentStep();
    
    if (isValid && currentStep < 3) {
      const newStep = (currentStep + 1) as RegisterStep;
      setCurrentStep(newStep);
      onStepChange?.(newStep);
      
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else if (!isValid) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, [currentStep, validateCurrentStep, onStepChange]);
  
  const previousStep = useCallback(() => {
    if (currentStep > 1) {
      const newStep = (currentStep - 1) as RegisterStep;
      setCurrentStep(newStep);
      onStepChange?.(newStep);
      
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [currentStep, onStepChange]);
  
  const goToStep = useCallback((step: RegisterStep) => {
    setCurrentStep(step);
    onStepChange?.(step);
  }, [onStepChange]);
  
  const canGoNext = currentStep < 3 && isStepValid(currentStep);
  const canGoPrevious = currentStep > 1;
  
  // ===== FORM SUBMISSION =====
  const handleSubmit = useCallback(async () => {
    try {
      clearAuthError();
      clearErrors();
      
      // Validate all steps
      for (let step = 1; step <= 3; step++) {
        if (!isStepValid(step as RegisterStep)) {
          goToStep(step as RegisterStep);
          throw new Error(`Veuillez corriger les erreurs de l'étape ${step}`);
        }
      }
      
      const formData = getValues();
      
      // Format data for API
      const registerRequest: RegisterRequest = {
        firstName: authService.formatName(formData.firstName),
        lastName: authService.formatName(formData.lastName),
        phone: authService.formatPhoneForApi(formData.phone),
        email: formData.email || undefined,
        role: formData.role!,
        commune: formData.commune || undefined,
        preferredLanguage: formData.preferredLanguage,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        termsAccepted: formData.termsAccepted,
      };
      
      // Submit registration
      const response = await registerMutation.mutateAsync(registerRequest);
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Clear draft on success
      await clearDraft();
      
      if (response.data.smsCodeSent) {
        // Navigate to SMS verification
        if (autoNavigate) {
          router.push({
            pathname: '/(auth)/verify-sms',
            params: { 
              phone: authService.formatPhoneForDisplay(registerRequest.phone),
              purpose: 'registration',
            },
          });
        }
      }
      
      onSuccess?.();
    } catch (error: any) {
      console.error('Registration error:', error);
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      const errorMessage = authService.parseApiError(error);
      onError?.(errorMessage);
    }
  }, [
    clearAuthError,
    clearErrors,
    isStepValid,
    goToStep,
    getValues,
    registerMutation,
    clearDraft,
    autoNavigate,
    onSuccess,
    onError,
  ]);
  
  // ===== FORMATTING UTILITIES =====
  const formatPhoneInput = useCallback((value: string): string => {
    return authService.formatPhoneForDisplay(value);
  }, []);
  
  const formatNameInput = useCallback((value: string): string => {
    return authService.formatName(value);
  }, []);
  
  const getPasswordStrength = useCallback((password: string) => {
    return authService.evaluatePasswordStrength(password);
  }, []);
  
  // ===== NAVIGATION =====
  const navigateToLogin = useCallback(() => {
    router.push('/(auth)/login');
  }, []);
  
  // ===== STEP UTILITIES =====
  const getStepTitle = useCallback((step: RegisterStep = currentStep): string => {
    switch (step) {
      case 1: return 'Informations personnelles';
      case 2: return 'Rôle et localisation';
      case 3: return 'Sécurité';
      default: return 'Inscription';
    }
  }, [currentStep]);
  
  const getStepSubtitle = useCallback((step: RegisterStep = currentStep): string => {
    switch (step) {
      case 1: return 'Dites-nous qui vous êtes';
      case 2: return 'Aidez-nous à personnaliser votre expérience';
      case 3: return 'Sécurisez votre compte';
      default: return '';
    }
  }, [currentStep]);
  
  const handleNextStep = useCallback(() => {
    nextStep();
  }, [nextStep]);
  
  const handlePreviousStep = useCallback(() => {
    previousStep();
  }, [previousStep]);
  
  // ===== COMPUTED VALUES =====
  const progress = (currentStep / 3) * 100;
  const isComplete = currentStep === 3 && isStepValid(3);
  const isLastStep = currentStep === 3;
  const isLoading = registerMutation.isPending;
  const error = authError || registerMutation.error?.message || null;
  
  const clearError = useCallback(() => {
    clearAuthError();
    clearErrors();
  }, [clearAuthError, clearErrors]);
  
  // ===== RETURN OBJECT =====
  return {
    // Form management
    form,
    currentStep,
    
    // Step navigation
    nextStep,
    previousStep,
    goToStep,
    canGoNext,
    canGoPrevious,
    handleNextStep,
    handlePreviousStep,
    
    // Step validation
    validateCurrentStep,
    getStepValidation,
    isStepValid,
    
    // Submit handling
    handleSubmit: formHandleSubmit(handleSubmit),
    isLoading,
    
    // Error handling
    error,
    clearError,
    
    // Progress
    progress,
    isComplete,
    isLastStep,
    
    // Draft management
    saveDraft,
    loadDraft,
    clearDraft,
    hasDraft,
    
    // Utilities
    formatPhoneInput,
    formatNameInput,
    getPasswordStrength,
    getStepTitle,
    getStepSubtitle,
    
    // Navigation
    navigateToLogin,
  };
};

// ===== CONVENIENCE HOOKS =====

/**
 * Hook pour récupérer les options de type d'utilisateur
 */
export const useUserTypeOptions = () => {
  return USER_TYPE_OPTIONS;
};

/**
 * Hook pour récupérer les communes disponibles
 */
export const useCommuneOptions = () => {
  return Object.values(Commune).map(commune => ({
    value: commune,
    label: commune.replace('_', ' '),
  }));
};

export default useRegister;