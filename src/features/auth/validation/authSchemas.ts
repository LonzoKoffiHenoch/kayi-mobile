import { z } from 'zod';
import { MOBILE_MONEY_OPERATORS } from '../../../core/config/constants';
import { UserRole } from '../types/auth.types';

// Côte d'Ivoire Phone Number Validation
const VALID_CI_PREFIXES = [
  '07', '77', '87',  // Orange
  '05', '55', '65',  // MTN
  '01', '02', '03',  // Moov
  '70'               // Wave
];

// Helper function to validate CI phone number
const validateCIPhone = (phone: string): boolean => {
  // Remove all non-digit characters except +
  const cleanPhone = phone.replace(/[^\d+]/g, '');
  
  // Check if it starts with +225
  if (cleanPhone.startsWith('+225')) {
    const number = cleanPhone.substring(4); // Remove +225
    if (number.length === 10) {
      const prefix = number.substring(0, 2);
      return VALID_CI_PREFIXES.includes(prefix);
    }
  }
  
  // Check if it's a local number (10 digits starting with valid prefix)
  if (cleanPhone.length === 10) {
    const prefix = cleanPhone.substring(0, 2);
    return VALID_CI_PREFIXES.includes(prefix);
  }
  
  return false;
};

// Helper function to format CI phone number
export const formatCIPhone = (phone: string): string => {
  const cleanPhone = phone.replace(/[^\d+]/g, '');
  
  if (cleanPhone.startsWith('+225')) {
    return cleanPhone;
  }
  
  if (cleanPhone.length === 10) {
    return `+225${cleanPhone}`;
  }
  
  return phone;
};

// Helper function to get operator from phone number
export const getPhoneOperator = (phone: string): string | null => {
  const cleanPhone = phone.replace(/[^\d+]/g, '');
  let number = cleanPhone;
  
  if (cleanPhone.startsWith('+225')) {
    number = cleanPhone.substring(4);
  }
  
  if (number.length === 10) {
    const prefix = number.substring(0, 2);
    
    for (const [operatorKey, operator] of Object.entries(MOBILE_MONEY_OPERATORS)) {
      if (operator.prefixes.includes(prefix)) {
        return operator.name;
      }
    }
  }
  
  return null;
};

// Base phone schema
export const phoneSchema = z
  .string()
  .min(1, 'Le numéro de téléphone est requis')
  .refine(
    (phone) => validateCIPhone(phone),
    {
      message: 'Numéro de téléphone invalide. Utilisez un numéro ivoirien valide (ex: 07 12 34 56 78)'
    }
  )
  .transform(formatCIPhone);

// Password schema
export const passwordSchema = z
  .string()
  .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    'Le mot de passe doit contenir au moins une minuscule, une majuscule, un chiffre et un caractère spécial'
  );

// Name schema
export const nameSchema = z
  .string()
  .min(2, 'Le nom doit contenir au moins 2 caractères')
  .max(50, 'Le nom ne peut pas dépasser 50 caractères')
  .regex(
    /^[a-zA-ZÀ-ÿ\s'-]+$/,
    'Le nom ne peut contenir que des lettres, espaces, traits d\'union et apostrophes'
  );

// Email schema (optional)
export const emailSchema = z
  .string()
  .email('Adresse email invalide')
  .optional()
  .or(z.literal(''));

// SMS verification code schema
export const smsCodeSchema = z
  .string()
  .min(4, 'Le code doit contenir au moins 4 chiffres')
  .max(6, 'Le code ne peut pas dépasser 6 chiffres')
  .regex(/^\d+$/, 'Le code ne peut contenir que des chiffres');

// Login Schema
export const loginSchema = z.object({
  identifier: phoneSchema,
  password: z.string().min(1, 'Le mot de passe est requis'),
  // rememberMe: z.boolean().default(false),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Register Schema
export const registerSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  phone: phoneSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  role: z.nativeEnum(UserRole, {
    errorMap: () => ({ message: 'Veuillez sélectionner un rôle valide' })
  }),
  email: emailSchema,
  acceptTerms: z.boolean().refine(
    (val) => val === true,
    { message: 'Vous devez accepter les conditions d\'utilisation' }
  ),
  acceptPrivacy: z.boolean().refine(
    (val) => val === true,
    { message: 'Vous devez accepter la politique de confidentialité' }
  ),
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword']
  }
);

export type RegisterFormData = z.infer<typeof registerSchema>;

// SMS Verification Schema
export const smsVerificationSchema = z.object({
  phone: phoneSchema,
  code: smsCodeSchema,
  type: z.enum(['registration', 'login', 'password_reset']),
});

export type SmsVerificationFormData = z.infer<typeof smsVerificationSchema>;

// Forgot Password Schema
export const forgotPasswordSchema = z.object({
  phone: phoneSchema,
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

// Reset Password Schema
export const resetPasswordSchema = z.object({
  phone: phoneSchema,
  code: smsCodeSchema,
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).refine(
  (data) => data.newPassword === data.confirmPassword,
  {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword']
  }
);

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

// Change Password Schema
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Le mot de passe actuel est requis'),
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).refine(
  (data) => data.newPassword === data.confirmPassword,
  {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword']
  }
).refine(
  (data) => data.currentPassword !== data.newPassword,
  {
    message: 'Le nouveau mot de passe doit être différent de l\'actuel',
    path: ['newPassword']
  }
);

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

// Update Profile Schema
export const updateProfileSchema = z.object({
  firstName: nameSchema.optional(),
  lastName: nameSchema.optional(),
  email: emailSchema,
  companyName: z.string().max(100, 'Le nom de l\'entreprise ne peut pas dépasser 100 caractères').optional(),
  language: z.enum(['fr', 'en']).optional(),
  notifications: z.object({
    email: z.boolean(),
    sms: z.boolean(),
    push: z.boolean(),
  }).partial().optional(),
});

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;

// Phone number input validation (for real-time validation)
export const validatePhoneInput = (phone: string): {
  isValid: boolean;
  error?: string;
  operator?: string;
  formatted: string;
} => {
  if (!phone || phone.length === 0) {
    return {
      isValid: false,
      error: 'Le numéro de téléphone est requis',
      formatted: phone,
    };
  }

  const isValid = validateCIPhone(phone);
  const operator = getPhoneOperator(phone);
  const formatted = formatCIPhone(phone);

  if (!isValid) {
    return {
      isValid: false,
      error: 'Numéro de téléphone invalide. Utilisez un numéro ivoirien valide',
      formatted: phone,
    };
  }

  return {
    isValid: true,
    operator: operator || undefined,
    formatted,
  };
};

// Password strength validation
export const validatePasswordStrength = (password: string): {
  score: number; // 0-4
  feedback: string[];
  isValid: boolean;
} => {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) score++;
  else feedback.push('Au moins 8 caractères');

  if (/[a-z]/.test(password)) score++;
  else feedback.push('Au moins une minuscule');

  if (/[A-Z]/.test(password)) score++;
  else feedback.push('Au moins une majuscule');

  if (/\d/.test(password)) score++;
  else feedback.push('Au moins un chiffre');

  if (/[@$!%*?&]/.test(password)) score++;
  else feedback.push('Au moins un caractère spécial');

  return {
    score,
    feedback,
    isValid: score >= 4,
  };
};