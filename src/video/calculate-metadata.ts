import type { CalculateMetadataFunction } from "remotion";
import type { DynamicVideoProps } from "./schema/scene-schema";

const FPS = 30;

export const calculateDynamicVideoMetadata: CalculateMetadataFunction<
  DynamicVideoProps
> = ({ props }) => {
  const totalSeconds = props.scenes.reduce(
    (sum, scene) => sum + scene.durationInSeconds,
    0,
  );

  return {
    durationInFrames: Math.round(totalSeconds * FPS),
  };
};
