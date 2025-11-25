"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getChapterById } from "@/lib/services/comics";
import { Chapter } from "@/lib/types";
import { ChapterForm } from "@/components/admin/chapter-form";
import { Spinner } from "@/components/ui/spinner";

export default function EditChapterPage() {
    const params = useParams();
    const seriesId = params.id as string;
    const chapterId = params.chapterId as string;
    const [chapter, setChapter] = useState<Chapter | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadChapter() {
            if (chapterId) {
                const data = await getChapterById(chapterId);
                setChapter(data);
            }
            setLoading(false);
        }
        loadChapter();
    }, [chapterId]);

    if (loading) {
        return (
            <div className="flex justify-center py-8">
                <Spinner className="h-8 w-8" />
            </div>
        );
    }

    if (!chapter) {
        return <div>Chapitre non trouvé</div>;
    }

    return <ChapterForm seriesId={seriesId} chapter={chapter} />;
}
