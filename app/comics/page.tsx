import Link from "next/link";
import { getAllSeries } from "@/lib/services/comics";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen } from "lucide-react";

export const revalidate = 60;

export default async function ComicsPage() {
    const seriesList = await getAllSeries();

    return (
        <div className="container py-12 space-y-8">
            <div className="space-y-4">
                <h1 className="text-4xl font-bold font-display">Webtoons</h1>
                <p className="text-muted-foreground text-lg max-w-2xl">
                    Découvrez nos séries originales, du fantastique à la romance.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {seriesList.length > 0 ? (
                    seriesList.map((series) => (
                        <Link key={series.id} href={`/comics/${series.slug}`}>
                            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer overflow-hidden group">
                                <div className="aspect-[2/3] w-full overflow-hidden relative">
                                    {series.coverImageUrl ? (
                                        <img
                                            src={series.coverImageUrl}
                                            alt={series.title}
                                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-muted flex items-center justify-center">
                                            <BookOpen className="h-12 w-12 text-muted-foreground" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                                        <p className="text-white font-bold">{series.title}</p>
                                        <p className="text-white/80 text-sm">{series.author}</p>
                                    </div>
                                </div>
                                <CardContent className="pt-4">
                                    <h3 className="font-bold text-lg mb-2 line-clamp-1">{series.title}</h3>
                                    <div className="flex gap-2 mb-2">
                                        <Badge variant={series.status === "ongoing" ? "success" : "secondary"}>
                                            {series.status === "ongoing" ? "En cours" : "Terminé"}
                                        </Badge>
                                    </div>
                                </CardContent>
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
