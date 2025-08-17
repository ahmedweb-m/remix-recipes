// scripts/inspect-remix-config.mjs
import path from "path";
import fs from "fs";
import { readConfig } from "@remix-run/dev/dist/config.js";

(async () => {
  try {
    console.log(">>> inspect-remix-config: cwd=", process.cwd());
    const cfg = await readConfig(process.cwd());
    console.log(">>> remix.config resolved:");
    console.log("  serverBuildTarget:", cfg.serverBuildTarget);
    console.log("  serverModuleFormat:", cfg.serverModuleFormat);
    console.log("  root:", cfg.root);
    console.log("  appDirectory:", cfg.appDirectory);
    console.log("  assetsBuildDirectory:", cfg.assetsBuildDirectory);
    // attempt to inspect Vite config if available
    try {
      const viteCfg = await cfg.viteConfig;
      console.log(">>> viteConfig type:", typeof viteCfg);
      // If the plugin list is accessible, print plugin names
      if (viteCfg && viteCfg.plugins) {
        console.log(">>> viteConfig.plugins count:", viteCfg.plugins.length);
        console.log(">>> viteConfig.plugins names (map):", viteCfg.plugins.map(p => p && p.name));
      } else {
        console.log(">>> viteConfig.plugins not available or empty");
      }
    } catch (e) {
      console.log(">>> reading cfg.viteConfig failed:", e && e.message ? e.message : e);
    }
    console.log(">>> Listing project root files:");
    console.log(fs.readdirSync(process.cwd()).join(", "));
  } catch (err) {
    console.error(">>> inspect-remix-config FAILED:", err && err.stack ? err.stack : err);
    process.exit(1);
  }
})();
