import Link from "next/link";
import { getAllSeries } from "@/lib/services/comics";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen } from "lucide-react";

export const revalidate = 60;

export default async function ComicsPage() {
    const seriesList = await getAllSeries();

    return (
        <div className="container py-24 space-y-12">
            <div className="space-y-4 text-center max-w-2xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-bold font-display text-gradient">Webtoons</h1>
                <p className="text-muted-foreground text-lg">
                    Découvrez nos séries originales, du fantastique à la romance.
                </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {seriesList.length > 0 ? (
                    seriesList.map((series) => (
                        <Link key={series.id} href={`/comics/${series.slug}`}>
                            <Card className="h-full group overflow-hidden border-0 bg-transparent">
                                <div className="aspect-[2/3] w-full overflow-hidden rounded-xl relative shadow-2xl">
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
                                        <h3 className="text-xl font-bold text-white mb-1 line-clamp-1">{series.title}</h3>
                                        <p className="text-white/70 text-sm">{series.author}</p>
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    ))
                ) : (
                    <div className="col-span-full text-center py-12 text-muted-foreground">
                        Aucune série pour le moment.
                    </div>
                )}
            </div>
        </div>
    );
}
