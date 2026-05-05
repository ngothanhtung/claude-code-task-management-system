import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  writeBatch,
} from "firebase/firestore"

import { db } from "@/lib/firebase/client"
import { projectMockData } from "./project-mock-data"
import type { Project } from "./types/project-types"

const PROJECTS_COLLECTION = "projects"

export async function getProjects(): Promise<Project[]> {
  try {
    const snapshot = await getDocs(collection(db, PROJECTS_COLLECTION))

    if (snapshot.empty) {
      return projectMockData
    }

    return snapshot.docs.map((document) => {
      const data = document.data() as Project
      return {
        ...data,
        id: data.id ?? document.id,
      }
    })
  } catch (error) {
    console.warn(
      "Failed to load projects from Firestore. Falling back to mock data.",
      error
    )
    return projectMockData
  }
}

export async function seedProjectsWithClient(): Promise<Project[]> {
  const batch = writeBatch(db)

  projectMockData.forEach((project) => {
    batch.set(
      doc(db, PROJECTS_COLLECTION, project.id),
      project,
      { merge: true }
    )
  })

  await batch.commit()
  return getProjects()
}

export async function createProject(project: Project): Promise<Project> {
  await setDoc(doc(db, PROJECTS_COLLECTION, project.id), project)
  return project
}

export async function updateProject(project: Project): Promise<Project> {
  const updated = {
    ...project,
    updatedAt: new Date().toISOString(),
  }
  await updateDoc(doc(db, PROJECTS_COLLECTION, project.id), updated)
  return updated
}

export async function deleteProject(projectId: string): Promise<void> {
  await deleteDoc(doc(db, PROJECTS_COLLECTION, projectId))
}
