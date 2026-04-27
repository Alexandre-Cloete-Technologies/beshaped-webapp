import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { FirebaseError } from "firebase/app";
import type { ProfileData } from "@/features/auth/types/authTypes";

export const getUserProfile = async (userId: string): Promise<ProfileData | null> => {
    if (!userId) throw new Error("No user ID provided");

    try {
        const docRef = doc(db, "users", userId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return null;
        }

        return {
            uid: docSnap.id,
            ...docSnap.data(),
        } as ProfileData;

    } catch (error) {
        const message = error instanceof FirebaseError ?
            "Firebase error occurred: " + error.message :
            "An unexpected error occurred while fetching your profile.";
        console.error("Failed to fetch user profile:", message);
        throw error;
    }
}