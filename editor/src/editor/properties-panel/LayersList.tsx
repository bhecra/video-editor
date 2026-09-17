import { useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ChevronsDown,
  ChevronsUp,
  GripVertical,
  Hash,
  Image as ImageIcon,
  List as ListIcon,
  MoreVertical,
  Plus,
  Quote as QuoteIcon,
  Square,
  Tag,
  Trash2,
  Type,
} from "lucide-react";
import type { CanvasLayer } from "@video/schema/scene-schema";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { cn } from "@/lib/utils";

type Props = {
  layers: CanvasLayer[];
  selectedLayerId: string | null;
  onSelectLayer: (id: string) => void;
  onDeleteLayer: (id: string) => void;
  onAddLayer: (type: CanvasLayer["type"]) => void;
  /** Target is an index into the layers array (0 = back, last = front). */
  onReorderLayer: (id: string, toIndex: number) => void;
};

const layerTypeLabels: Record<CanvasLayer["type"], string> = {
  text: "Texto",
  image: "Imagen",
  shape: "Forma",
  badge: "Badge",
  list: "Lista",
  stat: "Dato clave",
  quote: "Cita",
};

const layerIcons: Record<CanvasLayer["type"], React.ElementType> = {
  text: Type,
  image: ImageIcon,
  shape: Square,
  badge: Tag,
  list: ListIcon,
  stat: Hash,
  quote: QuoteIcon,
};

const addableTypes: CanvasLayer["type"][] = [
  "text",
  "image",
  "shape",
  "badge",
  "list",
  "stat",
  "quote",
];

const layerPreview = (layer: CanvasLayer) => {
  switch (layer.type) {
    case "text":
      return layer.text;
    case "badge":
      return layer.title;
    case "list":
      return layer.items[0];
    case "stat":
      return layer.value;
    case "quote":
      return layer.quote;
    case "image":
      return layer.src.startsWith("data:")
        ? "archivo subido"
        : layer.src.split("/").pop();
    default:
      return null;
  }
};

export const LayersList: React.FC<Props> = ({
  layers,
  selectedLayerId,
  onSelectLayer,
  onDeleteLayer,
  onAddLayer,
  onReorderLayer,
}) => {
  const listRef = useRef<HTMLDivElement>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  // Shown front-most first, the way design tools and PowerPoint do it.
  const displayed = [...layers].reverse();
  const arrayIndexOf = (id: string) => layers.findIndex((l) => l.id === id);

  // Pointer-based reordering: HTML5 drag-and-drop is inconsistent across
  // browsers and impossible to drive from automated tests.
  const startReorder = (layerId: string) => (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggingId(layerId);

    const rowAt = (clientY: number) => {
      const rows = [...(listRef.current?.children ?? [])] as HTMLElement[];
      for (let i = 0; i < rows.length; i++) {
        const r = rows[i].getBoundingClientRect();
        if (clientY < r.bottom) return i;
      }
      return rows.length - 1;
    };

    const onMove = (ev: PointerEvent) => setDropIndex(rowAt(ev.clientY));

    const onUp = (ev: PointerEvent) => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      const displayIndex = rowAt(ev.clientY);
      // Display is reversed, so display index N maps to array index len-1-N.
      onReorderLayer(layerId, layers.length - 1 - displayIndex);
      setDraggingId(null);
      setDropIndex(null);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Capas ({layers.length})
        </h3>
        <span className="text-[10px] text-muted-foreground">
          arrastra para reordenar
        </span>
      </div>

      <ItemGroup ref={listRef} className="gap-0.5">
        {displayed.map((layer, displayIndex) => {
          const Icon = layerIcons[layer.type];
          const isSelected = layer.id === selectedLayerId;
          const index = arrayIndexOf(layer.id);
          const preview = layerPreview(layer);

          return (
            <Item
              key={layer.id}
              size="xs"
              variant={isSelected ? "muted" : "default"}
              onClick={() => onSelectLayer(layer.id)}
              className={cn(
                "cursor-pointer py-1.5",
                isSelected && "border-primary bg-primary/5",
                draggingId === layer.id && "opacity-40",
                draggingId &&
                  draggingId !== layer.id &&
                  dropIndex === displayIndex &&
                  "border-primary border-dashed",
              )}
            >
              <ItemMedia>
                <GripVertical
                  onPointerDown={startReorder(layer.id)}
                  className="size-3.5 shrink-0 cursor-grab text-muted-foreground active:cursor-grabbing"
                />
              </ItemMedia>
              <ItemMedia variant="icon">
                <Icon className="text-muted-foreground" />
              </ItemMedia>
              <ItemContent className="min-w-0">
                <ItemTitle className="max-w-full truncate text-xs">
                  {layerTypeLabels[layer.type]}
                  {preview && (
                    <span className="ml-1 font-normal text-muted-foreground">
                      · {preview}
                    </span>
                  )}
                </ItemTitle>
              </ItemContent>

              <ItemActions>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="icon-xs"
                    variant="ghost"
                    aria-label="Acciones de capa"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    disabled={index === layers.length - 1}
                    onClick={() => onReorderLayer(layer.id, layers.length - 1)}
                  >
                    <ChevronsUp />
                    Traer al frente
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    disabled={index === layers.length - 1}
                    onClick={() => onReorderLayer(layer.id, index + 1)}
                  >
                    <ArrowUp />
                    Subir una
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    disabled={index === 0}
                    onClick={() => onReorderLayer(layer.id, index - 1)}
                  >
                    <ArrowDown />
                    Bajar una
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    disabled={index === 0}
                    onClick={() => onReorderLayer(layer.id, 0)}
                  >
                    <ChevronsDown />
                    Enviar al fondo
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => onDeleteLayer(layer.id)}
                  >
                    <Trash2 />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              </ItemActions>
            </Item>
          );
        })}
      </ItemGroup>

      <Separator />

      <div className="flex flex-wrap gap-1 pt-1">
        {addableTypes.map((t) => {
          const Icon = layerIcons[t];
          return (
            <Tooltip key={t}>
              <TooltipTrigger asChild>
                <Button size="xs" variant="outline" onClick={() => onAddLayer(t)}>
                  <Plus />
                  <Icon />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Agregar {layerTypeLabels[t]}</TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
};
