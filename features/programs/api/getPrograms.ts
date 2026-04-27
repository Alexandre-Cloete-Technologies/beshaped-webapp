"server-only";

import { db } from "@/lib/firebase";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { Program, ProgramListItem } from "../types/programTypes";

export const getAllPrograms = async (): Promise<ProgramListItem[]> => {
    try {
            const colRef = collection(db, "programs");
            const snapshots = await getDocs(colRef);
            return snapshots.docs.map(doc => ({ ...doc.data(), id: doc.id, createdAt: doc.data().createdAt.toDate().toISOString() })) as ProgramListItem[];
    } catch (error) {
        throw new Error("Failed to fetch programs. " + error);
    }
};

export const getProgramById = async (programId: string): Promise<Program> => {
    try {
        const docRef = doc(db, "programs", programId);
        const snapshots = await getDoc(docRef);

        if(!snapshots.exists()){
            throw new Error("Program not found");
        }

        return { ...snapshots.data(), createdAt: snapshots.data().createdAt.toDate().toISOString() } as Program;
    } catch {
        throw new Error("Failed to fetch program. ");
    }
};
