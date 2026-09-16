import { useRef } from "react";
import type { LogoSettings } from "../../../src/scene-editor/scene-schema";
import { Badge } from "./ui/badge";

type Props = {
  logo: LogoSettings;
  onChange: (logo: LogoSettings) => void;
};

const clampPos = (v: number) => Math.max(-5, Math.min(95, v));

export const LogoOverlay: React.FC<Props> = ({ logo, onChange }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);

  const startDrag = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Non-fatal: the window listeners below still drive the drag.
    }

    const startX = e.clientX;
    const startY = e.clientY;
    const origin = { x: logo.x, y: logo.y };

    const onMove = (ev: PointerEvent) => {
      const rect = wrapperRef.current?.getBoundingClientRect();
      if (!rect) return;
      onChange({
        ...logo,
        x: clampPos(origin.x + ((ev.clientX - startX) / rect.width) * 100),
        y: clampPos(origin.y + ((ev.clientY - startY) / rect.height) * 100),
      });
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  return (
    <div ref={wrapperRef} className="pointer-events-none absolute inset-0 z-20">
      <div
        onPointerDown={startDrag}
        className="group pointer-events-auto absolute cursor-move rounded-sm ring-2 ring-primary/0 transition-[--tw-ring-color] hover:ring-primary/60"
        style={{
          left: `${logo.x}%`,
          top: `${logo.y}%`,
          width: `${logo.w}%`,
        }}
      >
        <Badge className="absolute -top-6 left-0 opacity-0 transition-opacity group-hover:opacity-100">
          Logo
        </Badge>
        {/* Mirrors the rendered logo so the drag target matches what you see. */}
        <img
          src={logo.src}
          alt=""
          draggable={false}
          className="w-full object-contain opacity-0"
        />
      </div>
    </div>
  );
};
