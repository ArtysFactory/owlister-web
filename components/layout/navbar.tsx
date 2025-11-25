import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Navbar() {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-secondary/20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-6">
                    <Link href="/" className="flex items-center space-x-2">
                        <span className="text-xl font-bold font-display tracking-tight">Owlister</span>
                    </Link>
                    <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                        <Link href="/blog" className="transition-colors hover:text-primary">
                            Blog
                        </Link>
                        <Link href="/comics" className="transition-colors hover:text-primary">
                            Webtoon
                        </Link>
                    </nav>
                </div>
                <div className="flex items-center gap-4">
                    <Link href="/login">
                        <Button variant="ghost" size="sm">
                            Connexion
                        </Button>
                    </Link>
                </div>
            </div>
        </header>
    );
}
