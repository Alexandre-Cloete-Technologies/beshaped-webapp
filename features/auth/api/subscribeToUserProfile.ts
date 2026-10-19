import { doc, onSnapshot, type Unsubscribe } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { ProfileData } from "@/features/auth/types/authTypes";

// A listener rather than a one-off read: the users/{uid} doc is created on the server a few seconds after sign-up,
// so the profile fills in when it appears. onChange gets null while the doc doesn't exist.
export const subscribeToUserProfile = (
    userId: string,
    onChange: (profile: ProfileData | null) => void,
    onError: (error: Error) => void,
): Unsubscribe => {
    if (!userId) throw new Error("No user ID provided");

    return onSnapshot(
        doc(db, "users", userId),
        (docSnap) => {
            onChange(docSnap.exists() ? ({ uid: docSnap.id, ...docSnap.data() } as ProfileData) : null);
        },
        (error) => {
            console.error("Failed to load user profile:", error.message);
            onError(error);
        },
    );
};
