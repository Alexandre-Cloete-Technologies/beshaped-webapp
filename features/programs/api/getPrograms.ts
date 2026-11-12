import "server-only";

import { db } from "@/lib/firebase";
import { collection, doc, getDoc, getDocs, type DocumentData } from "firebase/firestore";
import { Program, ProgramListItem } from "../types/programTypes";
import { canAccessProgram, getEntitledProgramIds } from "./getEntitledProgramIds";

/** Firestore Timestamps can't cross to client components; `createdAt` goes as an ISO string. */
const toProgram = (id: string, data: DocumentData): Program =>
    ({
        ...data,
        id,
        createdAt: data.createdAt?.toDate?.().toISOString() ?? "",
    }) as Program;

/** The programs the user may open: free programs plus their `availablePrograms` (same rule as mobile). */
export const getProgramsForUser = async (uid: string): Promise<ProgramListItem[]> => {
    try {
        const [snapshots, entitledIds] = await Promise.all([
            getDocs(collection(db, "programs")),
            getEntitledProgramIds(uid),
        ]);
        return snapshots.docs
            .map((d) => toProgram(d.id, d.data()))
            .filter((program) => canAccessProgram(program, entitledIds));
    } catch (error) {
        throw new Error("Failed to fetch programs. " + error);
    }
};

/** The program, or null when it doesn't exist or the user isn't entitled to it. */
export const getProgramForUser = async (programId: string, uid: string): Promise<Program | null> => {
    try {
        const [snapshot, entitledIds] = await Promise.all([
            getDoc(doc(db, "programs", programId)),
            getEntitledProgramIds(uid),
        ]);
        if (!snapshot.exists()) return null;

        const program = toProgram(snapshot.id, snapshot.data());
        return canAccessProgram(program, entitledIds) ? program : null;
    } catch (error) {
        throw new Error("Failed to fetch program. " + error);
    }
};
