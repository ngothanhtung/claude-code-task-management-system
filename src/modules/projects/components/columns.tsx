"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"

import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { DataTableColumnHeader } from "@/modules/tasks/components/data-table-column-header"
import type { Project } from "@/modules/projects/services/types/project-types"
import { projectPriorities } from "@/modules/projects/services/project-mock-data"
import { DataTableRowActions } from "./data-table-row-actions"

interface ProjectColumnActions {
  onUpdateProject?: (project: Project) => void | Promise<void>
  onDeleteProject?: (projectId: string) => void | Promise<void>
}

const priorityColors: Record<string, string> = {
  critical: "border-red-500 text-red-600 dark:text-red-400",
  high: "border-orange-500 text-orange-600 dark:text-orange-400",
  medium: "border-blue-500 text-blue-600 dark:text-blue-400",
  low: "border-muted text-muted-foreground",
}

export function getProjectColumns({
  onUpdateProject,
  onDeleteProject,
}: ProjectColumnActions = {}): ColumnDef<Project>[] {
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
      accessorKey: "id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Project ID" />
      ),
      cell: ({ row }) => (
        <div className="w-[120px] font-mono text-xs">
          {row.getValue("id")}
        </div>
      ),
      enableHiding: false,
    },
    {
      accessorKey: "title",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Title" />
      ),
      cell: ({ row }) => (
        <div className="max-w-[300px] truncate font-medium">
          {row.getValue("title")}
        </div>
      ),
    },
    {
      accessorKey: "priority",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Priority" />
      ),
      cell: ({ row }) => {
        const priority = row.getValue("priority") as string
        const found = projectPriorities.find((p) => p.value === priority)
        return (
          <Badge
            variant="outline"
            className={cn(
              "font-medium capitalize",
              priorityColors[priority] ?? ""
            )}
          >
            {found?.label ?? priority}
          </Badge>
        )
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    {
      accessorKey: "startDate",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Start Date" />
      ),
      cell: ({ row }) => {
        const value = row.getValue("startDate") as string | undefined
        if (!value) return <span className="text-muted-foreground">--</span>
        return (
          <span className="text-sm">
            {format(new Date(value), "MMM d, yyyy")}
          </span>
        )
      },
      sortingFn: (rowA, rowB) => {
        const a = (rowA.getValue("startDate") as string) || ""
        const b = (rowB.getValue("startDate") as string) || ""
        return a.localeCompare(b)
      },
    },
    {
      accessorKey: "dueDate",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Due Date" />
      ),
      cell: ({ row }) => {
        const value = row.getValue("dueDate") as string | undefined
        if (!value) return <span className="text-muted-foreground">--</span>
        const date = new Date(value)
        const isOverdue = date < new Date()
        return (
          <Badge
            variant="outline"
            className={
              isOverdue
                ? "border-red-500 text-red-600 dark:text-red-400"
                : ""
            }
          >
            {format(date, "MMM d, yyyy")}
          </Badge>
        )
      },
      sortingFn: (rowA, rowB) => {
        const a = (rowA.getValue("dueDate") as string) || ""
        const b = (rowB.getValue("dueDate") as string) || ""
        return a.localeCompare(b)
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created" />
      ),
      cell: ({ row }) => {
        const value = row.getValue("createdAt") as string
        return (
          <span className="text-sm text-muted-foreground">
            {format(new Date(value), "MMM d, yyyy")}
          </span>
        )
      },
      enableHiding: true,
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DataTableRowActions
          row={row}
          onUpdateProject={onUpdateProject}
          onDeleteProject={onDeleteProject}
        />
      ),
    },
  ]
}

export const columns = getProjectColumns()
