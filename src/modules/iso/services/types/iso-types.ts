import { z } from "zod"

export const isoDocumentStatusEnum = z.enum(["DRAFT", "PUBLISHED"])
export type IsoDocumentStatus = z.infer<typeof isoDocumentStatusEnum>

export const attachmentSchema = z.object({
  type: z.string(), // "pdf" | "docx"
  size: z.string(), // e.g. "1.2 MB"
  fileName: z.string(),
  url: z.string(),
})

export type Attachment = z.infer<typeof attachmentSchema>

export const isoDocumentSchema = z.object({
  id: z.string(),
  name: z.string(),
  summary: z.string().optional(),
  status: isoDocumentStatusEnum,
  attachment: attachmentSchema,
  createdBy: z.string(),
  createdAt: z.number(), // Unix timestamp (ms)
  updatedBy: z.string(),
  updatedAt: z.number(), // Unix timestamp (ms)
})

export type IsoDocument = z.infer<typeof isoDocumentSchema>

// Form schema for create/edit (without auto-generated fields)
export const isoDocumentFormSchema = z.object({
  name: z.string().min(1, "Document name is required"),
  summary: z.string().optional(),
  status: isoDocumentStatusEnum,
})

export type IsoDocumentFormData = z.infer<typeof isoDocumentFormSchema>
