
export enum ContentType {
  ARTICLE = 'ARTICLE',
  COMIC = 'COMIC'
}

export enum UserRole {
  ADMIN = 'ADMIN',
  EDITOR = 'EDITOR',
  READER = 'READER'
}

export type Language = 'fr' | 'en' | 'es';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  bio?: string;
}

export interface Author {
  name: string;
  avatar: string;
  id?: string; // Link to user
}

export interface Comment {
  id: string;
  contentId: string;
  user: string;
  text: string;
  date: string;
  approved: boolean;
}

export interface Subscriber {
  email: string;
  date: string;
  language: Language;
}

export interface BaseContent {
  id: string;
  title: string;
  excerpt: string;
  coverImage: string;
  date: string;
  author: Author;
  tags: string[];
  likes: number;
  type: ContentType;
  originalLanguage: Language; // Added for translation
}

export interface Article extends BaseContent {
  type: ContentType.ARTICLE;
  content: string;
}

export interface Comic extends BaseContent {
  type: ContentType.COMIC;
  pages: string[];
}

export type ContentItem = Article | Comic;

export interface SocialLink {
  platform: 'instagram' | 'facebook' | 'whatsapp' | 'snapchat' | 'x' | 'tiktok' | 'linkedin';
  url?: string;
}
