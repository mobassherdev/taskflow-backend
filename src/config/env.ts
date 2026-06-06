import { z } from 'zod';

const envSchema = z.object({
  PORT: z.string().default('5000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string().min(10),
  JWT_EXPIRES_IN: z.string().default('7d'),
  JWT_REFRESH_SECRET: z.string().min(10),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),
  CLIENT_URL: z.string().default('http://localhost:3000'),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  MAX_FILE_SIZE_MB: z.string().default('5'),
  DEMO_ADMIN_EMAIL: z.string().optional(),
  DEMO_ADMIN_PASSWORD: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

export const env: Env = envSchema.parse(process.env);
