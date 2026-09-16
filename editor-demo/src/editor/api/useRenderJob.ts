import { useCallback, useState } from "react";
import type { DynamicVideoProps } from "@video/schema/scene-schema";
import { fetchRenderJob, renderedVideoUrl, startRender } from "./render-api";

const POLL_INTERVAL_MS = 1000;

export type RenderState =
  | { status: "idle" }
  | { status: "rendering"; progress: number }
  | { status: "done"; outputUrl: string }
  | { status: "error"; message: string };

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Drives one render from the editor: starts the job, polls it until it finishes
 * and exposes the progress the header shows. The whole conversation with the
 * render server lives here — the UI only reads `state` and calls `generate`.
 */
export const useRenderJob = (options?: { onDone?: () => void }) => {
  const [state, setState] = useState<RenderState>({ status: "idle" });
  const onDone = options?.onDone;

  const generate = useCallback(
    async (payload: DynamicVideoProps) => {
      setState({ status: "rendering", progress: 0 });

      try {
        const jobId = await startRender(payload);

        for (;;) {
          await wait(POLL_INTERVAL_MS);
          const job = await fetchRenderJob(jobId);

          if (job.status === "error") {
            setState({
              status: "error",
              message: job.error ?? "El render falló",
            });
            return;
          }
          if (job.status === "done") {
            setState({ status: "done", outputUrl: renderedVideoUrl(job) });
            onDone?.();
            return;
          }
          setState({ status: "rendering", progress: job.progress ?? 0 });
        }
      } catch (err) {
        setState({
          status: "error",
          message:
            err instanceof Error
              ? `${err.message} — ¿está corriendo "npm run render-server"?`
              : String(err),
        });
      }
    },
    [onDone],
  );

  return { renderState: state, generate };
};
