// scripts/validate-preset.mjs
try {
  const { vercelPreset } = await import("@vercel/remix/vite");
  console.log(">>> validate-preset: vercelPreset type =", typeof vercelPreset);
  // call the preset to ensure it returns a function/config
  const fake = vercelPreset();
  console.log(">>> validate-preset: vercelPreset() returned typeof", typeof fake);
} catch (e) {
  console.error(">>> validate-preset FAILED:", e && e.message);
  process.exit(1);
}
