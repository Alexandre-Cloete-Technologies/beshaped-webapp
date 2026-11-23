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

/**
 * The verified session of the signed-in user; redirects to the login page when there is none. Every protected
 * page calls this: the middleware only checks that a cookie is present.
 */
export async function requireAuth() {
  const auth = await getServerAuth();

  if (!auth) {
    // A cookie that is present but expired or revoked can't be deleted from a page render, and the middleware
    // sends any request with a cookie away from /login. `session=expired` tells it to clear the cookie first.
    redirect("/login?session=expired");
  }
  
  return auth;
}