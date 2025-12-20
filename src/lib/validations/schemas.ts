import { z } from 'zod'

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required').optional(),
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const createBoardSchema = z.object({
  name: z.string().min(1, 'Board name is required').max(255),
  description: z.string().max(1000).optional(),
})

export const updateBoardSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional().nullable(),
})

export const createColumnSchema = z.object({
  board_id: z.string().uuid(),
  name: z.string().min(1).max(255),
  position: z.number().int().min(0),
})

export const updateColumnSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  position: z.number().int().min(0).optional(),
})

export const createTaskSchema = z.object({
  column_id: z.string().uuid(),
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  due_date: z.string().datetime().optional().nullable(),
  position: z.number().int().min(0),
})

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional().nullable(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  due_date: z.string().datetime().optional().nullable(),
  position: z.number().int().min(0).optional(),
})

export const moveTaskSchema = z.object({
  column_id: z.string().uuid(),
  position: z.number().int().min(0),
})

export const createLabelSchema = z.object({
  board_id: z.string().uuid(),
  name: z.string().min(1).max(255),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format').optional(),
})

export const updateLabelSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().nullable(),
})
