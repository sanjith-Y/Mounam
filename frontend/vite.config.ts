import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 4173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
  build: {
    // Increase warning threshold to 800 kB given MediaPipe is unavoidably large
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks: (id: string) => {
          // Split MediaPipe into its own chunk — deferred load avoids blocking initial paint
          if (id.includes('@mediapipe')) return 'mediapipe';
          // Split Lucide icons separately — large icon lib
          if (id.includes('lucide-react')) return 'lucide';
          // Split Firebase SDK
          if (id.includes('firebase')) return 'firebase';
          // All other vendor node_modules
          if (id.includes('node_modules')) return 'vendor';
        },
      },
    },
  },
})
