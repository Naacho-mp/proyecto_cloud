import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    __API_URL__: JSON.stringify(process.env.VITE_API_URL || 'http://localhost:8000/api'),
    __WEBPAY_URL__: JSON.stringify(process.env.VITE_WEBPAY_URL || 'http://localhost:8080/java'),
  }
})
