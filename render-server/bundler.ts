import fs from "fs";
import path from "path";
import { bundle } from "@remotion/bundler";
import { VIDEO_ENTRY_POINT, VIDEO_SOURCE_DIR } from "./config";

const newestSourceMtime = (dir: string): number => {
  let newest = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    newest = Math.max(
      newest,
      entry.isDirectory() ? newestSourceMtime(full) : fs.statSync(full).mtimeMs,
    );
  }
  return newest;
};

// Caching the bundle for the life of the process means edits to src/ never
// reach a render until the server restarts — renders silently come out stale.
// Keyed on the newest source mtime instead: fast repeat renders, never stale.
let cachedBundle: { location: string; mtime: number } | null = null;

export const getBundle = async () => {
  const mtime = newestSourceMtime(VIDEO_SOURCE_DIR);
  if (cachedBundle?.mtime === mtime) return cachedBundle.location;

  const location = await bundle({ entryPoint: VIDEO_ENTRY_POINT });
  cachedBundle = { location, mtime };
  return location;
};
