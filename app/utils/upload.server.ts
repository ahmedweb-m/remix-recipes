// app/utils/upload.server.ts
import {
  unstable_parseMultipartFormData,
  unstable_composeUploadHandlers,
  unstable_createFileUploadHandler,
  unstable_createMemoryUploadHandler,
} from "@remix-run/node";
import path from "path";
import fs from "fs/promises";

// ✅ Always resolve relative to project root
const uploadDir = path.join(process.cwd(), "public", "uploads");

export async function ensureUploadDir() {
  await fs.mkdir(uploadDir, { recursive: true });
  console.log("✅ Upload directory ensured:", uploadDir);
}

/**
 * Parse the multipart form and stream files to disk under public/uploads.
 * Returns a FormData-like object where file fields are saved file paths.
 */
export async function parseMultipartForm(request: Request) {
  await ensureUploadDir();

  const uploadHandler = unstable_composeUploadHandlers(
    unstable_createFileUploadHandler({
      directory: uploadDir,
      // Avoid filename collisions
      file: ({ filename }) => {
        const safeName = filename.replace(/\s+/g, "-");
        const uniqueName = `${Date.now()}-${safeName}`;
        console.log("📂 Saving uploaded file as:", uniqueName);
        return uniqueName;
      },
    }),
    // Fallback for text fields
    unstable_createMemoryUploadHandler()
  );

  const formData = await unstable_parseMultipartFormData(request, uploadHandler);
  return formData;
}

/**
 * Given the value returned in FormData for a file field,
 * return a web path like "/uploads/xxx.png" or null
 */
// app/utils/upload.server.ts
export function getFilePublicPath(uploadResult: unknown) {
  if (!uploadResult) return null;

  // Handle the NodeOnDiskFile object
  if (
    typeof uploadResult === "object" &&
    uploadResult !== null &&
    "filepath" in uploadResult &&
    typeof (uploadResult as any).filepath === "string"
  ) {
    const filepath = (uploadResult as any).filepath as string;
    const filename = path.basename(filepath);
    return `/uploads/${filename}`;
  }

  // If string (old case)
  if (typeof uploadResult === "string") {
    const filename = path.basename(uploadResult);
    return `/uploads/${filename}`;
  }

  // If a File kept in memory (no file uploaded)
  if (uploadResult instanceof File) {
    if (uploadResult.size === 0) return null;
    console.warn("File was kept in memory:", uploadResult.name);
    return null;
  }

  return null;
}


