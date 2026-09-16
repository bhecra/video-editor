import { Player } from "@remotion/player";
import { DynamicVideo } from "@video/DynamicVideo";
import type { Scene, VideoSettings } from "@video/schema/scene-schema";
import { COMPOSITION_HEIGHT, COMPOSITION_WIDTH, FPS } from "../constants";

type Props = {
  scenes: Scene[];
  settings: VideoSettings;
  /** Remounts the player when the played selection changes. */
  playerKey: string;
};

/** Plays the composition exactly as the render server will produce it. */
export const ScenePlayer: React.FC<Props> = ({
  scenes,
  settings,
  playerKey,
}) => {
  const seconds = scenes.reduce((sum, s) => sum + s.durationInSeconds, 0);

  return (
    <div className="overflow-hidden rounded-xl ring-1 ring-foreground/10">
      <Player
        key={playerKey}
        component={DynamicVideo}
        inputProps={{ scenes, settings }}
        durationInFrames={Math.round(seconds * FPS)}
        compositionWidth={COMPOSITION_WIDTH}
        compositionHeight={COMPOSITION_HEIGHT}
        fps={FPS}
        style={{ width: "100%" }}
        controls
        loop
      />
    </div>
  );
};
