const CACHE_NAME = 'academy-lms-v1.0.0'
const STATIC_CACHE = 'academy-lms-static-v1'
const DYNAMIC_CACHE = 'academy-lms-dynamic-v1'

const STATIC_FILES = [
  '/',
  '/dashboard',
  '/login',
  '/offline',
  '/manifest.json',
  '/pwa/icon-192x192.png',
  '/pwa/icon-512x512.png'
]

const API_ROUTES = [
  '/api/',
  'supabase.co'
]

// Install Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...')
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Pre-caching static assets')
        return cache.addAll(STATIC_FILES)
      })
      .then(() => {
        console.log('[SW] Skip waiting...')
        self.skipWaiting()
      })
      .catch((error) => {
        console.error('[SW] Installation failed:', error)
      })
  )
})

// Activate Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...')
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName !== STATIC_CACHE && 
                     cacheName !== DYNAMIC_CACHE &&
                     cacheName.startsWith('academy-lms-')
            })
            .map((cacheName) => {
              console.log('[SW] Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            })
        )
      })
      .then(() => {
        console.log('[SW] Claiming clients...')
        return self.clients.claim()
      })
  )
})

// Fetch Strategy
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // Skip non-HTTP requests
  if (!request.url.startsWith('http')) {
    return
  }

  // Skip Chrome extension requests
  if (request.url.startsWith('chrome-extension://')) {
    return
  }

  // Handle API requests with Network First strategy
  if (API_ROUTES.some(route => request.url.includes(route))) {
    event.respondWith(networkFirstStrategy(request))
    return
  }

  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(navigationHandler(request))
    return
  }

  // Handle static assets with Cache First strategy
  if (request.destination === 'image' || 
      request.destination === 'script' || 
      request.destination === 'style') {
    event.respondWith(cacheFirstStrategy(request))
    return
  }

  // Default to Network First for everything else
  event.respondWith(networkFirstStrategy(request))
})

// Network First Strategy (for API calls and dynamic content)
async function networkFirstStrategy(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request)
    
    // If successful, update cache and return response
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url)
    
    // If network fails, try cache
    const cachedResponse = await caches.match(request)
    
    if (cachedResponse) {
      return cachedResponse
    }
    
    // If no cache, return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/offline')
    }
    
    // Return a generic offline response for other requests
    return new Response(
      JSON.stringify({ error: 'Offline', message: 'No network connection' }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  }
}

// Cache First Strategy (for static assets)
async function cacheFirstStrategy(request) {
  try {
    // Try cache first
    const cachedResponse = await caches.match(request)
    
    if (cachedResponse) {
      // Update cache in background
      fetch(request).then((networkResponse) => {
        if (networkResponse.ok) {
          caches.open(STATIC_CACHE).then((cache) => {
            cache.put(request, networkResponse)
          })
        }
      })
      
      return cachedResponse
    }
    
    // If not in cache, fetch from network
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('[SW] Cache and network failed:', request.url)
    
    // Return a placeholder for images
    if (request.destination === 'image') {
      return new Response(
        '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="#f0f0f0"/><text x="100" y="100" text-anchor="middle" dy=".3em" fill="#999">Image unavailable</text></svg>',
        { headers: { 'Content-Type': 'image/svg+xml' } }
      )
    }
    
    throw error
  }
}

// Navigation Handler
async function navigationHandler(request) {
  try {
    // Try network first for navigation
    return await fetch(request)
  } catch (error) {
    console.log('[SW] Navigation failed, serving offline page')
    
    // Serve offline page
    return caches.match('/offline') || caches.match('/')
  }
}

// Background Sync for failed requests
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag)
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Retry failed requests
      retryFailedRequests()
    )
  }
})

async function retryFailedRequests() {
  // Get failed requests from IndexedDB and retry them
  // This would integrate with your app's offline queue
  console.log('[SW] Retrying failed requests...')
}

// Push Notification Handler
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received')
  
  if (!event.data) {
    return
  }

  const options = {
    body: event.data.text(),
    icon: '/pwa/icon-192x192.png',
    badge: '/pwa/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/pwa/icon-72x72.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/pwa/icon-72x72.png'
      }
    ]
  }

  event.waitUntil(
    self.registration.showNotification('Academy LMS', options)
  )
})

// Notification Click Handler
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification click received:', event.action)
  
  event.notification.close()

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/dashboard')
    )
  }
})

// Message Handler (for communication with main thread)
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data)
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME })
  }
})