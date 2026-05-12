"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Plus, Upload, X } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

import { uploadIsoFile } from "@/modules/iso/services/iso-services"
import { isoStatuses } from "@/modules/iso/services/iso-mock-data"
import {
  isoDocumentFormSchema,
  type IsoDocument,
  type IsoDocumentFormData,
} from "@/modules/iso/services/types/iso-types"

interface AddIsoDocumentModalProps {
  onAddDocument?: (document: IsoDocument) => void | Promise<void>
  currentUserId?: string
}

export function AddIsoDocumentModal({
  onAddDocument,
  currentUserId = "anonymous",
}: AddIsoDocumentModalProps) {
  const [open, setOpen] = React.useState(false)
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
  const [fileError, setFileError] = React.useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = React.useState<number | null>(
    null
  )
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const form = useForm<IsoDocumentFormData>({
    resolver: zodResolver(isoDocumentFormSchema),
    defaultValues: { name: "", summary: "", status: "DRAFT" },
  })

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setSelectedFile(file)
    setFileError(null)
  }

  function clearFile() {
    setSelectedFile(null)
    setFileError(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  function resetAndClose() {
    form.reset()
    clearFile()
    setUploadProgress(null)
    setOpen(false)
  }

  async function handleSubmit(formData: IsoDocumentFormData) {
    // Validate file
    if (!selectedFile) {
      setFileError("An attachment is required")
      return
    }

    try {
      setIsSubmitting(true)
      const documentId = `ISO-${Date.now()}`
      const now = Date.now()

      // 1. Upload file to Firebase Storage
      const attachment = await uploadIsoFile(
        selectedFile,
        documentId,
        (p) => setUploadProgress(p)
      )
      setUploadProgress(null)

      // 2. Build the full document object
      const newDocument: IsoDocument = {
        id: documentId,
        name: formData.name,
        summary: formData.summary,
        status: formData.status,
        attachment,
        createdBy: currentUserId,
        createdAt: now,
        updatedBy: currentUserId,
        updatedAt: now,
      }

      // 3. Persist to Firestore via page callback
      await onAddDocument?.(newDocument)

      toast.success("Document created successfully")
      resetAndClose()
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create document"
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) resetAndClose(); else setOpen(true) }}>
      <DialogTrigger asChild>
        <Button type="button" variant="default" size="sm" className="cursor-pointer">
          <Plus className="w-4 h-4" />
          Add Document
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[540px]">
        <DialogHeader>
          <DialogTitle>Add ISO Document</DialogTitle>
          <DialogDescription>
            Upload a new ISO form or document. Provide a name and attach the
            file (PDF or DOCX).
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-5"
          >
            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Document Name *</FormLabel>
                  <FormControl>
                    <Input
                      id="iso-doc-name"
                      placeholder="Enter document name..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Summary */}
            <FormField
              control={form.control}
              name="summary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Summary</FormLabel>
                  <FormControl>
                    <Textarea
                      id="iso-doc-summary"
                      placeholder="Short description of the document..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Status */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger
                        id="iso-doc-status"
                        className="w-full cursor-pointer"
                      >
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isoStatuses.map((s) => (
                        <SelectItem
                          key={s.value}
                          value={s.value}
                          className="cursor-pointer"
                        >
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* File Attachment */}
            <div className="space-y-2">
              <FormLabel>
                Attachment *
              </FormLabel>
              {selectedFile ? (
                <div className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
                  <span className="flex-1 truncate text-foreground">
                    {selectedFile.name}
                  </span>
                  <span className="text-muted-foreground text-xs shrink-0">
                    {selectedFile.size >= 1024 * 1024
                      ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`
                      : `${Math.round(selectedFile.size / 1024)} KB`}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 cursor-pointer"
                    onClick={clearFile}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div
                  className="flex flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed px-4 py-6 text-sm text-muted-foreground cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-6 w-6" />
                  <span>Click to upload PDF or DOCX</span>
                </div>
              )}
              <input
                ref={fileInputRef}
                id="iso-doc-file"
                type="file"
                accept=".pdf,.docx"
                className="hidden"
                onChange={handleFileChange}
              />
              {fileError && (
                <p className="text-sm text-destructive">{fileError}</p>
              )}
              {uploadProgress !== null && (
                <Progress value={uploadProgress} className="h-1.5" />
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={resetAndClose}
                disabled={isSubmitting}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {uploadProgress !== null
                      ? `Uploading ${uploadProgress}%`
                      : "Creating..."}
                  </>
                ) : (
                  <>
                    <Plus className="mr-1 h-4 w-4" />
                    Create Document
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
