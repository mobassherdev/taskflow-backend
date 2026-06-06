import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().max(2000).optional(),
  assigneeId: z.string().optional(),
  dueDate: z.coerce.date().optional(),
  priority: z.enum(['HIGH', 'MEDIUM', 'LOW']).default('MEDIUM'),
  status: z.enum(['TODO', 'IN_PROGRESS', 'COMPLETED']).default('TODO'),
});

export const updateTaskSchema = z.object({
  title: z.string().min(2).max(200).optional(),
  description: z.string().max(2000).optional(),
  assigneeId: z.string().nullable().optional(),
  dueDate: z.coerce.date().optional().nullable(),
  priority: z.enum(['HIGH', 'MEDIUM', 'LOW']).optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'COMPLETED']).optional(),
});

export const taskQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'COMPLETED']).optional(),
  priority: z.enum(['HIGH', 'MEDIUM', 'LOW']).optional(),
  assigneeId: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'dueDate', 'priority', 'updatedAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  deadlineStatus: z.enum(['upcoming', 'overdue']).optional(),
});

export const addCommentSchema = z.object({
  body: z.string().min(1).max(2000),
});
