import { getPostBySlug } from "@/lib/services/posts";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Metadata } from "next";
import { CommentSection } from "@/components/comments/comment-section";

interface PageProps {
    params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const post = await getPostBySlug(params.slug);
    if (!post) return {};

    return {
        title: post.metaTitle || post.title,
        description: post.metaDescription || post.excerpt,
        keywords: post.tags,
    };
}

export default async function BlogPostPage({ params }: PageProps) {
    const post = await getPostBySlug(params.slug);

    if (!post) {
        notFound();
    }

    return (
        <article className="container py-12 max-w-4xl mx-auto">
            <div className="space-y-6 mb-12 text-center">
                <div className="flex justify-center gap-2">
                    {post.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                            {tag}
                        </Badge>
                    ))}
                </div>
                <h1 className="text-4xl md:text-5xl font-bold font-display leading-tight">
                    {post.title}
                </h1>
                <div className="text-muted-foreground">
                    Publié le {format(post.createdAt, "d MMMM yyyy", { locale: fr })}
                </div>
            </div>

            {post.coverImageUrl && (
                <div className="aspect-video w-full overflow-hidden rounded-xl mb-12 shadow-lg">
                    <img
                        src={post.coverImageUrl}
                        alt={post.title}
                        className="w-full h-full object-cover"
                    />
                </div>
            )}

            <div className="prose prose-lg dark:prose-invert mx-auto mb-16">
                <ReactMarkdown>{post.content}</ReactMarkdown>
            </div>

            <div className="border-t pt-12">
                <CommentSection targetId={post.id} />
            </div>
        </article>
    );
}
