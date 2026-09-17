import { RotateCcw } from "lucide-react";
import type { SceneTransition } from "@video/schema/scene-schema";
import {
  formatTransitionDuration,
  transitionIcons,
  transitionLabels,
} from "@/lib/scene-meta";
import { TransitionFields } from "@/components/fields/TransitionFields";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const cut: SceneTransition = { type: "none", durationInSeconds: 0.5 };

type Props = {
  /** The scene's own transition. Undefined means it follows the video's. */
  transition: SceneTransition | undefined;
  /** The video-wide default, applied when the scene has none of its own. */
  inherited: SceneTransition | undefined;
  onChange: (transition: SceneTransition | undefined) => void;
};

/**
 * The gap between two scene cards, which is where the transition that joins
 * them lives. Clicking it opens the effect, its duration and its direction.
 */
export const TransitionRow: React.FC<Props> = ({
  transition,
  inherited,
  onChange,
}) => {
  const isInherited = !transition;
  const effective = transition ?? inherited ?? cut;
  const Icon = transitionIcons[effective.type];

  const label =
    effective.type === "none"
      ? transitionLabels.none
      : `${transitionLabels[effective.type]} · ${formatTransitionDuration(
          effective.durationInSeconds,
        )}`;

  return (
    <div className="flex items-center gap-1.5 px-2">
      <Separator className="flex-1" />

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            aria-label={`Transición: ${label}`}
            className={cn(
              "h-6 gap-1 rounded-full px-2 text-[11px] font-medium",
              effective.type === "none" || isInherited
                ? "text-muted-foreground"
                : "text-primary",
            )}
          >
            <Icon className="size-3" />
            {label}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-64 space-y-3 p-3" align="center">
          <div className="space-y-0.5">
            <h4 className="text-sm font-semibold">Transición</h4>
            <p className="text-xs text-muted-foreground">
              {isInherited
                ? "Heredada de los ajustes del video."
                : "Solo entre estas dos escenas."}
            </p>
          </div>

          <TransitionFields
            transition={effective}
            onChange={(next) => onChange(next)}
          />

          {!isInherited && inherited && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-xs text-muted-foreground"
              onClick={() => onChange(undefined)}
            >
              <RotateCcw />
              Usar la transición del video
            </Button>
          )}
        </PopoverContent>
      </Popover>

      <Separator className="flex-1" />
    </div>
  );
};
