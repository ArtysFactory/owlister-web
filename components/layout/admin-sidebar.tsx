import Link from "next/link";
import { LayoutDashboard, FileText, BookOpen, Users, Image, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const sidebarItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
    { icon: FileText, label: "Articles", href: "/admin/posts" },
    { icon: BookOpen, label: "Webtoon", href: "/admin/comics" },
    { icon: Image, label: "Médias", href: "/admin/media" },
    { icon: Users, label: "Utilisateurs", href: "/admin/users" },
    { icon: Settings, label: "Réglages", href: "/admin/settings" },
];

export function AdminSidebar() {
    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-secondary/20 bg-surface/50 backdrop-blur-xl">
            <div className="flex h-16 items-center border-b border-secondary/20 px-6">
                <span className="text-lg font-bold font-display tracking-tight">Owlister Admin</span>
            </div>
            <div className="flex flex-col justify-between h-[calc(100vh-4rem)] p-4">
                <nav className="space-y-1">
                    {sidebarItems.map((item) => (
                        <Link key={item.href} href={item.href}>
                            <Button
                                variant="ghost"
                                className={cn(
                                    "w-full justify-start gap-3",
                                    // Active state logic would go here (using usePathname)
                                )}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.label}
                            </Button>
                        </Link>
                    ))}
                </nav>
                <div className="border-t border-secondary/20 pt-4">
                    <Button variant="ghost" className="w-full justify-start gap-3 text-error hover:text-error hover:bg-error/10">
                        <LogOut className="h-4 w-4" />
                        Déconnexion
                    </Button>
                </div>
            </div>
        </aside>
    );
}
