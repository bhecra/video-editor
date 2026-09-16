import path from "path";

export const PORT = 4000;

/** The only composition the server renders — see src/Root.tsx. */
export const COMPOSITION_ID = "SceneEditor";

export const PROJECT_ROOT = path.resolve(__dirname, "..");
export const VIDEO_SOURCE_DIR = path.join(PROJECT_ROOT, "src");
export const VIDEO_ENTRY_POINT = path.join(PROJECT_ROOT, "src", "index.ts");

/** Finished .mp4 files, served at /out. */
export const OUT_DIR = path.join(PROJECT_ROOT, "out");
/** Media uploaded from the editor, served at /uploads. */
export const UPLOADS_DIR = path.join(PROJECT_ROOT, "render-server", "uploads");
