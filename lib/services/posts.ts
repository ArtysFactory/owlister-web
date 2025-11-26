import { Post } from "@/lib/types";

export async function getRecentPosts(limit: number = 3): Promise<Post[]> {
  return Promise.resolve([
    {
      id: "1",
      title: "The Alchemist's Gambit: Chapter 1",
      slug: "the-alchemists-gambit-chapter-1",
      excerpt: "The first chapter of the new webtoon.",
      createdAt: new Date(),
      updatedAt: new Date(),
      status: "published",
      tags: ["webtoon", "fantasy"],
      coverImageUrl: "https://picsum.photos/seed/post1/400/300",
      content: "This is the content of the first chapter.",
      metaTitle: "The Alchemist's Gambit: Chapter 1",
      metaDescription: "The first chapter of the new webtoon.",
    },
    {
      id: "2",
      title: "The Art of Storytelling",
      slug: "the-art-of-storytelling",
      excerpt: "A deep dive into the art of storytelling.",
      createdAt: new Date(),
      updatedAt: new Date(),
      status: "published",
      tags: ["writing", "art"],
      coverImageUrl: "https://picsum.photos/seed/post2/400/300",
      content: "This is the content of the blog post.",
      metaTitle: "The Art of Storytelling",
      metaDescription: "A deep dive into the art of storytelling.",
    },
    {
      id: "3",
      title: "Character Design 101",
      slug: "character-design-101",
      excerpt: "Learn the basics of character design.",
      createdAt: new Date(),
      updatedAt: new Date(),
      status: "published",
      tags: ["art", "design"],
      coverImageUrl: "https://picsum.photos/seed/post3/400/300",
      content: "This is the content of the blog post.",
      metaTitle: "Character Design 101",
      metaDescription: "Learn the basics of character design.",
    },
  ]);
}
