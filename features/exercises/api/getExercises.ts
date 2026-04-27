
import { db } from "@/lib/firebase";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { Exercise } from "../types/exerciseTypes";

export const getAllExercises = async (): Promise<Exercise[]> => {
    try {
            const colRef = collection(db, "exercises");
            const snapshots = await getDocs(colRef);
            return snapshots.docs.map(doc => ({ ...doc.data(), id: doc.id, createdAt: doc.data().createdAt.toDate().toISOString(), updatedAt: doc.data().updatedAt?.toDate().toISOString() })) as Exercise[];
    } catch {
        throw new Error("Failed to fetch exercises.");
    }
};

export const getExerciseById = async (programId: string): Promise<Exercise> => {
    try {
        const docRef = doc(db, "exercises", programId);
        const docSnap = await getDoc(docRef);

        if(!docSnap.exists()){
            throw new Error("Program not found");
        }

        return { ...docSnap.data(), updatedAt: docSnap.data().updatedAt.toDate().toISOString() } as Exercise;
    } catch {
        throw new Error("Failed to fetch exercise.");
    }
};
