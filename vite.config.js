import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

// Replicate __dirname for modern ES Modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Maps the "@" symbol to your "src" folder
      "@": path.resolve(__dirname, "./src"),
    },
    // Tells Vite to try these extensions if they are missing in the import
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json']
  },
  build: {
    // Ensures a clean build on Vercel
    outDir: 'dist',
  }
})
