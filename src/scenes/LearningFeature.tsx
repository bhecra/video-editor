import {
  AbsoluteFill,
  Easing,
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";
import { loadFont as loadFontOpenSans } from "@remotion/google-fonts/OpenSans";
import { loadFont as loadFontMono } from "@remotion/google-fonts/RobotoMono";

const { fontFamily: interFont } = loadFont("normal", {
  weights: ["600", "700"],
  subsets: ["latin"],
});
const { fontFamily: openSansFont } = loadFontOpenSans("normal", {
  weights: ["400"],
  subsets: ["latin"],
});
const { fontFamily: monoFont } = loadFontMono("normal", {
  weights: ["700"],
  subsets: ["latin"],
});

export const LearningFeature: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      name="Learning background"
      style={{
        backgroundColor: "#f8faff",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        padding: 96,
        gap: 96,
      }}
    >
      <Interactive.Div
        name="Learning copy"
        style={{
          flex: 1,
          opacity: interpolate(frame, [0, 0.6 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
          translate: interpolate(
            frame,
            [0, 0.6 * fps],
            ["-40px 0px", "0px 0px"],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            },
          ),
        }}
      >
        <div
          style={{
            fontFamily: interFont,
            fontWeight: 700,
            fontSize: 26,
            color: "#1a6bff",
            letterSpacing: 2,
            textTransform: "uppercase",
            marginBottom: 20,
          }}
        >
          Aprendizaje
        </div>
        <div
          style={{
            fontFamily: interFont,
            fontWeight: 700,
            fontSize: 64,
            color: "#04101f",
            lineHeight: 1.1,
            marginBottom: 24,
          }}
        >
          Aprendizaje sin límites
        </div>
        <div
          style={{
            fontFamily: openSansFont,
            fontWeight: 400,
            fontSize: 26,
            color: "#2a303f",
            lineHeight: 1.5,
            maxWidth: 520,
          }}
        >
          Miles de cursos y rutas para que cada persona de tu organización
          crezca a su propio ritmo.
        </div>
      </Interactive.Div>
      <Interactive.Div
        name="Learning KPI card cursos"
        style={{
          background: "#ffffff",
          borderRadius: 16,
          border: "1px solid #d0d2d5",
          boxShadow: "0 8px 24px rgba(4,16,31,0.15)",
          padding: 32,
          width: 340,
          opacity: interpolate(frame, [0.4 * fps, 1 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.spring({ damping: 200 }),
          }),
          translate: interpolate(
            frame,
            [0.4 * fps, 1 * fps],
            ["40px 0px", "0px 0px"],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.spring({ damping: 200 }),
            },
          ),
        }}
      >
        <div
          style={{
            fontFamily: interFont,
            fontWeight: 600,
            fontSize: 15,
            color: "#6b7280",
            marginBottom: 12,
          }}
        >
          CURSOS DISPONIBLES
        </div>
        <div
          style={{
            fontFamily: monoFont,
            fontWeight: 700,
            fontSize: 48,
            color: "#04101f",
          }}
        >
          +1,200
        </div>
        <div
          style={{
            fontFamily: interFont,
            fontWeight: 600,
            fontSize: 15,
            color: "#2ec6ff",
            marginTop: 12,
          }}
        >
          ↑ Actualizados cada mes
        </div>
      </Interactive.Div>
    </AbsoluteFill>
  );
};
