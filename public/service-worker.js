
/* eslint-disable no-restricted-globals */
importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');

workbox.setConfig({ debug: false });

// Precache the main application shell
workbox.precaching.precacheAndRoute([
  { url: '/', revision: null },
  { url: '/index.html', revision: null },
  { url: '/manifest.json', revision: null },
  { url: '/logo192.png', revision: null },
  { url: '/logo512.png', revision: null },
]);

// Cache Google Fonts
workbox.routing.registerRoute(
  ({ url }) => url.origin === 'https://fonts.googleapis.com',
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'google-fonts-stylesheets',
  })
);
workbox.routing.registerRoute(
  ({ url }) => url.origin === 'https://fonts.gstatic.com',
  new workbox.strategies.CacheFirst({
    cacheName: 'google-fonts-webfonts',
    plugins: [
      new workbox.cacheableResponse.CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new workbox.expiration.ExpirationPlugin({
        maxAgeSeconds: 60 * 60 * 24 * 365,
        maxEntries: 30,
      }),
    ],
  })
);

// Listen for the sync event
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-trips') {
    event.waitUntil(processSyncQueue());
  }
});

async function processSyncQueue() {
  const db = await openDb();

  const syncQueueStore = db.transaction('syncQueue', 'readonly').objectStore('syncQueue');
  const queuedItems = await getAllFromStore(syncQueueStore);
  if (!queuedItems || queuedItems.length === 0) {
    console.log('Sync queue is empty.');
    return;
  }
  
  const tripsStore = db.transaction('trips', 'readonly').objectStore('trips');
  const tripsToSync = [];

  for (const item of queuedItems) {
      if (item.type === 'UPLOAD_TRIP') {
        const trip = await getFromStore(tripsStore, item.payload.localId);
        if (trip && !trip.synced) {
            tripsToSync.push({
                clientTripId: trip.id,
                ...trip
            });
        }
      }
  }

  if (tripsToSync.length === 0) {
      console.log('No trips to sync.');
      return;
  }
  
  try {
    // This is a mock API endpoint. Replace with your actual backend.
    const response = await fetch('/api/sync/trips', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
          clientId: 'user-uuid-placeholder',
          deviceId: 'device-uuid-placeholder',
          trips: tripsToSync,
      }),
    });

    if (response.ok) {
        // Mock response structure
        const results = {
            results: tripsToSync.map(t => ({
                clientTripId: t.clientTripId,
                status: 'created',
                serverTripId: `srv-${Date.now()}-${t.clientTripId}`
            }))
        };
        
        const updateTx = db.transaction(['trips', 'syncQueue'], 'readwrite');
        const tripsUpdateStore = updateTx.objectStore('trips');
        const syncQueueDeleteStore = updateTx.objectStore('syncQueue');

        for (const result of results.results) {
            if(result.status === 'created') {
                const trip = await getFromStore(tripsUpdateStore, result.clientTripId);
                if (trip) {
                    trip.synced = true;
                    trip.serverId = result.serverTripId;
                    await putInStore(tripsUpdateStore, trip);
                }
                const itemToDelete = queuedItems.find(i => i.payload.localId === result.clientTripId);
                if(itemToDelete) {
                    await deleteFromStore(syncQueueDeleteStore, itemToDelete.id);
                }
            }
        }
        await updateTx.done;
        console.log('Sync successful');
    } else {
      console.error('Sync failed:', response.statusText);
      // Item remains in queue for next sync attempt
    }
  } catch (error) {
    console.error('Error during sync:', error);
    // Item remains in queue for next sync attempt
  }
}

// Helper functions for raw IndexedDB access
function openDb() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('BikeAdvanceDB', 1);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
    });
}

function getAllFromStore(store) {
    return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
    });
}

function getFromStore(store, key) {
    return new Promise((resolve, reject) => {
        const request = store.get(key);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
    });
}

function putInStore(store, value) {
     return new Promise((resolve, reject) => {
        const request = store.put(value);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
    });
}

function deleteFromStore(store, key) {
     return new Promise((resolve, reject) => {
        const request = store.delete(key);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
    });
}
