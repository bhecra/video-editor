import {
  transitionDirections,
  transitionTypes,
  type SceneTransition,
  type TransitionDirection,
  type TransitionType,
} from "@video/schema/scene-schema";
import {
  directionalTransitions,
  formatTransitionDuration,
  transitionDirectionLabels,
  transitionIcons,
  transitionLabels,
} from "@/lib/scene-meta";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type Props = {
  transition: SceneTransition;
  onChange: (transition: SceneTransition) => void;
};

/**
 * The knobs of a single transition: kind, how long it runs and — for the ones
 * that travel across the frame — which way it comes from. Used both for the
 * transition between two scenes and for the video's default.
 */
export const TransitionFields: React.FC<Props> = ({ transition, onChange }) => {
  const hasDirection = directionalTransitions.includes(transition.type);

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Efecto</Label>
        <Select
          value={transition.type}
          onValueChange={(type) =>
            onChange({ ...transition, type: type as TransitionType })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {/* The icon rides inside the item's text, so the closed trigger
                shows it too — the effect is recognisable without opening. */}
            {transitionTypes.map((type) => {
              const Icon = transitionIcons[type];

              return (
                <SelectItem key={type} value={type}>
                  <Icon className="text-muted-foreground" />
                  {transitionLabels[type]}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {transition.type !== "none" && (
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">
            Duración — {formatTransitionDuration(transition.durationInSeconds)}
          </Label>
          <Slider
            value={[transition.durationInSeconds]}
            min={0.1}
            max={3}
            step={0.1}
            onValueChange={([durationInSeconds]) =>
              onChange({
                ...transition,
                durationInSeconds: Number(durationInSeconds.toFixed(1)),
              })
            }
          />
        </div>
      )}

      {hasDirection && (
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Desde</Label>
          <ToggleGroup
            type="single"
            size="sm"
            variant="outline"
            className="w-full"
            value={transition.direction ?? "from-right"}
            onValueChange={(direction) =>
              direction &&
              onChange({
                ...transition,
                direction: direction as TransitionDirection,
              })
            }
          >
            {transitionDirections.map((direction) => (
              <ToggleGroupItem
                key={direction}
                value={direction}
                className="flex-1 text-xs"
              >
                {transitionDirectionLabels[direction]}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      )}
    </div>
  );
};
