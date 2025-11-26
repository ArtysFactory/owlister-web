import { Series, Chapter } from "@/lib/types";

export async function getRecentSeries(limit: number = 3): Promise<Series[]> {
  return Promise.resolve([
    {
      id: "1",
      title: "The Alchemist's Gambit",
      slug: "the-alchemists-gambit",
      description: "A thrilling tale of magic and betrayal.",
      author: "Owlister",
      status: "ongoing",
      coverImageUrl: "https://picsum.photos/seed/series1/300/400",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "2",
      title: "Cybernetic Soul",
      slug: "cybernetic-soul",
      description: "A sci-fi adventure in a dystopian future.",
      author: "Owlister",
      status: "ongoing",
      coverImageUrl: "https://picsum.photos/seed/series2/300/400",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "3",
      title: "The Last Witch",
      slug: "the-last-witch",
      description: "A fantasy story about the last of the witches.",
      author: "Owlister",
      status: "completed",
      coverImageUrl: "https://picsum.photos/seed/series3/300/400",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
}

export async function getLatestChapter(seriesId: string): Promise<Chapter | null> {
    return Promise.resolve({
        id: "1",
        seriesId: "1",
        title: "Chapter 12",
        slug: "chapter-12",
        number: 12,
        status: "published",
        createdAt: new Date(),
        updatedAt: new Date(),
        images: [],
    });
}
