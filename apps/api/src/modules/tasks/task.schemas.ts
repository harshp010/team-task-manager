import { z } from "zod";

export const taskPrioritySchema = z.enum(["LOW", "MEDIUM", "HIGH"]);
export const taskStatusSchema = z.enum(["TODO", "IN_PROGRESS", "DONE"]);

export const createTaskSchema = z.object({
  title: z.string().trim().min(2, "Task title must be at least 2 characters").max(160),
  description: z.string().trim().max(1000).optional().nullable(),
  dueDate: z.string().datetime().optional().nullable(),
  priority: taskPrioritySchema.default("MEDIUM"),
  status: taskStatusSchema.default("TODO"),
  assigneeId: z.string().cuid().optional().nullable()
});

export const updateTaskSchema = z
  .object({
    title: z.string().trim().min(2).max(160).optional(),
    description: z.string().trim().max(1000).optional().nullable(),
    dueDate: z.string().datetime().optional().nullable(),
    priority: taskPrioritySchema.optional(),
    status: taskStatusSchema.optional(),
    assigneeId: z.string().cuid().optional().nullable()
  })
  .refine((data) => Object.keys(data).length > 0, "At least one field is required");

export const taskFilterSchema = z.object({
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
  assigneeId: z.string().cuid().optional()
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type TaskFilterInput = z.infer<typeof taskFilterSchema>;
