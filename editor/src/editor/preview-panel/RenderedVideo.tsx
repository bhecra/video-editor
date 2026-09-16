import type { RenderState } from "../api/useRenderJob";

/** The .mp4 the render server produced, once there is one. */
export const RenderedVideo: React.FC<{ renderState: RenderState }> = ({
  renderState,
}) =>
  renderState.status === "done" ? (
    <video src={renderState.outputUrl} controls className="w-full rounded-xl" />
  ) : (
    <div className="flex aspect-video w-full items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground">
      Aún no has generado un video. Dale a "Generar video".
    </div>
  );
