import { useRef } from "react";
import type { LogoSettings } from "@video/schema/scene-schema";
import { Badge } from "@/components/ui/badge";

type Props = {
  logo: LogoSettings;
  onChange: (logo: LogoSettings) => void;
};

// Corners double as resize grips; each one keeps the opposite corner pinned.
const corners = ["nw", "ne", "sw", "se"] as const;
type Corner = (typeof corners)[number];

const handleClass: Record<Corner, string> = {
  nw: "-left-1 -top-1 cursor-nwse-resize",
  ne: "-right-1 -top-1 cursor-nesw-resize",
  sw: "-left-1 -bottom-1 cursor-nesw-resize",
  se: "-right-1 -bottom-1 cursor-nwse-resize",
};

const clampPos = (v: number) => Math.max(-5, Math.min(95, v));
// Matches the size slider in the settings dialog, so both stay in step.
const clampWidth = (v: number) => Math.max(4, Math.min(40, v));

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

  const startResize = (corner: Corner) => (e: React.PointerEvent) => {
    const wrapper = wrapperRef.current?.getBoundingClientRect();
    const box = boxRef.current?.getBoundingClientRect();
    if (!wrapper || !box || box.width === 0) return;

    const origin = { x: logo.x, y: logo.y, w: logo.w };
    // The logo keeps its aspect ratio, so height follows from the width.
    const heightPerWidth =
      (box.height / box.width) * (wrapper.width / wrapper.height);
    const startH = origin.w * heightPerWidth;
    const west = corner === "nw" || corner === "sw";
    const north = corner === "nw" || corner === "ne";

    trackPointer(e, (dx) => {
      const w = clampWidth(origin.w + (west ? -dx : dx));
      onChange({
        ...logo,
        w,
        // Pin the corner opposite the grip.
        x: west ? clampPos(origin.x + (origin.w - w)) : origin.x,
        y: north
          ? clampPos(origin.y + (startH - w * heightPerWidth))
          : origin.y,
      });
    });
  };

  return (
    <div ref={wrapperRef} className="pointer-events-none absolute inset-0 z-20">
      <div
        ref={boxRef}
        onPointerDown={startDrag}
        className="group pointer-events-auto absolute cursor-move rounded-sm ring-2 ring-primary/0 transition-[--tw-ring-color] hover:ring-primary/60"
        style={{
          left: `${logo.x}%`,
          top: `${logo.y}%`,
          width: `${logo.w}%`,
        }}
      >
        <Badge
          variant="outline"
          className="absolute -top-6 left-0 bg-background opacity-0 transition-opacity group-hover:opacity-100"
        >
          Logo {Math.round(logo.w)}%
        </Badge>
        {/* Mirrors the rendered logo so the drag target matches what you see. */}
        <img
          src={logo.src}
          alt=""
          draggable={false}
          className="w-full object-contain opacity-0"
        />
        {corners.map((corner) => (
          <div
            key={corner}
            onPointerDown={startResize(corner)}
            aria-label={`Escalar logo (${corner})`}
            className={`absolute size-2.5 rounded-full border border-background bg-primary opacity-0 transition-opacity group-hover:opacity-100 ${handleClass[corner]}`}
          />
        ))}
      </div>
    </div>
  );
};
