import { Thumbnail } from "@remotion/player";
import { DynamicVideo } from "@video/DynamicVideo";
import { defaultVideoSettings, type Scene } from "@video/schema/scene-schema";
import {
  COMPOSITION_HEIGHT,
  COMPOSITION_WIDTH,
  FPS,
} from "@video/video-config";
import { settledFrame } from "@/lib/scene-meta";

type Props = {
  scene: Scene;
};

/** The first scene of an example, rendered by the real composition. */
export const ExampleCover: React.FC<Props> = ({ scene }) => (
  <div
    className="pointer-events-none w-full overflow-hidden bg-muted"
    style={{ aspectRatio: `${COMPOSITION_WIDTH} / ${COMPOSITION_HEIGHT}` }}
  >
    <Thumbnail
      component={DynamicVideo}
      inputProps={{ scenes: [scene], settings: defaultVideoSettings }}
      frameToDisplay={settledFrame(scene)}
      durationInFrames={Math.round(scene.durationInSeconds * FPS)}
      compositionWidth={COMPOSITION_WIDTH}
      compositionHeight={COMPOSITION_HEIGHT}
      fps={FPS}
      style={{ width: "100%", display: "block" }}
    />
  </div>
);
