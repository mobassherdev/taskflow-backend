import dotenv from 'dotenv';
import path from 'path';
import process from 'process';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  databaseUrl: process.env.DATABASE_URL || '',
  jwt: {
    accessSecret: process.env.JWT_SECRET || 'fallback-access-secret',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret',
    accessExpiry: process.env.JWT_EXPIRES_IN || '7d',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },
  corsOrigin: (process.env.CLIENT_URL || 'http://localhost:3000').split(','),
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },
  maxFileSizeMB: parseInt(process.env.MAX_FILE_SIZE_MB || '5', 10),
  superAdmin: {
    email: process.env.DEMO_ADMIN_EMAIL || '',
    password: process.env.DEMO_ADMIN_PASSWORD || '',
  },
} as const;
