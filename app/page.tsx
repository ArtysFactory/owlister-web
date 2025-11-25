import Link from "next/link";
import { getRecentPosts } from "@/lib/services/posts";
import { getRecentSeries } from "@/lib/services/comics";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, BookOpen, FileText } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export const revalidate = 60; // Revalidate every minute

export default async function HomePage() {
    const posts = await getRecentPosts(3);
    const series = await getRecentSeries(3);

    return (
        <div className="space-y-16 py-8">
            {/* Hero Section */}
            <section className="text-center space-y-6 py-12 md:py-24">
                <h1 className="text-4xl md:text-6xl font-bold font-display tracking-tight">
                    Bienvenue sur <span className="text-primary">Owlister</span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Découvrez nos articles de blog passionnants et plongez dans nos séries webtoon originales.
                </p>
                <div className="flex justify-center gap-4">
                    <Link href="/blog">
                        <Button size="lg" className="gap-2">
                            <FileText className="h-5 w-5" />
                            Lire le Blog
                        </Button>
                    </Link>
                    <Link href="/comics">
                        <Button size="lg" variant="outline" className="gap-2">
                            <BookOpen className="h-5 w-5" />
                            Lire les Webtoons
                        </Button>
                    </Link>
                </div>
            </section>

            {/* Latest Posts */}
            <section className="space-y-8">
                <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-bold font-display">Derniers Articles</h2>
                    <Link href="/blog">
                        <Button variant="ghost" className="gap-2">
                            Voir tout <ArrowRight className="h-4 w-4" />
                        </Button>
                    </Link>
                </div>
                <div className="grid gap-6 md:grid-cols-3">
                    {posts.length > 0 ? (
                        posts.map((post) => (
                            <Link key={post.id} href={`/blog/${post.slug}`}>
                                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                                    {post.coverImageUrl && (
                                        <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                                            <img
                                                src={post.coverImageUrl}
                                                alt={post.title}
                                                className="w-full h-full object-cover transition-transform hover:scale-105"
                                            />
                                        </div>
                                    )}
                                    <CardHeader>
                                        <div className="flex gap-2 mb-2">
                                            {post.tags.slice(0, 2).map((tag) => (
                                                <Badge key={tag} variant="secondary" className="text-xs">
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>
                                        <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
                                            {post.excerpt || post.content.substring(0, 150) + "..."}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {format(post.createdAt, "d MMMM yyyy", { locale: fr })}
                                        </p>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))
                    ) : (
                        <div className="col-span-3 text-center py-12 text-muted-foreground">
                            Aucun article pour le moment.
                        </div>
                    )}
                </div>
            </section>

            {/* Featured Comics */}
            <section className="space-y-8">
                <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-bold font-display">Séries à la Une</h2>
                    <Link href="/comics">
                        <Button variant="ghost" className="gap-2">
                            Voir tout <ArrowRight className="h-4 w-4" />
                        </Button>
                    </Link>
                </div>
                <div className="grid gap-6 md:grid-cols-3">
                    {series.length > 0 ? (
                        series.map((s) => (
                            <Link key={s.id} href={`/comics/${s.slug}`}>
                                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer overflow-hidden">
                                    <div className="aspect-[2/3] w-full overflow-hidden relative group">
                                        {s.coverImageUrl ? (
                                            <img
                                                src={s.coverImageUrl}
                                                alt={s.title}
                                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-muted flex items-center justify-center">
                                                <BookOpen className="h-12 w-12 text-muted-foreground" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                                            <p className="text-white font-bold">{s.title}</p>
                                            <p className="text-white/80 text-sm">{s.author}</p>
                                        </div>
                                    </div>
                                    <CardContent className="pt-4">
                                        <h3 className="font-bold text-lg mb-2">{s.title}</h3>
                                        <div className="flex gap-2 mb-2">
                                            <Badge variant={s.status === "ongoing" ? "success" : "secondary"}>
                                                {s.status === "ongoing" ? "En cours" : "Terminé"}
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))
                    ) : (
                        <div className="col-span-3 text-center py-12 text-muted-foreground">
                            Aucune série pour le moment.
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
