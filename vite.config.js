import { defineConfig } from "vite";
import path from "path";
import { vitePlugin as remix } from "@remix-run/dev";
import { vercelPreset } from '@vercel/remix/vite';
import { installGlobals } from '@remix-run/node';

installGlobals();

export default defineConfig({
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "app"), // ✅ Add this line
    },
  },
  plugins: [
    // Use the Remix plugin and include the Vercel preset:
    remix({
      presets: [vercelPreset()],
    }),
    tsconfigPaths(),
  ],
});
