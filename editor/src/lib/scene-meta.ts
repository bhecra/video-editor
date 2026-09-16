import type { Scene } from "@video/schema/scene-schema";

export const typeLabels: Record<Scene["type"], string> = {
  canvas: "Canvas",
  avatar: "Avatar",
  video: "Video",
  imagen: "Imagen",
};

export const formatDuration = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};
