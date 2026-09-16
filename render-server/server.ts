import fs from "fs";
import express from "express";
import cors from "cors";
import { OUT_DIR, PORT, UPLOADS_DIR } from "./config";
import { renderRouter } from "./routes/render";
import { uploadRouter } from "./routes/upload";

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Static: rendered videos and the media uploaded from the editor.
app.use("/out", express.static(OUT_DIR));
app.use("/uploads", express.static(UPLOADS_DIR));

// API consumed by editor/src/editor/api.
app.use("/api", uploadRouter);
app.use("/api", renderRouter);

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

app.listen(PORT, () => {
  console.log(`Render server listening on http://localhost:${PORT}`);
});
