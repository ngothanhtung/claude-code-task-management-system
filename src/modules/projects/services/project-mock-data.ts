import { projectSchema } from "./types/project-types"

const projectsData = [
  {
    id: "PROJECT-1001",
    title: "Website Redesign Initiative",
    startDate: "2026-01-15",
    dueDate: "2026-03-30",
    priority: "high",
    createdAt: "2026-01-10T08:00:00Z",
    updatedAt: "2026-01-10T08:00:00Z",
  },
  {
    id: "PROJECT-1002",
    title: "Mobile App Launch",
    startDate: "2026-02-01",
    dueDate: "2026-04-15",
    priority: "critical",
    createdAt: "2026-01-28T09:30:00Z",
    updatedAt: "2026-01-28T09:30:00Z",
  },
  {
    id: "PROJECT-1003",
    title: "Q2 Marketing Campaign",
    startDate: "2026-03-01",
    dueDate: "2026-05-31",
    priority: "medium",
    createdAt: "2026-02-20T10:00:00Z",
    updatedAt: "2026-02-20T10:00:00Z",
  },
  {
    id: "PROJECT-1004",
    title: "API Migration Project",
    startDate: "2026-01-01",
    dueDate: "2026-02-28",
    priority: "high",
    createdAt: "2025-12-15T07:45:00Z",
    updatedAt: "2026-01-05T14:20:00Z",
  },
  {
    id: "PROJECT-1005",
    title: "Customer Support Portal",
    startDate: "2026-04-01",
    dueDate: "2026-06-30",
    priority: "low",
    createdAt: "2026-03-15T11:00:00Z",
    updatedAt: "2026-03-15T11:00:00Z",
  },
]

export const projectMockData = projectSchema.array().parse(projectsData)

export const projectPriorities = [
  { value: "critical", label: "Critical", color: "text-red-600 dark:text-red-400" },
  { value: "high", label: "High", color: "text-orange-600 dark:text-orange-400" },
  { value: "medium", label: "Medium", color: "text-blue-600 dark:text-blue-400" },
  { value: "low", label: "Low", color: "text-muted-foreground" },
] as const
