"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { FileText, FileType } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

import type { IsoDocument } from "@/modules/iso/services/types/iso-types"
import { DataTableColumnHeader } from "./data-table-column-header"
import { DataTableRowActions } from "./data-table-row-actions"

interface IsoColumnActions {
  onUpdateDocument?: (document: IsoDocument) => void | Promise<void>
  onDeleteDocument?: (id: string) => void | Promise<void>
}

export function getIsoColumns({
  onUpdateDocument,
  onDeleteDocument,
}: IsoColumnActions = {}): ColumnDef<IsoDocument>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-[2px] cursor-pointer"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-[2px] cursor-pointer"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2 max-w-[320px]">
          <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="truncate font-medium">{row.getValue("name")}</span>
        </div>
      ),
      enableHiding: false,
    },
    {
      accessorKey: "summary",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Summary" />
      ),
      cell: ({ row }) => {
        const summary = row.getValue("summary") as string | undefined
        return (
          <div className="max-w-[280px] truncate text-muted-foreground text-sm">
            {summary || <span className="italic text-muted-foreground/50">—</span>}
          </div>
        )
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        const isPublished = status === "PUBLISHED"
        return (
          <Badge
            variant="outline"
            className={cn(
              "font-medium",
              isPublished
                ? "border-green-500 text-green-700 dark:text-green-400"
                : "border-amber-500 text-amber-700 dark:text-amber-400"
            )}
          >
            {isPublished ? "Published" : "Draft"}
          </Badge>
        )
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    {
      accessorKey: "attachment",
      header: "Attachment",
      cell: ({ row }) => {
        const attachment = row.original.attachment
        const isPdf = attachment.type === "pdf"
        return (
          <a
            href={attachment.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            <FileType className="h-4 w-4 shrink-0" />
            <span className="max-w-[160px] truncate">{attachment.fileName}</span>
            <span className="text-muted-foreground text-xs shrink-0">
              ({isPdf ? "PDF" : "DOCX"} · {attachment.size})
            </span>
          </a>
        )
      },
      enableSorting: false,
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created At" />
      ),
      cell: ({ row }) => {
        const ts = row.getValue("createdAt") as number
        return (
          <div className="text-sm text-muted-foreground whitespace-nowrap">
            {format(new Date(ts), "dd MMM yyyy")}
          </div>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DataTableRowActions
          row={row}
          onUpdateDocument={onUpdateDocument}
          onDeleteDocument={onDeleteDocument}
        />
      ),
    },
  ]
}

export const columns = getIsoColumns()
