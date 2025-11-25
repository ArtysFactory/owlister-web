"use client";

import Link from "next/link";
import { useAuth } from "@/lib/context/auth-context";
import { Button } from "@/components/ui/button";
import { User, LogOut, LayoutDashboard } from "lucide-react";

export function Navbar() {
    const { user, signOut } = useAuth();

    return (
        <nav className="sticky top-0 z-50 w-full glass">
            <div className="container flex h-16 items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <span className="text-2xl font-bold font-display text-gradient">
                        Owlister
                    </span>
                </Link>

                <div className="flex items-center gap-6">
                    <Link href="/blog" className="text-sm font-medium text-text-muted hover:text-primary transition-colors">
                        Blog
                    </Link>
                    <Link href="/comics" className="text-sm font-medium text-text-muted hover:text-primary transition-colors">
                        Webtoons
                    </Link>

                    {user ? (
                        <div className="flex items-center gap-4">
                            <Link href="/admin">
                                <Button variant="ghost" size="sm" className="text-text-muted hover:text-primary">
                                    <LayoutDashboard className="mr-2 h-4 w-4" />
                                    Admin
                                </Button>
                            </Link>
                            <Button variant="ghost" size="sm" onClick={() => signOut()} className="text-text-muted hover:text-error">
                                <LogOut className="h-4 w-4" />
                            </Button>
                        </div>
                    ) : (
                        <Link href="/login">
                            <Button size="sm" className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">
                                <User className="mr-2 h-4 w-4" />
                                Connexion
                            </Button>
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}
