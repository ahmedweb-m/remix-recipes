// vite.config.js (top)
import { vitePlugin as remix } from "@remix-run/dev";
import { vercelPreset } from "@vercel/remix/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vite";
import path from "path";
import { installGlobals } from "@remix-run/node";

installGlobals();

const remPlugin = remix({
  presets: [vercelPreset()],
});

// debug prints for CI (this will show in Vercel logs)
console.log(">>> REMIX PLUGIN CREATED:", !!remPlugin);
try {
  // attempt to inspect plugin internals
  console.log(">>> remPlugin keys:", Object.keys(remPlugin || {}));
  if (remPlugin && remPlugin.config) {
    // if the plugin exposes its config or presets, show it
    try {
      const cfg = remPlugin.config;
      console.log(">>> remPlugin.config (type):", typeof cfg);
    } catch (e) {
      console.log(">>> remPlugin.config read failed:", e && e.message);
    }
  }
} catch (e) {
  console.log(">>> remPlugin introspect failed:", e && e.message);
}

export default defineConfig({
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "app"), // ✅ Add this line
    },
  },
  plugins: [
    remPlugin,
    tsconfigPaths(),
  ],
});
