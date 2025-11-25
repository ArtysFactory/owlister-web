import Link from "next/link";
import { getRecentPosts } from "@/lib/services/posts";
import { getRecentSeries } from "@/lib/services/comics";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, BookOpen, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export const revalidate = 60; // Revalidate every minute

export default async function Home() {
    const [recentPosts, recentSeries] = await Promise.all([
        getRecentPosts(3),
        getRecentSeries(3)
    ]);

    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <section className="relative py-24 md:py-32 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/20 rounded-full blur-[120px] -z-10 opacity-50 animate-pulse" />

                <div className="container flex flex-col items-center text-center space-y-8">
                    <Badge variant="outline" className="px-4 py-1 border-primary/50 text-primary bg-primary/10 backdrop-blur-sm animate-fade-in">
                        <Sparkles className="w-3 h-3 mr-2" />
                        Nouveau sur Owlister
                    </Badge>

                    <h1 className="text-5xl md:text-7xl font-bold font-display tracking-tight max-w-4xl">
                        L'univers du <span className="text-gradient">Webtoon</span> <br />
                        et de la Création
                    </h1>

                    <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
                        Découvrez des histoires captivantes, apprenez à créer vos propres webtoons
                        et rejoignez une communauté de passionnés.
                    </p>

                    <div className="flex flex-wrap gap-4 justify-center pt-4">
                        <Link href="/comics">
                            <Button size="lg" className="bg-primary hover:bg-primary/90 text-white h-12 px-8 text-lg shadow-lg shadow-primary/25">
                                Lire des Webtoons <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                        <Link href="/blog">
                            <Button size="lg" variant="outline" className="h-12 px-8 text-lg border-white/10 hover:bg-white/5">
                                Explorer le Blog
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Featured Webtoons */}
            <section className="py-20 bg-surface/30 border-y border-white/5">
                <div className="container space-y-12">
                    <div className="flex items-center justify-between">
                        <h2 className="text-3xl font-bold font-display flex items-center gap-3">
                            <BookOpen className="h-8 w-8 text-secondary" />
                            Séries à la Une
                        </h2>
                        <Link href="/comics">
                            <Button variant="ghost" className="text-muted-foreground hover:text-primary">
                                Tout voir <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </div>

                    <div className="grid gap-8 md:grid-cols-3">
                        {recentSeries.map((series) => (
                            <Link key={series.id} href={`/comics/${series.slug}`}>
                                <Card className="h-full group overflow-hidden border-0 bg-transparent">
                                    <div className="aspect-[3/4] w-full overflow-hidden rounded-xl relative shadow-2xl">
                                        {series.coverImageUrl ? (
                                            <img
                                                src={series.coverImageUrl}
                                                alt={series.title}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-surface-highlight flex items-center justify-center">
                                                <BookOpen className="h-12 w-12 text-muted-foreground/50" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                                        <div className="absolute bottom-0 left-0 p-6 w-full transform translate-y-2 group-hover:translate-y-0 transition-transform">
                                            <Badge variant="secondary" className="mb-2 bg-primary/20 text-primary border-0 backdrop-blur-md">
                                                {series.status === "ongoing" ? "En cours" : "Terminé"}
                                            </Badge>
                                            <h3 className="text-2xl font-bold text-white mb-1">{series.title}</h3>
                                            <p className="text-white/70 text-sm line-clamp-2">{series.description}</p>
                                        </div>
                                    </div>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Latest Articles */}
            <section className="py-20">
                <div className="container space-y-12">
                    <div className="flex items-center justify-between">
                        <h2 className="text-3xl font-bold font-display">Derniers Articles</h2>
                        <Link href="/blog">
                            <Button variant="ghost" className="text-muted-foreground hover:text-primary">
                                Tout voir <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </div>

                    <div className="grid gap-6 md:grid-cols-3">
                        {recentPosts.map((post) => (
                            <Link key={post.id} href={`/blog/${post.slug}`}>
                                <Card className="h-full hover:bg-surface-highlight/50 transition-colors border-white/5">
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
                                            {post.tags.slice(0, 2).map((tag) => (
                                                <Badge key={tag} variant="outline" className="text-xs border-white/10 text-muted-foreground">
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>
                                        <CardTitle className="line-clamp-2 text-xl group-hover:text-primary transition-colors">
                                            {post.title}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
                                            {post.excerpt}
                                        </p>
                                        <p className="text-xs text-muted-foreground/60">
                                            {format(post.createdAt, "d MMMM yyyy", { locale: fr })}
                                        </p>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
