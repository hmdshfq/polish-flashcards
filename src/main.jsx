import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { registerServiceWorker } from './services/serviceWorker'
import { initializeAuth } from './services/supabase'

// Initialize service worker for offline support
registerServiceWorker().catch(err => {
  console.warn('Failed to register service worker:', err);
});

// Initialize Supabase authentication
initializeAuth().catch(err => {
  console.error('Failed to initialize authentication:', err);
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
