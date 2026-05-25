import { defineConfig } from "vite";

export default defineConfig({
  build: {
    emptyOutDir: false,
    outDir: "dist/assets",
    lib: {
      entry: "scripts/qrcode-browser-entry.js",
      name: "QRCode",
      formats: ["iife"],
      fileName: () => "qrcode-local.js"
    },
    rollupOptions: {
      output: {
        extend: true
      }
    },
    minify: false
  }
});
