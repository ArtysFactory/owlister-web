"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getPostById } from "@/lib/services/posts";
import { Post } from "@/lib/types";
import { PostForm } from "@/components/admin/post-form";
import { Spinner } from "@/components/ui/spinner";

export default function EditPostPage() {
    const params = useParams();
    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadPost() {
            if (params.id) {
                const data = await getPostById(params.id as string);
                setPost(data);
            }
            setLoading(false);
        }
        loadPost();
    }, [params.id]);

    if (loading) {
        return (
            <div className="flex justify-center py-8">
                <Spinner className="h-8 w-8" />
            </div>
        );
    }

    if (!post) {
        return <div>Article non trouvé</div>;
    }

    return <PostForm post={post} />;
}
