import { z } from 'zod';

export const updateUserSchema = z.object({
  name: z.string().min(2).max(60).optional(),
  avatar: z.string().url().optional(),
});

export const userQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
  role: z.enum(['ADMIN', 'PROJECT_MANAGER', 'TEAM_MEMBER']).optional(),
});
