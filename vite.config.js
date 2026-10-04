import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Vite exposes only VITE_* variables by default. Deliberately expose the
  // public API endpoint under the application's API_URL name instead.
  const env = loadEnv(mode, process.cwd(), 'API_')
  return {
    plugins: [react()],
    define: {
      'import.meta.env.API_URL': JSON.stringify(env.API_URL || 'http://localhost:8000'),
    },
  }
})
