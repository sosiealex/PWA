// wwwroot/service-worker.js
const CACHE_NAME = 'pwa-cache-v2';
const urlsToCache = [
    '/',
    '/NFC',
    '/QRCODE',
    '/ID',
    '/GPS',
    '/offline.html',
    '/lib/bootstrap/dist/css/bootstrap.min.css',
    '/css/site.css',
    '/js/site.js',
    '/manifest.json',
    '/images/icon-512x512.png',
    '/images/icon-192x192.png'
];

// 安裝 Service Worker 並快取所有資產
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: 打開快取');
                return cache.addAll(urlsToCache);
            })
            .then(() => self.skipWaiting())
            .catch((error) => {
                console.error('Service Worker: 快取失敗', error);
            })
    );
});

// 啟用 Service Worker
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Service Worker: 刪除舊快取:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});



self.addEventListener("updatefound", (event) => {
    console.log("Service Worker update found!");
});


// 快取優先，背景更新
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            // 啟動背景更新
            const fetchPromise = fetch(event.request)
                .then((networkResponse) => {
                    // 僅快取有效回應，且只快取 http/https
                    if (
                        networkResponse &&
                        networkResponse.status === 200 &&
                        networkResponse.type === 'basic' &&
                        event.request.url.startsWith('http')
                    ) {
                        const responseToCache = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, responseToCache);
                        });
                    }
                    return networkResponse;
                })
                .catch(() => {
                    // 網路失敗時不處理
                });

            // 若有快取，立即回應，並在背景更新
            if (cachedResponse) {
                event.waitUntil(fetchPromise);
                return cachedResponse;
            }
            // 沒有快取，直接用網路
            return fetchPromise.then((networkResponse) => {
                return networkResponse || caches.match('/offline.html');
            });
        })
    );
});
