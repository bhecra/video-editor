import { Video } from "@remotion/media";
import { AbsoluteFill, CanvasImage } from "remotion";
import type { AvatarScene, ImageScene, VideoScene } from "./scene-schema";

export const AvatarSceneRenderer: React.FC<{ scene: AvatarScene }> = ({
  scene,
}) => (
  <AbsoluteFill style={{ backgroundColor: "#04101f" }}>
    <Video
      src={scene.videoUrl}
      style={{ width: "100%", height: "100%", objectFit: "cover" }}
    />
  </AbsoluteFill>
);

export const VideoSceneRenderer: React.FC<{ scene: VideoScene }> = ({
  scene,
}) => (
  <AbsoluteFill style={{ backgroundColor: "#04101f" }}>
    <Video
      src={scene.videoUrl}
      style={{ width: "100%", height: "100%", objectFit: "cover" }}
    />
  </AbsoluteFill>
);

export const ImageSceneRenderer: React.FC<{ scene: ImageScene }> = ({
  scene,
}) => (
  <AbsoluteFill style={{ backgroundColor: scene.accentColor ?? "#04101f" }}>
    <CanvasImage
      src={scene.imageUrl}
      style={{ width: "100%", height: "100%", objectFit: "cover" }}
    />
  </AbsoluteFill>
);
