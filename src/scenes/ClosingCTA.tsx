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
import { UbitsLogo } from "../UbitsLogo";

const { fontFamily: interFont } = loadFont("normal", {
  weights: ["700"],
  subsets: ["latin"],
});
const { fontFamily: openSansFont } = loadFontOpenSans("normal", {
  weights: ["400", "600"],
  subsets: ["latin"],
});

export const ClosingCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      name="Closing background"
      style={{
        background: "linear-gradient(135deg, #04101f 0%, #1a6bff 60%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Interactive.Div
        name="Closing logo"
        style={{
          marginBottom: 40,
          opacity: interpolate(frame, [0, 0.6 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
          scale: interpolate(frame, [0, 0.6 * fps], [0.8, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.spring({ damping: 200 }),
            output: "perceptual-scale",
          }),
        }}
      >
        <UbitsLogo color="#ffffff" width={220} />
      </Interactive.Div>
      <Interactive.Div
        name="Closing title"
        style={{
          fontFamily: interFont,
          fontWeight: 700,
          fontSize: 52,
          color: "#ffffff",
          textAlign: "center",
          maxWidth: 900,
          opacity: interpolate(frame, [0.5 * fps, 1.1 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        Impulsa el talento de tu equipo
      </Interactive.Div>
      <Interactive.Div
        name="Closing button"
        style={{
          marginTop: 48,
          background: "#ffffff",
          color: "#1a6bff",
          borderRadius: 8,
          padding: "18px 44px",
          fontFamily: openSansFont,
          fontWeight: 600,
          fontSize: 24,
          opacity: interpolate(frame, [1 * fps, 1.6 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
          translate: interpolate(
            frame,
            [1 * fps, 1.6 * fps],
            ["0px 20px", "0px 0px"],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            },
          ),
        }}
      >
        Descubre UBITS
      </Interactive.Div>
    </AbsoluteFill>
  );
};
