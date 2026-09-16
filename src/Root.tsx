import { Composition } from "remotion";
import "./index.css";
import { DynamicVideo } from "./video/DynamicVideo";
import {
  DynamicVideoSchema,
  type DynamicVideoProps,
} from "./video/schema/scene-schema";
import { calculateDynamicVideoMetadata } from "./video/calculate-metadata";
import { createLayersForLayout } from "./video/theme/canvas-templates";
import {
  COMPOSITION_HEIGHT,
  COMPOSITION_WIDTH,
  FPS,
} from "./video/video-config";

const PLACEHOLDER_SECONDS = 6;

// Remotion Studio needs a document to open. The real content always arrives as
// inputProps — from the editor or from the render server — so this is only
// scaffolding: one scene built from a template, with no product copy in it.
const placeholderVideo: DynamicVideoProps = {
  settings: { subtitles: false },
  scenes: [
    {
      id: "placeholder",
      name: "Escena de ejemplo",
      type: "canvas",
      layout: "una-columna",
      durationInSeconds: PLACEHOLDER_SECONDS,
      accentColor: "#1a6bff",
      background: "gradient",
      layers: createLayersForLayout("una-columna"),
    },
  ],
};

// The editor and the render server both drive this single composition:
// `calculateMetadata` derives the real duration from the scenes they pass in.
export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="SceneEditor"
      component={DynamicVideo}
      durationInFrames={PLACEHOLDER_SECONDS * FPS}
      fps={FPS}
      width={COMPOSITION_WIDTH}
      height={COMPOSITION_HEIGHT}
      schema={DynamicVideoSchema}
      defaultProps={placeholderVideo}
      calculateMetadata={calculateDynamicVideoMetadata}
    />
  );
};
