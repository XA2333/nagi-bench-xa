import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Served at https://nagi-studio.github.io/nagi-bench/
export default defineConfig({
  base: '/nagi-bench/',
  plugins: [react(), tailwindcss()],
})
