import { adminAuth } from "@/lib/firebase-admin";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

async function getServerAuth() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  

  if (!session) {
    return null;
  }

  try {
    const decodedClaims = await adminAuth.verifySessionCookie(session, true);
    return decodedClaims;
  } catch {
    return null;
  }
}

export async function requireAuth() {
  const auth = await getServerAuth();
  
  if (!auth) {
    redirect("/login");
  }
  
  return auth;
}