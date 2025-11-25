import Link from "next/link";
import { getPublishedPosts } from "@/lib/services/posts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export const revalidate = 60;

export default async function BlogPage() {
    const posts = await getPublishedPosts(50);

    return (
        <div className="container py-24 space-y-12">
            <div className="space-y-4 text-center max-w-2xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-bold font-display text-gradient">Le Blog</h1>
                <p className="text-muted-foreground text-lg">
                    Retrouvez tous nos articles sur l'univers du webtoon, nos tutoriels et nos actualités.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {posts.length > 0 ? (
                    posts.map((post) => (
                        <Link key={post.id} href={`/blog/${post.slug}`}>
                            <Card className="h-full hover:bg-surface-highlight/50 transition-colors border-white/5 flex flex-col">
                                {post.coverImageUrl && (
                                    <div className="aspect-video w-full overflow-hidden rounded-t-xl">
                                        <img
                                            src={post.coverImageUrl}
                                            alt={post.title}
                                            className="w-full h-full object-cover transition-transform hover:scale-105"
                                        />
                                    </div>
                                )}
                                <CardHeader>
                                    <div className="flex gap-2 mb-2">
                                        {post.tags.slice(0, 3).map((tag) => (
                                            <Badge key={tag} variant="outline" className="text-xs border-white/10 text-muted-foreground">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                    <CardTitle className="line-clamp-2 text-xl group-hover:text-primary transition-colors">
                                        {post.title}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="flex-1 flex flex-col justify-between">
                                    <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
                                        {post.excerpt || post.content.substring(0, 150) + "..."}
                                    </p>
                                    <p className="text-xs text-muted-foreground/60 mt-auto pt-4 border-t border-white/5">
                                        {format(post.createdAt, "d MMMM yyyy", { locale: fr })}
                                    </p>
                                </CardContent>
                            </Card>
                        </Link>
                    ))
                ) : (
                    <div className="col-span-full text-center py-12 text-muted-foreground">
                        Aucun article publié pour le moment.
                    </div>
                )}
            </div>
        </div>
    );
}
