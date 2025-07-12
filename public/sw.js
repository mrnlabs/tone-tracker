// Service Worker for Activation Tracker PWA
const CACHE_NAME = 'activation-tracker-v1'
const STATIC_CACHE = 'static-v1'
const DYNAMIC_CACHE = 'dynamic-v1'

// Files to cache immediately (production assets only)
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/favicon.ico',
  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png',
  '/apple-touch-icon.png',
  '/favicon-16x16.png',
  '/favicon-32x32.png'
]

// API endpoints to cache
const API_CACHE_PATTERNS = [
  '/api/auth/profile',
  '/api/users/profile',
  '/api/dashboard/stats'
]

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...')
  
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => {
      console.log('Service Worker: Caching static assets')
      return cache.addAll(STATIC_ASSETS)
    }).then(() => {
      console.log('Service Worker: Static assets cached')
      return self.skipWaiting()
    }).catch(error => {
      console.error('Service Worker: Failed to cache static assets', error)
    })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...')
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('Service Worker: Deleting old cache', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    }).then(() => {
      console.log('Service Worker: Activated')
      return self.clients.claim()
    })
  )
})

// Fetch event - network first with cache fallback
self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }

  // Skip unsupported URL schemes (chrome-extension, chrome, moz-extension, etc.)
  if (!url.protocol.startsWith('http')) {
    return
  }

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request))
    return
  }

  // Skip Vite development assets
  if (url.pathname.startsWith('/src/') || 
      url.pathname.endsWith('.scss') || 
      url.pathname.endsWith('.vue') ||
      url.pathname.includes('/@vite/') ||
      url.pathname.includes('/@fs/')) {
    return
  }

  // Handle static assets
  if (STATIC_ASSETS.some(asset => url.pathname === asset)) {
    event.respondWith(handleStaticAsset(request))
    return
  }

  // Skip requests from browser extensions or other unsupported origins
  if (url.protocol === 'chrome-extension:' || 
      url.protocol === 'moz-extension:' || 
      url.protocol === 'safari-extension:' ||
      url.protocol === 'chrome:' ||
      url.protocol === 'about:') {
    return
  }

  // Handle other requests with network first strategy
  event.respondWith(handleDynamicRequest(request))
})

// API request handler - network first with cache fallback
async function handleApiRequest(request) {
  const url = new URL(request.url)
  
  try {
    // Try network first
    const networkResponse = await fetch(request)
    
    // Cache successful responses for specific endpoints
    if (networkResponse.ok && shouldCacheApiResponse(url.pathname)) {
      try {
        const cache = await caches.open(DYNAMIC_CACHE)
        await cache.put(request, networkResponse.clone())
      } catch (cacheError) {
        console.warn('Service Worker: Failed to cache API request', request.url, cacheError)
      }
    }
    
    return networkResponse
  } catch (error) {
    console.log('Service Worker: Network failed, trying cache for', request.url)
    
    // Fallback to cache
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Return offline fallback for specific endpoints
    if (shouldReturnOfflineFallback(url.pathname)) {
      return new Response(JSON.stringify({
        error: 'Offline',
        message: 'This data is not available offline',
        offline: true
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    throw error
  }
}

// Static asset handler - cache first
async function handleStaticAsset(request) {
  const cachedResponse = await caches.match(request)
  if (cachedResponse) {
    return cachedResponse
  }
  
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE)
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    const url = new URL(request.url)
    // Don't log errors for development assets
    if (!url.pathname.startsWith('/src/') && !url.pathname.endsWith('.scss')) {
      console.error('Service Worker: Failed to fetch static asset', request.url)
    }
    throw error
  }
}

// Dynamic request handler - network first with cache fallback
async function handleDynamicRequest(request) {
  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      const url = new URL(request.url)
      // Only cache HTTP/HTTPS requests
      if (url.protocol.startsWith('http')) {
        try {
          const cache = await caches.open(DYNAMIC_CACHE)
          await cache.put(request, networkResponse.clone())
        } catch (cacheError) {
          console.warn('Service Worker: Failed to cache request', request.url, cacheError)
        }
      }
    }
    
    return networkResponse
  } catch (error) {
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      const offlinePageResponse = await caches.match('/offline.html')
      if (offlinePageResponse) {
        return offlinePageResponse
      }
    }
    
    throw error
  }
}

// Check if API response should be cached
function shouldCacheApiResponse(pathname) {
  return API_CACHE_PATTERNS.some(pattern => pathname.includes(pattern))
}

// Check if offline fallback should be returned
function shouldReturnOfflineFallback(pathname) {
  return pathname.includes('/api/')
}

// Background sync for failed requests
self.addEventListener('sync', event => {
  console.log('Service Worker: Background sync triggered', event.tag)
  
  if (event.tag === 'background-sync') {
    event.waitUntil(processBackgroundSync())
  }
})

// Process queued requests during background sync
async function processBackgroundSync() {
  console.log('Service Worker: Processing background sync')
  
  try {
    // Get queued requests from IndexedDB
    const queuedRequests = await getQueuedRequests()
    
    for (const queuedRequest of queuedRequests) {
      try {
        const response = await fetch(queuedRequest.request)
        
        if (response.ok) {
          // Remove from queue on success
          await removeFromQueue(queuedRequest.id)
          
          // Notify clients of successful sync
          self.clients.matchAll().then(clients => {
            clients.forEach(client => {
              client.postMessage({
                type: 'BACKGROUND_SYNC_SUCCESS',
                data: queuedRequest
              })
            })
          })
        }
      } catch (error) {
        console.error('Service Worker: Background sync failed for request', error)
      }
    }
  } catch (error) {
    console.error('Service Worker: Background sync process failed', error)
  }
}

// Push notification handler
self.addEventListener('push', event => {
  console.log('Service Worker: Push notification received')
  
  const options = {
    body: 'You have new updates',
    icon: '/android-chrome-192x192.png',
    badge: '/android-chrome-192x192.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Details',
        icon: '/android-chrome-192x192.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/android-chrome-192x192.png'
      }
    ]
  }
  
  if (event.data) {
    const data = event.data.json()
    options.body = data.body || options.body
    options.data = { ...options.data, ...data }
  }
  
  event.waitUntil(
    self.registration.showNotification('Activation Tracker', options)
  )
})

// Notification click handler
self.addEventListener('notificationclick', event => {
  console.log('Service Worker: Notification clicked')
  
  event.notification.close()
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/dashboard')
    )
  } else if (event.action === 'close') {
    // Just close the notification
  } else {
    // Default action - open app
    event.waitUntil(
      clients.matchAll().then(clientList => {
        if (clientList.length > 0) {
          return clientList[0].focus()
        }
        return clients.openWindow('/')
      })
    )
  }
})

// Message handler for communication with main thread
self.addEventListener('message', event => {
  console.log('Service Worker: Message received', event.data)
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(DYNAMIC_CACHE).then(cache => {
        return cache.addAll(event.data.urls)
      })
    )
  }
})

// Utility functions for IndexedDB operations
async function getQueuedRequests() {
  // Implementation depends on your IndexedDB setup
  // This is a placeholder
  return []
}

async function removeFromQueue(id) {
  // Implementation depends on your IndexedDB setup
  // This is a placeholder
  console.log('Removing request from queue:', id)
}