import { Video } from "@remotion/media";
import { AbsoluteFill, CanvasImage } from "remotion";
import type { AvatarScene, ImageScene, VideoScene } from "../schema/scene-schema";
import { openSansFont } from "../theme/fonts";

// A scene starts without media: it is uploaded from the editor's panel. This
// stands in until then, instead of handing the player an empty src.
const MissingMedia: React.FC<{ label: string }> = ({ label }) => (
  <AbsoluteFill
    style={{
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#04101f",
      color: "rgba(255,255,255,0.6)",
      fontFamily: openSansFont,
      fontWeight: 600,
      fontSize: 38,
    }}
  >
    {label}
  </AbsoluteFill>
);

export const AvatarSceneRenderer: React.FC<{ scene: AvatarScene }> = ({ scene }) =>
  scene.videoUrl ? (
    <AbsoluteFill style={{ backgroundColor: "#04101f" }}>
      <Video
        src={scene.videoUrl}
        objectFit="cover"
        style={{ width: "100%", height: "100%" }}
      />
    </AbsoluteFill>
  ) : (
    <MissingMedia label="Sube el video del avatar" />
  );

export const VideoSceneRenderer: React.FC<{ scene: VideoScene }> = ({ scene }) =>
  scene.videoUrl ? (
    <AbsoluteFill style={{ backgroundColor: "#04101f" }}>
      <Video
        src={scene.videoUrl}
        objectFit="cover"
        style={{ width: "100%", height: "100%" }}
      />
    </AbsoluteFill>
  ) : (
    <MissingMedia label="Sube un video para esta escena" />
  );

export const ImageSceneRenderer: React.FC<{ scene: ImageScene }> = ({ scene }) =>
  scene.imageUrl ? (
    <AbsoluteFill style={{ backgroundColor: scene.accentColor ?? "#04101f" }}>
      <CanvasImage
        src={scene.imageUrl}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    </AbsoluteFill>
  ) : (
    <MissingMedia label="Sube una imagen para esta escena" />
  );
