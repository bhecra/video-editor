import { Audio } from "@remotion/media";
import { AbsoluteFill, Img, Series, useVideoConfig } from "remotion";
import type { DynamicVideoProps } from "./scene-schema";
import { SceneRenderer } from "./SceneRenderer";
import { openSansFont } from "./fonts";

const Subtitle: React.FC<{ text: string }> = ({ text }) => (
  <AbsoluteFill
    style={{
      justifyContent: "flex-end",
      alignItems: "center",
      padding: "0 8% 56px",
    }}
  >
    <div
      style={{
        fontFamily: openSansFont,
        fontWeight: 600,
        fontSize: 34,
        lineHeight: 1.35,
        color: "#ffffff",
        textAlign: "center",
        // A strong shadow keeps the text readable over any scene behind it.
        textShadow: "0 2px 12px rgba(4,16,31,0.95), 0 0 28px rgba(4,16,31,0.8)",
      }}
    >
      {text}
    </div>
  </AbsoluteFill>
);

export const DynamicVideo: React.FC<DynamicVideoProps> = ({
  scenes,
  settings,
}) => {
  const { fps } = useVideoConfig();
  const logo = settings?.logo;

  return (
    <AbsoluteFill>
      <Series>
        {scenes.map((scene) => (
          <Series.Sequence
            key={scene.id}
            name={scene.name}
            durationInFrames={Math.round(scene.durationInSeconds * fps)}
          >
            <SceneRenderer scene={scene} />
            {settings?.subtitles && scene.script && (
              <Subtitle text={scene.script} />
            )}
            {scene.audioUrl && (
              <Audio src={scene.audioUrl} volume={scene.audioVolume ?? 1} />
            )}
          </Series.Sequence>
        ))}
      </Series>

      {/* Sits outside the Series so it stays on screen for every scene. */}
      {logo && (
        <Img
          src={logo.src}
          style={{
            position: "absolute",
            left: `${logo.x}%`,
            top: `${logo.y}%`,
            width: `${logo.w}%`,
            objectFit: "contain",
          }}
        />
      )}
    </AbsoluteFill>
  );
};
