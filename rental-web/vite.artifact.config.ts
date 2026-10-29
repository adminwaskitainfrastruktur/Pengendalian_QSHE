import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Build satu berkas untuk dipratinjau sebagai halaman Artifact: semua JS dan CSS jadi satu.
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist-artifact',
    cssCodeSplit: false,
    assetsInlineLimit: 100_000_000,
    rollupOptions: { output: { inlineDynamicImports: true, entryFileNames: 'app.js', assetFileNames: 'app[extname]' } },
  },
})
