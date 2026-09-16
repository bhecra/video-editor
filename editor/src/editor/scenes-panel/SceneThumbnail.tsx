import { useEffect, useRef, useState } from "react";
import { Thumbnail } from "@remotion/player";
import { DynamicVideo } from "@video/DynamicVideo";
import {
  defaultVideoSettings,
  type Scene,
} from "@video/schema/scene-schema";
import { COMPOSITION_HEIGHT, COMPOSITION_WIDTH, FPS } from "@video/video-config";
import { settledFrame } from "@/lib/scene-meta";

type Props = {
  scene: Scene;
};

const THUMB_WIDTH = 80;

/**
 * A still of the real composition, scaled to the scene list. It mounts only
 * once the row is near the viewport so a long video does not spawn dozens of
 * Remotion trees at once.
 */
export const SceneThumbnail: React.FC<Props> = ({ scene }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { rootMargin: "160px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="pointer-events-none relative shrink-0 overflow-hidden rounded-md bg-muted ring-1 ring-foreground/10"
      style={{
        width: THUMB_WIDTH,
        aspectRatio: `${COMPOSITION_WIDTH} / ${COMPOSITION_HEIGHT}`,
      }}
    >
      {visible ? (
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
      ) : null}
    </div>
  );
};
