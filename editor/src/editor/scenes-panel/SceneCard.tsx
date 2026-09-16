import { Copy, MoreVertical, Trash2 } from "lucide-react";
import type { Scene } from "@video/schema/scene-schema";
import { formatDuration, typeLabels } from "@/lib/scene-meta";
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
import { SceneThumbnail } from "./SceneThumbnail";

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
    aria-label={`Escena ${index + 1}: ${scene.name}`}
    onClick={onSelect}
    onKeyDown={(event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onSelect();
      }
    }}
    className={cn(
      "group flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors",
      isSelected ? "bg-primary/10" : "hover:bg-muted",
    )}
  >
    <SceneThumbnail scene={scene} />

    <div className="min-w-0 flex-1">
      <div className="line-clamp-2 text-sm leading-snug font-semibold">
        {scene.name}
      </div>
      <div className="mt-0.5 flex items-center gap-1.5">
        <span className="font-mono text-xs text-muted-foreground">
          {formatDuration(scene.durationInSeconds)}
        </span>
        <Badge variant="outline" className="h-4 px-1.5 text-[10px]">
          {typeLabels[scene.type]}
        </Badge>
      </div>
    </div>

    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="icon-xs"
          variant="ghost"
          aria-label="Opciones de escena"
          className="shrink-0"
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
);
