import { Router } from "express";
import { DynamicVideoSchema } from "../../src/video/schema/scene-schema";
import { getJob, startRenderJob } from "../render-jobs";

export const renderRouter = Router();

// POST /api/render — validates the editor's payload against the same schema the
// composition uses, then answers with a job id the editor can poll.
renderRouter.post("/render", (req, res) => {
  const parsed = DynamicVideoSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const job = startRenderJob(parsed.data);
  res.json({ jobId: job.id });
});

// GET /api/render/:jobId — progress, and the output URL once it is done.
renderRouter.get("/render/:jobId", (req, res) => {
  const job = getJob(req.params.jobId);
  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }
  res.json(job);
});
