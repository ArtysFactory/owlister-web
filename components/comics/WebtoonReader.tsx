"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";

interface ChapterImage {
  url: string;
  order: number;
}

interface WebtoonReaderProps {
  series: {
    title: string;
    slug: string;
  };
  chapter: {
    title: string;
    images: ChapterImage[];
  };
  prevChapter: { slug: string } | null;
  nextChapter: { slug: string } | null;
}

export function WebtoonReader({
  series,
  chapter,
  prevChapter,
  nextChapter,
}: WebtoonReaderProps) {
  const [scrollProgress, setScrollProgress] = useState(0);

  const handleScroll = () => {
    const totalHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    const progress = (window.scrollY / totalHeight) * 100;
    setScrollProgress(progress);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="bg-raisin-black min-h-screen">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-raisin-black/80 backdrop-blur-sm">
        <nav className="container mx-auto p-4 flex items-center justify-between">
          <Link href={`/comics/${series.slug}`}>
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span>{series.title}</span>
            </Button>
          </Link>
          <h1 className="font-orbitron text-lg font-bold truncate">
            {chapter.title}
          </h1>
          <div className="flex gap-2">
            {prevChapter && (
              <Link href={`/comics/${series.slug}/${prevChapter.slug}`}>
                <Button variant="ghost" size="icon">
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              </Link>
            )}
            {nextChapter && (
              <Link href={`/comics/${series.slug}/${nextChapter.slug}`}>
                <Button variant="ghost" size="icon">
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </Link>
            )}
          </div>
        </nav>
        {/* Progress Bar */}
        <div className="h-1 bg-electric-violet/20">
          <div
            className="h-1 bg-electric-violet"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>
      </header>

      {/* Comic Pages */}
      <main className="max-w-4xl mx-auto flex flex-col items-center">
        {chapter.images && chapter.images.length > 0 ? (
          chapter.images
            .sort((a, b) => a.order - b.order)
            .map((img, index) => (
              <div key={index} className="w-full h-auto">
                <Image
                  src={img.url}
                  alt={`Page ${index + 1}`}
                  width={800}
                  height={1200}
                  className="w-full h-auto"
                  priority={index < 3}
                />
              </div>
            ))
        ) : (
          <div className="py-24 text-center text-white-smoke/50">
            No pages available for this chapter.
          </div>
        )}
      </main>

      {/* Chapter End Section */}
      <footer className="container mx-auto text-center py-12 lg:py-20 space-y-8">
        <div className="flex justify-between items-center max-w-4xl mx-auto">
          {prevChapter ? (
            <Link href={`/comics/${series.slug}/${prevChapter.slug}`}>
              <Button variant="outline">
                <ChevronLeft className="mr-2 h-4 w-4" /> Previous
              </Button>
            </Link>
          ) : (
            <div />
          )}
          {nextChapter ? (
            <Link href={`/comics/${series.slug}/${nextChapter.slug}`}>
              <Button variant="default">
                Next <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <div />
          )}
        </div>

        {/* Community CTA */}
        <div className="pt-12 border-t border-electric-violet/20">
          <h2 className="text-3xl font-bold font-orbitron mb-4">
            Liked the chapter?
          </h2>
          <p className="text-lg text-white-smoke/80 max-w-2xl mx-auto mb-6">
            Join the Artys x Unlmtd guild to discuss the story, share fan art,
            and get exclusive content.
          </p>
          <Button size="lg" variant="secondary">
            Join the Guild
          </Button>
        </div>
      </footer>
    </div>
  );
}
