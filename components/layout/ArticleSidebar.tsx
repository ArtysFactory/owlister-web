import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface ArticleSidebarProps {
  tags: string[];
  createdAt: string;
}

export function ArticleSidebar({ tags, createdAt }: ArticleSidebarProps) {
  return (
    <aside className="lg:col-span-3">
      <div className="sticky top-24 space-y-6">
        <h3 className="font-orbitron font-bold text-lg">Metadata</h3>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
        <div>
          <h4 className="font-semibold mb-2">Published On</h4>
          <p className="text-sm text-white-smoke/70">
            {format(new Date(createdAt), "d MMMM yyyy", { locale: fr })}
          </p>
        </div>
      </div>
    </aside>
  );
}
