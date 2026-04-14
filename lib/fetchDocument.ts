import { doc, getDoc, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';

/**
 * Generic function to fetch a Firestore document
 * @param collection - The Firestore collection name
 * @param documentId - The document ID to fetch
 * @returns The document data typed as T, or null if not found
 * @throws Error if fetch fails
 */
export async function fetchDocument<T extends DocumentData>(
  collection: string,
  documentId: string
): Promise<T | null> {
  const docRef = doc(db, collection, documentId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  return docSnap.data() as T;
}

/**
 * Generic function to fetch a Firestore document with ID included
 * @param collection - The Firestore collection name
 * @param documentId - The document ID to fetch
 * @returns The document data with id field, or null if not found
 */
export async function fetchDocumentWithId<T extends DocumentData>(
  collection: string,
  documentId: string
): Promise<(T & { id: string }) | null> {
  const docRef = doc(db, collection, documentId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  return {
    id: docSnap.id,
    ...docSnap.data(),
  } as T & { id: string };
}