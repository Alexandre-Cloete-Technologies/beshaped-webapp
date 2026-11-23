import "server-only";

import { adminDb } from "@/lib/firebase-admin";

/**
 * Ids of the programs assigned to or bought by the user: `users/{uid}.availablePrograms`, whose items are
 * program ids or references to program docs. Free programs are not listed there (see `canAccessProgram`).
 * A user without a `users` doc yet (it is created a few seconds after sign-up) has none.
 */
export async function getEntitledProgramIds(uid: string): Promise<Set<string>> {
  const snapshot = await adminDb.collection("users").doc(uid).get();
  const available: unknown = snapshot.data()?.availablePrograms;
  const ids = new Set<string>();
  if (!Array.isArray(available)) return ids;

  for (const item of available) {
    const id = typeof item === "string" ? item : (item as { id?: unknown } | null)?.id;
    if (typeof id === "string" && id) ids.add(id);
  }
  return ids;
}

/** Same rule as the mobile app: free programs, plus the user's `availablePrograms`. */
export function canAccessProgram(
  program: { id: string; accessType?: string | null },
  entitledIds: Set<string>
): boolean {
  return program.accessType === "free" || entitledIds.has(program.id);
}
