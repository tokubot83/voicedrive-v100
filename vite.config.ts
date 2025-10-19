import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'VoiceDrive',
        short_name: 'VoiceDrive',
        description: '医療職員の声を集め、組織改善につなげるシステム',
        theme_color: '#4F46E5',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/icon-72x72.png',
            sizes: '72x72',
            type: 'image/png'
          },
          {
            src: '/icon-96x96.png',
            sizes: '96x96',
            type: 'image/png'
          },
          {
            src: '/icon-128x128.png',
            sizes: '128x128',
            type: 'image/png'
          },
          {
            src: '/icon-144x144.png',
            sizes: '144x144',
            type: 'image/png'
          },
          {
            src: '/icon-152x152.png',
            sizes: '152x152',
            type: 'image/png'
          },
          {
            src: '/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icon-384x384.png',
            sizes: '384x384',
            type: 'image/png'
          },
          {
            src: '/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,gif,webp,woff,woff2,ttf,eot}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1年
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1年
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30日
              }
            }
          },
          {
            urlPattern: /\.(?:js|css)$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'static-resources',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7日
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: true
      }
    })
  ],
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
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3003',
        changeOrigin: true,
        secure: false
      }
    }
  },
  define: {
    __DEFINES__: {}
  }
})