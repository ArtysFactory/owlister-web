"use client";

import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { useAuth } from "@/lib/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Spinner } from "@/components/ui/spinner";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Spinner className="h-8 w-8" />
            </div>
        );
    }

    if (!user) {
        return null; // Will redirect
    }

    return (
        <div className="flex min-h-screen bg-background">
            <AdminSidebar />
            <main className="flex-1 pl-64">
                <div className="container mx-auto p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
