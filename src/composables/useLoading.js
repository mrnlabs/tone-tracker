import { ref, computed } from 'vue'

export function useLoading() {
  const loadingStates = ref(new Map())

  // Set loading state for a specific key
  const setLoading = (key, isLoading) => {
    if (isLoading) {
      loadingStates.value.set(key, true)
    } else {
      loadingStates.value.delete(key)
    }
  }

  // Check if a specific key is loading
  const isLoading = (key) => {
    return loadingStates.value.has(key)
  }

  // Check if any operation is loading
  const isAnyLoading = computed(() => {
    return loadingStates.value.size > 0
  })

  // Get all loading keys
  const getLoadingKeys = computed(() => {
    return Array.from(loadingStates.value.keys())
  })

  // Clear all loading states
  const clearAllLoading = () => {
    loadingStates.value.clear()
  }

  // Wrapper function to handle loading for async operations
  const withLoading = async (key, asyncFunction) => {
    try {
      setLoading(key, true)
      const result = await asyncFunction()
      return result
    } finally {
      setLoading(key, false)
    }
  }

  // Multiple loading states management
  const useMultipleLoading = (keys = []) => {
    const states = ref({})
    
    // Initialize states
    keys.forEach(key => {
      states.value[key] = false
    })

    const setLoadingState = (key, isLoading) => {
      states.value[key] = isLoading
      setLoading(key, isLoading)
    }

    const isLoadingState = (key) => {
      return states.value[key] || false
    }

    const isAnyLoadingState = computed(() => {
      return Object.values(states.value).some(loading => loading)
    })

    const withLoadingState = async (key, asyncFunction) => {
      try {
        setLoadingState(key, true)
        const result = await asyncFunction()
        return result
      } finally {
        setLoadingState(key, false)
      }
    }

    return {
      states: computed(() => states.value),
      setLoadingState,
      isLoadingState,
      isAnyLoadingState,
      withLoadingState
    }
  }

  return {
    setLoading,
    isLoading,
    isAnyLoading,
    getLoadingKeys,
    clearAllLoading,
    withLoading,
    useMultipleLoading
  }
}

// Global loading state (singleton)
const globalLoading = useLoading()

export const useGlobalLoading = () => globalLoading

// Specific loading hooks for common operations
export function useApiLoading() {
  const { useMultipleLoading } = useLoading()
  
  return useMultipleLoading([
    'fetch',
    'create',
    'update',
    'delete',
    'upload',
    'download'
  ])
}

export function useAuthLoading() {
  const { useMultipleLoading } = useLoading()
  
  return useMultipleLoading([
    'login',
    'logout',
    'register',
    'forgotPassword',
    'resetPassword',
    'verifyEmail'
  ])
}

export function usePageLoading() {
  const { useMultipleLoading } = useLoading()
  
  return useMultipleLoading([
    'initial',
    'refresh',
    'navigation'
  ])
}