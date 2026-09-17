import {
  Aperture,
  Blend,
  Clock,
  Columns2,
  FlipHorizontal,
  MoveRight,
  Scissors,
  ZoomIn,
  type LucideIcon,
} from "lucide-react";
import type {
  Scene,
  TransitionDirection,
  TransitionType,
} from "@video/schema/scene-schema";
import { FPS } from "@video/video-config";

export const typeLabels: Record<Scene["type"], string> = {
  canvas: "Canvas",
  avatar: "Avatar",
  video: "Video",
  image: "Imagen",
};

export const transitionLabels: Record<TransitionType, string> = {
  none: "Corte directo",
  zoom: "Zoom",
  fade: "Fundido",
  slide: "Deslizar",
  wipe: "Barrido",
  flip: "Voltear",
  "clock-wipe": "Reloj",
  iris: "Iris",
};

// Shown wherever a transition is named — the list of effects and the chip
// between two scenes — so the same effect is recognisable in both.
export const transitionIcons: Record<TransitionType, LucideIcon> = {
  none: Scissors,
  zoom: ZoomIn,
  fade: Blend,
  slide: MoveRight,
  wipe: Columns2,
  flip: FlipHorizontal,
  "clock-wipe": Clock,
  iris: Aperture,
};

export const transitionDirectionLabels: Record<TransitionDirection, string> = {
  "from-left": "Izquierda",
  "from-right": "Derecha",
  "from-top": "Arriba",
  "from-bottom": "Abajo",
};

// The rest of the presentations ignore the direction, so the field only shows
// up for these three.
export const directionalTransitions: TransitionType[] = [
  "slide",
  "wipe",
  "flip",
];

export const formatTransitionDuration = (seconds: number) =>
  `${seconds.toFixed(1)} s`;

export const formatDuration = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};

// Layers fade in staggered by index. Thumbnails and the editing canvas both
// show a frame where every animation has already settled.
export const settledFrame = (scene: Scene) => {
  const layerCount = scene.type === "canvas" ? scene.layers.length : 1;
  const lastStart = (layerCount - 1) * 4;
  const maxFrame = Math.round(scene.durationInSeconds * FPS) - 1;
  return Math.min(lastStart + 20, Math.max(0, maxFrame));
};
