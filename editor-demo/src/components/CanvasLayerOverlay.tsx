import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ChevronsDown,
  ChevronsUp,
  ImageUp,
  Pencil,
  Trash2,
} from "lucide-react";
import type {
  CanvasLayer,
  CanvasScene,
} from "../../../src/scene-editor/scene-schema";
import { InlineFieldEditor } from "./InlineFieldEditor";
import { setLayerField } from "../../../src/scene-editor/layer-fields";
import { Badge } from "./ui/badge";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "./ui/context-menu";
import { cn } from "../lib/utils";

type Props = {
  scene: CanvasScene;
  selectedLayerId: string | null;
  onSelectLayer: (id: string | null) => void;
  onUpdateLayer: (id: string, patch: Partial<CanvasLayer>) => void;
  onDeleteLayer: (id: string) => void;
  onReorderLayer: (id: string, toIndex: number) => void;
};

// Same clamps the UBITS slide player uses: layers may hang slightly off-canvas.
const clampPos = (v: number) => Math.max(-10, Math.min(95, v));
const clampSize = (v: number) => Math.max(6, Math.min(110, v));
const DRAG_THRESHOLD_SQ = 25;

// Layer types that expose editable text through data-field markers.
const EDITABLE_TYPES: CanvasLayer["type"][] = [
  "text",
  "badge",
  "list",
  "stat",
  "quote",
];

const layerLabels: Record<CanvasLayer["type"], string> = {
  text: "Texto",
  image: "Imagen",
  shape: "Forma",
  badge: "Badge",
  list: "Lista",
  stat: "Dato",
  quote: "Cita",
};

export const CanvasLayerOverlay: React.FC<Props> = ({
  scene,
  selectedLayerId,
  onSelectLayer,
  onUpdateLayer,
  onDeleteLayer,
  onReorderLayer,
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingLayerId, setEditingLayerId] = useState<string | null>(null);
  const [imageLayerId, setImageLayerId] = useState<string | null>(null);

  const pickImageFor = (layerId: string) => {
    setImageLayerId(layerId);
    fileInputRef.current?.click();
  };

  const onImagePicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !imageLayerId || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      onUpdateLayer(imageLayerId, { src: String(reader.result) });
      setImageLayerId(null);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (editingLayerId && editingLayerId !== selectedLayerId) {
      setEditingLayerId(null);
    }
  }, [selectedLayerId, editingLayerId]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Delete" && e.key !== "Backspace") return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.isContentEditable ||
          ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
      ) {
        return;
      }
      if (!selectedLayerId) return;
      e.preventDefault();
      onDeleteLayer(selectedLayerId);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedLayerId, onDeleteLayer]);

  const startInteraction =
    (layer: CanvasLayer, mode: "move" | "resize") =>
    (e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // Second click on an already-selected layer edits it in place.
      if (mode === "move" && layer.id === selectedLayerId) {
        if (layer.type === "image") {
          pickImageFor(layer.id);
          return;
        }
        if (EDITABLE_TYPES.includes(layer.type)) {
          setEditingLayerId(layer.id);
          return;
        }
      }

      onSelectLayer(layer.id);

      // Capture keeps the drag (and the cursor) attached to this layer even if
      // the pointer runs past its edges. It throws when the pointer is already
      // gone, which must never take the drag down with it.
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // Non-fatal: dragging still works through the window listeners below.
      }

      const startX = e.clientX;
      const startY = e.clientY;
      const origin = { x: layer.x, y: layer.y, w: layer.w, h: layer.h };
      let dragging = mode === "resize";

      const onMove = (ev: PointerEvent) => {
        const rect = wrapperRef.current?.getBoundingClientRect();
        if (!rect) return;
        const dxPx = ev.clientX - startX;
        const dyPx = ev.clientY - startY;

        if (!dragging) {
          if (dxPx * dxPx + dyPx * dyPx < DRAG_THRESHOLD_SQ) return;
          dragging = true;
        }

        const dx = (dxPx / rect.width) * 100;
        const dy = (dyPx / rect.height) * 100;

        if (mode === "resize") {
          onUpdateLayer(layer.id, {
            w: clampSize(origin.w + dx),
            h: clampSize(origin.h + dy),
          });
        } else {
          onUpdateLayer(layer.id, {
            x: clampPos(origin.x + dx),
            y: clampPos(origin.y + dy),
          });
        }
      };

      const onUp = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    };

  const editingLayer = scene.layers.find((l) => l.id === editingLayerId);

  return (
    <div ref={wrapperRef} className="pointer-events-none absolute inset-0 z-10">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={onImagePicked}
      />
      {/* Click-to-deselect surface. */}
      <div
        onPointerDown={() => {
          onSelectLayer(null);
          setEditingLayerId(null);
        }}
        className="pointer-events-auto absolute inset-0"
      />

      {scene.layers.map((layer, index) => {
        const isSelected = layer.id === selectedLayerId;
        if (layer.id === editingLayerId) return null;
        return (
          <ContextMenu key={layer.id}>
            <ContextMenuTrigger asChild>
              <div
                onPointerDown={startInteraction(layer, "move")}
                onContextMenu={() => onSelectLayer(layer.id)}
                className={cn(
                  "pointer-events-auto absolute rounded-sm border transition-colors",
                  // First hover always offers to move it. Only once selected
                  // does the cursor hint at what a second click does.
                  !isSelected
                    ? "cursor-move"
                    : EDITABLE_TYPES.includes(layer.type)
                      ? "cursor-text"
                      : layer.type === "image"
                        ? "cursor-pointer"
                        : "cursor-move",
                  isSelected
                    ? "border-primary bg-primary/10 ring-2 ring-primary/40"
                    : "border-transparent hover:border-primary/50 hover:bg-primary/5",
                )}
                style={{
                  left: `${layer.x}%`,
                  top: `${layer.y}%`,
                  width: `${layer.w}%`,
                  height: `${layer.h}%`,
                  rotate: layer.rotation ? `${layer.rotation}deg` : undefined,
                }}
              >
                {isSelected && (
                  <>
                    <Badge className="absolute -top-6 left-0 whitespace-nowrap">
                      {layerLabels[layer.type]}
                      {EDITABLE_TYPES.includes(layer.type) &&
                        " · clic para editar"}
                      {layer.type === "image" && " · clic para reemplazar"}
                    </Badge>
                    <span
                      onPointerDown={startInteraction(layer, "resize")}
                      className="absolute -right-1.5 -bottom-1.5 size-3 cursor-nwse-resize rounded-full border-2 border-background bg-primary"
                    />
                  </>
                )}
              </div>
            </ContextMenuTrigger>
            <ContextMenuContent>
              {EDITABLE_TYPES.includes(layer.type) && (
                <>
                  <ContextMenuItem onClick={() => setEditingLayerId(layer.id)}>
                    <Pencil />
                    Editar texto
                  </ContextMenuItem>
                  <ContextMenuSeparator />
                </>
              )}
              {layer.type === "image" && (
                <>
                  <ContextMenuItem onClick={() => pickImageFor(layer.id)}>
                    <ImageUp />
                    Reemplazar imagen
                  </ContextMenuItem>
                  <ContextMenuSeparator />
                </>
              )}
              <ContextMenuItem
                disabled={index === scene.layers.length - 1}
                onClick={() =>
                  onReorderLayer(layer.id, scene.layers.length - 1)
                }
              >
                <ChevronsUp />
                Traer al frente
              </ContextMenuItem>
              <ContextMenuItem
                disabled={index === scene.layers.length - 1}
                onClick={() => onReorderLayer(layer.id, index + 1)}
              >
                <ArrowUp />
                Subir una
              </ContextMenuItem>
              <ContextMenuItem
                disabled={index === 0}
                onClick={() => onReorderLayer(layer.id, index - 1)}
              >
                <ArrowDown />
                Bajar una
              </ContextMenuItem>
              <ContextMenuItem
                disabled={index === 0}
                onClick={() => onReorderLayer(layer.id, 0)}
              >
                <ChevronsDown />
                Enviar al fondo
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem
                variant="destructive"
                onClick={() => onDeleteLayer(layer.id)}
              >
                <Trash2 />
                Eliminar
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        );
      })}

      {editingLayer && (
        <InlineFieldEditor
          layer={editingLayer}
          container={wrapperRef.current?.parentElement ?? null}
          onChangeField={(field, value) =>
            onUpdateLayer(
              editingLayer.id,
              setLayerField(editingLayer, field, value),
            )
          }
          onFinish={() => setEditingLayerId(null)}
        />
      )}
    </div>
  );
};
