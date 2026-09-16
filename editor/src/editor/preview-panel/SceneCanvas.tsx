import { Thumbnail } from "@remotion/player";
import { DynamicVideo } from "@video/DynamicVideo";
import type {
  CanvasLayer,
  LogoSettings,
  Scene,
  VideoSettings,
} from "@video/schema/scene-schema";
import { COMPOSITION_HEIGHT, COMPOSITION_WIDTH, FPS } from "@video/video-config";
import { settledFrame } from "@/lib/scene-meta";
import { CanvasLayerOverlay } from "./CanvasLayerOverlay";
import { LogoOverlay } from "./LogoOverlay";

type Props = {
  scene: Scene;
  settings: VideoSettings;
  selectedLayerId: string | null;
  onSelectLayer: (id: string | null) => void;
  onUpdateLayer: (id: string, patch: Partial<CanvasLayer>) => void;
  onDeleteLayer: (id: string) => void;
  onReorderLayer: (id: string, toIndex: number) => void;
  onChangeLogo: (logo: LogoSettings) => void;
};

/**
 * The editing surface: a still frame of the real composition with the
 * drag-and-drop overlays on top, so what you move is what gets rendered.
 */
export const SceneCanvas: React.FC<Props> = ({
  scene,
  settings,
  selectedLayerId,
  onSelectLayer,
  onUpdateLayer,
  onDeleteLayer,
  onReorderLayer,
  onChangeLogo,
}) => (
  <div className="relative overflow-hidden rounded-xl ring-1 ring-foreground/10">
    <Thumbnail
      component={DynamicVideo}
      inputProps={{ scenes: [scene], settings }}
      frameToDisplay={settledFrame(scene)}
      durationInFrames={Math.round(scene.durationInSeconds * FPS)}
      compositionWidth={COMPOSITION_WIDTH}
      compositionHeight={COMPOSITION_HEIGHT}
      fps={FPS}
      style={{ width: "100%" }}
    />
    {settings.logo && (
      <LogoOverlay logo={settings.logo} onChange={onChangeLogo} />
    )}
    {scene.type === "canvas" && (
      <CanvasLayerOverlay
        scene={scene}
        selectedLayerId={selectedLayerId}
        onSelectLayer={onSelectLayer}
        onUpdateLayer={onUpdateLayer}
        onDeleteLayer={onDeleteLayer}
        onReorderLayer={onReorderLayer}
      />
    )}
  </div>
);
