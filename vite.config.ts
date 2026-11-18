import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'
import { dashboardShowcase } from './scripts/dashboard-showcase.ts'

const showcase = dashboardShowcase(fileURLToPath(new URL('./', import.meta.url)), fileURLToPath(new URL('../web-dashboard/', import.meta.url)))

export default defineConfig({
  plugins: [react(), tailwindcss(), showcase.plugin],
  publicDir: showcase.publicDir,
  server: { host: '127.0.0.1', port: 5173, strictPort: true },
  build: { target: 'es2022' },
})
