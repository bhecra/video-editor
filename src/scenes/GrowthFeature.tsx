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

const { fontFamily: interFont } = loadFont("normal", {
  weights: ["600", "700"],
  subsets: ["latin"],
});
const { fontFamily: openSansFont } = loadFontOpenSans("normal", {
  weights: ["400"],
  subsets: ["latin"],
});

export const GrowthFeature: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      name="Growth background"
      style={{
        backgroundColor: "#ffffff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 96,
      }}
    >
      <Interactive.Div
        name="Growth title"
        style={{
          fontFamily: interFont,
          fontWeight: 700,
          fontSize: 60,
          color: "#04101f",
          textAlign: "center",
          opacity: interpolate(frame, [0, 0.6 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        Rutas de aprendizaje a la medida
      </Interactive.Div>
      <Interactive.Div
        name="Growth subtitle"
        style={{
          fontFamily: openSansFont,
          fontWeight: 400,
          fontSize: 26,
          color: "#2a303f",
          textAlign: "center",
          marginTop: 20,
          marginBottom: 56,
          maxWidth: 760,
          opacity: interpolate(frame, [0.3 * fps, 0.9 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        Contenido curado por especialidad, para cada rol y cada etapa de
        crecimiento
      </Interactive.Div>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: 24,
        }}
      >
        <Interactive.Div
          name="Growth badge liderazgo"
          style={{
            background: "#dbeafe",
            color: "#1e40af",
            borderRadius: 999,
            padding: "16px 32px",
            fontFamily: interFont,
            fontWeight: 600,
            fontSize: 24,
            scale: interpolate(frame, [0.8 * fps, 1.3 * fps], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.spring({ damping: 200 }),
              output: "perceptual-scale",
            }),
          }}
        >
          Liderazgo
        </Interactive.Div>
        <Interactive.Div
          name="Growth badge ventas"
          style={{
            background: "#dcfce7",
            color: "#166534",
            borderRadius: 999,
            padding: "16px 32px",
            fontFamily: interFont,
            fontWeight: 600,
            fontSize: 24,
            scale: interpolate(frame, [1 * fps, 1.5 * fps], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.spring({ damping: 200 }),
              output: "perceptual-scale",
            }),
          }}
        >
          Ventas
        </Interactive.Div>
        <Interactive.Div
          name="Growth badge tecnologia"
          style={{
            background: "#cadeff",
            color: "#04101f",
            borderRadius: 999,
            padding: "16px 32px",
            fontFamily: interFont,
            fontWeight: 600,
            fontSize: 24,
            scale: interpolate(frame, [1.2 * fps, 1.7 * fps], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.spring({ damping: 200 }),
              output: "perceptual-scale",
            }),
          }}
        >
          Tecnología
        </Interactive.Div>
        <Interactive.Div
          name="Growth badge bienestar"
          style={{
            background: "#fef9c3",
            color: "#854d0e",
            borderRadius: 999,
            padding: "16px 32px",
            fontFamily: interFont,
            fontWeight: 600,
            fontSize: 24,
            scale: interpolate(frame, [1.4 * fps, 1.9 * fps], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.spring({ damping: 200 }),
              output: "perceptual-scale",
            }),
          }}
        >
          Bienestar
        </Interactive.Div>
      </div>
    </AbsoluteFill>
  );
};
