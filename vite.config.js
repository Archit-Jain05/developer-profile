import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // The Three.js chunk (~1 MB, ~275 kB gzipped) is lazy-loaded by the hero
    // scene after first paint, so a larger limit than the default is expected.
    chunkSizeWarningLimit: 1100,
    rolldownOptions: {
      output: {
        // Keep large libraries in their own long-cacheable chunks.
        codeSplitting: {
          groups: [
            { name: 'supabase', test: /node_modules[\\/]@supabase/ },
            { name: 'react', test: /node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/ },
            { name: 'three', test: /node_modules[\\/](three|three-stdlib|@react-three)[\\/]/ },
          ],
        },
      },
    },
  },
  test: {
    environment: 'node',
  },
})
