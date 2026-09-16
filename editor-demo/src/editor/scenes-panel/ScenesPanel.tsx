import { Plus } from "lucide-react";
import type { Scene } from "@video/schema/scene-schema";
import { formatDuration, typeLabels } from "@/lib/scene-meta";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SceneCard } from "./SceneCard";

type Props = {
  scenes: Scene[];
  selectedSceneId: string;
  totalSeconds: number;
  onSelectScene: (id: string) => void;
  onAddScene: (type: Scene["type"]) => void;
  onDuplicateScene: (scene: Scene) => void;
  onDeleteScene: (id: string) => void;
};

const sceneTypes = ["canvas", "imagen", "video", "avatar"] as const;

/** Left column: the video's scene list and how new scenes get in. */
export const ScenesPanel: React.FC<Props> = ({
  scenes,
  selectedSceneId,
  totalSeconds,
  onSelectScene,
  onAddScene,
  onDuplicateScene,
  onDeleteScene,
}) => (
  <Card className="flex w-72 flex-col gap-0 py-0 shadow-sm">
    <div className="flex items-baseline gap-2 border-b px-4 py-3">
      <h2 className="text-sm font-semibold">Escenas ({scenes.length})</h2>
      <span className="text-xs text-muted-foreground">
        {formatDuration(totalSeconds)} min en total
      </span>
    </div>

    <ScrollArea className="min-h-0 flex-1 p-2">
      <div className="flex flex-col gap-1">
        {scenes.map((scene, index) => (
          <SceneCard
            key={scene.id}
            scene={scene}
            index={index}
            isSelected={scene.id === selectedSceneId}
            canDelete={scenes.length > 1}
            onSelect={() => onSelectScene(scene.id)}
            onDuplicate={() => onDuplicateScene(scene)}
            onDelete={() => onDeleteScene(scene.id)}
          />
        ))}
      </div>
    </ScrollArea>

    <div className="border-t p-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full">
            <Plus />
            Añadir escena
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="w-(--radix-dropdown-menu-trigger-width)"
        >
          {sceneTypes.map((type) => (
            <DropdownMenuItem key={type} onClick={() => onAddScene(type)}>
              {typeLabels[type]}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </Card>
);
