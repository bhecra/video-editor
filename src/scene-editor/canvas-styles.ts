import type { CSSProperties } from "react";
import type { CanvasBackground, ShapeLayer, TextLayer } from "./scene-schema";
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
