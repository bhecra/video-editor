import { Composition } from "remotion";
import "./index.css";
import { DynamicVideo } from "./video/DynamicVideo";
import { DynamicVideoSchema } from "./video/schema/scene-schema";
import { calculateDynamicVideoMetadata } from "./video/calculate-metadata";
import { sampleOnboardingVideo } from "./video/schema/sample-data";

// The editor and the render server both drive this single composition: the
// editor passes its scenes as input props, and `calculateMetadata` derives the
// duration from them, so the number below is only the default preview length.
export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="SceneEditor"
      component={DynamicVideo}
      durationInFrames={2430}
      fps={30}
      width={1920}
      height={1080}
      schema={DynamicVideoSchema}
      defaultProps={sampleOnboardingVideo}
      calculateMetadata={calculateDynamicVideoMetadata}
    />
  );
};
