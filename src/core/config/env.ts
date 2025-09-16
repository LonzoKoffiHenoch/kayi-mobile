import { z } from 'zod';

const envSchema = z.object({
  EXPO_PUBLIC_API_BASE_URL: z.string().url('API base URL must be a valid URL'),
  EXPO_PUBLIC_APP_ENVIRONMENT: z.enum(['development', 'staging', 'production']),
});

type EnvConfig = z.infer<typeof envSchema>;

class EnvironmentService {
  private static instance: EnvironmentService;
  private config: EnvConfig;

  private constructor() {
    try {
      this.config = envSchema.parse(process.env);
    } catch (error) {
      console.error('Environment validation failed:', error);
      throw new Error('Invalid environment configuration');
    }
  }

  public static getInstance(): EnvironmentService {
    if (!EnvironmentService.instance) {
      EnvironmentService.instance = new EnvironmentService();
    }
    return EnvironmentService.instance;
  }

  public get apiBaseUrl(): string {
    return this.config.EXPO_PUBLIC_API_BASE_URL;
  }

  public get environment(): string {
    return this.config.EXPO_PUBLIC_APP_ENVIRONMENT;
  }

  public get isDevelopment(): boolean {
    return this.config.EXPO_PUBLIC_APP_ENVIRONMENT === 'development';
  }

  public get isProduction(): boolean {
    return this.config.EXPO_PUBLIC_APP_ENVIRONMENT === 'production';
  }

  public get isStaging(): boolean {
    return this.config.EXPO_PUBLIC_APP_ENVIRONMENT === 'staging';
  }
}

export const env = EnvironmentService.getInstance();
export type { EnvConfig };