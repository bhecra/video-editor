import type { CalculateMetadataFunction } from "remotion";
import type { DynamicVideoProps } from "./schema/scene-schema";
import { FPS } from "./video-config";

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
