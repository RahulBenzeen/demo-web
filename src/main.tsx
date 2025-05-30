
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

import { setupNotifications  } from '@/lib/notifications.ts';

// Register service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/firebase-messaging-sw.js')
    .then(registration => {
      console.log('Service Worker registered:', registration);
      setupNotifications();
    })
    .catch(error => {
      console.error('Service Worker registration failed:', error);
    });
} else {
  console.warn('Service Workers not supported');
}


createRoot(document.getElementById('root')!).render(<App />);
