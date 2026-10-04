import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Vite exposes only VITE_* variables by default. Deliberately expose the
  // public API endpoint under the application's API_URL name instead.
  const apiEnv = loadEnv(mode, process.cwd(), 'API_')
  const googleEnv = loadEnv(mode, process.cwd(), 'GOOGLE_')
  return {
    plugins: [react()],
    define: {
      'import.meta.env.API_URL': JSON.stringify(apiEnv.API_URL || 'http://localhost:8000'),
      'import.meta.env.GOOGLE_CLIENT_ID': JSON.stringify(googleEnv.GOOGLE_CLIENT_ID || ''),
    },
  }
})
