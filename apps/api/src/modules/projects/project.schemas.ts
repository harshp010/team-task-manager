import { z } from "zod";

export const projectRoleSchema = z.enum(["ADMIN", "MEMBER"]);

export const createProjectSchema = z.object({
  name: z.string().trim().min(2, "Project name must be at least 2 characters").max(120),
  description: z.string().trim().max(500).optional().nullable()
});

export const updateProjectSchema = createProjectSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  "At least one field is required"
);

export const addMemberSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  role: projectRoleSchema.default("MEMBER")
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type AddMemberInput = z.infer<typeof addMemberSchema>;
