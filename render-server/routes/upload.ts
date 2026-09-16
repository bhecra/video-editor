import fs from "fs";
import path from "path";
import { Router } from "express";
import { UPLOADS_DIR } from "../config";

export const uploadRouter = Router();

// POST /api/upload — media picked in the editor lands here instead of
// travelling inside the render payload: a video inlined as base64 would blow
// past the JSON limit, and the renderer needs a URL it can fetch on its own
// anyway. The body is streamed straight to disk — express.json() ignores
// image/* and video/* bodies.
uploadRouter.post("/upload", (req, res) => {
  const contentType = req.get("content-type") ?? "";
  if (!contentType.startsWith("image/") && !contentType.startsWith("video/")) {
    res.status(415).json({ error: "Solo se aceptan imágenes y videos" });
    return;
  }

  // The name only survives as a hint: it is sanitised and prefixed, so two
  // uploads of the same file never overwrite each other.
  const original = path.basename(String(req.query.name ?? "media"));
  const safe = original.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-60) || "media";
  const fileName = `${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}-${safe}`;
  const destination = path.join(UPLOADS_DIR, fileName);

  const file = fs.createWriteStream(destination);
  req.pipe(file);

  file.on("finish", () => {
    res.json({
      url: `${req.protocol}://${req.get("host")}/uploads/${encodeURIComponent(
        fileName,
      )}`,
    });
  });

  const fail = (err: Error) => {
    fs.rm(destination, { force: true }, () => undefined);
    if (!res.headersSent) res.status(500).json({ error: err.message });
  };
  file.on("error", fail);
  req.on("error", fail);
});
