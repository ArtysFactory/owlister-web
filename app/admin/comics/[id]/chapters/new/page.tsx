"use client";

import { useParams } from "next/navigation";
import { ChapterForm } from "@/components/admin/chapter-form";

export default function NewChapterPage() {
    const params = useParams();
    const seriesId = params.id as string;

    return <ChapterForm seriesId={seriesId} />;
}
