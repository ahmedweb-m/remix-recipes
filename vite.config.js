import { defineConfig } from "vite";
import path from "path";
import { vitePlugin as remix } from "@remix-run/dev";

export default defineConfig({
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "app"), // ✅ Add this line
    },
  },
  plugins: [remix()],
});
