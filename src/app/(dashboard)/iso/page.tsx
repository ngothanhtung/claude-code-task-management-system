"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { onAuthStateChanged } from "firebase/auth"
import { ArrowUp, FileCheck2, Files, FileX2 } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { auth } from "@/lib/firebase/client"

import { getIsoColumns } from "@/modules/iso/components/columns"
import { DataTable } from "@/modules/iso/components/data-table"
import {
  createIsoDocument,
  deleteIsoDocument,
  getIsoDocumentStats,
  getIsoDocuments,
  seedIsoDocumentsWithClient,
  updateIsoDocument,
} from "@/modules/iso/services/iso-services"
import type { IsoDocument } from "@/modules/iso/services/types/iso-types"

export default function IsoPage() {
  const [documents, setDocuments] = useState<IsoDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [isSeeding, setIsSeeding] = useState(false)
  const [currentUserId, setCurrentUserId] = useState("anonymous")

  // Track authenticated user
  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      if (user) setCurrentUserId(user.uid)
    })
  }, [])

  const refreshDocuments = useCallback(async () => {
    const docs = await getIsoDocuments()
    setDocuments(docs)
  }, [])

  useEffect(() => {
    const load = async () => {
      try {
        await refreshDocuments()
      } catch (error) {
        console.error("Failed to load ISO documents:", error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [refreshDocuments])

  // ── CRUD handlers ────────────────────────────────────────────────────────────

  const handleAddDocument = useCallback(
    async (newDoc: IsoDocument) => {
      const docWithUser: IsoDocument = {
        ...newDoc,
        createdBy: currentUserId,
        updatedBy: currentUserId,
      }
      await createIsoDocument(docWithUser)
      await refreshDocuments()
    },
    [currentUserId, refreshDocuments]
  )

  const handleUpdateDocument = useCallback(
    async (updated: IsoDocument) => {
      const docWithUser: IsoDocument = {
        ...updated,
        updatedBy: currentUserId,
        updatedAt: Date.now(),
      }
      await updateIsoDocument(docWithUser)
      setDocuments((prev) =>
        prev.map((d) => (d.id === docWithUser.id ? docWithUser : d))
      )
    },
    [currentUserId]
  )

  const handleDeleteDocument = useCallback(async (id: string) => {
    await deleteIsoDocument(id)
    setDocuments((prev) => prev.filter((d) => d.id !== id))
  }, [])

  const handleSeedDocuments = useCallback(async () => {
    try {
      setIsSeeding(true)
      const seeded = await seedIsoDocumentsWithClient()
      setDocuments(seeded)
    } catch (error) {
      console.error("Failed to seed ISO documents:", error)
    } finally {
      setIsSeeding(false)
    }
  }, [])

  // ── Column factory ───────────────────────────────────────────────────────────

  const isoColumns = useMemo(
    () =>
      getIsoColumns({
        onUpdateDocument: handleUpdateDocument,
        onDeleteDocument: handleDeleteDocument,
      }),
    [handleUpdateDocument, handleDeleteDocument]
  )

  // ── Stats ────────────────────────────────────────────────────────────────────

  const stats = getIsoDocumentStats(documents)

  // ── Loading skeleton ─────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex flex-col gap-6 px-4 md:px-6">
        {/* Header skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>

        {/* Stat cards skeleton */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>

        {/* Table skeleton */}
        <Skeleton className="h-96 rounded-xl" />
      </div>
    )
  }

  return (
    <>
      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2 px-4 md:px-6">
        <h1 className="text-2xl font-bold tracking-tight">
          ISO Document Management
        </h1>
        <p className="text-muted-foreground">
          Manage company ISO forms, procedures, and quality documents.
        </p>
      </div>

      {/* ── Stats Cards ─────────────────────────────────────────────────────── */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3 px-4 md:px-6">
        {/* Total */}
        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Total Documents
                </p>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-2xl font-bold">{stats.total}</span>
                </div>
              </div>
              <div className="bg-secondary rounded-lg p-3">
                <Files className="size-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Published */}
        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Published
                </p>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-2xl font-bold">{stats.published}</span>
                  {stats.total > 0 && (
                    <span className="flex items-center gap-0.5 text-sm text-green-500">
                      <ArrowUp className="size-3.5" />
                      {Math.round((stats.published / stats.total) * 100)}%
                    </span>
                  )}
                </div>
              </div>
              <div className="bg-secondary rounded-lg p-3">
                <FileCheck2 className="size-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Drafts */}
        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Drafts
                </p>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-2xl font-bold">{stats.draft}</span>
                  {stats.total > 0 && (
                    <span className="flex items-center gap-0.5 text-sm text-amber-500">
                      <ArrowUp className="size-3.5" />
                      {Math.round((stats.draft / stats.total) * 100)}%
                    </span>
                  )}
                </div>
              </div>
              <div className="bg-secondary rounded-lg p-3">
                <FileX2 className="size-6 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Data Table ──────────────────────────────────────────────────────── */}
      <div className="px-4 md:px-6">
        <Card>
          <CardHeader>
            <CardTitle>ISO Documents</CardTitle>
            <CardDescription>
              View, filter, and manage all ISO forms and documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={documents}
              columns={isoColumns}
              onAddDocument={handleAddDocument}
              onSeedDocuments={handleSeedDocuments}
              isSeeding={isSeeding}
              currentUserId={currentUserId}
            />
          </CardContent>
        </Card>
      </div>
    </>
  )
}
