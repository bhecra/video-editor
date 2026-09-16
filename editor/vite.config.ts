import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // The Remotion side of the project: schema, theme and the composition the
      // editor previews. Shared source, not a copy.
      "@video": path.resolve(__dirname, "../src/video"),
      // Force a single React instance: the root project's copy.
      // Without this, npm installs a second react/react-dom inside
      // editor/node_modules (as a peer dep of radix-ui), which
      // causes "Invalid hook call" errors.
      react: path.resolve(__dirname, "../node_modules/react"),
      "react-dom": path.resolve(__dirname, "../node_modules/react-dom"),
    },
  },
  optimizeDeps: {
    force: true,
  },
  server: {
    port: 5173,
    fs: {
      allow: [path.resolve(__dirname, "..")],
    },
  },
});
