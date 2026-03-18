import { ref, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";

/**
 * Resolves anatomyExerciseWalkthrough to a usable GIF URL.
 * Supports full URLs (use directly) and Firebase Storage paths (resolve via getDownloadURL).
 */
export async function resolveGifUrl(value: unknown): Promise<string | null> {
  if (typeof value !== "string" || !value.trim()) return null;
  const trimmed = value.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  try {
    return await getDownloadURL(ref(storage, trimmed));
  } catch {
    return null;
  }
}
