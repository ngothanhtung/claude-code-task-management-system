import { isoDocumentSchema } from "./types/iso-types"

const now = Date.now()

const rawData = [
  {
    id: "ISO-1001",
    name: "ISO 9001 Quality Management Procedure",
    summary: "Standard operating procedure for quality control processes",
    status: "PUBLISHED",
    attachment: {
      type: "pdf",
      size: "2.4 MB",
      fileName: "ISO-9001-QM-Procedure.pdf",
      url: "https://example.com/files/ISO-9001-QM-Procedure.pdf",
    },
    createdBy: "user-001",
    createdAt: now - 30 * 24 * 60 * 60 * 1000,
    updatedBy: "user-001",
    updatedAt: now - 5 * 24 * 60 * 60 * 1000,
  },
  {
    id: "ISO-1002",
    name: "ISO 14001 Environmental Management Form",
    summary: "Form for tracking environmental compliance and audits",
    status: "DRAFT",
    attachment: {
      type: "docx",
      size: "856 KB",
      fileName: "ISO-14001-Env-Form.docx",
      url: "https://example.com/files/ISO-14001-Env-Form.docx",
    },
    createdBy: "user-002",
    createdAt: now - 15 * 24 * 60 * 60 * 1000,
    updatedBy: "user-002",
    updatedAt: now - 2 * 24 * 60 * 60 * 1000,
  },
  {
    id: "ISO-1003",
    name: "ISO 45001 Health & Safety Risk Assessment",
    summary: "Risk assessment template for workplace health and safety",
    status: "PUBLISHED",
    attachment: {
      type: "pdf",
      size: "1.1 MB",
      fileName: "ISO-45001-Risk-Assessment.pdf",
      url: "https://example.com/files/ISO-45001-Risk-Assessment.pdf",
    },
    createdBy: "user-001",
    createdAt: now - 60 * 24 * 60 * 60 * 1000,
    updatedBy: "user-003",
    updatedAt: now - 10 * 24 * 60 * 60 * 1000,
  },
  {
    id: "ISO-1004",
    name: "ISO 27001 Information Security Policy",
    summary: "Company-wide information security policy document",
    status: "DRAFT",
    attachment: {
      type: "docx",
      size: "1.8 MB",
      fileName: "ISO-27001-InfoSec-Policy.docx",
      url: "https://example.com/files/ISO-27001-InfoSec-Policy.docx",
    },
    createdBy: "user-003",
    createdAt: now - 7 * 24 * 60 * 60 * 1000,
    updatedBy: "user-003",
    updatedAt: now - 1 * 24 * 60 * 60 * 1000,
  },
  {
    id: "ISO-1005",
    name: "ISO 22000 Food Safety Management Checklist",
    summary: "Checklist for food safety management system compliance",
    status: "PUBLISHED",
    attachment: {
      type: "pdf",
      size: "3.2 MB",
      fileName: "ISO-22000-Food-Safety-Checklist.pdf",
      url: "https://example.com/files/ISO-22000-Food-Safety-Checklist.pdf",
    },
    createdBy: "user-002",
    createdAt: now - 90 * 24 * 60 * 60 * 1000,
    updatedBy: "user-001",
    updatedAt: now - 20 * 24 * 60 * 60 * 1000,
  },
]

export const isoDocumentMockData = isoDocumentSchema.array().parse(rawData)

export const isoStatuses = [
  { value: "DRAFT", label: "Draft" },
  { value: "PUBLISHED", label: "Published" },
]
