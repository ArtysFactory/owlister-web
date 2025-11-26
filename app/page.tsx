import Link from "next/link";
import Image from "next/image";
import { getRecentPosts } from "@/lib/services/posts";
import { getRecentSeries, getLatestChapter } from "@/lib/services/comics";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowRight, BookOpen, Rss } from "lucide-react";

export const revalidate = 60; // Revalidate every minute

export default async function Home() {
  const [recentPosts, recentSeries] = await Promise.all([
    getRecentPosts(5),
    getRecentSeries(5),
  ]);

  const latestChapter = recentSeries.length > 0 ? await getLatestChapter(recentSeries[0].id) : null;
  const currentSeries = recentSeries.length > 0 ? recentSeries[0] : null;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center text-center py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-raisin-black via-raisin-black/80 to-raisin-black z-10" />
        <Image
          src="/img/owlister-hero.svg"
          alt="Owlister in a dystopian city"
          fill
          className="object-cover object-center animate-fade-in"
        />
        <div className="container relative z-20 flex flex-col items-center space-y-6">
          <h1 className="text-5xl md:text-7xl font-bold font-orbitron tracking-tighter text-ghost-white shadow-lg">
            GUIDE OF THE{" "}
            <span className="text-electric-violet font-orbitron">ARTYS x UNLMTD</span>{" "}
            MOVEMENT
          </h1>
          <p className="text-xl text-white-smoke/80 max-w-2xl leading-relaxed">
            I explore dystopian universes through a mix of editorial blog posts
            and vertical comics. Join the guild, and let's build the future of
            storytelling together.
          </p>
          <div className="flex flex-wrap gap-4 justify-center pt-4">
            <Link href="/comics">
              <Button size="lg">
                Explore Webtoons <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/blog">
              <Button size="lg" variant="outline">
                Read Articles
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Articles Rail */}
      <section className="py-20">
        <div className="container space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold font-orbitron flex items-center gap-3">
              <Rss className="h-8 w-8 text-acid-green" />
              Latest Articles
            </h2>
            <Link href="/blog">
              <Button variant="ghost">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {recentPosts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`}>
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>{post.title}</CardTitle>
                    <CardDescription>{post.excerpt}</CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <p className="text-xs text-white-smoke/50">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Webtoons Rail */}
      <section className="py-20 bg-raisin-black-light">
        <div className="container space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold font-orbitron flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-electric-violet" />
              Featured Webtoons
            </h2>
            <Link href="/comics">
              <Button variant="ghost">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {recentSeries.map((series) => (
              <Link key={series.id} href={`/comics/${series.slug}`}>
                <Card className="h-full">
                  <CardHeader>
                    <div className="aspect-[3/4] w-full overflow-hidden rounded-md mb-4">
                      <Image
                        src={series.coverImageUrl || "/placeholder.png"}
                        alt={series.title}
                        width={300}
                        height={400}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardTitle>{series.title}</CardTitle>
                    <CardDescription>{series.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Current Arc Section */}
      <section className="py-20 text-center">
        <div className="container space-y-6">
          <h2 className="text-3xl font-bold font-orbitron">
            Current Arc: {currentSeries ? currentSeries.title : "The Alchemist's Gambit"}
          </h2>
          <p className="text-xl text-white-smoke/80 max-w-2xl mx-auto">
            The story is heating up. Catch up on the latest chapter before the
            next one drops.
          </p>
          {latestChapter && currentSeries && (
            <Link href={`/comics/${currentSeries.slug}/${latestChapter.slug}`}>
              <Button size="lg" variant="secondary">
                Read {latestChapter.title} <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
