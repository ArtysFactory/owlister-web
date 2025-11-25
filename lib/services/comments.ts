import {
    collection,
    doc,
    getDocs,
    addDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    Timestamp
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Comment } from "@/lib/types";

const COMMENTS_COLLECTION = "comments";

export async function getCommentsByTargetId(targetId: string): Promise<Comment[]> {
    const q = query(
        collection(db, COMMENTS_COLLECTION),
        where("targetId", "==", targetId),
        orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: (doc.data().createdAt as Timestamp).toDate(),
    } as Comment));
}

export async function createComment(comment: Omit<Comment, "id" | "createdAt">): Promise<string> {
    const docRef = await addDoc(collection(db, COMMENTS_COLLECTION), {
        ...comment,
        createdAt: Timestamp.now(),
    });
    return docRef.id;
}

export async function deleteComment(id: string): Promise<void> {
    await deleteDoc(doc(db, COMMENTS_COLLECTION, id));
}
