import type { CSSProperties } from "react";
import type {
  CanvasBackground,
  ShapeLayer,
  SubtitleStyle,
  TextLayer,
} from "../schema/scene-schema";
import { interFont, openSansFont } from "./fonts";

export const backgroundStyle = (
  background: CanvasBackground,
  accentColor: string,
): CSSProperties => {
  switch (background) {
    case "gradient":
      return {
        background: `linear-gradient(135deg, #04101f 0%, ${accentColor} 100%)`,
      };
    case "dark":
      return { backgroundColor: "#04101f" };
    case "accent":
      return { backgroundColor: accentColor };
    case "light":
    default:
      return { backgroundColor: "#f8faff" };
  }
};

export const isDarkBackground = (background: CanvasBackground) =>
  background === "dark" || background === "gradient" || background === "accent";

// Font sizes are in composition pixels (1920x1080). The inline editor scales
// them by the Player's render scale so both look identical.
export const textStyles = (
  variant: TextLayer["variant"],
  onDark: boolean,
): CSSProperties => {
  switch (variant) {
    case "eyebrow":
      return {
        fontFamily: interFont,
        fontWeight: 600,
        fontSize: 24,
        letterSpacing: 2,
        textTransform: "uppercase",
        color: onDark ? "#cadeff" : "#1a6bff",
      };
    case "title":
      return {
        fontFamily: interFont,
        fontWeight: 700,
        fontSize: 72,
        lineHeight: 1.05,
        color: onDark ? "#ffffff" : "#04101f",
      };
    case "subtitle":
      return {
        fontFamily: interFont,
        fontWeight: 600,
        fontSize: 36,
        lineHeight: 1.2,
        color: onDark ? "#cadeff" : "#2a303f",
      };
    case "statement":
      return {
        fontFamily: interFont,
        fontWeight: 700,
        fontSize: 64,
        lineHeight: 1.2,
        textAlign: "center",
        color: onDark ? "#ffffff" : "#04101f",
      };
    case "body":
    default:
      return {
        fontFamily: openSansFont,
        fontWeight: 400,
        fontSize: 28,
        lineHeight: 1.5,
        color: onDark ? "#cadeff" : "#2a303f",
      };
  }
};

// Scales composition-pixel font metrics to the on-screen size of the Player.
export const scaleTextStyles = (
  style: CSSProperties,
  scale: number,
): CSSProperties => ({
  ...style,
  fontSize:
    typeof style.fontSize === "number" ? style.fontSize * scale : style.fontSize,
  letterSpacing:
    typeof style.letterSpacing === "number"
      ? style.letterSpacing * scale
      : style.letterSpacing,
});

export const shapeFillColor = (
  fill: ShapeLayer["fill"],
  accentColor: string,
): string => {
  switch (fill) {
    case "accent":
      return accentColor;
    case "dark":
      return "#04101f";
    case "tint":
      return "#cadeff";
    case "white":
    default:
      return "#ffffff";
  }
};

// Subtitle size in composition pixels (1920x1080).
export const subtitleFontSize = 34;

// Shared by the burned-in subtitle and the settings dialog's preview of it, so
// what the editor shows is what the video renders.
export const subtitleTextStyle = (
  style: SubtitleStyle,
  fontSize = subtitleFontSize,
): CSSProperties => {
  const outlined = style.outlineWidth > 0;
  // The stroke is centred on the glyph outline and the fill is painted over
  // it, so only half of it shows: double it to get the width that was asked
  // for, scaled to whatever size the text is drawn at.
  const stroke = (style.outlineWidth * 2 * fontSize) / subtitleFontSize;

  return {
    fontFamily: openSansFont,
    fontWeight: 600,
    fontSize,
    lineHeight: 1.35,
    color: style.color,
    textAlign: "center",
    WebkitTextStroke: outlined ? `${stroke}px ${style.outlineColor}` : undefined,
    paintOrder: "stroke fill",
    // Without an outline the text leans on a strong shadow to stay readable
    // over any scene; with one, the shadow only adds depth.
    textShadow: outlined
      ? `0 ${fontSize / 17}px ${fontSize / 3.4}px rgba(4,16,31,0.45)`
      : `0 ${fontSize / 17}px ${fontSize / 2.8}px rgba(4,16,31,0.95), 0 0 ${fontSize / 1.2}px rgba(4,16,31,0.8)`,
  };
};

// A scrim behind the subtitle, so white text stays readable over a bright
// scene. It fades out towards the top so it reads as a shadow at the foot of
// the frame rather than a bar. Shared by the burned-in subtitle and the
// settings dialog's preview.
const scrimColor = (alpha: number) => `rgba(4,16,31,${Number(alpha.toFixed(3))})`;

export const subtitleScrimBackground = (opacity: number) =>
  `linear-gradient(0deg, ${scrimColor(opacity)} 0%, ${scrimColor(
    opacity * 0.7,
  )} 45%, ${scrimColor(0)} 100%)`;

export const subtitleScrimStyle = (
  style: SubtitleStyle,
  fontSize = subtitleFontSize,
): CSSProperties => ({
  width: "100%",
  display: "flex",
  justifyContent: "center",
  // Turning the background off keeps the padding, so the text does not move.
  background: style.background
    ? subtitleScrimBackground(style.backgroundOpacity)
    : undefined,
  // Generous top padding gives the gradient room to fade before it reaches
  // the text; the bottom keeps the old distance to the edge of the frame.
  padding: `${fontSize * 2.4}px 8% ${fontSize * 1.65}px`,
});
