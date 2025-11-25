import { getSeriesBySlug, getChapterBySlug, getChaptersBySeries } from "@/lib/services/comics";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import { Metadata } from "next";
import { CommentSection } from "@/components/comments/comment-section";

interface PageProps {
    params: { seriesSlug: string; chapterSlug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
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
    const publishedChapters = allChapters.filter(c => c.status === "published");

    const currentIndex = publishedChapters.findIndex(c => c.id === chapter.id);
    const prevChapter = currentIndex > 0 ? publishedChapters[currentIndex - 1] : null;
    const nextChapter = currentIndex < publishedChapters.length - 1 ? publishedChapters[currentIndex + 1] : null;

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Navigation Bar */}
            <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-sm border-b border-white/10 p-4 flex items-center justify-between">
                <Link href={`/comics/${series.slug}`}>
                    <Button variant="ghost" className="text-white hover:text-white hover:bg-white/10 gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="hidden sm:inline">{series.title}</span>
                    </Button>
                </Link>
                <div className="font-bold text-sm sm:text-base truncate max-w-[200px] sm:max-w-md">
                    {chapter.title}
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        disabled={!prevChapter}
                        className="text-white hover:text-white hover:bg-white/10 disabled:opacity-30"
                        asChild={!!prevChapter}
                    >
                        {prevChapter ? (
                            <Link href={`/comics/${series.slug}/${prevChapter.slug}`}>
                                <ChevronLeft className="h-5 w-5" />
                            </Link>
                        ) : (
                            <ChevronLeft className="h-5 w-5" />
                        )}
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        disabled={!nextChapter}
                        className="text-white hover:text-white hover:bg-white/10 disabled:opacity-30"
                        asChild={!!nextChapter}
                    >
                        {nextChapter ? (
                            <Link href={`/comics/${series.slug}/${nextChapter.slug}`}>
                                <ChevronRight className="h-5 w-5" />
                            </Link>
                        ) : (
                            <ChevronRight className="h-5 w-5" />
                        )}
                    </Button>
                </div>
            </div>

            {/* Reader Content */}
            <div className="max-w-3xl mx-auto flex flex-col items-center">
                {chapter.images && chapter.images.length > 0 ? (
                    chapter.images.sort((a, b) => a.order - b.order).map((img, index) => (
                        <img
                            key={index}
                            src={img.url}
                            alt={`Page ${index + 1}`}
                            className="w-full h-auto block"
                            loading="lazy"
                        />
                    ))
                ) : (
                    <div className="py-24 text-center text-gray-400">
                        Aucune page disponible pour ce chapitre.
                    </div>
                )}
            </div>

            {/* Bottom Navigation */}
            <div className="max-w-3xl mx-auto p-8 flex justify-between items-center">
                {prevChapter ? (
                    <Link href={`/comics/${series.slug}/${prevChapter.slug}`}>
                        <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                            <ChevronLeft className="mr-2 h-4 w-4" /> Précédent
                        </Button>
                    </Link>
                ) : (
                    <div />
                )}

                {nextChapter ? (
                    <Link href={`/comics/${series.slug}/${nextChapter.slug}`}>
                        <Button className="bg-primary text-white hover:bg-primary/90">
                            Suivant <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                ) : (
                    <div />
                )}
            </div>

            {/* Comments Section */}
            <div className="max-w-3xl mx-auto p-8 border-t border-white/10">
                <CommentSection targetId={chapter.id} />
            </div>
        </div>
    );
}
