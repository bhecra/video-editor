import fs from "fs";
import path from "path";
import express from "express";
import cors from "cors";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import {
  DynamicVideoSchema,
  type DynamicVideoProps,
} from "../src/scene-editor/scene-schema";

const PORT = 4000;
const COMPOSITION_ID = "SceneEditor";
const PROJECT_ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(PROJECT_ROOT, "out");

type RenderJob = {
  id: string;
  status: "bundling" | "rendering" | "done" | "error";
  progress: number;
  outputFile?: string;
  error?: string;
};

const jobs = new Map<string, RenderJob>();

const newestSourceMtime = (dir: string): number => {
  let newest = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    newest = Math.max(
      newest,
      entry.isDirectory()
        ? newestSourceMtime(full)
        : fs.statSync(full).mtimeMs,
    );
  }
  return newest;
};

// Caching the bundle for the life of the process means edits to src/ never
// reach a render until the server restarts — renders silently come out stale.
// Keyed on the newest source mtime instead: fast repeat renders, never stale.
let cachedBundle: { location: string; mtime: number } | null = null;

const getBundle = async () => {
  const mtime = newestSourceMtime(path.join(PROJECT_ROOT, "src"));
  if (cachedBundle?.mtime === mtime) return cachedBundle.location;

  const location = await bundle({
    entryPoint: path.join(PROJECT_ROOT, "src", "index.ts"),
  });
  cachedBundle = { location, mtime };
  return location;
};

const runRender = async (job: RenderJob, inputProps: DynamicVideoProps) => {
  try {
    const serveUrl = await getBundle();
    const composition = await selectComposition({
      serveUrl,
      id: COMPOSITION_ID,
      inputProps,
    });

    job.status = "rendering";
    const outputLocation = path.join(OUT_DIR, `${job.id}.mp4`);

    await renderMedia({
      composition,
      serveUrl,
      codec: "h264",
      outputLocation,
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

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use("/out", express.static(OUT_DIR));

app.post("/api/render", (req, res) => {
  const parsed = DynamicVideoSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const jobId = Math.random().toString(36).slice(2, 10);
  const job: RenderJob = { id: jobId, status: "bundling", progress: 0 };
  jobs.set(jobId, job);
  res.json({ jobId });

  void runRender(job, parsed.data);
});

app.get("/api/render/:jobId", (req, res) => {
  const job = jobs.get(req.params.jobId);
  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }
  res.json(job);
});

app.listen(PORT, () => {
  console.log(`Render server listening on http://localhost:${PORT}`);
});
