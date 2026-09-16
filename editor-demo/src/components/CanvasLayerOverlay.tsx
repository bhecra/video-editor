import { useEffect, useRef } from "react";
import type {
  CanvasLayer,
  CanvasScene,
} from "../../../src/scene-editor/scene-schema";
import { cn } from "../lib/utils";

type Props = {
  scene: CanvasScene;
  selectedLayerId: string | null;
  onSelectLayer: (id: string | null) => void;
  onUpdateLayer: (id: string, patch: Partial<CanvasLayer>) => void;
  onDeleteLayer: (id: string) => void;
};

// Same clamps the UBITS slide player uses: layers may hang slightly off-canvas.
const clampPos = (v: number) => Math.max(-10, Math.min(95, v));
const clampSize = (v: number) => Math.max(6, Math.min(110, v));
const DRAG_THRESHOLD_SQ = 25;

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
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);

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
      onSelectLayer(layer.id);

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

  return (
    <div ref={wrapperRef} className="pointer-events-none absolute inset-0 z-10">
      {/* Click-to-deselect surface. Stops short of the player controls. */}
      <div
        onPointerDown={() => onSelectLayer(null)}
        className="pointer-events-auto absolute inset-x-0 top-0 bottom-14"
      />
      {scene.layers.map((layer) => {
        const isSelected = layer.id === selectedLayerId;
        return (
          <div
            key={layer.id}
            onPointerDown={startInteraction(layer, "move")}
            className={cn(
              "pointer-events-auto absolute cursor-move rounded-sm border transition-colors",
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
                <span className="absolute -top-6 left-0 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap text-primary-foreground">
                  {layerLabels[layer.type]}
                </span>
                <span
                  onPointerDown={startInteraction(layer, "resize")}
                  className="absolute -right-1.5 -bottom-1.5 size-3 cursor-nwse-resize rounded-full border-2 border-background bg-primary"
                />
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};
