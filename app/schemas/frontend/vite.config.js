import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Configuración del servidor Vite
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173
  }
})
