import { z } from "zod"

export const projectPriorityValues = [
  "low",
  "medium",
  "high",
  "critical",
] as const

export const projectSchema = z.object({
  id: z.string(),
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be 100 characters or fewer"),
  startDate: z.string().optional(),
  dueDate: z.string().optional(),
  priority: z.enum(projectPriorityValues),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type Project = z.infer<typeof projectSchema>

export const projectFormSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be 100 characters or fewer"),
  startDate: z.string().optional(),
  dueDate: z.string().optional(),
  priority: z.enum(projectPriorityValues),
})

export type ProjectFormValues = z.infer<typeof projectFormSchema>

export type ProjectPriority = (typeof projectPriorityValues)[number]
