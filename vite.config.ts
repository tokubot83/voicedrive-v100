import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  publicDir: 'public',
  build: {
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false, // 一時的にconsoleログを残す（デバッグ用）
        drop_debugger: true
      }
    },
    target: 'es2020',
    outDir: 'dist',
    rollupOptions: {
      onwarn(warning, warn) {
        if (warning.code === 'UNRESOLVED_IMPORT') return
        if (warning.code === 'CIRCULAR_DEPENDENCY') return
        if (warning.code === 'THIS_IS_UNDEFINED') return
        warn(warning)
      },
      output: {
        manualChunks(id) {
          // React関連
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react';
          }
          
          // ルーティング関連
          if (id.includes('node_modules/react-router')) {
            return 'router';
          }
          
          // UI ライブラリ
          if (id.includes('node_modules/lucide-react')) {
            return 'ui';
          }
          
          // 大きなサービスファイルを分割
          if (id.includes('src/services/PostVisibilityEngine')) {
            return 'visibility-engine';
          }
          
          if (id.includes('src/hooks/projects/useProjectScoring')) {
            return 'project-scoring';
          }
          
          // デモデータを分割
          if (id.includes('src/data/demo/')) {
            return 'demo-data';
          }
          
          // ダッシュボード関連コンポーネント
          if (id.includes('src/components/dashboards/') || id.includes('src/pages/') && id.includes('Dashboard')) {
            return 'dashboards';
          }
          
          // 分析コンポーネント
          if (id.includes('src/components/analytics/')) {
            return 'analytics-components';
          }
          
          // 権限システム
          if (id.includes('src/permissions/')) {
            return 'permissions';
          }
          
          // その他のサービス
          if (id.includes('src/services/')) {
            return 'services';
          }
          
          // その他のnode_modules
          if (id.includes('node_modules/')) {
            return 'vendor';
          }
        },
        assetFileNames: (assetInfo) => {
          if (!assetInfo.name) return 'assets/[name]-[hash][extname]';
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        }
      }
    },
    assetsInlineLimit: 4096,
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
    port: 5173,
    strictPort: true,
    host: true
  }
})