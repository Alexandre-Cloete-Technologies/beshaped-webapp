"server-only";

import { db } from "@/lib/firebase";
import { collection, doc, getDoc, getDocs, limit, orderBy, query, QueryConstraint } from "firebase/firestore";
import { Product } from "../types/productTypes";

interface FilterOptions {
    limit?: number;
}

export const getAllProducts = async (options?: FilterOptions): Promise<Product[]> => {
    try {
            const colRef = collection(db, "products");


            const contraints: QueryConstraint[] = [
                orderBy("createdAt", "desc"),
            ];

            if(options?.limit){
                contraints.push(limit(options.limit));
            }

            const q = query(colRef, ...contraints);
            const snapshots = await getDocs(q);
            return snapshots.docs.map(doc => ({ ...doc.data(), id: doc.id, createdAt: doc.data().createdAt.toDate().toISOString(), updatedAt: doc.data().updatedAt.toDate().toISOString() })) as Product[];
    } catch (error) {
        throw new Error("Failed to fetch products.");
    }
};

export const getProductById = async (productId: string): Promise<Product> => {
    try {
        const docRef = doc(db, "products", productId);
        const snapshots = await getDoc(docRef);

        if(!snapshots.exists()){
            throw new Error("Product not found");
        }

        return { ...snapshots.data(), createdAt: snapshots.data().createdAt?.toDate().toISOString(), updatedAt: snapshots.data().updatedAt?.toDate().toISOString() } as Product;
    } catch (error: any) {
        if (error.message === "Product not found") {
            throw error;
        }
        throw new Error("Failed to fetch product.");
    }
};
