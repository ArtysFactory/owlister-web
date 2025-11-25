export type UserRole = "admin" | "contributor";

export interface UserProfile {
    id: string;
    email: string;
    displayName?: string;
    photoURL?: string;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
}

export interface Post {
    id: string;
    title: string;
    slug: string;
    content: string;
    excerpt?: string;
    status: "draft" | "published";
    authorId: string;
    tags: string[];
    coverImageUrl?: string;
    metaTitle?: string;
    metaDescription?: string;
    likeCount: number;
    commentCount: number;
    createdAt: Date;
    updatedAt: Date;
    aiMetadata?: {
        lastPrompt?: string;
        model?: string;
    };
}

export interface Series {
    id: string;
    title: string;
    slug: string;
    description: string;
    coverImageUrl?: string;
    authorId: string;
    author?: string; // Display name of author
    artist?: string; // Display name of artist
    tags: string[];
    status: "ongoing" | "completed" | "hiatus";
    createdAt: Date;
    updatedAt: Date;
}

export interface Chapter {
    id: string;
    seriesId: string;
    title: string;
    number: number;
    slug: string;
    images: ChapterImage[];
    status: "draft" | "published";
    createdAt: Date;
    updatedAt: Date;
}

export interface ChapterImage {
    url: string;
    alt: string;
    width: number;
    height: number;
    order: number;
}

export interface Comment {
    id: string;
    targetId: string;
    userId: string;
    userDisplayName: string;
    userPhotoURL?: string;
    content: string;
    createdAt: Date;
}
