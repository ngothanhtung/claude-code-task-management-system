"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getProjectColumns } from "@/modules/projects/components/columns"
import { DataTable } from "@/modules/projects/components/data-table"
import {
  createProject,
  deleteProject,
  getProjects,
  seedProjectsWithClient,
  updateProject,
} from "@/modules/projects/services/project-services"
import type {
  Project,
  ProjectFormValues,
} from "@/modules/projects/services/types/project-types"

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [isSeedingProjects, setIsSeedingProjects] = useState(false)

  const refreshProjects = useCallback(async () => {
    const list = await getProjects()
    setProjects(list)
  }, [])

  useEffect(() => {
    const loadProjects = async () => {
      try {
        await refreshProjects()
      } catch (error) {
        console.error("Failed to load projects:", error)
      } finally {
        setLoading(false)
      }
    }
    loadProjects()
  }, [refreshProjects])

  const handleAddProject = useCallback(
    async (formValues: ProjectFormValues) => {
      const now = new Date().toISOString()
      const newProject: Project = {
        id: `PROJECT-${Date.now()}`,
        title: formValues.title.trim(),
        startDate: formValues.startDate || undefined,
        dueDate: formValues.dueDate || undefined,
        priority: formValues.priority ?? "medium",
        createdAt: now,
        updatedAt: now,
      }
      await createProject(newProject)
      await refreshProjects()
    },
    [refreshProjects]
  )

  const handleUpdateProject = useCallback(async (project: Project) => {
    const updated = await updateProject(project)
    setProjects((prev) =>
      prev.map((p) => (p.id === updated.id ? updated : p))
    )
  }, [])

  const handleDeleteProject = useCallback(async (projectId: string) => {
    await deleteProject(projectId)
    setProjects((prev) => prev.filter((p) => p.id !== projectId))
  }, [])

  const handleSeedProjects = useCallback(async () => {
    try {
      setIsSeedingProjects(true)
      const seeded = await seedProjectsWithClient()
      setProjects(seeded)
    } catch (error) {
      console.error("Failed to seed projects:", error)
    } finally {
      setIsSeedingProjects(false)
    }
  }, [])

  const projectColumns = useMemo(
    () =>
      getProjectColumns({
        onUpdateProject: handleUpdateProject,
        onDeleteProject: handleDeleteProject,
      }),
    [handleDeleteProject, handleUpdateProject]
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Loading projects...</div>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col gap-2 px-4 md:px-6">
        <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
        <p className="text-muted-foreground">
          Manage and track all your projects in one place.
        </p>
      </div>

      <div className="h-full flex-1 flex-col space-y-6 px-4 md:px-6">
        <Card>
          <CardHeader>
            <CardTitle>Project Management</CardTitle>
            <CardDescription>
              View, filter, and manage all your projects.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={projects}
              columns={projectColumns}
              onAddProject={handleAddProject}
              onSeedProjects={handleSeedProjects}
              isSeedingProjects={isSeedingProjects}
            />
          </CardContent>
        </Card>
      </div>
    </>
  )
}
