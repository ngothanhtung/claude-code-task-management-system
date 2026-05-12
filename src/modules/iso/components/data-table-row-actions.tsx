"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { Row } from "@tanstack/react-table"
import {
  ExternalLink,
  Loader2,
  MoreHorizontal,
  Pencil,
  Trash2,
  Upload,
} from "lucide-react"
import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
  isoDocumentSchema,
  type IsoDocument,
  type IsoDocumentFormData,
} from "@/modules/iso/services/types/iso-types"

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
  onUpdateDocument?: (document: IsoDocument) => void | Promise<void>
  onDeleteDocument?: (id: string) => void | Promise<void>
}

export function DataTableRowActions<TData>({
  row,
  onUpdateDocument,
  onDeleteDocument,
}: DataTableRowActionsProps<TData>) {
  const parsed = isoDocumentSchema.safeParse(row.original)

  const [editOpen, setEditOpen] = React.useState(false)
  const [deleteOpen, setDeleteOpen] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [uploadProgress, setUploadProgress] = React.useState<number | null>(
    null
  )
  const [pendingFile, setPendingFile] = React.useState<File | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const form = useForm<IsoDocumentFormData>({
    resolver: zodResolver(isoDocumentFormSchema),
    defaultValues: { name: "", summary: "", status: "DRAFT" },
  })

  if (!parsed.success) return null

  const document_ = parsed.data

  function openEditDialog() {
    form.reset({
      name: document_.name,
      summary: document_.summary ?? "",
      status: document_.status,
    })
    setPendingFile(null)
    setUploadProgress(null)
    setEditOpen(true)
  }

  async function handleSave(formData: IsoDocumentFormData) {
    try {
      setIsSaving(true)

      let attachment = document_.attachment

      // If user chose a new file — upload it first
      if (pendingFile) {
        attachment = await uploadIsoFile(
          pendingFile,
          document_.id,
          (p) => setUploadProgress(p)
        )
        setUploadProgress(null)
      }

      const updated: IsoDocument = {
        ...document_,
        name: formData.name,
        summary: formData.summary,
        status: formData.status,
        attachment,
        updatedAt: Date.now(),
        // updatedBy would be set to currentUser.uid in the page callback
        updatedBy: document_.updatedBy,
      }

      await onUpdateDocument?.(updated)
      toast.success("Document updated successfully")
      setEditOpen(false)
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update document"
      )
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete() {
    try {
      setIsDeleting(true)
      await onDeleteDocument?.(document_.id)
      toast.success("Document deleted successfully")
      setDeleteOpen(false)
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete document"
      )
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted cursor-pointer"
          >
            <MoreHorizontal />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[180px]">
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={openEditDialog}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Edit Document
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => window.open(document_.attachment.url, "_blank")}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            View File
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer"
            variant="destructive"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* ── Edit Dialog ───────────────────────────────────────────── */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[540px]">
          <DialogHeader>
            <DialogTitle>Edit ISO Document</DialogTitle>
            <DialogDescription>
              Update the document details. A new file upload will replace the
              existing attachment.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSave)}
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
                        <SelectTrigger className="w-full cursor-pointer">
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

              {/* Current Attachment */}
              <div className="space-y-2">
                <FormLabel>Attachment</FormLabel>
                <div className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm text-muted-foreground">
                  <span className="truncate flex-1">
                    {pendingFile
                      ? pendingFile.name
                      : document_.attachment.fileName}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="shrink-0 cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4 mr-1" />
                    Replace
                  </Button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) setPendingFile(file)
                  }}
                />
                {uploadProgress !== null && (
                  <Progress value={uploadProgress} className="h-1.5" />
                )}
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditOpen(false)}
                  disabled={isSaving}
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="cursor-pointer"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* ── Delete AlertDialog ────────────────────────────────────── */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete ISO Document?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <span className="font-semibold">{document_.name}</span> from
              Firestore. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting} className="cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
