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
  weights: ["400", "700"],
  subsets: ["latin"],
});
const { fontFamily: openSansFont } = loadFontOpenSans("normal", {
  weights: ["400"],
  subsets: ["latin"],
});

export const HeroIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      name="Hero background"
      style={{
        background: "linear-gradient(135deg, #04101f 0%, #1a6bff 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Interactive.Div
        name="Hero logo"
        style={{
          position: "absolute",
          top: 64,
          left: 64,
          opacity: interpolate(frame, [0, 0.5 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        <UbitsLogo color="#ffffff" width={160} />
      </Interactive.Div>
      <Interactive.Div
        name="Hero title"
        style={{
          fontFamily: interFont,
          fontWeight: 700,
          fontSize: 108,
          color: "#ffffff",
          textAlign: "center",
          opacity: interpolate(frame, [0.5 * fps, 1.2 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
          translate: interpolate(
            frame,
            [0.5 * fps, 1.2 * fps],
            ["0px 40px", "0px 0px"],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            },
          ),
        }}
      >
        UBITS
      </Interactive.Div>
      <Interactive.Div
        name="Hero tagline"
        style={{
          fontFamily: openSansFont,
          fontWeight: 400,
          fontSize: 36,
          color: "#cadeff",
          textAlign: "center",
          marginTop: 24,
          maxWidth: 900,
          opacity: interpolate(frame, [1.2 * fps, 1.9 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
          translate: interpolate(
            frame,
            [1.2 * fps, 1.9 * fps],
            ["0px 30px", "0px 0px"],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            },
          ),
        }}
      >
        La plataforma donde tu equipo aprende, crece y brilla
      </Interactive.Div>
    </AbsoluteFill>
  );
};
