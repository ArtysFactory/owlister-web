"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAllPosts, deletePost } from "@/lib/services/posts";
import { Post } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function PostsPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPosts();
    }, []);

    async function loadPosts() {
        setLoading(true);
        try {
            const data = await getAllPosts();
            setPosts(data);
        } catch (error) {
            console.error("Error loading posts", error);
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(id: string) {
        if (confirm("Êtes-vous sûr de vouloir supprimer cet article ?")) {
            await deletePost(id);
            loadPosts();
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold font-display">Articles</h1>
                <Link href="/admin/posts/new">
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Nouvel Article
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Tous les articles</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : posts.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            Aucun article trouvé. Créez-en un !
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
                                    {posts.map((post) => (
                                        <tr
                                            key={post.id}
                                            className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                                        >
                                            <td className="p-4 align-middle font-medium">
                                                {post.title}
                                            </td>
                                            <td className="p-4 align-middle">
                                                <Badge
                                                    variant={
                                                        post.status === "published" ? "success" : "secondary"
                                                    }
                                                >
                                                    {post.status === "published" ? "Publié" : "Brouillon"}
                                                </Badge>
                                            </td>
                                            <td className="p-4 align-middle">
                                                {format(post.createdAt, "d MMMM yyyy", { locale: fr })}
                                            </td>
                                            <td className="p-4 align-middle text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Link href={`/admin/posts/${post.id}`}>
                                                        <Button variant="ghost" size="icon">
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-error hover:text-error hover:bg-error/10"
                                                        onClick={() => handleDelete(post.id)}
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
