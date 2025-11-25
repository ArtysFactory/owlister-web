import { getSeriesBySlug, getChaptersBySeries } from "@/lib/services/comics";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Metadata } from "next";

interface PageProps {
    params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const series = await getSeriesBySlug(params.slug);
    if (!series) return {};

    return {
        title: series.title,
        description: series.description,
        keywords: series.tags,
    };
}

export default async function SeriesPage({ params }: PageProps) {
    const series = await getSeriesBySlug(params.slug);

    if (!series) {
        notFound();
    }

    const chapters = await getChaptersBySeries(series.id);
    const publishedChapters = chapters.filter(c => c.status === "published");

    return (
        <div className="container py-12 space-y-12">
            {/* Series Header */}
            <div className="grid gap-8 md:grid-cols-3">
                <div className="md:col-span-1">
                    <div className="aspect-[2/3] w-full overflow-hidden rounded-lg shadow-lg">
                        {series.coverImageUrl ? (
                            <img
                                src={series.coverImageUrl}
                                alt={series.title}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-muted" />
                        )}
                    </div>
                </div>
                <div className="md:col-span-2 space-y-6">
                    <div className="space-y-2">
                        <h1 className="text-4xl md:text-5xl font-bold font-display">{series.title}</h1>
                        <div className="flex gap-2">
                            <Badge variant={series.status === "ongoing" ? "success" : "secondary"}>
                                {series.status === "ongoing" ? "En cours" : "Terminé"}
                            </Badge>
                            {series.tags.map(tag => (
                                <Badge key={tag} variant="outline">{tag}</Badge>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4 text-muted-foreground">
                        <p className="whitespace-pre-wrap">{series.description}</p>
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                            <div>
                                <span className="font-medium text-foreground">Auteur:</span> {series.author}
                            </div>
                            <div>
                                <span className="font-medium text-foreground">Artiste:</span> {series.artist}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chapters List */}
            <div className="space-y-6">
                <h2 className="text-2xl font-bold font-display">Chapitres</h2>
                <div className="grid gap-4">
                    {publishedChapters.length > 0 ? (
                        publishedChapters.map((chapter) => (
                            <Link key={chapter.id} href={`/comics/${series.slug}/${chapter.slug}`}>
                                <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                                    <CardContent className="flex items-center justify-between p-4">
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-12 w-12 items-center justify-center rounded bg-primary/10 text-primary font-bold text-lg">
                                                #{chapter.number}
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-lg">{chapter.title}</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {format(chapter.createdAt, "d MMMM yyyy", { locale: fr })}
                                                </p>
                                            </div>
                                        </div>
                                        <Button variant="ghost">Lire</Button>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))
                    ) : (
                        <div className="text-center py-12 text-muted-foreground">
                            Aucun chapitre publié pour le moment.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
