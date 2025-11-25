"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, BookOpen, Users, MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";
import { getAllPosts } from "@/lib/services/posts";
import { getAllSeries } from "@/lib/services/comics";

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        posts: 0,
        series: 0,
        users: 0, // Mocked for now
        comments: 0, // Mocked for now
    });

    useEffect(() => {
        async function fetchStats() {
            try {
                const posts = await getAllPosts();
                const series = await getAllSeries();
                setStats({
                    posts: posts.length,
                    series: series.length,
                    users: 12, // Mock
                    comments: 5, // Mock
                });
            } catch (error) {
                console.error("Error fetching stats", error);
            }
        }
        fetchStats();
    }, []);

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold font-display">Tableau de bord</h1>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Articles</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.posts}</div>
                        <p className="text-xs text-muted-foreground">
                            +2 depuis le mois dernier
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Séries Webtoon</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.series}</div>
                        <p className="text-xs text-muted-foreground">
                            En cours de publication
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Utilisateurs</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.users}</div>
                        <p className="text-xs text-muted-foreground">
                            +1 cette semaine
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Commentaires</CardTitle>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.comments}</div>
                        <p className="text-xs text-muted-foreground">
                            En attente de modération
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
