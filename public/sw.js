const CACHE_NAME = 'delio-pwa-cache-v1';

// Assets to cache immediately on SW activation
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/src/main.js',
  '/src/router.js',
  '/src/assets/styles.css',
  '/src/utils/geo-data.js',
  '/src/utils/helpers.js',
  '/src/services/supabase.js',
  '/src/services/auth-service.js',
  '/src/services/db-service.js',
  '/src/services/chat-service.js',
  '/src/components/common/navbar.js',
  '/src/components/common/notification.js',
  '/src/components/auth/login-form.js',
  '/src/components/auth/register-form.js',
  '/src/components/auth/user-profile.js',
  '/src/components/board/errand-board.js',
  '/src/components/board/errand-card.js',
  '/src/components/board/errand-filters.js',
  '/src/components/board/errand-form.js',
  '/src/components/chat/chat-list.js',
  '/src/components/chat/chat-window.js',
  '/manifest.json',
  '/favicon.ico',
  '/icon-192.png',
  '/icon-512.png',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700;800&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// SW Install Event: Cache core files
self.addEventListener('install', (e) => {
  console.log('[Delio SW] Install Event: Pre-caching static assets...');
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

// SW Activate Event: Clear past outdated caches
self.addEventListener('activate', (e) => {
  console.log('[Delio SW] Activate Event: Cleaning old cache vaults...');
  e.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log(`[Delio SW] Deleting obsolete cache: ${name}`);
            return caches.delete(name);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// SW Fetch Interceptor: Cache-First for static assets, Network-First for API/DB queries
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // Bypass caching for Supabase DB API calls, real-time WebSocket traffic, or live authentication
  if (url.origin.includes('supabase.co') || url.pathname.includes('/rest/v1') || url.pathname.includes('/auth/v1')) {
    e.respondWith(
      fetch(e.request).catch(() => {
        // Fallback for API offline calls (just return offline code or custom message)
        return new Response(JSON.stringify({ error: "Estás desconectado de internet. Reconecta para ver actualizaciones." }), {
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }

  // Cache-First strategy for local scripts, styles, markup, and external assets (Google Fonts, FontAwesome)
  e.respondWith(
    caches.match(e.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          // Serve from cache but fetch fresh copy in background to keep assets updated (Stale-While-Revalidate)
          fetch(e.request)
            .then((networkResponse) => {
              if (networkResponse.status === 200) {
                caches.open(CACHE_NAME).then((cache) => cache.put(e.request, networkResponse));
              }
            })
            .catch(() => {/* Ignore background reload errors when offline */});
            
          return cachedResponse;
        }

        // Cache miss: Load from internet
        return fetch(e.request).then((response) => {
          // Do not cache non-successful, range, or POST/PUT request responses
          if (!response || response.status !== 200 || e.request.method !== 'GET') {
            return response;
          }

          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, responseToCache);
          });

          return response;
        });
      })
      .catch(() => {
        // Ultimate Offline Fallback: If navigating index.html and offline, return the cached SPA entry
        if (e.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      })
  );
});

// SW Push Notification Event Listener (iOS 16.4+ / Android Chrome support)
self.addEventListener('push', (e) => {
  console.log('[Delio SW] Push Notification event received.');
  
  let payload = {
    title: 'Delio México',
    body: 'Tienes un nuevo mensaje de negociación offline o mandado publicado en tu zona.',
    icon: '/icon-192.png',
    badge: '/favicon.ico',
    vibrate: [100, 50, 100],
    data: { url: '/#/chats' }
  };

  if (e.data) {
    try {
      const parsed = e.data.json();
      payload = { ...payload, ...parsed };
    } catch (parseErr) {
      payload.body = e.data.text();
    }
  }

  e.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: payload.icon,
      badge: payload.badge,
      vibrate: payload.vibrate,
      data: payload.data
    })
  );
});

// SW Notification Click: Focus standalone PWA window and route to DMs
self.addEventListener('notificationclick', (e) => {
  console.log('[Delio SW] Notification clicked.');
  e.notification.close();

  const targetUrl = e.notification.data?.url || '/#/';

  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // If there's an active app window open, focus it and redirect
        for (const client of clientList) {
          if (client.url.includes(self.registration.scope) && 'focus' in client) {
            client.postMessage({ type: 'NAVIGATE', url: targetUrl });
            return client.focus();
          }
        }
        
        // Otherwise, open a fresh standalone window at the thread route
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      })
  );
});
