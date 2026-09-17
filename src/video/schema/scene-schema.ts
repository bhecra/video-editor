import { z } from "zod";
import { zColor } from "@remotion/zod-types";

export const transitionTypes = [
  "none",
  "zoom",
  "fade",
  "slide",
  "wipe",
  "flip",
  "clock-wipe",
  "iris",
] as const;

export const transitionDirections = [
  "from-left",
  "from-right",
  "from-top",
  "from-bottom",
] as const;

/**
 * How a scene enters from the one before it. The transition overlaps both
 * scenes, so it shortens the video by its own duration — every duration
 * calculation has to go through `src/video/transitions.ts`.
 */
export const SceneTransitionSchema = z.object({
  type: z.enum(transitionTypes),
  durationInSeconds: z.number().min(0.1).max(3),
  // Only "slide", "wipe" and "flip" read the direction.
  direction: z.enum(transitionDirections).optional(),
});

export const defaultTransition: SceneTransition = {
  type: "zoom",
  durationInSeconds: 0.5,
};

const baseSceneFields = {
  id: z.string(),
  name: z.string(),
  durationInSeconds: z.number().min(1),
  audioUrl: z.string().optional(),
  audioVolume: z.number().min(0).max(1).optional(),
  // Narration text. Shown as a subtitle when the setting is on.
  script: z.string().optional(),
  // Transition in from the previous scene. The first scene has nothing to come
  // from, so it ignores this. Left unset, the video's default transition
  // applies instead.
  transition: SceneTransitionSchema.optional(),
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
});

export const VideoSceneSchema = z.object({
  ...baseSceneFields,
  type: z.literal("video"),
  videoUrl: z.string(),
});

export const ImageSceneSchema = z.object({
  ...baseSceneFields,
  type: z.literal("image"),
  imageUrl: z.string(),
  accentColor: zColor().optional(),
});

export const SceneSchema = z.discriminatedUnion("type", [
  CanvasSceneSchema,
  AvatarSceneSchema,
  VideoSceneSchema,
  ImageSceneSchema,
]);

// Footprint size, as % of the canvas. Logos are often wordmarks or columns,
// not squares, so width and height are independent.
export const LOGO_SIZE_MIN = 4;
export const LOGO_SIZE_MAX = 40;

// Placed in % of the canvas, so it survives any output resolution.
export const LogoSettingsSchema = z.object({
  src: z.string(),
  x: z.number(),
  y: z.number(),
  // Width and height of the whole logo footprint, plate included.
  w: z.number(),
  // Optional so payloads from before independent height still parse; the
  // editor writes it on upload and the render falls back to the image's own
  // aspect when it is missing.
  h: z.number().optional(),
  // A plate behind the mark, so a dark logo stays visible over a dark scene.
  // Off by default: a logo made for video usually needs no help.
  background: z.boolean().default(false),
  backgroundColor: zColor().default("#ffffff"),
  backgroundOpacity: z.number().min(0).max(1).default(0.9),
  // Both are % of the logo footprint width, so they hold at any size and any
  // output resolution. The padding insets the mark inside the footprint.
  backgroundPadding: z.number().min(0).max(25).default(8),
  backgroundRadius: z.number().min(0).max(50).default(12),
});

export const SubtitleStyleSchema = z.object({
  color: zColor(),
  outlineColor: zColor(),
  // Stroke width in px at 1080p. 0 leaves the text without an outline.
  outlineWidth: z.number().min(0).max(10),
  // Dark scrim behind the text. Off leaves the subtitle over the bare scene,
  // where it leans on its shadow and outline to stay readable.
  background: z.boolean().default(true),
  // How opaque the scrim gets at the foot of the frame, where it is strongest.
  backgroundOpacity: z.number().min(0).max(1).default(0.85),
});

export const VideoSettingsSchema = z.object({
  subtitles: z.boolean(),
  subtitleStyle: SubtitleStyleSchema.optional(),
  logo: LogoSettingsSchema.optional(),
  // Used between every pair of scenes that does not carry its own transition.
  defaultTransition: SceneTransitionSchema.optional(),
});

// Applied to every logo as it is uploaded, so the schema's defaults and the
// editor's starting point never drift apart.
export const defaultLogoBackground = {
  background: false,
  backgroundColor: "#ffffff",
  backgroundOpacity: 0.9,
  backgroundPadding: 8,
  backgroundRadius: 12,
} satisfies Omit<LogoSettings, "src" | "x" | "y" | "w" | "h">;

export const defaultSubtitleStyle: SubtitleStyle = {
  color: "#ffffff",
  outlineColor: "#04101f",
  outlineWidth: 0,
  background: true,
  backgroundOpacity: 0.85,
};

export const defaultVideoSettings: VideoSettings = {
  subtitles: false,
  defaultTransition,
};

export const DynamicVideoSchema = z.object({
  scenes: z.array(SceneSchema),
  settings: VideoSettingsSchema.optional(),
});

export type TransitionType = (typeof transitionTypes)[number];
export type TransitionDirection = (typeof transitionDirections)[number];
export type SceneTransition = z.infer<typeof SceneTransitionSchema>;
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
