import { z } from 'zod';
import { CI_CONSTANTS } from '../../config/constants';
import { ValidationResult, FormError } from '../types/common.types';

// Types pour validation result
export interface ValidationOptions {
  language?: 'fr' | 'en';
  strict?: boolean;
}

// Messages d'erreur en français (par défaut)
const VALIDATION_MESSAGES = {
  fr: {
    required: 'Ce champ est obligatoire',
    email: 'Adresse email invalide',
    phone: 'Numéro de téléphone ivoirien invalide',
    cni: 'Numéro CNI invalide (format: CIXXXXXXXXXX)',
    password: 'Mot de passe faible (8+ caractères, majus, minus, chiffre, spécial)',
    pin: 'PIN doit contenir exactement 4 chiffres',
    sms_code: 'Code SMS doit contenir exactement 6 chiffres',
    price_range: 'Prix doit être entre 0 et 100 000 000 FCFA',
    price_suspicious: 'Prix semble anormalement bas ou élevé',
    surface_range: 'Surface doit être entre 1 et 10 000 m²',
    coordinates: 'Coordonnées GPS invalides pour la Côte d\'Ivoire',
    commune: 'Commune invalide',
    age: 'Âge doit être entre 18 et 100 ans',
  },
  en: {
    required: 'This field is required',
    email: 'Invalid email address',
    phone: 'Invalid Ivorian phone number',
    cni: 'Invalid CNI number (format: CIXXXXXXXXXX)',
    password: 'Weak password (8+ chars, upper, lower, digit, special)',
    pin: 'PIN must contain exactly 4 digits',
    sms_code: 'SMS code must contain exactly 6 digits',
    price_range: 'Price must be between 0 and 100,000,000 FCFA',
    price_suspicious: 'Price seems abnormally low or high',
    surface_range: 'Surface must be between 1 and 10,000 m²',
    coordinates: 'Invalid GPS coordinates for Côte d\'Ivoire',
    commune: 'Invalid commune',
    age: 'Age must be between 18 and 100 years',
  },
};

// Validateurs de base pour Côte d'Ivoire

/**
 * Valide un numéro de téléphone ivoirien
 * Formats acceptés: 0XXXXXXXXX, +2250XXXXXXXXX, 2250XXXXXXXXX
 */
export const validateCIPhone = (phone: string): boolean => {
  if (!phone) return false;
  
  // Nettoyer le numéro (supprimer espaces, tirets, etc.)
  const cleaned = phone.replace(/[\s\-\(\)\.]/g, '');
  
  // Patterns pour CI
  const patterns = [
    /^0[0-9]{9}$/,           // 0XXXXXXXXX (format local)
    /^\+2250[0-9]{9}$/,      // +2250XXXXXXXXX (international)
    /^2250[0-9]{9}$/,        // 2250XXXXXXXXX (international sans +)
  ];
  
  // Vérifier si correspond à un pattern
  const isValid = patterns.some(pattern => pattern.test(cleaned));
  
  if (!isValid) return false;
  
  // Extraire les digits du numéro local (les 10 derniers)
  const localDigits = cleaned.slice(-10);
  
  // Vérifier les préfixes valides CI (opérateurs principaux)
  const validPrefixes = [
    '01', '02', '03',         // Orange
    '04', '05', '06',         // MTN
    '07', '08', '09',         // Moov
  ];
  
  const prefix = localDigits.substring(1, 3); // Position 1-2 après le 0
  return validPrefixes.includes(prefix);
};

/**
 * Formate un numéro de téléphone ivoirien
 */
export const formatCIPhone = (phone: string, international = false): string => {
  if (!phone) return '';
  
  const cleaned = phone.replace(/[\s\-\(\)\.]/g, '');
  
  if (!validateCIPhone(cleaned)) return phone; // Retourner original si invalide
  
  // Extraire les 10 derniers digits (numéro local)
  const localDigits = cleaned.slice(-10);
  
  if (international) {
    return `+225 ${localDigits}`;
  }
  
  // Format local avec espaces
  return `${localDigits.substring(0, 2)} ${localDigits.substring(2, 4)} ${localDigits.substring(4, 6)} ${localDigits.substring(6, 8)} ${localDigits.substring(8)}`;
};

/**
 * Valide un numéro CNI ivoirien
 * Format: CIXXXXXXXXXX (CI + 10 chiffres)
 */
export const validateCICNI = (cni: string): boolean => {
  if (!cni) return false;
  
  const cleaned = cni.toUpperCase().replace(/[\s\-]/g, '');
  
  // Pattern CNI CI: CI + 10 chiffres
  const pattern = /^CI[0-9]{10}$/;
  
  if (!pattern.test(cleaned)) return false;
  
  // TODO: Ajouter validation checksum si algorithme disponible
  return true;
};

/**
 * Valide un prix en FCFA pour le marché ivoirien
 */
export const validateCIPrice = (price: number, options?: { strict?: boolean }): {
  isValid: boolean;
  isSuspicious?: boolean;
  message?: string;
} => {
  if (typeof price !== 'number' || isNaN(price)) {
    return { isValid: false, message: 'Prix doit être un nombre' };
  }
  
  // Range acceptable: 0 à 100M FCFA
  if (price < 0 || price > 100_000_000) {
    return { isValid: false, message: 'Prix hors limites (0 - 100M FCFA)' };
  }
  
  // Détecter prix suspects
  let isSuspicious = false;
  let suspiciousReason = '';
  
  if (price < 10_000) { // Moins de 10k FCFA
    isSuspicious = true;
    suspiciousReason = 'Prix très bas';
  } else if (price > 50_000_000) { // Plus de 50M FCFA
    isSuspicious = true;
    suspiciousReason = 'Prix très élevé';
  }
  
  // En mode strict, rejeter les prix suspects
  if (options?.strict && isSuspicious) {
    return { isValid: false, isSuspicious: true, message: suspiciousReason };
  }
  
  return { isValid: true, isSuspicious, message: suspiciousReason };
};

/**
 * Valide des coordonnées GPS pour la Côte d'Ivoire
 * Côte d'Ivoire: Lat ~4.9° à 10.7°N, Lon ~-8.6° à -2.5°W
 */
export const validateCICoordinates = (latitude: number, longitude: number): boolean => {
  if (typeof latitude !== 'number' || typeof longitude !== 'number') return false;
  if (isNaN(latitude) || isNaN(longitude)) return false;
  
  // Boundaries approximatives de la Côte d'Ivoire
  const bounds = {
    north: 10.7,
    south: 4.9,
    east: -2.5,
    west: -8.6,
  };
  
  return latitude >= bounds.south && 
         latitude <= bounds.north && 
         longitude >= bounds.west && 
         longitude <= bounds.east;
};

/**
 * Valide une commune d'Abidjan
 */
export const validateCommune = (commune: string): boolean => {
  if (!commune) return false;
  const normalizedCommune = commune.toUpperCase().trim();
  return CI_CONSTANTS.POPULAR_COMMUNES.includes(normalizedCommune as any);
};

/**
 * Validateurs Zod pour formulaires
 */
export const phoneSchema = z.string()
  .min(1, VALIDATION_MESSAGES.fr.required)
  .refine(validateCIPhone, VALIDATION_MESSAGES.fr.phone);

export const cniSchema = z.string()
  .min(1, VALIDATION_MESSAGES.fr.required)
  .refine(validateCICNI, VALIDATION_MESSAGES.fr.cni);

export const emailSchema = z.string()
  .min(1, VALIDATION_MESSAGES.fr.required)
  .email(VALIDATION_MESSAGES.fr.email);

export const passwordSchema = z.string()
  .min(8, 'Mot de passe doit contenir au moins 8 caractères')
  .regex(/[A-Z]/, 'Mot de passe doit contenir au moins une majuscule')
  .regex(/[a-z]/, 'Mot de passe doit contenir au moins une minuscule')
  .regex(/[0-9]/, 'Mot de passe doit contenir au moins un chiffre')
  .regex(/[^A-Za-z0-9]/, 'Mot de passe doit contenir au moins un caractère spécial');

export const pinSchema = z.string()
  .regex(/^[0-9]{4}$/, VALIDATION_MESSAGES.fr.pin);

export const smsCodeSchema = z.string()
  .regex(/^[0-9]{6}$/, VALIDATION_MESSAGES.fr.sms_code);

export const priceSchema = z.number()
  .min(0, 'Prix doit être positif')
  .max(100_000_000, 'Prix maximum: 100M FCFA')
  .refine(price => !isNaN(price), 'Prix invalide');

export const surfaceSchema = z.number()
  .min(1, 'Surface minimum: 1 m²')
  .max(10_000, 'Surface maximum: 10 000 m²');

// Schémas pour formulaires complets
export const registrationSchema = z.object({
  firstName: z.string().min(1, 'Prénom obligatoire').max(50, 'Prénom trop long'),
  lastName: z.string().min(1, 'Nom obligatoire').max(50, 'Nom trop long'),
  email: emailSchema.optional(),
  phone: phoneSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  nationalId: cniSchema.optional(),
  commune: z.string().refine(validateCommune, 'Commune invalide').optional(),
  acceptTerms: z.boolean().refine(val => val === true, 'Vous devez accepter les conditions'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

export const loginSchema = z.object({
  phone: phoneSchema,
  password: z.string().min(1, 'Mot de passe obligatoire'),
});

export const propertySchema = z.object({
  title: z.string().min(5, 'Titre trop court').max(100, 'Titre trop long'),
  description: z.string().min(20, 'Description trop courte').max(2000, 'Description trop longue'),
  price: priceSchema,
  surface: surfaceSchema,
  bedrooms: z.number().min(0).max(20),
  bathrooms: z.number().min(0).max(20),
  commune: z.string().refine(validateCommune, 'Commune invalide'),
  neighborhood: z.string().min(1, 'Quartier obligatoire'),
  latitude: z.number(),
  longitude: z.number(),
}).refine(data => validateCICoordinates(data.latitude, data.longitude), {
  message: 'Coordonnées invalides pour la Côte d\'Ivoire',
  path: ['coordinates'],
});

/**
 * Fonction principale de validation de formulaire
 */
export const validateRegistrationForm = (data: any): ValidationResult => {
  try {
    registrationSchema.parse(data);
    return { isValid: true, errors: [] };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: FormError[] = error.issues.map((err: any) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      return { isValid: false, errors };
    }
    return { isValid: false, errors: [{ field: 'form', message: 'Erreur de validation' }] };
  }
};

export const validateLoginForm = (data: any): ValidationResult => {
  try {
    loginSchema.parse(data);
    return { isValid: true, errors: [] };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: FormError[] = error.issues.map((err: any) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      return { isValid: false, errors };
    }
    return { isValid: false, errors: [{ field: 'form', message: 'Erreur de validation' }] };
  }
};

export const validatePropertyForm = (data: any): ValidationResult => {
  try {
    propertySchema.parse(data);
    return { isValid: true, errors: [] };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: FormError[] = error.issues.map((err: any) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      return { isValid: false, errors };
    }
    return { isValid: false, errors: [{ field: 'form', message: 'Erreur de validation' }] };
  }
};

// Validateurs temps réel avec debouncing
export const createDebouncedValidator = <T>(
  validator: (value: T) => boolean,
  delay: number = 300
) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  
  return (value: T, callback: (isValid: boolean) => void) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      const isValid = validator(value);
      callback(isValid);
    }, delay);
  };
};

// Export des validateurs debouncés couramment utilisés
export const debouncedPhoneValidator = createDebouncedValidator(validateCIPhone);
export const debouncedEmailValidator = createDebouncedValidator((email: string) => {
  try {
    emailSchema.parse(email);
    return true;
  } catch {
    return false;
  }
});

// Utilitaires de validation
export const isValidCIPhonePrefix = (phone: string): boolean => {
  const cleaned = phone.replace(/[\s\-\(\)\.]/g, '');
  if (cleaned.length < 2) return false;
  
  const localDigits = cleaned.slice(-10);
  if (localDigits.length < 3) return false;
  
  const prefix = localDigits.substring(1, 3);
  return ['01', '02', '03', '04', '05', '06', '07', '08', '09'].includes(prefix);
};

export const getPhoneOperator = (phone: string): 'ORANGE' | 'MTN' | 'MOOV' | 'UNKNOWN' => {
  if (!validateCIPhone(phone)) return 'UNKNOWN';
  
  const cleaned = phone.replace(/[\s\-\(\)\.]/g, '');
  const localDigits = cleaned.slice(-10);
  const prefix = localDigits.substring(1, 3);
  
  if (['01', '02', '03'].includes(prefix)) return 'ORANGE';
  if (['04', '05', '06'].includes(prefix)) return 'MTN';
  if (['07', '08', '09'].includes(prefix)) return 'MOOV';
  
  return 'UNKNOWN';
};

// Validation de sécurité additionnelle
export const validateSecureInput = (input: string): boolean => {
  // Rejeter les scripts et injections courantes
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /data:text\/html/i,
    /vbscript:/i,
  ];
  
  return !dangerousPatterns.some(pattern => pattern.test(input));
};

export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  
  return input
    .replace(/[<>]/g, '') // Supprimer < et >
    .replace(/javascript:/gi, '') // Supprimer javascript:
    .replace(/on\w+\s*=/gi, '') // Supprimer les event handlers
    .trim()
    .substring(0, 1000); // Limiter la longueur
};