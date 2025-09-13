import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Add error boundary for debugging
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
  console.error('Error message:', event.message);
  console.error('Stack trace:', event.error?.stack);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

const rootElement = document.getElementById('root');

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  
  try {
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log('App rendered successfully');
  } catch (error) {
    console.error('Error rendering app:', error);
  }
} else {
  console.error('Root element not found!');
}

// Service Worker登録（モバイル対応強化）
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker 登録成功:', registration.scope);

      // 更新検知
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('新しいService Workerが利用可能です');
              // 必要に応じてユーザーに更新を通知
            }
          });
        }
      });

      // バックグラウンド同期対応
      if ('sync' in registration) {
        await registration.sync.register('sync-interview-bookings');
        console.log('バックグラウンド同期登録完了');
      }

    } catch (error) {
      console.error('Service Worker 登録失敗:', error);
    }
  });
} else {
  console.log('Service Worker はサポートされていません');
}