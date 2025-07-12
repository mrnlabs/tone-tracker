import { ref, computed, onMounted, onUnmounted } from 'vue'

export function usePWA() {
  const isOnline = ref(navigator.onLine)
  const isInstallable = ref(false)
  const isInstalled = ref(false)
  const swRegistration = ref(null)
  const updateAvailable = ref(false)
  const installing = ref(false)
  
  let deferredPrompt = null

  // Network status
  const updateOnlineStatus = () => {
    isOnline.value = navigator.onLine
  }

  // Service Worker registration
  const registerServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        })
        
        swRegistration.value = registration
        console.log('Service Worker registered successfully:', registration)

        // Listen for updates
        registration.addEventListener('updatefound', () => {
          const installingWorker = registration.installing
          
          if (installingWorker) {
            installing.value = true
            
            installingWorker.addEventListener('statechange', () => {
              if (installingWorker.state === 'installed') {
                installing.value = false
                
                if (navigator.serviceWorker.controller) {
                  // New update available
                  updateAvailable.value = true
                  console.log('New service worker update available')
                } else {
                  // First install
                  console.log('Service worker installed for the first time')
                }
              }
            })
          }
        })

        // Listen for messages from service worker
        navigator.serviceWorker.addEventListener('message', handleSWMessage)

        return registration
      } catch (error) {
        console.error('Service Worker registration failed:', error)
        throw error
      }
    } else {
      console.warn('Service Workers are not supported')
      return null
    }
  }

  // Handle service worker messages
  const handleSWMessage = (event) => {
    const { data } = event
    
    if (data.type === 'BACKGROUND_SYNC_SUCCESS') {
      console.log('Background sync completed successfully')
      // Emit event or show notification
    }
  }

  // Update service worker
  const updateServiceWorker = async () => {
    if (swRegistration.value && swRegistration.value.waiting) {
      swRegistration.value.waiting.postMessage({ type: 'SKIP_WAITING' })
      updateAvailable.value = false
      
      // Reload page after service worker activation
      window.location.reload()
    }
  }

  // PWA Installation
  const setupInstallPrompt = () => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      deferredPrompt = e
      isInstallable.value = true
      console.log('PWA install prompt available')
    })

    window.addEventListener('appinstalled', () => {
      isInstalled.value = true
      isInstallable.value = false
      deferredPrompt = null
      console.log('PWA installed successfully')
    })
  }

  // Trigger PWA install
  const installPWA = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt()
        const choiceResult = await deferredPrompt.userChoice
        
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted PWA install')
        } else {
          console.log('User dismissed PWA install')
        }
        
        deferredPrompt = null
        isInstallable.value = false
      } catch (error) {
        console.error('PWA installation failed:', error)
      }
    }
  }

  // Check if app is installed
  const checkIfInstalled = () => {
    // Check if app is running in standalone mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    const isInWebApp = window.navigator.standalone === true
    
    isInstalled.value = isStandalone || isInWebApp
  }

  // Offline data management
  const queuedRequests = ref([])

  const queueRequest = (request) => {
    queuedRequests.value.push({
      id: Date.now(),
      url: request.url,
      method: request.method,
      body: request.body,
      headers: Object.fromEntries(request.headers.entries()),
      timestamp: new Date().toISOString()
    })
    
    // Store in IndexedDB for persistence
    saveQueuedRequests()
  }

  const saveQueuedRequests = async () => {
    try {
      localStorage.setItem('pwa_queued_requests', JSON.stringify(queuedRequests.value))
    } catch (error) {
      console.error('Failed to save queued requests:', error)
    }
  }

  const loadQueuedRequests = async () => {
    try {
      const stored = localStorage.getItem('pwa_queued_requests')
      if (stored) {
        queuedRequests.value = JSON.parse(stored)
      }
    } catch (error) {
      console.error('Failed to load queued requests:', error)
    }
  }

  const processQueuedRequests = async () => {
    if (!isOnline.value || queuedRequests.value.length === 0) {
      return
    }

    const processPromises = queuedRequests.value.map(async (queuedReq) => {
      try {
        const response = await fetch(queuedReq.url, {
          method: queuedReq.method,
          body: queuedReq.body,
          headers: queuedReq.headers
        })

        if (response.ok) {
          // Remove from queue on success
          queuedRequests.value = queuedRequests.value.filter(req => req.id !== queuedReq.id)
          console.log('Queued request processed successfully:', queuedReq.url)
        }
      } catch (error) {
        console.error('Failed to process queued request:', error)
      }
    })

    await Promise.allSettled(processPromises)
    saveQueuedRequests()
  }

  // Cache management
  const clearCache = async () => {
    if ('caches' in window) {
      const cacheNames = await caches.keys()
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      )
      console.log('All caches cleared')
    }
  }

  const getCacheSize = async () => {
    if ('caches' in window && 'storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate()
        return {
          usage: estimate.usage,
          quota: estimate.quota,
          usagePercentage: Math.round((estimate.usage / estimate.quota) * 100)
        }
      } catch (error) {
        console.error('Failed to get cache size:', error)
        return null
      }
    }
    return null
  }

  // Push notifications
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    }
    return false
  }

  const subscribeToPushNotifications = async () => {
    if (swRegistration.value && 'PushManager' in window) {
      try {
        const subscription = await swRegistration.value.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(import.meta.env.VITE_VAPID_PUBLIC_KEY)
        })
        
        console.log('Push notification subscription:', subscription)
        return subscription
      } catch (error) {
        console.error('Failed to subscribe to push notifications:', error)
        return null
      }
    }
    return null
  }

  // Utility function for VAPID key conversion
  const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  // Computed properties
  const isOffline = computed(() => !isOnline.value)
  const hasQueuedRequests = computed(() => queuedRequests.value.length > 0)
  const canInstall = computed(() => isInstallable.value && !isInstalled.value)

  // Lifecycle
  onMounted(() => {
    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)
    
    setupInstallPrompt()
    checkIfInstalled()
    loadQueuedRequests()
    
    // Process queued requests when coming online
    if (isOnline.value) {
      processQueuedRequests()
    }
  })

  onUnmounted(() => {
    window.removeEventListener('online', updateOnlineStatus)
    window.removeEventListener('offline', updateOnlineStatus)
    
    if (navigator.serviceWorker) {
      navigator.serviceWorker.removeEventListener('message', handleSWMessage)
    }
  })

  return {
    // State
    isOnline,
    isOffline,
    isInstallable,
    isInstalled,
    canInstall,
    updateAvailable,
    installing,
    queuedRequests,
    hasQueuedRequests,
    
    // Service Worker
    registerServiceWorker,
    updateServiceWorker,
    
    // Installation
    installPWA,
    
    // Offline functionality
    queueRequest,
    processQueuedRequests,
    
    // Cache management
    clearCache,
    getCacheSize,
    
    // Push notifications
    requestNotificationPermission,
    subscribeToPushNotifications
  }
}