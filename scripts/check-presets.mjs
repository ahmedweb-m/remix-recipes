// scripts/check-presets.mjs
console.log('>>> running check-presets.mjs');

try {
  const mod = await import('@vercel/remix/vite');
  console.log('>>> import of @vercel/remix/vite succeeded; vercelPreset type =', typeof mod.vercelPreset);
} catch (e) {
  console.error('>>> import of @vercel/remix/vite FAILED:', e && e.message ? e.message : e);
  // don't exit non-zero here — we want to see remix build logs too, but you can uncomment the line below if desired
  // process.exit(1);
}

try {
  const vr = await import('@vercel/remix/package.json').catch(()=>null);
  console.log('>>> @vercel/remix package.json load attempt result =', !!vr);
} catch(e){
  console.error('>>> reading @vercel/remix/package.json failed:', e && e.message ? e.message : e);
}
