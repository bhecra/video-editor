import { Video } from "@remotion/media";
import { AbsoluteFill, CanvasImage } from "remotion";
import type { AvatarScene, ImageScene, VideoScene } from "./scene-schema";
import { openSansFont } from "./fonts";

const Caption: React.FC<{ caption?: string }> = ({ caption }) => {
  if (!caption) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        background:
          "linear-gradient(0deg, rgba(4,16,31,0.85) 0%, rgba(4,16,31,0) 100%)",
        padding: "80px 96px 48px",
      }}
    >
      <div
        style={{
          fontFamily: openSansFont,
          fontWeight: 600,
          fontSize: 30,
          color: "#ffffff",
        }}
      >
        {caption}
      </div>
    </div>
  );
};

export const AvatarSceneRenderer: React.FC<{ scene: AvatarScene }> = ({
  scene,
}) => (
  <AbsoluteFill style={{ backgroundColor: "#04101f" }}>
    <Video
      src={scene.videoUrl}
      style={{ width: "100%", height: "100%", objectFit: "cover" }}
    />
    <Caption caption={scene.caption} />
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
    <Caption caption={scene.caption} />
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
    <Caption caption={scene.caption} />
  </AbsoluteFill>
);
