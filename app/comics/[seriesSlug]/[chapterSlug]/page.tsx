import {
  getSeriesBySlug,
  getChapterBySlug,
  getChaptersBySeries,
} from "@/lib/services/comics";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { CommentSection } from "@/components/comments/comment-section";
import { WebtoonReader } from "@/components/comics/WebtoonReader";

interface PageProps {
  params: { seriesSlug: string; chapterSlug: string };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const series = await getSeriesBySlug(params.seriesSlug);
  if (!series) return {};

  const chapter = await getChapterBySlug(series.id, params.chapterSlug);
  if (!chapter) return {};

  return {
    title: `${chapter.title} - ${series.title}`,
    description: `Lire ${chapter.title} de ${series.title} sur Owlister.`,
  };
}

export default async function ChapterReaderPage({ params }: PageProps) {
  const series = await getSeriesBySlug(params.seriesSlug);
  if (!series) notFound();

  const chapter = await getChapterBySlug(series.id, params.chapterSlug);
  if (!chapter) notFound();

  const allChapters = await getChaptersBySeries(series.id);
  const publishedChapters = allChapters.filter(
    (c) => c.status === "published"
  );

  const currentIndex = publishedChapters.findIndex((c) => c.id === chapter.id);
  const prevChapter =
    currentIndex > 0 ? publishedChapters[currentIndex - 1] : null;
  const nextChapter =
    currentIndex < publishedChapters.length - 1
      ? publishedChapters[currentIndex + 1]
      : null;

  return (
    <div>
      <WebtoonReader
        series={series}
        chapter={chapter}
        prevChapter={prevChapter}
        nextChapter={nextChapter}
      />
      <div className="container max-w-4xl mx-auto py-12">
        <CommentSection targetId={chapter.id} />
      </div>
    </div>
  );
}
