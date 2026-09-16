import type { Scene } from "@video/schema/scene-schema";
import { FPS } from "@video/video-config";

export const typeLabels: Record<Scene["type"], string> = {
  canvas: "Canvas",
  avatar: "Avatar",
  video: "Video",
  image: "Imagen",
};

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
