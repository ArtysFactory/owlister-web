"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAllSeries, deleteSeries } from "@/lib/services/comics";
import { Series } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Loader2, BookOpen } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function SeriesPage() {
    const [seriesList, setSeriesList] = useState<Series[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSeries();
    }, []);

    async function loadSeries() {
        setLoading(true);
        try {
            const data = await getAllSeries();
            setSeriesList(data);
        } catch (error) {
            console.error("Error loading series", error);
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(id: string) {
        if (confirm("Êtes-vous sûr de vouloir supprimer cette série ?")) {
            await deleteSeries(id);
            loadSeries();
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold font-display">Séries Webtoon</h1>
                <Link href="/admin/comics/new">
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Nouvelle Série
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Toutes les séries</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : seriesList.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            Aucune série trouvée. Créez-en une !
                        </div>
                    ) : (
                        <div className="relative w-full overflow-auto">
                            <table className="w-full caption-bottom text-sm">
                                <thead className="[&_tr]:border-b">
                                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                            Titre
                                        </th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                            Statut
                                        </th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                            Date
                                        </th>
                                        <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="[&_tr:last-child]:border-0">
                                    {seriesList.map((series) => (
                                        <tr
                                            key={series.id}
                                            className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                                        >
                                            <td className="p-4 align-middle font-medium">
                                                <div className="flex items-center gap-2">
                                                    {series.coverImageUrl && (
                                                        <img
                                                            src={series.coverImageUrl}
                                                            alt={series.title}
                                                            className="w-8 h-8 object-cover rounded"
                                                        />
                                                    )}
                                                    {series.title}
                                                </div>
                                            </td>
                                            <td className="p-4 align-middle">
                                                <Badge
                                                    variant={
                                                        series.status === "ongoing" ? "success" : "secondary"
                                                    }
                                                >
                                                    {series.status === "ongoing" ? "En cours" : "Terminé"}
                                                </Badge>
                                            </td>
                                            <td className="p-4 align-middle">
                                                {format(series.createdAt, "d MMMM yyyy", { locale: fr })}
                                            </td>
                                            <td className="p-4 align-middle text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Link href={`/admin/comics/${series.id}`}>
                                                        <Button variant="ghost" size="icon" title="Gérer les chapitres">
                                                            <BookOpen className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Link href={`/admin/comics/${series.id}/edit`}>
                                                        <Button variant="ghost" size="icon">
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-error hover:text-error hover:bg-error/10"
                                                        onClick={() => handleDelete(series.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
