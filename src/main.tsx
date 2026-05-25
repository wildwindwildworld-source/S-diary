// Ensure the page is loaded with a trailing slash on GitHub Pages if it's a directory path.
// This is critical to prevent relative assets/SW/Manifest from resolving to the parent path (which causes 404s).
if (!window.location.pathname.endsWith('/') && !window.location.pathname.split('/').pop()?.includes('.')) {
  window.location.replace(window.location.pathname + '/' + window.location.search + window.location.hash);
}

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Relative path with cache-busting to register service worker correctly under subdirectories
    navigator.serviceWorker.register('./sw.js?v=2')
      .then((reg) => {
        console.log('Service Worker registered successfully!', reg);
        // Prompt immediate update checks
        reg.update();
      })
      .catch((err) => console.error('Service Worker registration failed:', err));
  });
}
