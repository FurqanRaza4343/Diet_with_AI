import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  define: {
    global: 'globalThis',
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) return 'vendor';
          if (id.includes('node_modules/recharts')) return 'charts';
          if (id.includes('node_modules/framer-motion') || id.includes('node_modules/react-hot-toast')) return 'ui';
          if (id.includes('node_modules/@reduxjs/toolkit') || id.includes('node_modules/react-redux')) return 'redux';
        },
      },
    },
  },
})
