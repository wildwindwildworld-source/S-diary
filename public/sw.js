const CACHE_NAME = 'stool-appliance-diary-v2';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './app_icon.svg'
];

// インストール時にキャッシュ
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// アクティベート時に古いキャッシュをクリーンアップ
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// フェッチ時にキャッシュまたはネットワークから取得
self.addEventListener('fetch', (event) => {
  // GETリクエストのみをキャッシュ対象とする（APIなどのPOSTを避けるため）
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((response) => {
        // 正常なレスポンスのみをキャッシュ
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return response;
      }).catch(() => {
        // オフライン時のナビゲート用のフォールバック
        if (event.request.mode === 'navigate') {
          return caches.match('./');
        }
      });
    })
  );
});
