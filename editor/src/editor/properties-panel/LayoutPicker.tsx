import { useEffect, useMemo, useRef, useState } from "react";
import type {
  CanvasLayer,
  CanvasLayout,
} from "@video/schema/scene-schema";
import {
  canvasLayoutLabels,
  canvasTemplates,
} from "@video/theme/canvas-templates";
import {
  AlignLeft,
  Bookmark,
  Check,
  ChevronsUpDown,
  Columns2,
  Heading,
  Lightbulb,
  ListChecks,
  ListOrdered,
  PanelsTopLeft,
  Presentation,
  Quote,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type LayoutMeta = {
  icon: React.ComponentType<{ className?: string }>;
  hint: string;
  keywords: string;
};

const layoutMeta: Record<CanvasLayout, LayoutMeta> = {
  portada: {
    icon: Presentation,
    hint: "Abre el video con título e imagen",
    keywords: "inicio intro cover apertura",
  },
  "texto-imagen": {
    icon: PanelsTopLeft,
    hint: "Texto a un lado, imagen al otro",
    keywords: "split foto media",
  },
  "dato-clave": {
    icon: Lightbulb,
    hint: "Una cifra grande con su etiqueta",
    keywords: "numero metrica stat kpi",
  },
  cita: {
    icon: Quote,
    hint: "Testimonio con autor",
    keywords: "testimonio frase autor",
  },
  "una-columna": {
    icon: AlignLeft,
    hint: "Bloque de texto centrado",
    keywords: "texto parrafo simple",
  },
  "dos-columnas": {
    icon: Columns2,
    hint: "Compara dos ideas lado a lado",
    keywords: "comparar antes despues",
  },
  "lista-ordenada": {
    icon: ListOrdered,
    hint: "Pasos numerados",
    keywords: "pasos numerada proceso",
  },
  "agenda-indice": {
    icon: ListChecks,
    hint: "Temario de lo que viene",
    keywords: "temario contenido indice",
  },
  "divisor-seccion": {
    icon: Bookmark,
    hint: "Marca el cambio de capítulo",
    keywords: "separador capitulo transicion",
  },
  afirmacion: {
    icon: Heading,
    hint: "Una frase que ocupa la pantalla",
    keywords: "statement impacto frase",
  },
};

const layoutGroups: { label: string; layouts: CanvasLayout[] }[] = [
  { label: "Apertura y transición", layouts: ["portada", "divisor-seccion"] },
  {
    label: "Contenido",
    layouts: [
      "texto-imagen",
      "una-columna",
      "dos-columnas",
      "lista-ordenada",
      "agenda-indice",
    ],
  },
  { label: "Énfasis", layouts: ["dato-clave", "cita", "afirmacion"] },
];

type Box = { x: number; y: number; w: number; h: number };
type Mark = Box & { className: string; rx: number };

// Evenly stacked bars, used wherever a layer holds running text.
const stack = (
  box: Box,
  count: number,
  className: string,
  widths: number[],
): Mark[] => {
  const gap = 2.5;
  const h = Math.max(2.5, Math.min(5, (box.h - gap * (count - 1)) / count));
  const top = box.y + (box.h - (h * count + gap * (count - 1))) / 2;

  return Array.from({ length: count }, (_, i) => ({
    x: box.x,
    y: top + i * (h + gap),
    w: box.w * (widths[i] ?? 1),
    h,
    rx: 1.5,
    className,
  }));
};

const bar = (box: Box, h: number, w: number, className: string): Mark => ({
  x: box.x,
  y: box.y,
  w: box.w * w,
  h: Math.min(box.h, h),
  rx: 1.5,
  className,
});

// Each layer becomes the marks that read like the thing it renders: a title
// is one heavy bar, body copy is two thin ones, an image is a solid block.
const layerMarks = (layer: CanvasLayer, box: Box): Mark[] => {
  switch (layer.type) {
    case "text":
      switch (layer.variant) {
        case "eyebrow":
          return [bar(box, 3, 0.5, "fill-primary/60")];
        case "title":
        case "statement":
          return [bar(box, 9, 1, "fill-foreground/55")];
        case "subtitle":
          return [bar(box, 6, 0.85, "fill-foreground/45")];
        default:
          return stack(box, 2, "fill-foreground/25", [1, 0.8]);
      }
    case "image":
      return [{ ...box, rx: 3, className: "fill-foreground/20" }];
    case "shape":
      return [{ ...box, rx: 3, className: "fill-primary/15" }];
    case "badge":
      return [bar(box, 7, Math.min(1, 26 / box.w), "fill-foreground/30")];
    case "list":
      return stack(box, 3, "fill-foreground/30", [1, 0.9, 0.7]);
    case "quote":
      return stack(box, 3, "fill-primary/45", [1, 0.95, 0.6]);
    case "stat":
      return [
        bar(box, 16, 0.7, "fill-primary/70"),
        bar({ ...box, y: box.y + 19 }, 3, 0.45, "fill-foreground/30"),
      ];
    default:
      return [];
  }
};

// The wireframe is derived from the real template, so it can never drift
// from what picking the layout actually produces.
const LayoutThumb: React.FC<{ layout: CanvasLayout; className?: string }> = ({
  layout,
  className,
}) => (
  <svg
    viewBox="0 0 160 90"
    className={cn("h-full w-full", className)}
    aria-hidden
  >
    <rect width="160" height="90" rx="5" className="fill-muted" />
    {canvasTemplates[layout].layers.flatMap((layer) => {
      const box = {
        x: (layer.x / 100) * 160,
        y: (layer.y / 100) * 90,
        w: Math.max((layer.w / 100) * 160, 3),
        h: Math.max((layer.h / 100) * 90, 3),
      };
      const rotation = layer.rotation
        ? `rotate(${layer.rotation} ${box.x + box.w / 2} ${box.y + box.h / 2})`
        : undefined;

      return layerMarks(layer, box).map((mark, i) => (
        <rect
          key={`${layer.id}-${i}`}
          x={mark.x}
          y={mark.y}
          width={mark.w}
          height={mark.h}
          rx={mark.rx}
          className={mark.className}
          transform={rotation}
        />
      ));
    })}
  </svg>
);

const matches = (layout: CanvasLayout, query: string) => {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return `${canvasLayoutLabels[layout]} ${layoutMeta[layout].hint} ${layoutMeta[layout].keywords}`
    .toLowerCase()
    .includes(q);
};

type Props = {
  value: CanvasLayout;
  onChange: (layout: CanvasLayout) => void;
};

export const LayoutPicker: React.FC<Props> = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const gridRef = useRef<HTMLDivElement>(null);
  const CurrentIcon = layoutMeta[value].icon;

  const groups = useMemo(
    () =>
      layoutGroups
        .map((g) => ({
          ...g,
          layouts: g.layouts.filter((l) => matches(l, query)),
        }))
        .filter((g) => g.layouts.length > 0),
    [query],
  );

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  // Arrow keys walk the cards from the search field, two per row.
  const moveFocus = (step: number) => {
    const options = Array.from(
      gridRef.current?.querySelectorAll<HTMLButtonElement>("[data-layout]") ??
        [],
    );
    if (options.length === 0) return;
    const current = options.findIndex((el) => el === document.activeElement);
    const next = current === -1 ? 0 : current + step;
    options[Math.min(Math.max(next, 0), options.length - 1)]?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    // Left/right belong to the caret while the search field has focus.
    const inSearch = e.target instanceof HTMLInputElement;
    if (inSearch && (e.key === "ArrowLeft" || e.key === "ArrowRight")) return;

    const step =
      e.key === "ArrowDown"
        ? 2
        : e.key === "ArrowUp"
          ? -2
          : e.key === "ArrowRight"
            ? 1
            : e.key === "ArrowLeft"
              ? -1
              : 0;
    if (step === 0) return;
    e.preventDefault();
    moveFocus(step);
  };

  return (
    <Field>
      <FieldLabel className="text-xs text-muted-foreground">Plantilla</FieldLabel>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="h-auto w-full justify-start gap-2.5 whitespace-normal p-1.5"
          >
            <span className="h-8 w-14 shrink-0 overflow-hidden rounded-md ring-1 ring-foreground/10">
              <LayoutThumb layout={value} />
            </span>
            <span className="min-w-0 flex-1 text-left">
              <span className="flex items-center gap-1.5 text-sm font-medium">
                <CurrentIcon className="size-3.5 text-muted-foreground" />
                <span className="truncate">{canvasLayoutLabels[value]}</span>
              </span>
              <span className="block truncate text-xs font-normal text-muted-foreground">
                {layoutMeta[value].hint}
              </span>
            </span>
            <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align="end"
          collisionPadding={12}
          className="w-(--radix-popover-trigger-width) min-w-80 p-0"
          onKeyDown={onKeyDown}
        >
          <InputGroup className="h-auto rounded-none border-0 border-b">
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
            <InputGroupInput
              autoFocus
              value={query}
              placeholder="Buscar plantilla…"
              onChange={(e) => setQuery(e.target.value)}
            />
          </InputGroup>

          <div
            ref={gridRef}
            className="max-h-80 space-y-3 overflow-y-auto p-2"
            role="listbox"
          >
            {groups.map((group) => (
              <div key={group.label} className="space-y-1.5">
                <p className="px-0.5 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                  {group.label}
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {group.layouts.map((layout) => {
                    const Icon = layoutMeta[layout].icon;
                    const selected = layout === value;

                    return (
                      <Button
                        key={layout}
                        type="button"
                        variant="ghost"
                        data-layout={layout}
                        role="option"
                        aria-selected={selected}
                        title={layoutMeta[layout].hint}
                        onClick={() => {
                          onChange(layout);
                          setOpen(false);
                        }}
                        className={cn(
                          "group relative h-auto flex-col items-stretch gap-1.5 whitespace-normal rounded-lg p-1.5 text-left",
                          selected
                            ? "border border-primary/60 bg-primary/5"
                            : "border border-transparent",
                        )}
                      >
                        <span className="block aspect-video overflow-hidden rounded-md ring-1 ring-foreground/10">
                          <LayoutThumb layout={layout} />
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Icon className="size-3.5 shrink-0 text-muted-foreground" />
                          <span className="truncate text-xs font-medium">
                            {canvasLayoutLabels[layout]}
                          </span>
                        </span>
                        {selected && (
                          <span className="absolute top-2.5 right-2.5 flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                            <Check className="size-3" />
                          </span>
                        )}
                      </Button>
                    );
                  })}
                </div>
              </div>
            ))}

            {groups.length === 0 && (
              <p className="px-1 py-6 text-center text-xs text-muted-foreground">
                Ninguna plantilla coincide con “{query}”.
              </p>
            )}
          </div>

          <div className="border-t px-2.5 py-1.5 text-[11px] text-muted-foreground">
            Cambiar de plantilla reemplaza las capas de la escena.
          </div>
        </PopoverContent>
      </Popover>
    </Field>
  );
};
