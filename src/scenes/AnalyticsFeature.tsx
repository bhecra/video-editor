import {
  AbsoluteFill,
  Easing,
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";
import { loadFont as loadFontMono } from "@remotion/google-fonts/RobotoMono";

const { fontFamily: interFont } = loadFont("normal", {
  weights: ["600", "700"],
  subsets: ["latin"],
});
const { fontFamily: monoFont } = loadFontMono("normal", {
  weights: ["600", "700"],
  subsets: ["latin"],
});

export const AnalyticsFeature: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      name="Analytics background"
      style={{
        backgroundColor: "#04101f",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 96,
      }}
    >
      <Interactive.Div
        name="Analytics title"
        style={{
          fontFamily: interFont,
          fontWeight: 700,
          fontSize: 56,
          color: "#ffffff",
          textAlign: "center",
          marginBottom: 72,
          opacity: interpolate(frame, [0, 0.6 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        Resultados que se ven
      </Interactive.Div>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: 40,
        }}
      >
        <Interactive.Div
          name="Analytics card engagement"
          style={{
            background: "#2a303f",
            borderRadius: 16,
            padding: 32,
            width: 320,
            opacity: interpolate(frame, [0.5 * fps, 1.1 * fps], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.spring({ damping: 200 }),
            }),
            translate: interpolate(
              frame,
              [0.5 * fps, 1.1 * fps],
              ["0px 40px", "0px 0px"],
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
              color: "#cadeff",
              marginBottom: 12,
            }}
          >
            ENGAGEMENT
          </div>
          <div
            style={{
              fontFamily: monoFont,
              fontWeight: 700,
              fontSize: 44,
              color: "#ffffff",
            }}
          >
            +34%
          </div>
        </Interactive.Div>
        <Interactive.Div
          name="Analytics card certificaciones"
          style={{
            background: "#2a303f",
            borderRadius: 16,
            padding: 32,
            width: 320,
            opacity: interpolate(frame, [0.7 * fps, 1.3 * fps], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.spring({ damping: 200 }),
            }),
            translate: interpolate(
              frame,
              [0.7 * fps, 1.3 * fps],
              ["0px 40px", "0px 0px"],
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
              color: "#cadeff",
              marginBottom: 12,
            }}
          >
            CERTIFICACIONES
          </div>
          <div
            style={{
              fontFamily: monoFont,
              fontWeight: 700,
              fontSize: 44,
              color: "#ffffff",
            }}
          >
            5,400+
          </div>
        </Interactive.Div>
        <Interactive.Div
          name="Analytics card tiempo"
          style={{
            background: "#2a303f",
            borderRadius: 16,
            padding: 32,
            width: 320,
            opacity: interpolate(frame, [0.9 * fps, 1.5 * fps], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.spring({ damping: 200 }),
            }),
            translate: interpolate(
              frame,
              [0.9 * fps, 1.5 * fps],
              ["0px 40px", "0px 0px"],
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
              color: "#cadeff",
              marginBottom: 12,
            }}
          >
            APRENDIZAJE / SEMANA
          </div>
          <div
            style={{
              fontFamily: monoFont,
              fontWeight: 700,
              fontSize: 44,
              color: "#ffffff",
            }}
          >
            2.4h
          </div>
        </Interactive.Div>
      </div>
    </AbsoluteFill>
  );
};
