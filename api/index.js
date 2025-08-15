// api/index.js - tiny wrapper that imports and runs the built Remix server
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// If build/index.js is ESM, import it; otherwise require
const built = await import(path.join(__dirname, "../build/index.js"));

export default function handler(req, res) {
  // The built Remix server exports a function that handles requests.
  // The import above should result in module default/exports suitable for Node.
  // If the server exports a request handler differently, adjust this wrapper as needed.
  if (built && typeof built.default === "function") {
    return built.default(req, res);
  }
  // fallback: try run exported handler
  if (built && built.handler) {
    return built.handler(req, res);
  }
  res.statusCode = 500;
  res.end("server entry not found");
}
