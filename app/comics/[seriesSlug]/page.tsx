import { getSeriesBySlug, getChaptersBySeries } from "@/lib/services/comics";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, ChevronRight } from "lucide-react";

interface PageProps {
  params: { seriesSlug: string };
}

export default async function SeriesPage({ params }: PageProps) {
  const series = await getSeriesBySlug(params.seriesSlug);
  if (!series) notFound();

  const chapters = (await getChaptersBySeries(series.id)).filter(
    (c) => c.status === "published"
  );

  return (
    <div className="container py-12 lg:py-20">
      <main className="grid lg:grid-cols-3 gap-12">
        {/* Series Info */}
        <aside className="lg:col-span-1 space-y-6">
          <Card>
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
            </CardHeader>
            <CardContent>
              <p className="text-sm text-white-smoke/80 mb-4">
                {series.description}
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{series.status}</Badge>
                <Badge variant="outline">{series.author}</Badge>
              </div>
            </CardContent>
          </Card>
        </aside>

        {/* Chapters List */}
        <div className="lg:col-span-2">
          <h2 className="text-3xl font-bold font-orbitron mb-8 flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-electric-violet" />
            Chapters
          </h2>
          <div className="space-y-4">
            {chapters.map((chapter) => (
              <Link
                key={chapter.id}
                href={`/comics/${series.slug}/${chapter.slug}`}
              >
                <Card className="hover:border-electric-violet/50">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>{chapter.title}</CardTitle>
                      <ChevronRight className="h-6 w-6 text-electric-violet" />
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
