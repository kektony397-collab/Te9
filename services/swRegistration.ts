
export async function registerSW() {
  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('/service-worker.js');
      console.log('Service Worker registered successfully.');
    } catch (e) {
      console.error('Service Worker registration failed:', e);
    }
  }
}

export async function tryRegisterSync() {
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    try {
      const reg = await navigator.serviceWorker.ready;
      // FIX: Cast registration to `any` to access the experimental `sync` property, which is not in the default ServiceWorkerRegistration type.
      await (reg as any).sync.register('sync-trips');
      console.log('Background sync registered.');
    } catch (e) {
      console.warn('Background sync registration failed:', e);
    }
  }
}
