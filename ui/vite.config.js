import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineConfig({
  plugins: [svelte()],
  base: './',
  build: {
    manifest: true,
    outDir: 'dist',
    assetsDir: '.',
    sourcemap: false,
    rollupOptions: {
      // overwrite default .html entry
      input: '/src/main.js',
    },
  }
})
