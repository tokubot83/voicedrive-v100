import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    rollupOptions: {
      onwarn(warning, warn) {
        if (warning.code === 'UNRESOLVED_IMPORT') return
        if (warning.code === 'CIRCULAR_DEPENDENCY') return
        if (warning.code === 'THIS_IS_UNDEFINED') return
        warn(warning)
      },
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          vendor: ['lucide-react']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  esbuild: {
    logOverride: { 
      'this-is-undefined-in-esm': 'silent',
      'direct-eval': 'silent'
    }
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  server: {
    port: 5173
  }
})