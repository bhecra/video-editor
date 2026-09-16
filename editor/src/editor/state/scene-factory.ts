import type { CanvasLayer, Scene } from "@video/schema/scene-schema";
import {
  canvasTemplates,
  createLayersForLayout,
} from "@video/theme/canvas-templates";

/** Blank layer dropped in the middle of the canvas, ready to be dragged. */
export const createLayer = (type: CanvasLayer["type"]): CanvasLayer => {
  const box = { id: `${type}-${Date.now()}`, x: 30, y: 40, w: 36, h: 18 };
  switch (type) {
    case "text":
      return { ...box, type: "text", variant: "body", text: "Nuevo texto" };
    case "image":
      return {
        ...box,
        type: "image",
        src: "https://picsum.photos/seed/nueva/1200/1200",
        h: 40,
      };
    case "shape":
      return { ...box, type: "shape", fill: "accent" };
    case "badge":
      return {
        ...box,
        type: "badge",
        title: "Badge",
        subtitle: "Subtítulo",
        h: 14,
      };
    case "list":
      return {
        ...box,
        type: "list",
        ordered: true,
        items: ["Primer item", "Segundo item"],
        h: 32,
      };
    case "stat":
      return { ...box, type: "stat", value: "100", label: "Métrica", h: 30 };
    case "quote":
      return {
        ...box,
        type: "quote",
        quote: "Nueva cita",
        author: "Autor",
        h: 30,
      };
  }
};

/** Media scenes start empty: the URL is filled in by uploading a file. */
export const createScene = (type: Scene["type"]): Scene => {
  const id = `scene-${Date.now()}`;
  switch (type) {
    case "canvas":
      return {
        id,
        name: "Nueva escena",
        type: "canvas",
        layout: "una-columna",
        durationInSeconds: 6,
        accentColor: "#1a6bff",
        background: canvasTemplates["una-columna"].background,
        layers: createLayersForLayout("una-columna"),
      };
    case "imagen":
      return {
        id,
        name: "Nueva imagen",
        type: "imagen",
        durationInSeconds: 5,
        imageUrl: "",
      };
    case "video":
      return {
        id,
        name: "Nuevo video",
        type: "video",
        durationInSeconds: 5,
        videoUrl: "",
      };
    case "avatar":
      return {
        id,
        name: "Nuevo avatar",
        type: "avatar",
        durationInSeconds: 5,
        videoUrl: "",
      };
  }
};

// Layer ids have to be regenerated so the copy can be selected independently.
export const duplicateScene = (scene: Scene): Scene => {
  const suffix = Math.random().toString(36).slice(2, 7);
  const copy = {
    ...scene,
    id: `${scene.id}-copy-${suffix}`,
    name: `${scene.name} (copia)`,
  };
  return copy.type === "canvas"
    ? {
        ...copy,
        layers: copy.layers.map((l) => ({ ...l, id: `${l.id}-${suffix}` })),
      }
    : copy;
};
