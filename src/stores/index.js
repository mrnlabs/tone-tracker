// src/stores/index.js
// Centralized store exports and setup for the Activation Tracking System

// Import all stores
export { useAuthStore } from './auth'
export { useActivationsStore } from './activations'
export { useClientsStore } from './clients'
export { useWarehouseStore } from './warehouse'
export { useUsersStore } from './users'
export { useReportsStore } from './reports'

// Import store utilities
import { useAuthStore } from './auth'
import { useActivationsStore } from './activations'
import { useClientsStore } from './clients'
import { useWarehouseStore } from './warehouse'
import { useUsersStore } from './users'
import { useReportsStore } from './reports'

/**
 * Composite store hook that provides access to all stores
 * Use this when you need multiple stores in a component
 */
export const useStores = () => {
    return {
        auth: useAuthStore(),
        activations: useActivationsStore(),
        clients: useClientsStore(),
        warehouse: useWarehouseStore(),
        users: useUsersStore(),
        reports: useReportsStore()
    }
}

/**
 * Initialize all stores with default data
 * Call this during app startup
 */
export const initializeStores = async () => {
    const authStore = useAuthStore()

    try {
        // Initialize authentication first
        await authStore.initializeAuth()

        // If user is authenticated, initialize other stores
        if (authStore.isAuthenticated) {
            const activationsStore = useActivationsStore()
            const clientsStore = useClientsStore()
            const warehouseStore = useWarehouseStore()
            const usersStore = useUsersStore()
            const reportsStore = useReportsStore()

            // Initialize based on user role and permissions
            const initPromises = []

            // Always fetch dashboard stats for authenticated users
            initPromises.push(reportsStore.fetchDashboardStats())

            // Role-based initialization
            if (authStore.canManageActivations) {
                initPromises.push(activationsStore.fetchActivations({ limit: 20 }))
            }

            if (authStore.canManageUsers) {
                initPromises.push(usersStore.fetchUsers({ limit: 50 }))
            }

            if (authStore.isAdmin || authStore.isActivationManager) {
                initPromises.push(clientsStore.fetchClients({ limit: 20 }))
            }

            if (authStore.canManageWarehouse) {
                initPromises.push(warehouseStore.fetchAllStocks())
                initPromises.push(warehouseStore.fetchLowStockAlerts())
            }

            if (authStore.isClient) {
                // For clients, fetch their own data
                initPromises.push(
                    activationsStore.fetchActivations({
                        client: authStore.user.clientId,
                        limit: 10
                    })
                )
            }

            // Execute all initialization promises
            await Promise.allSettled(initPromises)
        }

        return { success: true }
    } catch (error) {
        console.error('Failed to initialize stores:', error)
        return { success: false, error }
    }
}

/**
 * Reset all stores to initial state
 * Useful for logout or when switching accounts
 */
export const resetStores = () => {
    const stores = useStores()

    // Reset each store's state
    Object.values(stores).forEach(store => {
        if (typeof store.$reset === 'function') {
            store.$reset()
        }
    })
}

/**
 * Global error handler for stores
 * Centralizes error handling across all stores
 */
export const handleStoreError = (error, storeName, action) => {
    console.error(`Error in ${storeName}.${action}:`, error)

    // You can add global error handling logic here
    // Such as showing notifications, logging to external services, etc.

    // For now, we'll just return the error
    return {
        message: error.message || 'An unexpected error occurred',
        code: error.code || 'UNKNOWN_ERROR',
        timestamp: new Date().toISOString(),
        store: storeName,
        action
    }
}

/**
 * Store synchronization utilities
 * Keep related data in sync across stores
 */
export const useStoreSynchronization = () => {
    const stores = useStores()

    /**
     * Sync user data across stores when user profile is updated
     */
    const syncUserUpdate = (updatedUser) => {
        // Update user in activations (if they're assigned)
        stores.activations.activations.forEach((activation, index) => {
            if (activation.teamMembers) {
                const memberIndex = activation.teamMembers.findIndex(
                    member => member.id === updatedUser.id
                )
                if (memberIndex !== -1) {
                    stores.activations.activations[index].teamMembers[memberIndex] = {
                        ...stores.activations.activations[index].teamMembers[memberIndex],
                        ...updatedUser
                    }
                }
            }
        })

        // Update user in users store
        const userIndex = stores.users.users.findIndex(user => user.id === updatedUser.id)
        if (userIndex !== -1) {
            stores.users.users[userIndex] = updatedUser
        }
    }

    /**
     * Sync activation updates across related stores
     */
    const syncActivationUpdate = (updatedActivation) => {
        // Update in reports if referenced
        stores.reports.reports.forEach((report, index) => {
            if (report.activationIds?.includes(updatedActivation.id)) {
                // Trigger report refresh if needed
                stores.reports.reports[index].needsRefresh = true
            }
        })
    }

    /**
     * Sync inventory updates with activations
     */
    const syncInventoryUpdate = (updatedItem) => {
        // Update allocation status in activations if this item is allocated
        stores.activations.activations.forEach((activation, index) => {
            if (activation.allocatedItems) {
                const itemIndex = activation.allocatedItems.findIndex(
                    item => item.inventoryId === updatedItem.id
                )
                if (itemIndex !== -1) {
                    stores.activations.activations[index].allocatedItems[itemIndex] = {
                        ...stores.activations.activations[index].allocatedItems[itemIndex],
                        ...updatedItem
                    }
                }
            }
        })
    }

    return {
        syncUserUpdate,
        syncActivationUpdate,
        syncInventoryUpdate
    }
}

/**
 * Performance monitoring for stores
 * Track store operation performance
 */
export const useStorePerformance = () => {
    const performanceMetrics = new Map()

    const startTimer = (storeName, action) => {
        const key = `${storeName}.${action}`
        performanceMetrics.set(key, performance.now())
    }

    const endTimer = (storeName, action) => {
        const key = `${storeName}.${action}`
        const startTime = performanceMetrics.get(key)
        if (startTime) {
            const duration = performance.now() - startTime
            console.log(`Store operation ${key} took ${duration.toFixed(2)}ms`)
            performanceMetrics.delete(key)
            return duration
        }
        return null
    }

    const getAverageTime = (storeName, action) => {
        // This would require storing historical data
        // For now, just return null
        return null
    }

    return {
        startTimer,
        endTimer,
        getAverageTime
    }
}

/**
 * Store hydration utilities
 * Handle data persistence and restoration
 */
export const useStoreHydration = () => {
    const STORAGE_KEY = 'activation_tracker_store_cache'

    /**
     * Save critical store data to localStorage
     */
    const saveStoreData = () => {
        try {
            const stores = useStores()
            const dataToSave = {
                auth: {
                    user: stores.auth.user,
                    isAuthenticated: stores.auth.isAuthenticated
                },
                preferences: {
                    activationFilters: stores.activations.filters,
                    clientFilters: stores.clients.filters,
                    userFilters: stores.users.filters,
                    warehouseFilters: stores.warehouse.filters
                },
                timestamp: Date.now()
            }

            localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave))
            return true
        } catch (error) {
            console.error('Failed to save store data:', error)
            return false
        }
    }

    /**
     * Restore store data from localStorage
     */
    const restoreStoreData = () => {
        try {
            const savedData = localStorage.getItem(STORAGE_KEY)
            if (!savedData) return null

            const data = JSON.parse(savedData)

            // Check if data is not too old (24 hours)
            const maxAge = 24 * 60 * 60 * 1000
            if (Date.now() - data.timestamp > maxAge) {
                localStorage.removeItem(STORAGE_KEY)
                return null
            }

            return data
        } catch (error) {
            console.error('Failed to restore store data:', error)
            localStorage.removeItem(STORAGE_KEY)
            return null
        }
    }

    /**
     * Clear saved store data
     */
    const clearStoreData = () => {
        localStorage.removeItem(STORAGE_KEY)
    }

    return {
        saveStoreData,
        restoreStoreData,
        clearStoreData
    }
}

/**
 * Development utilities
 */
export const useStoreDevtools = () => {
    const stores = useStores()

    /**
     * Log all store states (development only)
     */
    const logStoreStates = () => {
        if (process.env.NODE_ENV === 'development') {
            console.group('🏪 Store States')
            Object.entries(stores).forEach(([name, store]) => {
                console.log(`${name}:`, store.$state || store)
            })
            console.groupEnd()
        }
    }

    /**
     * Reset specific store (development only)
     */
    const resetStore = (storeName) => {
        if (process.env.NODE_ENV === 'development' && stores[storeName]) {
            if (typeof stores[storeName].$reset === 'function') {
                stores[storeName].$reset()
                console.log(`🔄 Reset ${storeName} store`)
            }
        }
    }

    return {
        logStoreStates,
        resetStore
    }
}

// Export default utilities
export default {
    useStores,
    initializeStores,
    resetStores,
    handleStoreError,
    useStoreSynchronization,
    useStorePerformance,
    useStoreHydration,
    useStoreDevtools
}