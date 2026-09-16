import { Audio } from "@remotion/media";
import { AbsoluteFill, Img, Series, useVideoConfig } from "remotion";
import {
  defaultSubtitleStyle,
  type DynamicVideoProps,
  type SubtitleStyle,
} from "./scene-schema";
import { SceneRenderer } from "./SceneRenderer";
import { subtitleScrimStyle, subtitleTextStyle } from "./canvas-styles";

const Subtitle: React.FC<{ text: string; style?: SubtitleStyle }> = ({
  text,
  style,
}) => {
  const resolved = style ?? defaultSubtitleStyle;

  return (
    <AbsoluteFill style={{ justifyContent: "flex-end" }}>
      <div style={subtitleScrimStyle(resolved)}>
        <div style={subtitleTextStyle(resolved)}>{text}</div>
      </div>
    </AbsoluteFill>
  );
};

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
              <Subtitle text={scene.script} style={settings.subtitleStyle} />
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
