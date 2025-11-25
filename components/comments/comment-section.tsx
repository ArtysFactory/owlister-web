"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/lib/context/auth-context";
import { getCommentsByTargetId, createComment, deleteComment } from "@/lib/services/comments";
import { Comment } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Send, Trash2, User } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";

interface CommentSectionProps {
    targetId: string;
}

export function CommentSection({ targetId }: CommentSectionProps) {
    const { user, profile } = useAuth();
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<{ content: string }>();

    useEffect(() => {
        loadComments();
    }, [targetId]);

    async function loadComments() {
        try {
            const data = await getCommentsByTargetId(targetId);
            setComments(data);
        } catch (error) {
            console.error("Error loading comments", error);
        } finally {
            setLoading(false);
        }
    }

    async function onSubmit(data: { content: string }) {
        if (!user) return;
        setSubmitting(true);
        try {
            const newComment = {
                targetId,
                userId: user.uid,
                userDisplayName: user.displayName || "Utilisateur",
                userPhotoURL: user.photoURL || undefined,
                content: data.content,
            };
            await createComment(newComment);
            reset();
            loadComments();
        } catch (error) {
            console.error("Error creating comment", error);
        } finally {
            setSubmitting(false);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Supprimer ce commentaire ?")) return;
        try {
            await deleteComment(id);
            setComments(comments.filter(c => c.id !== id));
        } catch (error) {
            console.error("Error deleting comment", error);
        }
    }

    return (
        <div className="space-y-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold font-display">Commentaires ({comments.length})</h3>

            {/* Comment Form */}
            {user ? (
                <Card>
                    <CardContent className="p-4">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="flex gap-4">
                                {user.photoURL ? (
                                    <img
                                        src={user.photoURL}
                                        alt={user.displayName || "User"}
                                        className="w-10 h-10 rounded-full"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                                        <User className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                )}
                                <div className="flex-1 space-y-2">
                                    <textarea
                                        {...register("content", { required: true })}
                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        placeholder="Ajouter un commentaire..."
                                    />
                                    {errors.content && <span className="text-xs text-error">Ce champ est requis</span>}
                                    <div className="flex justify-end">
                                        <Button type="submit" disabled={submitting} size="sm">
                                            {submitting && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                                            <Send className="mr-2 h-3 w-3" />
                                            Publier
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            ) : (
                <Card className="bg-muted/50">
                    <CardContent className="p-6 text-center">
                        <p className="text-muted-foreground mb-4">Connectez-vous pour participer à la discussion.</p>
                        <Link href="/login">
                            <Button variant="outline">Se connecter</Button>
                        </Link>
                    </CardContent>
                </Card>
            )}

            {/* Comments List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : comments.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        Soyez le premier à commenter !
                    </div>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="flex gap-4 p-4 rounded-lg bg-card border">
                            {comment.userPhotoURL ? (
                                <img
                                    src={comment.userPhotoURL}
                                    alt={comment.userDisplayName}
                                    className="w-10 h-10 rounded-full"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                                    <User className="h-5 w-5 text-muted-foreground" />
                                </div>
                            )}
                            <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-sm">{comment.userDisplayName}</span>
                                        <span className="text-xs text-muted-foreground">
                                            {format(comment.createdAt, "d MMMM yyyy à HH:mm", { locale: fr })}
                                        </span>
                                    </div>
                                    {(user?.uid === comment.userId || profile?.role === "admin") && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 text-muted-foreground hover:text-error"
                                            onClick={() => handleDelete(comment.id)}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    )}
                                </div>
                                <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
