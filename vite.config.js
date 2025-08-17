import { defineConfig } from "vite";
import path from "path";
import { vitePlugin as remix } from "@remix-run/dev";
import { vercelPreset } from '@vercel/remix/vite';
import { installGlobals } from '@remix-run/node';
import tsconfigPaths from "vite-tsconfig-paths";

installGlobals();
// vite.config.js (top)
console.log('>>> VITE CONFIG LOADED — NODE_ENV=', process.env.NODE_ENV);
try {
  // will show whether the vercelPreset symbol exists at import time
  import('@vercel/remix/vite').then(m => {
    console.log('>>> vercelPreset import ok — typeof:', typeof m.vercelPreset);
  }).catch(e => {
    console.error('>>> vercelPreset import FAILED:', e && e.message ? e.message : e);
  });
} catch (e) {
  console.error('>>> vercelPreset top-level import try-catch failed:', e && e.message ? e.message : e);
}

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
