import path from "path";
import { renderMedia, selectComposition } from "@remotion/renderer";
import type { DynamicVideoProps } from "../src/video/schema/scene-schema";
import { getBundle } from "./bundler";
import { COMPOSITION_ID, OUT_DIR } from "./config";

export type RenderJob = {
  id: string;
  status: "bundling" | "rendering" | "done" | "error";
  progress: number;
  outputFile?: string;
  error?: string;
};

// Rendering outlives the HTTP request that starts it, so jobs live here and the
// editor polls them by id. In-memory on purpose: a restart drops the history,
// and the finished files stay on disk under out/.
const jobs = new Map<string, RenderJob>();

export const getJob = (id: string) => jobs.get(id);

const run = async (job: RenderJob, inputProps: DynamicVideoProps) => {
  try {
    const serveUrl = await getBundle();
    const composition = await selectComposition({
      serveUrl,
      id: COMPOSITION_ID,
      inputProps,
    });

    job.status = "rendering";

    await renderMedia({
      composition,
      serveUrl,
      codec: "h264",
      outputLocation: path.join(OUT_DIR, `${job.id}.mp4`),
      inputProps,
      onProgress: ({ progress }) => {
        job.progress = progress;
      },
    });

    job.status = "done";
    job.progress = 1;
    job.outputFile = `/out/${job.id}.mp4`;
  } catch (err) {
    job.status = "error";
    job.error = err instanceof Error ? err.message : String(err);
  }
};

/** Registers the job, starts rendering in the background and returns its id. */
export const startRenderJob = (inputProps: DynamicVideoProps): RenderJob => {
  const job: RenderJob = {
    id: Math.random().toString(36).slice(2, 10),
    status: "bundling",
    progress: 0,
  };
  jobs.set(job.id, job);
  void run(job, inputProps);
  return job;
};
