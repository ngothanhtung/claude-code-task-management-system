"use client"

import type { Table } from "@tanstack/react-table"
import { Database, RefreshCcw, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { isoStatuses } from "@/modules/iso/services/iso-mock-data"
import type { IsoDocument } from "@/modules/iso/services/types/iso-types"
import { AddIsoDocumentModal } from "./add-iso-document-modal"
import { DataTableViewOptions } from "./data-table-view-options"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  onAddDocument?: (document: IsoDocument) => void | Promise<void>
  onSeedDocuments?: () => void | Promise<void>
  isSeeding?: boolean
  currentUserId?: string
}

export function DataTableToolbar<TData>({
  table,
  onAddDocument,
  onSeedDocuments,
  isSeeding,
  currentUserId,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  const statusFilter = table.getColumn("status")?.getFilterValue() as
    | string
    | undefined

  const handleStatusChange = (value: string) => {
    const col = table.getColumn("status")
    if (value === "all") {
      col?.setFilterValue(undefined)
    } else {
      col?.setFilterValue(value)
    }
  }

  return (
    <div className="space-y-3">
      {/* Row 1: Search + Status filter */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            id="iso-search-input"
            placeholder="Search documents..."
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(e) =>
              table.getColumn("name")?.setFilterValue(e.target.value)
            }
            className="pl-9 w-full md:w-[300px]"
          />
        </div>

        {/* Status filter */}
        <Select
          value={statusFilter ?? "all"}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger
            id="iso-status-filter"
            className="w-full md:w-[180px] cursor-pointer"
          >
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="cursor-pointer">
              All Statuses
            </SelectItem>
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

        {/* Reset */}
        {isFiltered && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => table.resetColumnFilters()}
            className="cursor-pointer"
          >
            <RefreshCcw className="h-4 w-4" />
            Reset
          </Button>
        )}
      </div>

      {/* Row 2: Right-side actions */}
      <div className="flex items-center justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          className="cursor-pointer"
          onClick={onSeedDocuments}
          disabled={!onSeedDocuments || isSeeding}
        >
          <Database className="h-4 w-4" />
          <span className="hidden lg:block">
            {isSeeding ? "Seeding..." : "Seed Data"}
          </span>
        </Button>

        <DataTableViewOptions table={table} />

        <AddIsoDocumentModal
          onAddDocument={onAddDocument}
          currentUserId={currentUserId}
        />
      </div>
    </div>
  )
}
