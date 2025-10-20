import { 
  LoginRequest,
  RegisterRequest,
  VerifySmsRequest,
  AuthResponse,
  SmsVerificationResponse,
  User,
  AuthTokens,
} from '../../features/auth/types/auth.types';

// Mock delay function
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock user data
const mockUser: User = {
  id: '1',
  phone: '+2250123456789',
  email: 'user@kayi.ci',
  firstName: 'John',
  lastName: 'Doe',
  role: 'tenant',
  status: 'active',
  isPhoneVerified: true,
  isEmailVerified: false,
  avatar: null,
  preferences: {
    language: 'fr',
    currency: 'XOF',
    notifications: {
      email: true,
      sms: true,
      push: true,
    },
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Mock tokens
const mockTokens: AuthTokens = {
  accessToken: 'mock-access-token-' + Date.now(),
  refreshToken: 'mock-refresh-token-' + Date.now(),
  expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
};

// Mock API responses
export const mockAuthApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    await delay(1000);
    
    // Accept test credentials
    if (data.phone === '+2250123456789' && data.password === 'password123') {
      return {
        success: true,
        message: 'Connexion réussie',
        data: {
          user: mockUser,
          tokens: mockTokens,
        },
      };
    }
    
    throw {
      code: 'AUTH_ERROR',
      message: 'Numéro de téléphone ou mot de passe incorrect',
      details: 'Invalid credentials',
    };
  },

  register: async (data: RegisterRequest): Promise<{ success: boolean; message: string; phone: string }> => {
    await delay(1200);
    
    return {
      success: true,
      message: 'Compte créé avec succès. Un code de vérification a été envoyé par SMS.',
      phone: data.phone,
    };
  },

  verifySms: async (data: VerifySmsRequest): Promise<SmsVerificationResponse> => {
    await delay(800);
    
    // Accept any 6-digit code for demo
    if (data.code.length === 6 && /^\d+$/.test(data.code)) {
      return {
        success: true,
        message: 'Numéro vérifié avec succès',
        data: {
          verified: true,
          user: mockUser,
          tokens: mockTokens,
        },
      };
    }
    
    throw {
      code: 'VALIDATION_ERROR',
      message: 'Code de vérification invalide',
      details: 'Invalid verification code',
    };
  },

  resendSms: async (): Promise<{ success: boolean; message: string }> => {
    await delay(500);
    return {
      success: true,
      message: 'Un nouveau code de vérification a été envoyé',
    };
  },

  logout: async (): Promise<{ success: boolean; message: string }> => {
    await delay(300);
    return {
      success: true,
      message: 'Déconnexion réussie',
    };
  },

  getProfile: async () => {
    await delay(600);
    return {
      success: true,
      message: 'Profil récupéré avec succès',
      data: { user: mockUser },
    };
  },

  refreshToken: async (): Promise<{ tokens: AuthTokens }> => {
    await delay(400);
    return {
      tokens: {
        ...mockTokens,
        accessToken: 'mock-access-token-refreshed-' + Date.now(),
      },
    };
  },
};