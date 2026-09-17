import type { RenderState } from "../api/useRenderJob";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";

/** The .mp4 the render server produced, once there is one. */
export const RenderedVideo: React.FC<{ renderState: RenderState }> = ({
  renderState,
}) =>
  renderState.status === "done" ? (
    <video src={renderState.outputUrl} controls className="w-full rounded-xl" />
  ) : (
    <Empty className="aspect-video w-full border">
      <EmptyHeader>
        <EmptyTitle>Aún no hay video</EmptyTitle>
        <EmptyDescription>
          Aún no has generado un video. Dale a &quot;Generar video&quot;.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
