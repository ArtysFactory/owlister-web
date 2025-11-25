"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Post } from "@/lib/types";
import { createPost, updatePost } from "@/lib/services/posts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Save, ArrowLeft, Wand2 } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/context/auth-context";
import { generateOutline, generateDraft, generateSeoMetadata } from "@/lib/ai/gemini";

interface PostFormProps {
    post?: Post;
}

export function PostForm({ post }: PostFormProps) {
    const router = useRouter();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);

    const { register, handleSubmit, setValue, getValues, watch, formState: { errors } } = useForm<Partial<Post>>({
        defaultValues: post || {
            status: "draft",
            tags: [],
        },
    });

    const onSubmit = async (data: Partial<Post>) => {
        if (!user) return;
        setLoading(true);
        try {
            const postData = {
                ...data,
                slug: data.slug || data.title?.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "") || "untitled",
                authorId: user.uid,
                tags: typeof data.tags === 'string' ? (data.tags as string).split(',').map((t: string) => t.trim()) : data.tags,
            };

            if (post) {
                await updatePost(post.id, postData);
            } else {
                await createPost(postData as any);
            }
            router.push("/admin/posts");
            router.refresh();
        } catch (error) {
            console.error("Error saving post", error);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateOutline = async () => {
        const title = getValues("title");
        if (!title) return alert("Veuillez entrer un titre d'abord.");

        setAiLoading(true);
        try {
            const outline = await generateOutline(title);
            setValue("content", outline);
        } catch (e) {
            alert("Erreur lors de la génération du plan.");
        } finally {
            setAiLoading(false);
        }
    };

    const handleGenerateDraft = async () => {
        const title = getValues("title");
        const content = getValues("content");
        if (!title || !content) return alert("Veuillez avoir un titre et un plan (dans le contenu).");

        setAiLoading(true);
        try {
            const draft = await generateDraft(title, content);
            setValue("content", draft);
        } catch (e) {
            alert("Erreur lors de la génération du brouillon.");
        } finally {
            setAiLoading(false);
        }
    };

    const handleGenerateSEO = async () => {
        const content = getValues("content");
        if (!content) return alert("Veuillez avoir du contenu.");

        setAiLoading(true);
        try {
            const metadata = await generateSeoMetadata(content);
            // We don't have specific fields for meta title/desc in the form yet, let's add them or just log for now
            // Actually, let's assume we want to save them. The Post type has metaTitle and metaDescription.
            // But the form doesn't have inputs for them visible yet.
            // Let's just append them to the content or alert them for now, or add hidden fields?
            // Better: Add fields for SEO in the form.
            console.log("Generated Metadata:", metadata);
            alert(`Titre SEO: ${metadata.title}\nDescription: ${metadata.description}\nTags: ${metadata.tags.join(", ")}`);

            // If we had fields:
            // setValue("metaTitle", metadata.title);
            // setValue("metaDescription", metadata.description);
            // setValue("tags", metadata.tags); // This might overwrite existing tags

            // Let's update tags at least
            setValue("tags", metadata.tags);
        } catch (e) {
            alert("Erreur lors de la génération SEO.");
        } finally {
            setAiLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/posts">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold font-display">
                        {post ? "Modifier l'article" : "Nouvel article"}
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
                                <Input {...register("title", { required: true })} placeholder="Titre de l'article" />
                                {errors.title && <span className="text-xs text-error">Requis</span>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Slug</label>
                                <Input {...register("slug")} placeholder="slug-de-l-article" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Contenu (Markdown)</label>
                                <textarea
                                    {...register("content", { required: true })}
                                    className="flex min-h-[400px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border-secondary/20 font-mono"
                                    placeholder="# Votre contenu ici..."
                                />
                                {errors.content && <span className="text-xs text-error">Requis</span>}
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
                                    <option value="draft">Brouillon</option>
                                    <option value="published">Publié</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Tags (séparés par virgules)</label>
                                <Input {...register("tags")} placeholder="tech, nextjs, firebase" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Image de couverture (URL)</label>
                                <Input {...register("coverImageUrl")} placeholder="https://..." />
                            </div>
                        </CardContent>
                    </Card>

                    {/* AI Tools */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm flex items-center gap-2">
                                <Wand2 className="h-4 w-4 text-primary" />
                                Assistant IA
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button
                                variant="outline"
                                className="w-full justify-start"
                                type="button"
                                onClick={handleGenerateOutline}
                                disabled={aiLoading}
                            >
                                {aiLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "✨"} Générer un plan
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full justify-start"
                                type="button"
                                onClick={handleGenerateDraft}
                                disabled={aiLoading}
                            >
                                {aiLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "📝"} Rédiger le brouillon
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full justify-start"
                                type="button"
                                onClick={handleGenerateSEO}
                                disabled={aiLoading}
                            >
                                {aiLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "🔍"} Optimiser SEO
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </form>
    );
}
