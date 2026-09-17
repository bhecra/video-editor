import Color from "color";
import { RotateCcw } from "lucide-react";
import { useCallback, useState } from "react";
import {
  ColorPicker,
  ColorPickerAlpha,
  ColorPickerEyeDropper,
  ColorPickerFormat,
  ColorPickerHue,
  ColorPickerOutput,
  ColorPickerSelection,
} from "@/components/ui/color-picker";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type Props = {
  label: string;
  /** Undefined means "inherit", and the swatch shows `fallback` instead. */
  value?: string;
  fallback: string;
  onChange: (color: string) => void;
  onReset?: () => void;
};

const serializeColor = (value: unknown): string | null => {
  try {
    const color = Color(value as Parameters<typeof Color>[0]);
    const [r, g, b] = color.rgb().array().slice(0, 3).map((channel) => Math.round(channel));
    const alpha = Math.round(color.alpha() * 1000) / 1000;
    if (alpha >= 0.995) {
      return color.hex();
    }
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  } catch {
    return null;
  }
};

const sameColor = (left: string, right: string) => {
  try {
    const a = Color(left);
    const b = Color(right);
    return a.hex() === b.hex() && Math.abs(a.alpha() - b.alpha()) < 0.005;
  } catch {
    return left.toLowerCase() === right.toLowerCase();
  }
};

export const ColorField: React.FC<Props> = ({
  label,
  value,
  fallback,
  onChange,
  onReset,
}) => {
  const shown = value ?? fallback;
  const [open, setOpen] = useState(false);

  const handlePickerChange = useCallback(
    (next: Parameters<typeof Color.rgb>[0]) => {
      const serialized = serializeColor(next);
      if (!serialized || sameColor(serialized, shown)) {
        return;
      }
      onChange(serialized);
    },
    [onChange, shown],
  );

  return (
    <Field>
      <FieldLabel className="text-xs text-muted-foreground">{label}</FieldLabel>
      <InputGroup>
        <InputGroupAddon>
          <Popover modal open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                aria-label={label}
                className="relative h-5 w-7 cursor-pointer overflow-hidden rounded-sm border border-input"
              >
                <span
                  aria-hidden
                  className="absolute inset-0"
                  style={{
                    backgroundImage:
                      "url(\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMUlEQVQ4T2NkYGAQYcAP3uCTZhw1gGGYhAGBZIA/nYDCgBDAm9BGDWAAJyRCgLaBCAAgXwixzAS0pgAAAABJRU5ErkJggg==\")",
                    backgroundSize: "8px 8px",
                  }}
                />
                <span
                  aria-hidden
                  className="absolute inset-0"
                  style={{ backgroundColor: shown }}
                />
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" side="bottom" className="z-[60] w-72 p-3">
              <ColorPicker
                key={String(open)}
                className="h-auto w-full"
                defaultValue={shown}
                onChange={handlePickerChange}
              >
                <ColorPickerSelection className="h-36" />
                <ColorPickerHue />
                <ColorPickerAlpha />
                <div className="flex items-center gap-2">
                  <ColorPickerEyeDropper />
                  <ColorPickerOutput />
                  <ColorPickerFormat />
                </div>
              </ColorPicker>
            </PopoverContent>
          </Popover>
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
