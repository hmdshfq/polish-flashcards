import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { registerServiceWorker } from './services/serviceWorker'
import { initializeAuth } from './services/firebase'

// Initialize service worker for offline support
registerServiceWorker().catch(err => {
  console.warn('Failed to register service worker:', err);
});

// Initialize Firebase authentication and render app
// Creates anonymous session if none exists
initializeAuth()
  .then(() => {
    createRoot(document.getElementById('root')).render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  })
  .catch(err => {
    console.error('Failed to initialize authentication:', err);
    // Still render app even if auth fails, some features will be unavailable
    createRoot(document.getElementById('root')).render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  });
