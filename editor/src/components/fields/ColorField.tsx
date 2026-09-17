import { RotateCcw } from "lucide-react";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
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
    <Field>
      <FieldLabel className="text-xs text-muted-foreground">{label}</FieldLabel>
      <InputGroup>
        <InputGroupAddon>
          <input
            type="color"
            value={shown}
            onChange={(e) => onChange(e.target.value)}
            aria-label={label}
            className="h-5 w-7 cursor-pointer rounded-sm border border-input bg-transparent p-0"
          />
        </InputGroupAddon>
        <InputGroupInput
          value={shown}
          onChange={(e) => onChange(e.target.value)}
        />
        {onReset && value && (
          <InputGroupAddon align="inline-end">
            <Tooltip>
              <TooltipTrigger asChild>
                <InputGroupButton
                  size="icon-xs"
                  aria-label="Restablecer color"
                  onClick={onReset}
                >
                  <RotateCcw />
                </InputGroupButton>
              </TooltipTrigger>
              <TooltipContent>Volver al color por defecto</TooltipContent>
            </Tooltip>
          </InputGroupAddon>
        )}
      </InputGroup>
    </Field>
  );
};
