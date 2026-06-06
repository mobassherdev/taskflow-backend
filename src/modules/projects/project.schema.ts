import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(1000).optional(),
  deadline: z.coerce.date().optional(),
  status: z.enum(['ACTIVE', 'COMPLETED', 'ON_HOLD']).default('ACTIVE'),
});

export const updateProjectSchema = createProjectSchema.partial();

export const addMemberSchema = z.object({
  userId: z.string().min(1),
});

export const projectQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  status: z.enum(['ACTIVE', 'COMPLETED', 'ON_HOLD']).optional(),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'deadline', 'name', 'updatedAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});
