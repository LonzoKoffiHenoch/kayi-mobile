import Constants from 'expo-constants';

interface EnvConfig {
  API_BASE_URL: string;
  API_TIMEOUT: number;
  APP_NAME: string;
  APP_VERSION: string;
  APP_ENVIRONMENT: 'development' | 'staging' | 'production';
  
  // Mobile Money URLs
  ORANGE_MONEY_API_URL: string;
  MTN_MONEY_API_URL: string;
  MOOV_MONEY_API_URL: string;
  
  // Deep Linking
  DEEP_LINK_SCHEME: string;
  
  // Feature flags
  FLEX_RENT_ENABLED: boolean;
  VIRTUAL_TOURS_ENABLED: boolean;
  BIOMETRIC_AUTH_ENABLED: boolean;
  OFFLINE_MODE_ENABLED: boolean;
  ANALYTICS_ENABLED: boolean;
  CRASHLYTICS_ENABLED: boolean;
  
  // Development flags
  MOCK_AUTH_ENABLED: boolean;
}

const createConfig = (): EnvConfig => {
  const expoConfig = Constants.expoConfig;
  const manifest = Constants.manifest2 ?? Constants.manifest;
  
  return {
    API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.100.90:3002',
    API_TIMEOUT: parseInt(process.env.EXPO_PUBLIC_API_TIMEOUT || '30000', 10),
    APP_NAME: process.env.EXPO_PUBLIC_APP_NAME || 'KAYI House',
    APP_VERSION: process.env.EXPO_PUBLIC_APP_VERSION || '1.0.0',
    APP_ENVIRONMENT: (process.env.EXPO_PUBLIC_APP_ENVIRONMENT as EnvConfig['APP_ENVIRONMENT']) || 'development',
    
    // Mobile Money
    ORANGE_MONEY_API_URL: process.env.EXPO_PUBLIC_ORANGE_MONEY_API_URL || '',
    MTN_MONEY_API_URL: process.env.EXPO_PUBLIC_MTN_MONEY_API_URL || '',
    MOOV_MONEY_API_URL: process.env.EXPO_PUBLIC_MOOV_MONEY_API_URL || '',
    
    // Deep Linking
    DEEP_LINK_SCHEME: process.env.EXPO_PUBLIC_DEEP_LINK_SCHEME || 'kayihouse',
    
    // Feature flags
    FLEX_RENT_ENABLED: process.env.EXPO_PUBLIC_FLEX_RENT_ENABLED === 'true',
    VIRTUAL_TOURS_ENABLED: process.env.EXPO_PUBLIC_VIRTUAL_TOURS_ENABLED === 'true',
    BIOMETRIC_AUTH_ENABLED: process.env.EXPO_PUBLIC_BIOMETRIC_AUTH_ENABLED === 'true',
    OFFLINE_MODE_ENABLED: process.env.EXPO_PUBLIC_OFFLINE_MODE_ENABLED === 'true',
    ANALYTICS_ENABLED: process.env.EXPO_PUBLIC_ANALYTICS_ENABLED === 'true',
    CRASHLYTICS_ENABLED: process.env.EXPO_PUBLIC_CRASHLYTICS_ENABLED === 'true',
    
    // Development flags
    MOCK_AUTH_ENABLED: process.env.EXPO_PUBLIC_MOCK_AUTH_ENABLED === 'true' || __DEV__,
  };
};

export const ENV = createConfig();

// Validation environnement
const validateEnv = () => {
  const requiredVars: (keyof EnvConfig)[] = ['API_BASE_URL', 'APP_NAME', 'APP_VERSION'];
  
  for (const varName of requiredVars) {
    if (!ENV[varName]) {
      throw new Error(`Missing required environment variable: ${varName}`);
    }
  }
  
  console.log('✅ Environment configuration loaded successfully');
  console.log(`🌍 Environment: ${ENV.APP_ENVIRONMENT}`);
  console.log(`🔗 API Base URL: ${ENV.API_BASE_URL}`);
  console.log(`📱 Deep Link Scheme: ${ENV.DEEP_LINK_SCHEME}`);
};

// Valider au démarrage
if (__DEV__) {
  validateEnv();
}