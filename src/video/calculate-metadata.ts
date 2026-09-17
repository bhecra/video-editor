import type { CalculateMetadataFunction } from "remotion";
import type { DynamicVideoProps } from "./schema/scene-schema";
import { totalDurationInFrames } from "./transitions";
import { FPS } from "./video-config";

export const calculateDynamicVideoMetadata: CalculateMetadataFunction<
  DynamicVideoProps
> = ({ props }) => {
  return {
    // Transitions overlap the scenes they join, so this is shorter than the
    // sum of the scene durations whenever the video has any.
    durationInFrames: totalDurationInFrames(props.scenes, props.settings, FPS),
  };
};
