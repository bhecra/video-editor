import type { DynamicVideoProps } from "@video/schema/scene-schema";
import { RENDER_SERVER_URL } from "./config";

/** Mirrors the job shape returned by render-server/render-jobs.ts. */
export type RenderJob = {
  id: string;
  status: "bundling" | "rendering" | "done" | "error";
  progress: number;
  outputFile?: string;
  error?: string;
};

/** POST /api/render — queues a render and returns the job id to poll. */
export const startRender = async (
  payload: DynamicVideoProps,
): Promise<string> => {
  const response = await fetch(`${RENDER_SERVER_URL}/api/render`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`El servidor de render respondió ${response.status}`);
  }

  const { jobId } = (await response.json()) as { jobId: string };
  return jobId;
};

/** GET /api/render/:jobId — progress while rendering, output once done. */
export const fetchRenderJob = async (jobId: string): Promise<RenderJob> => {
  const response = await fetch(`${RENDER_SERVER_URL}/api/render/${jobId}`);
  if (!response.ok) {
    throw new Error(`El servidor de render respondió ${response.status}`);
  }
  return (await response.json()) as RenderJob;
};

/** The job only carries a server path; the editor needs an absolute URL. */
export const renderedVideoUrl = (job: RenderJob) =>
  `${RENDER_SERVER_URL}${job.outputFile}`;
