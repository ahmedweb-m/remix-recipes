// vite.config.js — export async config so Remix can load it reliably in CI
import { defineConfig } from "vite";
import path from "path";
import tsconfigPaths from "vite-tsconfig-paths";
import { vitePlugin as remix } from "@remix-run/dev";
import { vercelPreset } from "@vercel/remix/vite";
import { installGlobals } from "@remix-run/node";

installGlobals();

export default defineConfig(async () => {
  const rem = remix({
    presets: [vercelPreset()],
  });

  return {
    resolve: {
      alias: {
        "~": path.resolve(__dirname, "app"),
      },
    },
    plugins: [
      rem,
      tsconfigPaths(),
    ],
  };
});
