"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Series } from "@/lib/types";
import { createSeries, updateSeries } from "@/lib/services/comics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/context/auth-context";

interface SeriesFormProps {
    series?: Series;
}

export function SeriesForm({ series }: SeriesFormProps) {
    const router = useRouter();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<Partial<Series>>({
        defaultValues: series || {
            status: "ongoing",
        },
    });

    const onSubmit = async (data: Partial<Series>) => {
        if (!user) return;
        setLoading(true);
        try {
            const seriesData = {
                ...data,
                slug: data.slug || data.title?.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "") || "untitled",
                authorId: user.uid, // Default to current user as creator, but fields allow override
            };

            if (series) {
                await updateSeries(series.id, seriesData);
            } else {
                await createSeries(seriesData as any);
            }
            router.push("/admin/comics");
            router.refresh();
        } catch (error) {
            console.error("Error saving series", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/comics">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold font-display">
                        {series ? "Modifier la série" : "Nouvelle série"}
                    </h1>
                </div>
                <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Save className="mr-2 h-4 w-4" />
                    Enregistrer
                </Button>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
                <div className="md:col-span-2 space-y-4">
                    <Card>
                        <CardContent className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Titre</label>
                                <Input {...register("title", { required: true })} placeholder="Titre de la série" />
                                {errors.title && <span className="text-xs text-error">Requis</span>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Slug</label>
                                <Input {...register("slug")} placeholder="slug-de-la-serie" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Description</label>
                                <textarea
                                    {...register("description", { required: true })}
                                    className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border-secondary/20 font-sans"
                                    placeholder="Synopsis de la série..."
                                />
                                {errors.description && <span className="text-xs text-error">Requis</span>}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-4">
                    <Card>
                        <CardContent className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Statut</label>
                                <select
                                    {...register("status")}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border-secondary/20"
                                >
                                    <option value="ongoing">En cours</option>
                                    <option value="completed">Terminé</option>
                                    <option value="hiatus">En pause</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Auteur</label>
                                <Input {...register("author")} placeholder="Nom de l'auteur" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Artiste</label>
                                <Input {...register("artist")} placeholder="Nom de l'artiste" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Image de couverture (URL)</label>
                                <Input {...register("coverImageUrl")} placeholder="https://..." />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </form>
    );
}
