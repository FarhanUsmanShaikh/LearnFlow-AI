import { z } from 'zod'

// Task validation schemas
export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED']).default('TODO'),
  dueDate: z.date().optional(),
  assigneeId: z.string().optional(),
  estimatedTime: z.number().min(1).optional(),
  tags: z.array(z.string()).default([]),
})

export const updateTaskSchema = createTaskSchema.partial().extend({
  id: z.string(),
})

// Progress validation schemas
export const createProgressSchema = z.object({
  taskId: z.string(),
  progress: z.number().min(0).max(100),
  notes: z.string().optional(),
  timeSpent: z.number().min(0).optional(),
})

// AI validation schemas
export const taskBreakdownSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
})

export const progressSummarySchema = z.object({
  userId: z.string(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
})

// User validation schemas
export const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  role: z.enum(['STUDENT', 'EDUCATOR', 'ADMIN']).optional(),
})

// Filter and pagination schemas
export const taskFilterSchema = z.object({
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  assigneeId: z.string().optional(),
  creatorId: z.string().optional(),
  search: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
})

export type CreateTaskInput = z.infer<typeof createTaskSchema>
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>
export type CreateProgressInput = z.infer<typeof createProgressSchema>
export type TaskBreakdownInput = z.infer<typeof taskBreakdownSchema>
export type ProgressSummaryInput = z.infer<typeof progressSummarySchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type TaskFilterInput = z.infer<typeof taskFilterSchema>