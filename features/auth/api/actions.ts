"use server";

import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase-admin";

const FIVE_DAYS_IN_MS = 60 * 60 * 24 * 5 * 1000;

export async function createSession(token: string) {
  try {
    if (!token) throw new Error("Token required");

    // 1. Verify the token and create the session cookie
    const sessionCookie = await adminAuth.createSessionCookie(token, {
      expiresIn: FIVE_DAYS_IN_MS,
    });

    // 2. Set the cookie
    const cookieStore = await cookies();
    cookieStore.set("session", sessionCookie, {
      maxAge: FIVE_DAYS_IN_MS / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return { success: true };
  } catch (error) {
    console.error("Session creation error:", error);
    return { success: false, error: "Invalid token" };
  }
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
  return { success: true };
}
