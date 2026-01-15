import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import process from 'node:process'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), './src'),
    },
  },
  build: {
    chunkSizeWarningLimit: 1000, // Optional: increase limit if chunks are still slightly large
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-three-core': ['three'],
          'vendor-react-three': ['@react-three/fiber', '@react-three/drei'],
          'vendor-elevenlabs': ['@elevenlabs/react'],
          'vendor-supabase': ['@supabase/supabase-js'],
        },
      },
    },
  },
})
