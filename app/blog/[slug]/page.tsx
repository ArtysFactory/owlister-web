import { getPostBySlug } from "@/lib/services/posts";
import { notFound } from "next/navigation";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Metadata } from "next";
import { CommentSection } from "@/components/comments/comment-section";
import { Rss } from "lucide-react";
import { ArticleSidebar } from "@/components/layout/ArticleSidebar";

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
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
    <main>
      {/* Post Header */}
      <header className="relative h-[50vh] flex items-center justify-center">
        <div className="absolute inset-0 bg-black/60 z-10" />
        {post.coverImageUrl && (
          <Image
            src={post.coverImageUrl}
            alt={post.title}
            fill
            className="object-cover"
          />
        )}
        <div className="container relative z-20 text-center text-ghost-white space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold font-orbitron">
            {post.title}
          </h1>
          <p className="text-lg text-white-smoke/80">
            {format(post.createdAt, "d MMMM yyyy", { locale: fr })}
          </p>
        </div>
      </header>

      {/* Post Content */}
      <article className="container max-w-4xl mx-auto py-12 lg:py-20 grid lg:grid-cols-12 gap-12">
        <ArticleSidebar tags={post.tags} createdAt={post.createdAt.toString()} />

        <div className="lg:col-span-9">
          <div className="prose prose-lg prose-invert mx-auto">
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>
        </div>
      </article>

      {/* Comments Section */}
      <section className="py-12 lg:py-20 border-t border-electric-violet/20">
        <div className="container max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold font-orbitron mb-8 flex items-center gap-3">
            <Rss className="h-8 w-8 text-acid-green" />
            Join the Discussion
          </h2>
          <CommentSection targetId={post.id} />
        </div>
      </section>
    </main>
  );
}
