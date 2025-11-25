import Link from "next/link";
import { Twitter, Instagram, Github } from "lucide-react";

export function Footer() {
    return (
        <footer className="border-t border-white/5 bg-surface/30 backdrop-blur-sm mt-auto">
            <div className="container py-12 md:py-16">
                <div className="grid gap-8 md:grid-cols-4">
                    <div className="space-y-4">
                        <h3 className="text-2xl font-bold font-display text-gradient">Owlister</h3>
                        <p className="text-muted-foreground text-sm">
                            La plateforme de référence pour les créateurs et lecteurs de Webtoon.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-bold mb-4">Navigation</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/" className="hover:text-primary transition-colors">Accueil</Link></li>
                            <li><Link href="/blog" className="hover:text-primary transition-colors">Blog</Link></li>
                            <li><Link href="/comics" className="hover:text-primary transition-colors">Webtoons</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold mb-4">Légal</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="#" className="hover:text-primary transition-colors">Mentions Légales</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors">Confidentialité</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors">CGU</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold mb-4">Suivez-nous</h4>
                        <div className="flex gap-4">
                            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                                <Twitter className="h-5 w-5" />
                            </Link>
                            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                                <Instagram className="h-5 w-5" />
                            </Link>
                            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                                <Github className="h-5 w-5" />
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/5 mt-12 pt-8 text-center text-sm text-muted-foreground">
                    © {new Date().getFullYear()} Owlister. Tous droits réservés.
                </div>
            </div>
        </footer>
    );
}
