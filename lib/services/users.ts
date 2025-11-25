import {
    collection,
    doc,
    getDocs,
    updateDoc,
    query,
    orderBy,
    Timestamp
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { UserProfile, UserRole } from "@/lib/types";

const USERS_COLLECTION = "users";

export async function getAllUsers(): Promise<UserProfile[]> {
    const q = query(
        collection(db, USERS_COLLECTION),
        orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: (doc.data().createdAt as Timestamp).toDate(),
        updatedAt: (doc.data().updatedAt as Timestamp).toDate(),
    } as UserProfile));
}

export async function updateUserRole(uid: string, role: UserRole): Promise<void> {
    const docRef = doc(db, USERS_COLLECTION, uid);
    await updateDoc(docRef, {
        role,
        updatedAt: Timestamp.now(),
    });
}
