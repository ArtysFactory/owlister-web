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
import { Series, Chapter } from "@/lib/types";

const SERIES_COLLECTION = "series";
const CHAPTERS_COLLECTION = "chapters";

// Series
export async function getRecentSeries(limitCount: number = 3): Promise<Series[]> {
    const q = query(
        collection(db, SERIES_COLLECTION),
        where("status", "==", "ongoing"), // Or just all? Let's say ongoing or completed
        orderBy("createdAt", "desc"),
        limit(limitCount)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: (doc.data().createdAt as Timestamp).toDate(),
        updatedAt: (doc.data().updatedAt as Timestamp).toDate(),
    } as Series));
}

export async function getAllSeries(): Promise<Series[]> {
    const q = query(
        collection(db, SERIES_COLLECTION),
        orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: (doc.data().createdAt as Timestamp).toDate(),
        updatedAt: (doc.data().updatedAt as Timestamp).toDate(),
    } as Series));
}

export async function getSeriesBySlug(slug: string): Promise<Series | null> {
    const q = query(
        collection(db, SERIES_COLLECTION),
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
    } as Series;
}

export async function getSeriesById(id: string): Promise<Series | null> {
    const docRef = doc(db, SERIES_COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return null;

    return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: (docSnap.data().createdAt as Timestamp).toDate(),
        updatedAt: (docSnap.data().updatedAt as Timestamp).toDate(),
    } as Series;
}

export async function createSeries(series: Omit<Series, "id" | "createdAt" | "updatedAt">): Promise<string> {
    const docRef = await addDoc(collection(db, SERIES_COLLECTION), {
        ...series,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
    });
    return docRef.id;
}

export async function updateSeries(id: string, series: Partial<Series>): Promise<void> {
    const docRef = doc(db, SERIES_COLLECTION, id);
    await updateDoc(docRef, {
        ...series,
        updatedAt: Timestamp.now(),
    });
}

export async function deleteSeries(id: string): Promise<void> {
    await deleteDoc(doc(db, SERIES_COLLECTION, id));
}

// Chapters
export async function getChaptersBySeries(seriesId: string): Promise<Chapter[]> {
    const q = query(
        collection(db, CHAPTERS_COLLECTION),
        where("seriesId", "==", seriesId),
        orderBy("number", "asc")
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: (doc.data().createdAt as Timestamp).toDate(),
        updatedAt: (doc.data().updatedAt as Timestamp).toDate(),
    } as Chapter));
}

export async function getChapterBySlug(seriesId: string, slug: string): Promise<Chapter | null> {
    const q = query(
        collection(db, CHAPTERS_COLLECTION),
        where("seriesId", "==", seriesId),
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
    } as Chapter;
}

export async function getChapterById(id: string): Promise<Chapter | null> {
    const docRef = doc(db, CHAPTERS_COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return null;

    return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: (docSnap.data().createdAt as Timestamp).toDate(),
        updatedAt: (docSnap.data().updatedAt as Timestamp).toDate(),
    } as Chapter;
}

export async function createChapter(chapter: Omit<Chapter, "id" | "createdAt" | "updatedAt">): Promise<string> {
    const docRef = await addDoc(collection(db, CHAPTERS_COLLECTION), {
        ...chapter,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
    });
    return docRef.id;
}

export async function updateChapter(id: string, chapter: Partial<Chapter>): Promise<void> {
    const docRef = doc(db, CHAPTERS_COLLECTION, id);
    await updateDoc(docRef, {
        ...chapter,
        updatedAt: Timestamp.now(),
    });
}

export async function deleteChapter(id: string): Promise<void> {
    await deleteDoc(doc(db, CHAPTERS_COLLECTION, id));
}
