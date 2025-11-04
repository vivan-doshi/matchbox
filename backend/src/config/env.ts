import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export interface EnvConfig {
  // Server
  PORT: number;
  NODE_ENV: string;

  // Database
  MONGODB_URI: string;

  // JWT
  JWT_SECRET: string;
  JWT_EXPIRE: string;

  // CORS
  CORS_ORIGIN: string;
}

const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
};

export const env: EnvConfig = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: getEnvVar('MONGODB_URI', 'mongodb://localhost:27017/matchbox'),
  JWT_SECRET: getEnvVar('JWT_SECRET'),
  JWT_EXPIRE: process.env.JWT_EXPIRE || '7d',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
};

// Validate critical env vars on startup
export const validateEnv = (): void => {
  const required = ['JWT_SECRET', 'MONGODB_URI'];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }

  console.log('✅ Environment variables validated');
};
