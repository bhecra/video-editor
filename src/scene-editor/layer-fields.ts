import type { CanvasLayer } from "./scene-schema";

const ITEMS_PREFIX = "items.";

export const getLayerField = (layer: CanvasLayer, field: string): string => {
  if (field.startsWith(ITEMS_PREFIX)) {
    if (layer.type !== "list") return "";
    return layer.items[Number(field.slice(ITEMS_PREFIX.length))] ?? "";
  }
  const value = (layer as unknown as Record<string, unknown>)[field];
  return typeof value === "string" ? value : "";
};

export const setLayerField = (
  layer: CanvasLayer,
  field: string,
  value: string,
): CanvasLayer => {
  if (field.startsWith(ITEMS_PREFIX)) {
    if (layer.type !== "list") return layer;
    const index = Number(field.slice(ITEMS_PREFIX.length));
    const items = [...layer.items];
    items[index] = value;
    return { ...layer, items };
  }
  return { ...layer, [field]: value } as CanvasLayer;
};
