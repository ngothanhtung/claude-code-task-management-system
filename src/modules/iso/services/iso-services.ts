import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from "firebase/firestore"
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytesResumable,
} from "firebase/storage"

import { db, storage } from "@/lib/firebase/client"
import { isoDocumentMockData } from "./iso-mock-data"
import type { Attachment, IsoDocument } from "./types/iso-types"

const ISO_COLLECTION = "iso_documents"

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function getIsoDocuments(): Promise<IsoDocument[]> {
  const snapshot = await getDocs(collection(db, ISO_COLLECTION))

  return snapshot.docs.map((document) => {
    const data = document.data() as IsoDocument
    return {
      ...data,
      id: data.id ?? document.id,
      // Firestore Timestamp fallback → convert to ms number
      createdAt:
        typeof data.createdAt === "number"
          ? data.createdAt
          : (data.createdAt as unknown as { toMillis(): number })?.toMillis?.() ??
            Date.now(),
      updatedAt:
        typeof data.updatedAt === "number"
          ? data.updatedAt
          : (data.updatedAt as unknown as { toMillis(): number })?.toMillis?.() ??
            Date.now(),
    }
  })
}

// ─── Seed ─────────────────────────────────────────────────────────────────────

export async function seedIsoDocumentsWithClient(): Promise<IsoDocument[]> {
  const batch = writeBatch(db)

  isoDocumentMockData.forEach((doc_) => {
    batch.set(doc(db, ISO_COLLECTION, doc_.id), doc_, { merge: true })
  })

  await batch.commit()
  return getIsoDocuments()
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createIsoDocument(
  document_: IsoDocument
): Promise<IsoDocument> {
  await setDoc(doc(db, ISO_COLLECTION, document_.id), {
    ...document_,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return document_
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updateIsoDocument(
  document_: IsoDocument
): Promise<IsoDocument> {
  await updateDoc(doc(db, ISO_COLLECTION, document_.id), {
    ...document_,
    updatedAt: serverTimestamp(),
  })
  return { ...document_, updatedAt: Date.now() }
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteIsoDocument(id: string): Promise<void> {
  await deleteDoc(doc(db, ISO_COLLECTION, id))
}

// ─── File Upload ──────────────────────────────────────────────────────────────

/**
 * Uploads a file to Firebase Storage and returns Attachment metadata.
 * Progress callback receives a 0-100 number.
 */
export async function uploadIsoFile(
  file: File,
  documentId: string,
  onProgress?: (progress: number) => void
): Promise<Attachment> {
  const storageRef = ref(storage, `iso_documents/${documentId}/${file.name}`)
  const uploadTask = uploadBytesResumable(storageRef, file)

  return new Promise((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        onProgress?.(Math.round(progress))
      },
      reject,
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref)
        const sizeInBytes = file.size
        const sizeStr =
          sizeInBytes >= 1024 * 1024
            ? `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`
            : `${Math.round(sizeInBytes / 1024)} KB`

        const ext = file.name.split(".").pop()?.toLowerCase() ?? "pdf"
        const type = ext === "docx" ? "docx" : "pdf"

        resolve({
          type,
          size: sizeStr,
          fileName: file.name,
          url,
        })
      }
    )
  })
}

/**
 * Attempts to delete the old Storage file when the attachment is replaced.
 * Silently ignores errors (file may already be deleted or be a mock URL).
 */
export async function deleteIsoFile(fileUrl: string): Promise<void> {
  try {
    const fileRef = ref(storage, fileUrl)
    await deleteObject(fileRef)
  } catch {
    // no-op — mock URLs or already-deleted files
  }
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export function getIsoDocumentStats(documents: IsoDocument[]) {
  return {
    total: documents.length,
    published: documents.filter((d) => d.status === "PUBLISHED").length,
    draft: documents.filter((d) => d.status === "DRAFT").length,
  }
}
