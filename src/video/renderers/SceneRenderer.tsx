import type { Scene } from "../schema/scene-schema";
import { CanvasSceneRenderer } from "./CanvasSceneRenderer";
import {
  AvatarSceneRenderer,
  ImageSceneRenderer,
  VideoSceneRenderer,
} from "./MediaSceneRenderer";

export const SceneRenderer: React.FC<{ scene: Scene }> = ({ scene }) => {
  switch (scene.type) {
    case "canvas":
      return <CanvasSceneRenderer scene={scene} />;
    case "avatar":
      return <AvatarSceneRenderer scene={scene} />;
    case "video":
      return <VideoSceneRenderer scene={scene} />;
    case "imagen":
      return <ImageSceneRenderer scene={scene} />;
    default:
      return null;
  }
};
