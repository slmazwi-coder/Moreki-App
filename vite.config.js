import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

// We create our own __dirname because it's not available in modern ES Modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // This is the "magic" that tells Vite that @/ means the src folder
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
