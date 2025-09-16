import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from 'jwt-decode';
import { AuthUser, PhoneValidationResult, PasswordStrength, AUTH_CONSTANTS } from '../types/auth.types';
import { ApiResponse } from '../../../core/types/common.types';

export const validatePhoneFormat = (phone: string): PhoneValidationResult => {
  if (!phone) {
    return {
      isValid: false,
      formatted: '',
      error: 'Numéro de téléphone requis'
    };
  }

  // Supprimer tous les espaces et caractères spéciaux
  const cleaned = phone.replace(/[\s\-\(\)\.]/g, '');
  
  // Patterns valides pour la Côte d'Ivoire
  const patterns = [
    /^(\+225|225)?([0-9]{8})$/, // Format: +225XXXXXXXX ou 225XXXXXXXX ou XXXXXXXX
    /^(\+225|225)?\s?([0-9]{2})\s?([0-9]{2})\s?([0-9]{2})\s?([0-9]{2})$/, // Format espacé
  ];

  for (const pattern of patterns) {
    const match = cleaned.match(pattern);
    if (match) {
      const number = match[2] || match[1]; // Récupérer les 8 chiffres
      
      // Vérifier que le numéro commence par un préfixe valide CI
      const validPrefixes = ['01', '02', '03', '05', '07', '08', '09'];
      const prefix = number.substring(0, 2);
      
      if (validPrefixes.includes(prefix)) {
        return {
          isValid: true,
          formatted: `${AUTH_CONSTANTS.PHONE_PREFIX_CI}${number}`,
        };
      }
    }
  }

  return {
    isValid: false,
    formatted: '',
    error: 'Format de numéro invalide. Utilisez un numéro ivoirien valide.'
  };
};

export const formatPhoneForApi = (phone: string): string => {
  const validation = validatePhoneFormat(phone);
  return validation.isValid ? validation.formatted : phone;
};

export const formatPhoneForDisplay = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.startsWith('225')) {
    const number = cleaned.substring(3);
    return `+225 ${number.substring(0, 2)} ${number.substring(2, 4)} ${number.substring(4, 6)} ${number.substring(6, 8)}`;
  }
  
  if (cleaned.length === 8) {
    return `+225 ${cleaned.substring(0, 2)} ${cleaned.substring(2, 4)} ${cleaned.substring(4, 6)} ${cleaned.substring(6, 8)}`;
  }
  
  return phone;
};

/**
 * Formate l'entrée utilisateur de téléphone
 */
export const formatPhoneInput = (input: string): string => {
  // Remove all non-digits first
  const cleaned = input.replace(/\D/g, '');
  
  // If it starts with 225, add the +
  if (cleaned.startsWith('225')) {
    return '+' + cleaned;
  }
  
  // If it doesn't start with 225, prepend it
  if (cleaned.length > 0) {
    return '+225' + cleaned;
  }
  
  return input;
};

/**
 * Masque partiellement un numéro de téléphone
 */
export const maskPhoneNumber = (phone: string): string => {
  const validation = validatePhoneFormat(phone);
  if (!validation.isValid) return phone;
  
  const formatted = validation.formatted;
  const visibleStart = formatted.substring(0, 8); // +225 XX
  const visibleEnd = formatted.substring(formatted.length - 2); // XX
  const masked = '*'.repeat(formatted.length - 10);
  
  return `${visibleStart}${masked}${visibleEnd}`;
};

// ===== PASSWORD VALIDATION =====

/**
 * Évalue la force d'un mot de passe
 */
export const evaluatePasswordStrength = (password: string): PasswordStrength => {
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const minLength = password.length >= AUTH_CONSTANTS.PASSWORD_MIN_LENGTH;

  const criteria = [hasLowercase, hasUppercase, hasNumbers, hasSpecialChars, minLength];
  const score = criteria.filter(Boolean).length;

  const feedback: string[] = [];
  
  if (!minLength) {
    feedback.push(`Au moins ${AUTH_CONSTANTS.PASSWORD_MIN_LENGTH} caractères`);
  }
  if (!hasLowercase) {
    feedback.push('Au moins une minuscule');
  }
  if (!hasUppercase) {
    feedback.push('Au moins une majuscule');
  }
  if (!hasNumbers) {
    feedback.push('Au moins un chiffre');
  }
  if (!hasSpecialChars) {
    feedback.push('Au moins un caractère spécial');
  }

  return {
    score: Math.min(score, 4),
    hasLowercase,
    hasUppercase,
    hasNumbers,
    hasSpecialChars,
    minLength,
    feedback,
  };
};

/**
 * Valide qu'un mot de passe est suffisamment fort
 */
export const validatePasswordStrength = (password: string): { isValid: boolean; errors: string[] } => {
  const strength = evaluatePasswordStrength(password);
  const isValid = strength.score >= 3; // Au moins 3 critères sur 5
  
  return {
    isValid,
    errors: strength.feedback,
  };
};

// ===== JWT TOKEN UTILITIES =====

/**
 * Vérifie si un token JWT est expiré
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded: any = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch (error) {
    console.error('Token decode error:', error);
    return true; // Considérer comme expiré si décodage impossible
  }
};

/**
 * Vérifie s'il faut rafraîchir le token
 */
export const shouldRefreshToken = (token: string): boolean => {
  try {
    const decoded: any = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    const timeUntilExpiry = decoded.exp - currentTime;
    
    // Rafraîchir si moins de 5 minutes avant expiration
    return timeUntilExpiry < (AUTH_CONSTANTS.TOKEN_REFRESH_THRESHOLD / 1000);
  } catch (error) {
    console.error('Token decode error:', error);
    return true; // Rafraîchir si décodage impossible
  }
};

/**
 * Extrait les informations d'un token JWT
 */
export const parseTokenInfo = (token: string): any | null => {
  try {
    return jwtDecode(token);
  } catch (error) {
    console.error('Token parse error:', error);
    return null;
  }
};

// ===== DATA PARSING =====

/**
 * Parse la réponse utilisateur de l'API vers le type AuthUser
 */
export const parseUserFromApi = (apiUser: any): AuthUser => {
  return {
    id: apiUser.id,
    createdAt: apiUser.createdAt,
    updatedAt: apiUser.updatedAt,
    email: apiUser.email,
    phone: apiUser.phone,
    firstName: apiUser.firstName,
    lastName: apiUser.lastName,
    preferredLanguage: apiUser.preferredLanguage || 'fr',
    role: apiUser.role,
    verified: apiUser.verified || false,
    phoneVerified: apiUser.phoneVerified || false,
    profileComplete: apiUser.profileComplete || false,
    nationalId: apiUser.nationalId,
    commune: apiUser.commune,
    neighborhood: apiUser.neighborhood,
    monthlyIncome: apiUser.monthlyIncome,
    profilePicture: apiUser.profilePicture,
    lastLoginAt: apiUser.lastLoginAt,
    deviceId: apiUser.deviceId,
    biometricEnabled: apiUser.biometricEnabled || false,
  };
};

/**
 * Parse une réponse d'erreur API
 */
export const parseApiError = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  
  if (error.message) {
    return error.message;
  }
  
  return 'Une erreur est survenue';
};

// ===== STORAGE UTILITIES =====

/**
 * Nettoie toutes les données utilisateur du stockage
 */
export const clearAllUserData = async (): Promise<void> => {
  try {
    // Effacer le stockage sécurisé
    const secureKeys = ['auth-tokens', 'biometric-data', 'refresh-token'];
    await Promise.all(
      secureKeys.map(key => 
        SecureStore.deleteItemAsync(key).catch(error => 
          console.warn(`Failed to delete ${key}:`, error)
        )
      )
    );

    // Effacer AsyncStorage
    const asyncKeys = [
      'auth-user-data',
      'auth-user-preferences', 
      'kayi-auth-store',
      'auth-form-drafts',
      'last-login-phone',
    ];
    
    await AsyncStorage.multiRemove(asyncKeys);
    
    console.log('All user data cleared successfully');
  } catch (error) {
    console.error('Error clearing user data:', error);
    throw error;
  }
};

/**
 * Sauvegarde un brouillon de formulaire
 */
export const saveDraftData = async (formType: string, data: any): Promise<void> => {
  try {
    const key = `auth-form-draft-${formType}`;
    await AsyncStorage.setItem(key, JSON.stringify({
      data,
      timestamp: Date.now(),
    }));
  } catch (error) {
    console.error('Error saving draft:', error);
  }
};

/**
 * Récupère un brouillon de formulaire
 */
export const loadDraftData = async (formType: string): Promise<any | null> => {
  try {
    const key = `auth-form-draft-${formType}`;
    const stored = await AsyncStorage.getItem(key);
    
    if (stored) {
      const { data, timestamp } = JSON.parse(stored);
      
      // Vérifier si le brouillon n'est pas trop ancien (24h)
      const maxAge = 24 * 60 * 60 * 1000;
      if (Date.now() - timestamp < maxAge) {
        return data;
      } else {
        // Supprimer le brouillon expiré
        await AsyncStorage.removeItem(key);
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error loading draft:', error);
    return null;
  }
};

/**
 * Efface un brouillon de formulaire
 */
export const clearDraftData = async (formType: string): Promise<void> => {
  try {
    const key = `auth-form-draft-${formType}`;
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error('Error clearing draft:', error);
  }
};

// ===== VALIDATION UTILITIES =====

/**
 * Valide une adresse email
 */
export const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  if (!email) {
    return { isValid: true }; // Email optionnel
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValid = emailRegex.test(email);
  
  return {
    isValid,
    error: isValid ? undefined : 'Format d\'email invalide'
  };
};

/**
 * Valide un nom (prénom ou nom de famille)
 */
export const validateName = (name: string, field: string): { isValid: boolean; error?: string } => {
  if (!name) {
    return {
      isValid: false,
      error: `${field} requis`
    };
  }
  
  if (name.length < 2) {
    return {
      isValid: false,
      error: `${field} doit contenir au moins 2 caractères`
    };
  }
  
  if (name.length > 50) {
    return {
      isValid: false,
      error: `${field} ne peut pas dépasser 50 caractères`
    };
  }
  
  // Permettre seulement lettres, espaces, apostrophes et traits d'union
  const nameRegex = /^[a-zA-ZÀ-ÿ\s'\-]+$/;
  if (!nameRegex.test(name)) {
    return {
      isValid: false,
      error: `${field} contient des caractères invalides`
    };
  }
  
  return { isValid: true };
};

/**
 * Formate un nom en proper case
 */
export const formatName = (name: string): string => {
  if (!name) return '';
  
  return name
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Valide un code SMS
 */
export const validateSmsCode = (code: string): { isValid: boolean; error?: string } => {
  if (!code) {
    return {
      isValid: false,
      error: 'Code SMS requis'
    };
  }
  
  if (code.length !== AUTH_CONSTANTS.SMS_CODE_LENGTH) {
    return {
      isValid: false,
      error: `Le code doit contenir ${AUTH_CONSTANTS.SMS_CODE_LENGTH} chiffres`
    };
  }
  
  if (!/^\d+$/.test(code)) {
    return {
      isValid: false,
      error: 'Le code doit contenir uniquement des chiffres'
    };
  }
  
  return { isValid: true };
};

// ===== DEVICE UTILITIES =====

/**
 * Génère un identifiant unique pour l'appareil
 */
export const generateDeviceId = (): string => {
  return `device_${Date.now()}_${Math.random().toString(36).substring(2)}`;
};

/**
 * Récupère ou génère un ID d'appareil
 */
export const getDeviceId = async (): Promise<string> => {
  try {
    let deviceId = await AsyncStorage.getItem('device-id');
    
    if (!deviceId) {
      deviceId = generateDeviceId();
      await AsyncStorage.setItem('device-id', deviceId);
    }
    
    return deviceId;
  } catch (error) {
    console.error('Error getting device ID:', error);
    return generateDeviceId();
  }
};

// ===== EXPORT DEFAULT =====
export default {
  // Phone utilities
  validatePhoneFormat,
  formatPhoneForApi,
  formatPhoneForDisplay,
  formatPhoneInput,
  maskPhoneNumber,
  
  // Password utilities
  evaluatePasswordStrength,
  validatePasswordStrength,
  
  // Token utilities
  isTokenExpired,
  shouldRefreshToken,
  parseTokenInfo,
  
  // Data parsing
  parseUserFromApi,
  parseApiError,
  
  // Storage utilities
  clearAllUserData,
  saveDraftData,
  loadDraftData,
  clearDraftData,
  
  // Validation utilities
  validateEmail,
  validateName,
  formatName,
  validateSmsCode,
  
  // Device utilities
  generateDeviceId,
  getDeviceId,
};