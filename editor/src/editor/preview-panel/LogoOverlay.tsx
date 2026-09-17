import { useRef } from "react";
import { RotateCcw } from "lucide-react";
import {
  LOGO_SIZE_MAX,
  LOGO_SIZE_MIN,
  type LogoSettings,
} from "@video/schema/scene-schema";
import { logoPlacementStyle } from "@video/theme/canvas-styles";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { readLogoFootprint } from "@/lib/logo-size";

type Props = {
  logo: LogoSettings;
  onChange: (logo: LogoSettings) => void;
};

const handles = ["n", "ne", "e", "se", "s", "sw", "w", "nw"] as const;
type Handle = (typeof handles)[number];

const handleClass: Record<Handle, string> = {
  n: "left-1/2 -top-1 -translate-x-1/2 cursor-ns-resize",
  s: "left-1/2 -bottom-1 -translate-x-1/2 cursor-ns-resize",
  e: "-right-1 top-1/2 -translate-y-1/2 cursor-ew-resize",
  w: "-left-1 top-1/2 -translate-y-1/2 cursor-ew-resize",
  nw: "-left-1 -top-1 cursor-nwse-resize",
  ne: "-right-1 -top-1 cursor-nesw-resize",
  sw: "-left-1 -bottom-1 cursor-nesw-resize",
  se: "-right-1 -bottom-1 cursor-nwse-resize",
};

const clampPos = (v: number) => Math.max(-5, Math.min(95, v));
const clampSize = (v: number) =>
  Math.max(LOGO_SIZE_MIN, Math.min(LOGO_SIZE_MAX, v));

export const LogoOverlay: React.FC<Props> = ({ logo, onChange }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  // Both gestures share the same window listeners; only the math differs.
  const trackPointer = (
    e: React.PointerEvent,
    onDelta: (dxPercent: number, dyPercent: number) => void,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Non-fatal: the window listeners below still drive the gesture.
    }

    const startX = e.clientX;
    const startY = e.clientY;

    const onMove = (ev: PointerEvent) => {
      const rect = wrapperRef.current?.getBoundingClientRect();
      if (!rect) return;
      onDelta(
        ((ev.clientX - startX) / rect.width) * 100,
        ((ev.clientY - startY) / rect.height) * 100,
      );
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  const startDrag = (e: React.PointerEvent) => {
    const origin = { x: logo.x, y: logo.y };
    trackPointer(e, (dx, dy) =>
      onChange({
        ...logo,
        x: clampPos(origin.x + dx),
        y: clampPos(origin.y + dy),
      }),
    );
  };

  const startResize = (handle: Handle) => (e: React.PointerEvent) => {
    const wrapper = wrapperRef.current?.getBoundingClientRect();
    const box = boxRef.current?.getBoundingClientRect();
    if (!wrapper || !box || wrapper.width === 0 || wrapper.height === 0) {
      return;
    }

    const west = handle === "w" || handle === "nw" || handle === "sw";
    const east = handle === "e" || handle === "ne" || handle === "se";
    const north = handle === "n" || handle === "nw" || handle === "ne";
    const south = handle === "s" || handle === "sw" || handle === "se";
    const corner = (east || west) && (north || south);
    const origin = {
      x: logo.x,
      y: logo.y,
      w: logo.w,
      h: logo.h ?? (box.height / wrapper.height) * 100,
    };

    trackPointer(e, (dx, dy) => {
      let w = origin.w;
      let h = origin.h;
      let x = origin.x;
      let y = origin.y;

      if (corner) {
        // Same scale on both % values keeps the visual aspect: w and h are
        // fractions of the canvas, and the canvas ratio does not change.
        const nextW = origin.w + (east ? dx : -dx);
        const nextH = origin.h + (south ? dy : -dy);
        const scaleW = origin.w > 0 ? nextW / origin.w : 1;
        const scaleH = origin.h > 0 ? nextH / origin.h : 1;
        const rawScale =
          Math.abs(scaleW - 1) >= Math.abs(scaleH - 1) ? scaleW : scaleH;
        const minScale = Math.max(
          LOGO_SIZE_MIN / origin.w,
          LOGO_SIZE_MIN / origin.h,
        );
        const maxScale = Math.min(
          LOGO_SIZE_MAX / origin.w,
          LOGO_SIZE_MAX / origin.h,
        );
        const scale = Math.max(minScale, Math.min(maxScale, rawScale));
        w = origin.w * scale;
        h = origin.h * scale;
        if (west) x = clampPos(origin.x + (origin.w - w));
        if (north) y = clampPos(origin.y + (origin.h - h));
      } else {
        if (east) w = clampSize(origin.w + dx);
        if (west) {
          w = clampSize(origin.w - dx);
          x = clampPos(origin.x + (origin.w - w));
        }
        if (south) h = clampSize(origin.h + dy);
        if (north) {
          h = clampSize(origin.h - dy);
          y = clampPos(origin.y + (origin.h - h));
        }
      }

      onChange({ ...logo, x, y, w, h });
    });
  };

  const resetSize = (e: React.PointerEvent) => {
    e.stopPropagation();
  };

  const applyOriginalSize = (e: React.MouseEvent) => {
    e.stopPropagation();
    readLogoFootprint(logo.src, (size) => onChange({ ...logo, ...size }));
  };

  const sizeLabel =
    logo.h != null
      ? `${Math.round(logo.w)}% × ${Math.round(logo.h)}%`
      : `${Math.round(logo.w)}%`;

  return (
    <div ref={wrapperRef} className="pointer-events-none absolute inset-0 z-20">
      <div
        ref={boxRef}
        onPointerDown={startDrag}
        className="group pointer-events-auto absolute cursor-move rounded-sm ring-2 ring-primary/0 transition-[--tw-ring-color] hover:ring-primary/60"
        style={logoPlacementStyle(logo)}
      >
        <div className="absolute -top-6 left-0 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <Badge variant="outline" className="bg-background">
            Logo {sizeLabel}
          </Badge>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon-xs"
                variant="outline"
                aria-label="Restablecer tamaño original"
                onPointerDown={resetSize}
                onClick={applyOriginalSize}
                className="bg-background"
              >
                <RotateCcw />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Tamaño original</TooltipContent>
          </Tooltip>
        </div>
        {/* Fills the footprint so the drag target matches the rendered box. */}
        <img
          src={logo.src}
          alt=""
          draggable={false}
          className={
            logo.h != null
              ? "size-full object-fill opacity-0"
              : "w-full object-contain opacity-0"
          }
        />
        {handles.map((handle) => (
          <div
            key={handle}
            onPointerDown={startResize(handle)}
            aria-label={
              handle === "n" || handle === "s"
                ? `Cambiar alto del logo (${handle})`
                : handle === "e" || handle === "w"
                  ? `Cambiar ancho del logo (${handle})`
                  : `Escalar logo en proporción (${handle})`
            }
            className={`absolute size-2.5 rounded-full border border-background bg-primary opacity-0 transition-opacity group-hover:opacity-100 ${handleClass[handle]}`}
          />
        ))}
      </div>
    </div>
  );
};
