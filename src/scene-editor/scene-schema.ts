import { z } from "zod";
import { zColor } from "@remotion/zod-types";

const baseSceneFields = {
  id: z.string(),
  name: z.string(),
  durationInSeconds: z.number().min(1),
  audioUrl: z.string().optional(),
  audioVolume: z.number().min(0).max(1).optional(),
  // Narration text. Shown as a subtitle when the setting is on.
  script: z.string().optional(),
};

export const canvasLayouts = [
  "portada",
  "texto-imagen",
  "dato-clave",
  "cita",
  "una-columna",
  "dos-columnas",
  "lista-ordenada",
  "agenda-indice",
  "divisor-seccion",
  "afirmacion",
] as const;

export type CanvasLayout = (typeof canvasLayouts)[number];

// Every layer is positioned in % of the slide, like a PowerPoint text box.
const layerBox = {
  id: z.string(),
  x: z.number(),
  y: z.number(),
  w: z.number(),
  h: z.number(),
  rotation: z.number().optional(),
};

export const textVariants = [
  "eyebrow",
  "title",
  "subtitle",
  "body",
  "statement",
] as const;

export const TextLayerSchema = z.object({
  ...layerBox,
  type: z.literal("text"),
  text: z.string(),
  variant: z.enum(textVariants),
  // Overrides the colour the variant would pick for this background.
  color: zColor().optional(),
});

export const ImageLayerSchema = z.object({
  ...layerBox,
  type: z.literal("image"),
  src: z.string(),
});

export const shapeFills = ["accent", "white", "dark", "tint"] as const;

export const ShapeLayerSchema = z.object({
  ...layerBox,
  type: z.literal("shape"),
  fill: z.enum(shapeFills),
  // Overrides the preset fill with an explicit colour.
  color: zColor().optional(),
});

export const BadgeLayerSchema = z.object({
  ...layerBox,
  type: z.literal("badge"),
  title: z.string(),
  subtitle: z.string().optional(),
});

export const ListLayerSchema = z.object({
  ...layerBox,
  type: z.literal("list"),
  items: z.array(z.string()),
  ordered: z.boolean(),
});

export const StatLayerSchema = z.object({
  ...layerBox,
  type: z.literal("stat"),
  value: z.string(),
  label: z.string().optional(),
});

export const QuoteLayerSchema = z.object({
  ...layerBox,
  type: z.literal("quote"),
  quote: z.string(),
  author: z.string().optional(),
});

export const CanvasLayerSchema = z.discriminatedUnion("type", [
  TextLayerSchema,
  ImageLayerSchema,
  ShapeLayerSchema,
  BadgeLayerSchema,
  ListLayerSchema,
  StatLayerSchema,
  QuoteLayerSchema,
]);

export const canvasBackgrounds = ["gradient", "light", "dark", "accent"] as const;

export const CanvasSceneSchema = z.object({
  ...baseSceneFields,
  type: z.literal("canvas"),
  layout: z.enum(canvasLayouts),
  accentColor: zColor(),
  background: z.enum(canvasBackgrounds),
  layers: z.array(CanvasLayerSchema),
});

export const AvatarSceneSchema = z.object({
  ...baseSceneFields,
  type: z.literal("avatar"),
  videoUrl: z.string(),
  caption: z.string().optional(),
});

export const VideoSceneSchema = z.object({
  ...baseSceneFields,
  type: z.literal("video"),
  videoUrl: z.string(),
  caption: z.string().optional(),
});

export const ImageSceneSchema = z.object({
  ...baseSceneFields,
  type: z.literal("imagen"),
  imageUrl: z.string(),
  caption: z.string().optional(),
  accentColor: zColor().optional(),
});

export const SceneSchema = z.discriminatedUnion("type", [
  CanvasSceneSchema,
  AvatarSceneSchema,
  VideoSceneSchema,
  ImageSceneSchema,
]);

// Placed in % of the canvas, so it survives any output resolution.
export const LogoSettingsSchema = z.object({
  src: z.string(),
  x: z.number(),
  y: z.number(),
  w: z.number(),
});

export const SubtitleStyleSchema = z.object({
  color: zColor(),
  outlineColor: zColor(),
  // Stroke width in px at 1080p. 0 leaves the text without an outline.
  outlineWidth: z.number().min(0).max(10),
});

export const VideoSettingsSchema = z.object({
  subtitles: z.boolean(),
  subtitleStyle: SubtitleStyleSchema.optional(),
  logo: LogoSettingsSchema.optional(),
});

export const defaultSubtitleStyle: SubtitleStyle = {
  color: "#ffffff",
  outlineColor: "#04101f",
  outlineWidth: 0,
};

export const defaultVideoSettings: VideoSettings = { subtitles: false };

export const DynamicVideoSchema = z.object({
  scenes: z.array(SceneSchema),
  settings: VideoSettingsSchema.optional(),
});

export type LogoSettings = z.infer<typeof LogoSettingsSchema>;
export type VideoSettings = z.infer<typeof VideoSettingsSchema>;
export type SubtitleStyle = z.infer<typeof SubtitleStyleSchema>;
export type CanvasLayer = z.infer<typeof CanvasLayerSchema>;
export type TextLayer = z.infer<typeof TextLayerSchema>;
export type ImageLayer = z.infer<typeof ImageLayerSchema>;
export type ShapeLayer = z.infer<typeof ShapeLayerSchema>;
export type BadgeLayer = z.infer<typeof BadgeLayerSchema>;
export type ListLayer = z.infer<typeof ListLayerSchema>;
export type StatLayer = z.infer<typeof StatLayerSchema>;
export type QuoteLayer = z.infer<typeof QuoteLayerSchema>;
export type CanvasBackground = z.infer<typeof CanvasSceneSchema>["background"];
export type Scene = z.infer<typeof SceneSchema>;
export type CanvasScene = z.infer<typeof CanvasSceneSchema>;
export type AvatarScene = z.infer<typeof AvatarSceneSchema>;
export type VideoScene = z.infer<typeof VideoSceneSchema>;
export type ImageScene = z.infer<typeof ImageSceneSchema>;
export type DynamicVideoProps = z.infer<typeof DynamicVideoSchema>;
