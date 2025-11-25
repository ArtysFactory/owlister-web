import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    Timestamp,
    limit
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Post } from "@/lib/types";

const POSTS_COLLECTION = "posts";

export async function getPublishedPosts(limitCount = 10): Promise<Post[]> {
    const q = query(
        collection(db, POSTS_COLLECTION),
        where("status", "==", "published"),
        orderBy("createdAt", "desc"),
        limit(limitCount)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: (doc.data().createdAt as Timestamp).toDate(),
        updatedAt: (doc.data().updatedAt as Timestamp).toDate(),
    } as Post));
}

export async function getRecentPosts(limitCount: number = 3): Promise<Post[]> {
    const q = query(
        collection(db, POSTS_COLLECTION),
        where("status", "==", "published"),
        orderBy("createdAt", "desc"),
        limit(limitCount)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: (doc.data().createdAt as Timestamp).toDate(),
        updatedAt: (doc.data().updatedAt as Timestamp).toDate(),
    } as Post));
}

export async function getAllPosts(): Promise<Post[]> {
    const q = query(
        collection(db, POSTS_COLLECTION),
        orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: (doc.data().createdAt as Timestamp).toDate(),
        updatedAt: (doc.data().updatedAt as Timestamp).toDate(),
    } as Post));
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
    const q = query(
        collection(db, POSTS_COLLECTION),
        where("slug", "==", slug),
        limit(1)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    return {
        id: doc.id,
        ...doc.data(),
        createdAt: (doc.data().createdAt as Timestamp).toDate(),
        updatedAt: (doc.data().updatedAt as Timestamp).toDate(),
    } as Post;
}

export async function getPostById(id: string): Promise<Post | null> {
    const docRef = doc(db, POSTS_COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return null;

    return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: (docSnap.data().createdAt as Timestamp).toDate(),
        updatedAt: (docSnap.data().updatedAt as Timestamp).toDate(),
    } as Post;
}

export async function createPost(post: Omit<Post, "id" | "createdAt" | "updatedAt">): Promise<string> {
    const docRef = await addDoc(collection(db, POSTS_COLLECTION), {
        ...post,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        likeCount: 0,
        commentCount: 0,
    });
    return docRef.id;
}

export async function updatePost(id: string, data: Partial<Post>): Promise<void> {
    const docRef = doc(db, POSTS_COLLECTION, id);
    await updateDoc(docRef, {
        ...data,
        updatedAt: Timestamp.now(),
    });
}

export async function deletePost(id: string): Promise<void> {
    await deleteDoc(doc(db, POSTS_COLLECTION, id));
}
