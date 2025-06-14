import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { setupDevTools } from './devtools-setup'

console.log('React version:', React.version);
console.log('ReactDOM version:', ReactDOM.version);

// Setup DevTools
setupDevTools();

const rootElement = document.getElementById('root');
console.log('Root element:', rootElement);

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  console.log('React root created');
  
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  
  console.log('React app rendered');
} else {
  console.error('Root element not found!');
}