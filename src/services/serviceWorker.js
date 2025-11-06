/**
 * Service Worker Registration and Management
 */

let swRegistration = null;

/**
 * Register the service worker
 */
export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    console.warn('[SW] Service Workers not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    });

    swRegistration = registration;
    console.log('[SW] Service Worker registered successfully');

    // Check for updates periodically
    setInterval(() => {
      registration.update();
    }, 60000); // Check every minute

    // Listen for updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      console.log('[SW] New service worker found');

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // New service worker is ready
          console.log('[SW] New service worker ready to activate');
          notifyUpdateAvailable();
        }
      });
    });

    return registration;
  } catch (error) {
    console.error('[SW] Registration failed:', error);
    return null;
  }
}

/**
 * Unregister the service worker (for development/cleanup)
 */
export async function unregisterServiceWorker() {
  if (!swRegistration) return;

  try {
    const success = await swRegistration.unregister();
    if (success) {
      swRegistration = null;
      console.log('[SW] Service Worker unregistered');
    }
  } catch (error) {
    console.error('[SW] Unregistration failed:', error);
  }
}

/**
 * Request sync for progress updates (background sync)
 */
export async function requestProgressSync() {
  if (!swRegistration || !('sync' in swRegistration)) {
    console.warn('[SW] Background Sync API not supported');
    return false;
  }

  try {
    await swRegistration.sync.register('sync-progress');
    console.log('[SW] Progress sync requested');
    return true;
  } catch (error) {
    console.error('[SW] Sync request failed:', error);
    return false;
  }
}

/**
 * Notify the app when a service worker update is available
 */
function notifyUpdateAvailable() {
  // Dispatch custom event that the app can listen to
  window.dispatchEvent(new CustomEvent('sw-update-available', {
    detail: { registration: swRegistration }
  }));

  console.log('[SW] Update notification sent to app');
}

/**
 * Skip waiting - activate pending service worker immediately
 */
export function skipWaiting() {
  if (!swRegistration || !swRegistration.waiting) {
    return;
  }

  swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
  console.log('[SW] Requesting immediate activation');
}

/**
 * Get the current service worker registration
 */
export function getServiceWorkerRegistration() {
  return swRegistration;
}

/**
 * Listen for service worker messages
 */
export function onServiceWorkerMessage(callback) {
  if (!('serviceWorker' in navigator)) return;

  navigator.serviceWorker.addEventListener('message', event => {
    callback(event.data);
  });
}

/**
 * Send message to service worker
 */
export function postToServiceWorker(message) {
  if (!navigator.serviceWorker.controller) {
    console.warn('[SW] No active service worker to send message to');
    return;
  }

  navigator.serviceWorker.controller.postMessage(message);
}
