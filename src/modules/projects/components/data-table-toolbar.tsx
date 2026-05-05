"use client"

import type { Table } from "@tanstack/react-table"
import { Database, RefreshCcw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTableViewOptions } from "./data-table-view-options"
import { AddProjectModal } from "./add-project-modal"
import type { ProjectFormValues } from "@/modules/projects/services/types/project-types"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  onAddProject?: (formValues: ProjectFormValues) => void
  onSeedProjects?: () => void | Promise<void>
  isSeedingProjects?: boolean
}

export function DataTableToolbar<TData>({
  table,
  onAddProject,
  onSeedProjects,
  isSeedingProjects,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <Input
            placeholder="Search by title..."
            value={
              (table.getColumn("title")?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table.getColumn("title")?.setFilterValue(event.target.value)
            }
            className="w-[200px] lg:w-[300px] cursor-text"
          />
          {isFiltered && (
            <Button
              variant="outline"
              onClick={() => table.resetColumnFilters()}
              className="px-3 cursor-pointer"
            >
              <RefreshCcw className="h-4 w-4" />
              <span className="hidden lg:block">Reset Filters</span>
            </Button>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer"
            onClick={onSeedProjects}
            disabled={!onSeedProjects || isSeedingProjects}
          >
            <Database className="h-4 w-4" />
            <span className="hidden lg:block">
              {isSeedingProjects ? "Seeding..." : "Seed Data"}
            </span>
          </Button>
          <DataTableViewOptions table={table} />
          <AddProjectModal onAddProject={onAddProject} />
        </div>
      </div>
    </div>
  )
}
