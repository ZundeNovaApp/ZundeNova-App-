const CACHE_NAME = 'zundenova-v1.0.0';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/offline.html',
  '/favicon.ico',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        
        return fetch(event.request).then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      }
    )
  );
});

self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('Background sync triggered');
    event.waitUntil(syncOfflineData());
  }
});

self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New notification from ZundeNova',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Details',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/xmark.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('ZundeNova', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

async function syncOfflineData() {
  try {
    const offlineData = await getOfflineData();
    
    for (const data of offlineData) {
      try {
        const response = await fetch('/api/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data)
        });

        if (response.ok) {
          await markAsSynced(data.id);
          console.log(`Synced data: ${data.id}`);
        }
      } catch (error) {
        console.error('Sync failed for:', data.id, error);
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

async function getOfflineData() {
  return new Promise((resolve) => {
    const request = indexedDB.open('ZundeNovaOfflineDB', 1);
    
    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(['offlineData'], 'readonly');
      const store = transaction.objectStore('offlineData');
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = () => {
        const unsynced = getAllRequest.result.filter(item => !item.synced);
        resolve(unsynced);
      };
    };
    
    request.onerror = () => {
      resolve([]);
    };
  });
}

async function markAsSynced(id) {
  return new Promise((resolve) => {
    const request = indexedDB.open('ZundeNovaOfflineDB', 1);
    
    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(['offlineData'], 'readwrite');
      const store = transaction.objectStore('offlineData');
      
      const getRequest = store.get(id);
      getRequest.onsuccess = () => {
        const data = getRequest.result;
        if (data) {
          data.synced = true;
          store.put(data);
        }
        resolve();
      };
    };
    
    request.onerror = () => {
      resolve();
    };
  });
}

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
