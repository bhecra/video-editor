import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type Props = {
  label: string;
  /** Undefined means "inherit", and the swatch shows `fallback` instead. */
  value?: string;
  fallback: string;
  onChange: (color: string) => void;
  onReset?: () => void;
};

export const ColorField: React.FC<Props> = ({
  label,
  value,
  fallback,
  onChange,
  onReset,
}) => {
  const shown = value ?? fallback;

  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={shown}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-10 cursor-pointer rounded-md border border-input bg-transparent p-0.5"
        />
        <Input
          value={shown}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1"
        />
        {onReset && value && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon-sm"
                variant="ghost"
                onClick={onReset}
                aria-label="Restablecer color"
              >
                <RotateCcw />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Volver al color por defecto</TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  );
};
