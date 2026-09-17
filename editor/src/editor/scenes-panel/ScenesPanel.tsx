import { Fragment } from "react";
import { Plus } from "lucide-react";
import type {
  Scene,
  SceneTransition,
  VideoSettings,
} from "@video/schema/scene-schema";
import { formatDuration, typeLabels } from "@/lib/scene-meta";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SceneCard } from "./SceneCard";
import { TransitionRow } from "./TransitionRow";

type Props = {
  scenes: Scene[];
  settings: VideoSettings;
  selectedSceneId: string;
  totalSeconds: number;
  onSelectScene: (id: string) => void;
  onAddScene: (type: Scene["type"]) => void;
  onDuplicateScene: (scene: Scene) => void;
  onDeleteScene: (id: string) => void;
  onChangeTransition: (
    sceneId: string,
    transition: SceneTransition | undefined,
  ) => void;
};

const sceneTypes = ["canvas", "image", "video", "avatar"] as const;

/** Left column: the video's scene list and how new scenes get in. */
export const ScenesPanel: React.FC<Props> = ({
  scenes,
  settings,
  selectedSceneId,
  totalSeconds,
  onSelectScene,
  onAddScene,
  onDuplicateScene,
  onDeleteScene,
  onChangeTransition,
}) => (
  <Card className="flex w-80 flex-col gap-0 py-0 shadow-sm">
    <CardHeader className="border-b py-3">
      <div className="flex items-baseline gap-2">
        <CardTitle className="text-sm font-semibold">
          Escenas ({scenes.length})
        </CardTitle>
        <CardDescription>
          {formatDuration(totalSeconds)} min en total
        </CardDescription>
      </div>
    </CardHeader>

    <ScrollArea className="min-h-0 flex-1 p-2">
      <div className="flex flex-col gap-1">
        {scenes.map((scene, index) => (
          <Fragment key={scene.id}>
            {/* The gap before a scene is the transition that brings it in, so
                the first scene has no row above it. */}
            {index > 0 && (
              <TransitionRow
                transition={scene.transition}
                inherited={settings.defaultTransition}
                onChange={(transition) =>
                  onChangeTransition(scene.id, transition)
                }
              />
            )}
            <SceneCard
              scene={scene}
              index={index}
              isSelected={scene.id === selectedSceneId}
              canDelete={scenes.length > 1}
              onSelect={() => onSelectScene(scene.id)}
              onDuplicate={() => onDuplicateScene(scene)}
              onDelete={() => onDeleteScene(scene.id)}
            />
          </Fragment>
        ))}
      </div>
    </ScrollArea>

    <CardFooter className="p-2">
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
    </CardFooter>
  </Card>
);
