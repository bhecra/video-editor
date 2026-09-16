import { Audio } from "@remotion/media";
import { Series, useVideoConfig } from "remotion";
import type { DynamicVideoProps } from "./scene-schema";
import { SceneRenderer } from "./SceneRenderer";

export const DynamicVideo: React.FC<DynamicVideoProps> = ({ scenes }) => {
  const { fps } = useVideoConfig();

  return (
    <Series>
      {scenes.map((scene) => (
        <Series.Sequence
          key={scene.id}
          name={scene.name}
          durationInFrames={Math.round(scene.durationInSeconds * fps)}
        >
          <SceneRenderer scene={scene} />
          {scene.audioUrl && (
            <Audio src={scene.audioUrl} volume={scene.audioVolume ?? 1} />
          )}
        </Series.Sequence>
      ))}
    </Series>
  );
};
