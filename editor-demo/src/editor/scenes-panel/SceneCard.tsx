import { Copy, MoreVertical, Trash2 } from "lucide-react";
import type { Scene } from "@video/schema/scene-schema";
import { typeLabels } from "@/lib/scene-meta";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type Props = {
  scene: Scene;
  index: number;
  isSelected: boolean;
  canDelete: boolean;
  onSelect: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
};

export const SceneCard: React.FC<Props> = ({
  scene,
  index,
  isSelected,
  canDelete,
  onSelect,
  onDuplicate,
  onDelete,
}) => (
  <div
    role="button"
    tabIndex={0}
    onClick={onSelect}
    className={cn(
      "group cursor-pointer rounded-lg border-l-2 px-3 py-2 text-left transition-colors",
      isSelected
        ? "border-l-primary bg-primary/5"
        : "border-l-transparent hover:bg-muted",
    )}
  >
    <div className="mb-1 flex items-center justify-between gap-2">
      <span className="text-[11px] font-semibold text-muted-foreground">
        ESCENA {index + 1}
      </span>
      <div className="flex items-center gap-1">
        <Badge variant="outline">{typeLabels[scene.type]}</Badge>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon-xs"
              variant="ghost"
              aria-label="Opciones de escena"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onDuplicate}>
              <Copy />
              Duplicar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              disabled={!canDelete}
              onClick={onDelete}
            >
              <Trash2 />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
    <div className="text-sm font-semibold">{scene.name}</div>
    <div className="font-mono text-xs text-muted-foreground">
      0:{scene.durationInSeconds.toString().padStart(2, "0")}
    </div>
  </div>
);
