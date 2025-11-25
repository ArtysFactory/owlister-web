"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Chapter, ChapterImage } from "@/lib/types";
import { createChapter, updateChapter } from "@/lib/services/comics";
import { uploadImage } from "@/lib/services/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Save, ArrowLeft, Upload, X, ArrowUp, ArrowDown } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/context/auth-context";

interface ChapterFormProps {
    seriesId: string;
    chapter?: Chapter;
}

export function ChapterForm({ seriesId, chapter }: ChapterFormProps) {
    const router = useRouter();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [images, setImages] = useState<ChapterImage[]>(chapter?.images || []);

    const { register, handleSubmit, formState: { errors } } = useForm<Partial<Chapter>>({
        defaultValues: chapter || {
            status: "draft",
            number: 1,
        },
    });

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        setUploading(true);
        try {
            const newImages: ChapterImage[] = [];
            for (let i = 0; i < e.target.files.length; i++) {
                const file = e.target.files[i];
                const url = await uploadImage(file, `comics/${seriesId}/chapters`);
                newImages.push({
                    url,
                    alt: file.name,
                    order: images.length + i,
                    width: 0, // We could get this from the image
                    height: 0,
                });
            }
            setImages([...images, ...newImages]);
        } catch (error) {
            console.error("Error uploading images", error);
            alert("Erreur lors de l'upload des images");
        } finally {
            setUploading(false);
        }
    };

    const removeImage = (index: number) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        // Reorder
        newImages.forEach((img, i) => img.order = i);
        setImages(newImages);
    };

    const moveImage = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === images.length - 1) return;

        const newImages = [...images];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;

        [newImages[index], newImages[targetIndex]] = [newImages[targetIndex], newImages[index]];

        // Update order
        newImages.forEach((img, i) => img.order = i);
        setImages(newImages);
    };

    const onSubmit = async (data: Partial<Chapter>) => {
        if (!user) return;
        setLoading(true);
        try {
            const chapterData = {
                ...data,
                seriesId,
                slug: data.slug || `chapter-${data.number}`,
                images,
                number: Number(data.number),
            };

            if (chapter) {
                await updateChapter(chapter.id, chapterData);
            } else {
                await createChapter(chapterData as any);
            }
            router.push(`/admin/comics/${seriesId}`);
            router.refresh();
        } catch (error) {
            console.error("Error saving chapter", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href={`/admin/comics/${seriesId}`}>
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold font-display">
                        {chapter ? `Modifier Chapitre ${chapter.number}` : "Nouveau Chapitre"}
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
                        <CardHeader>
                            <CardTitle>Pages du chapitre</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-center w-full">
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 dark:hover:bg-gray-800 dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        {uploading ? (
                                            <Loader2 className="w-8 h-8 mb-4 text-gray-500 animate-spin" />
                                        ) : (
                                            <Upload className="w-8 h-8 mb-4 text-gray-500" />
                                        )}
                                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                            <span className="font-semibold">Cliquez pour uploader</span> ou glissez-déposez
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG (MAX. 10MB)</p>
                                    </div>
                                    <input
                                        type="file"
                                        className="hidden"
                                        multiple
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        disabled={uploading}
                                    />
                                </label>
                            </div>

                            <div className="space-y-2">
                                {images.map((img, index) => (
                                    <div key={index} className="flex items-center gap-4 p-2 border rounded bg-card">
                                        <div className="flex flex-col gap-1">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6"
                                                onClick={() => moveImage(index, 'up')}
                                                disabled={index === 0}
                                            >
                                                <ArrowUp className="h-3 w-3" />
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6"
                                                onClick={() => moveImage(index, 'down')}
                                                disabled={index === images.length - 1}
                                            >
                                                <ArrowDown className="h-3 w-3" />
                                            </Button>
                                        </div>
                                        <img src={img.url} alt={img.alt} className="h-20 w-auto object-cover rounded" />
                                        <div className="flex-1 text-sm truncate">{img.alt}</div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="text-error hover:bg-error/10"
                                            onClick={() => removeImage(index)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-4">
                    <Card>
                        <CardContent className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Titre du chapitre</label>
                                <Input {...register("title", { required: true })} placeholder="Titre..." />
                                {errors.title && <span className="text-xs text-error">Requis</span>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Numéro</label>
                                <Input
                                    type="number"
                                    {...register("number", { required: true })}
                                    placeholder="1"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Slug</label>
                                <Input {...register("slug")} placeholder="chapter-1" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Statut</label>
                                <select
                                    {...register("status")}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border-secondary/20"
                                >
                                    <option value="draft">Brouillon</option>
                                    <option value="published">Publié</option>
                                </select>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </form>
    );
}
