"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getSeriesById, getChaptersBySeries, deleteChapter } from "@/lib/services/comics";
import { Series, Chapter } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Loader2, ArrowLeft, ImageIcon } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function SeriesDetailsPage() {
    const params = useParams();
    const [series, setSeries] = useState<Series | null>(null);
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [params.id]);

    async function loadData() {
        setLoading(true);
        try {
            if (params.id) {
                const seriesData = await getSeriesById(params.id as string);
                setSeries(seriesData);
                if (seriesData) {
                    const chaptersData = await getChaptersBySeries(seriesData.id);
                    setChapters(chaptersData);
                }
            }
        } catch (error) {
            console.error("Error loading data", error);
        } finally {
            setLoading(false);
        }
    }

    async function handleDeleteChapter(id: string) {
        if (confirm("Êtes-vous sûr de vouloir supprimer ce chapitre ?")) {
            await deleteChapter(id);
            loadData();
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!series) {
        return <div>Série non trouvée</div>;
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/comics">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold font-display">{series.title}</h1>
                        <p className="text-muted-foreground text-sm">
                            {chapters.length} chapitres • {series.status === "ongoing" ? "En cours" : "Terminé"}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Link href={`/admin/comics/${series.id}/edit`}>
                        <Button variant="outline">
                            <Pencil className="mr-2 h-4 w-4" />
                            Modifier la série
                        </Button>
                    </Link>
                    <Link href={`/admin/comics/${series.id}/chapters/new`}>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Nouveau Chapitre
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Chapitres</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {chapters.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                Aucun chapitre. Ajoutez-en un !
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {chapters.map((chapter) => (
                                    <div
                                        key={chapter.id}
                                        className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-10 w-10 items-center justify-center rounded bg-primary/10 text-primary font-bold">
                                                #{chapter.number}
                                            </div>
                                            <div>
                                                <h3 className="font-medium">{chapter.title}</h3>
                                                <p className="text-xs text-muted-foreground">
                                                    {format(chapter.createdAt, "d MMMM yyyy", { locale: fr })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant={chapter.status === "published" ? "success" : "secondary"}>
                                                {chapter.status === "published" ? "Publié" : "Brouillon"}
                                            </Badge>
                                            <Link href={`/admin/comics/${series.id}/chapters/${chapter.id}`}>
                                                <Button variant="ghost" size="icon">
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-error hover:text-error hover:bg-error/10"
                                                onClick={() => handleDeleteChapter(chapter.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Informations</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            {series.coverImageUrl && (
                                <img
                                    src={series.coverImageUrl}
                                    alt={series.title}
                                    className="w-full aspect-[2/3] object-cover rounded-md mb-4"
                                />
                            )}
                            <div>
                                <span className="font-medium text-muted-foreground">Auteur:</span>
                                <p>{series.author || "-"}</p>
                            </div>
                            <div>
                                <span className="font-medium text-muted-foreground">Artiste:</span>
                                <p>{series.artist || "-"}</p>
                            </div>
                            <div>
                                <span className="font-medium text-muted-foreground">Slug:</span>
                                <p className="font-mono text-xs">{series.slug}</p>
                            </div>
                            <div>
                                <span className="font-medium text-muted-foreground">Description:</span>
                                <p className="mt-1 text-muted-foreground line-clamp-4">{series.description}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
