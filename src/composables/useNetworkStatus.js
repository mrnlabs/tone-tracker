// Network status composable for offline/online detection

import { ref, computed, onMounted, onUnmounted } from 'vue'

export const useNetworkStatus = () => {
  const isOnline = ref(navigator.onLine)
  const isServerReachable = ref(true)
  const lastServerCheck = ref(null)

  // Handle browser online/offline events
  const handleOnline = () => {
    isOnline.value = true
    checkServerHealth()
  }

  const handleOffline = () => {
    isOnline.value = false
    isServerReachable.value = false
  }

  // Check if the API server is reachable
  const checkServerHealth = async () => {
    try {
      const { apiService } = await import('@/services/api')
      await apiService.healthCheck()
      isServerReachable.value = true
      lastServerCheck.value = new Date()
    } catch (error) {
      console.warn('Server health check failed:', error)
      isServerReachable.value = false
      lastServerCheck.value = new Date()
    }
  }

  // Computed status
  const networkStatus = computed(() => {
    if (!isOnline.value) return 'offline'
    if (!isServerReachable.value) return 'server-unreachable'
    return 'online'
  })

  const statusMessage = computed(() => {
    switch (networkStatus.value) {
      case 'offline':
        return 'You are offline'
      case 'server-unreachable':
        return 'Server is unreachable - working in offline mode'
      case 'online':
        return 'Connected'
      default:
        return 'Unknown status'
    }
  })

  // Set up event listeners
  onMounted(() => {
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    // Initial server check if online
    if (isOnline.value) {
      checkServerHealth()
    }
  })

  onUnmounted(() => {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
  })

  return {
    isOnline,
    isServerReachable,
    lastServerCheck,
    networkStatus,
    statusMessage,
    checkServerHealth
  }
}