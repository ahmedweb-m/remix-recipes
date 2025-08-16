import { defineConfig } from "vite";
import path from "path";
import { vitePlugin as remix } from "@remix-run/dev";
import { vercelPreset } from '@vercel/remix/vite';
import { installGlobals } from '@remix-run/node';
import tsconfigPaths from "vite-tsconfig-paths";

installGlobals();

export default defineConfig({
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "app"), // ✅ Add this line
    },
  },
  plugins: [
    remix({
      presets: [vercelPreset()],
    }),
    tsconfigPaths(),
  ],
});
