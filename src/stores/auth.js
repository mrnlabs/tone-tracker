// src/stores/auth.js
// Authentication store for the Activation Tracking System

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '@/services/api'
import { USER_ROLES, STORAGE_KEYS, hasPermission } from '@/utils/constants'

export const useAuthStore = defineStore('auth', () => {
    // === STATE ===
    const user = ref(null)
    const isAuthenticated = ref(false)
    const isLoading = ref(false)
    const loginError = ref(null)
    const permissions = ref([])
    const lastActivity = ref(null)
    const sessionTimeout = ref(null)

    // === GETTERS (COMPUTED) ===
    const userRole = computed(() => user.value?.role || null)

    const userFullName = computed(() => {
        if (!user.value) return null
        return `${user.value.firstName} ${user.value.lastName}`.trim()
    })

    const userInitials = computed(() => {
        if (!user.value) return null
        const first = user.value.firstName?.[0] || ''
        const last = user.value.lastName?.[0] || ''
        return `${first}${last}`.toUpperCase()
    })

    const isAdmin = computed(() => userRole.value === USER_ROLES.ADMIN)

    const isActivationManager = computed(() =>
        userRole.value === USER_ROLES.ACTIVATION_MANAGER
    )

    const isWarehouseManager = computed(() =>
        userRole.value === USER_ROLES.WAREHOUSE_MANAGER
    )

    const isPromoter = computed(() => userRole.value === USER_ROLES.PROMOTER)

    const isClient = computed(() => userRole.value === USER_ROLES.CLIENT)

    const canManageUsers = computed(() =>
        hasPermission(userRole.value, 'manage_users')
    )

    const canManageActivations = computed(() =>
        hasPermission(userRole.value, 'manage_activations')
    )

    const canManageWarehouse = computed(() =>
        hasPermission(userRole.value, 'manage_warehouse')
    )

    const canViewReports = computed(() =>
        hasPermission(userRole.value, 'view_all_reports') ||
        hasPermission(userRole.value, 'view_activation_reports') ||
        hasPermission(userRole.value, 'view_own_reports')
    )

    // === ACTIONS ===

    /**
     * Initialize auth state from stored tokens
     */
    const initializeAuth = async () => {
        const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
        if (token) {
            try {
                isLoading.value = true
                await getCurrentUser()
                updateLastActivity()
                startSessionTimer()
            } catch (error) {
                console.error('Failed to initialize auth:', error)
                await logout()
            } finally {
                isLoading.value = false
            }
        }
    }

    /**
     * Login user with credentials
     */
    const login = async (credentials) => {
        try {
            isLoading.value = true
            loginError.value = null

            const response = await authService.login(credentials)

            user.value = response.user
            isAuthenticated.value = true
            permissions.value = response.permissions || []

            updateLastActivity()
            startSessionTimer()

            // Store user preferences if available
            if (response.user.preferences) {
                localStorage.setItem(
                    STORAGE_KEYS.USER_PREFERENCES,
                    JSON.stringify(response.user.preferences)
                )
            }

            return response
        } catch (error) {
            loginError.value = error.message || 'Login failed'
            throw error
        } finally {
            isLoading.value = false
        }
    }

    /**
     * Register new user
     */
    const register = async (userData) => {
        try {
            isLoading.value = true
            loginError.value = null

            const response = await authService.register(userData)

            // Auto-login after successful registration
            if (response.auto_login) {
                user.value = response.user
                isAuthenticated.value = true
                permissions.value = response.permissions || []
                updateLastActivity()
                startSessionTimer()
            }

            return response
        } catch (error) {
            loginError.value = error.message || 'Registration failed'
            throw error
        } finally {
            isLoading.value = false
        }
    }

    /**
     * Logout user
     */
    const logout = async () => {
        try {
            // Call logout API (don't wait for it)
            authService.logout().catch(console.error)
        } finally {
            // Clear state regardless of API call result
            user.value = null
            isAuthenticated.value = false
            permissions.value = []
            loginError.value = null
            lastActivity.value = null

            clearSessionTimer()
            clearStoredData()
        }
    }

    /**
     * Get current user data
     */
    const getCurrentUser = async () => {
        try {
            const userData = await authService.getCurrentUser()
            user.value = userData
            isAuthenticated.value = true
            permissions.value = userData.permissions || []
            return userData
        } catch (error) {
            console.error('Failed to get current user:', error)
            throw error
        }
    }

    /**
     * Update user profile
     */
    const updateProfile = async (profileData) => {
        try {
            isLoading.value = true
            const updatedUser = await authService.updateProfile(profileData)

            // Update local user data
            user.value = { ...user.value, ...updatedUser }

            return updatedUser
        } catch (error) {
            throw error
        } finally {
            isLoading.value = false
        }
    }

    /**
     * Change password
     */
    const changePassword = async (passwordData) => {
        try {
            isLoading.value = true
            return await authService.changePassword(passwordData)
        } catch (error) {
            throw error
        } finally {
            isLoading.value = false
        }
    }

    /**
     * Request password reset
     */
    const forgotPassword = async (email) => {
        try {
            isLoading.value = true
            return await authService.forgotPassword(email)
        } catch (error) {
            throw error
        } finally {
            isLoading.value = false
        }
    }

    /**
     * Reset password with token
     */
    const resetPassword = async (token, newPassword) => {
        try {
            isLoading.value = true
            return await authService.resetPassword(token, newPassword)
        } catch (error) {
            throw error
        } finally {
            isLoading.value = false
        }
    }

    /**
     * Verify email with token
     */
    const verifyEmail = async (token) => {
        try {
            isLoading.value = true
            const response = await authService.verifyEmail(token)

            // Update user verification status
            if (user.value) {
                user.value.emailVerified = true
            }

            return response
        } catch (error) {
            throw error
        } finally {
            isLoading.value = false
        }
    }

    /**
     * Check if user has specific permission
     */
    const checkPermission = (permission) => {
        return hasPermission(userRole.value, permission)
    }

    /**
     * Check if user can access route
     */
    const canAccessRoute = (routePermissions = []) => {
        if (!routePermissions.length) return true
        return routePermissions.some(permission => checkPermission(permission))
    }

    /**
     * Update last activity timestamp
     */
    const updateLastActivity = () => {
        lastActivity.value = new Date().toISOString()
    }

    /**
     * Start session timeout timer
     */
    const startSessionTimer = () => {
        clearSessionTimer()

        // Set timeout for 24 hours (can be configured)
        const timeoutDuration = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

        sessionTimeout.value = setTimeout(() => {
            logout()
        }, timeoutDuration)
    }

    /**
     * Clear session timeout timer
     */
    const clearSessionTimer = () => {
        if (sessionTimeout.value) {
            clearTimeout(sessionTimeout.value)
            sessionTimeout.value = null
        }
    }

    /**
     * Clear stored user data
     */
    const clearStoredData = () => {
        localStorage.removeItem(STORAGE_KEYS.USER_PREFERENCES)
        // Note: Auth tokens are cleared by the API service
    }

    /**
     * Get user preferences
     */
    const getUserPreferences = () => {
        try {
            const stored = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES)
            return stored ? JSON.parse(stored) : {}
        } catch (error) {
            console.error('Failed to get user preferences:', error)
            return {}
        }
    }

    /**
     * Update user preferences
     */
    const updateUserPreferences = (preferences) => {
        try {
            const current = getUserPreferences()
            const updated = { ...current, ...preferences }
            localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(updated))

            // Update user object if available
            if (user.value) {
                user.value.preferences = updated
            }

            return updated
        } catch (error) {
            console.error('Failed to update user preferences:', error)
            throw error
        }
    }

    /**
     * Check if user is online/active
     */
    const isUserActive = computed(() => {
        if (!lastActivity.value) return false

        const now = new Date()
        const lastActive = new Date(lastActivity.value)
        const timeDiff = now - lastActive

        // Consider user active if last activity was within 5 minutes
        return timeDiff < 5 * 60 * 1000
    })

    /**
     * Refresh authentication state
     */
    const refreshAuth = async () => {
        if (!isAuthenticated.value) return

        try {
            await getCurrentUser()
            updateLastActivity()
        } catch (error) {
            console.error('Failed to refresh auth:', error)
            // Don't logout on refresh failure, just log the error
        }
    }

    /**
     * Clear login error
     */
    const clearLoginError = () => {
        loginError.value = null
    }

    // === COMPUTED HELPERS ===
    const userDisplayName = computed(() => {
        if (!user.value) return 'Unknown User'
        if (userFullName.value) return userFullName.value
        if (user.value.username) return user.value.username
        if (user.value.email) return user.value.email
        return 'User'
    })

    const userAvatar = computed(() => {
        return user.value?.avatar || null
    })

    const roleDisplayName = computed(() => {
        const roleMap = {
            [USER_ROLES.ADMIN]: 'Administrator',
            [USER_ROLES.ACTIVATION_MANAGER]: 'Activation Manager',
            [USER_ROLES.WAREHOUSE_MANAGER]: 'Warehouse Manager',
            [USER_ROLES.PROMOTER]: 'Promoter',
            [USER_ROLES.CLIENT]: 'Client'
        }
        return roleMap[userRole.value] || userRole.value
    })

    // Return store interface
    return {
        // State
        user,
        isAuthenticated,
        isLoading,
        loginError,
        permissions,
        lastActivity,

        // Getters
        userRole,
        userFullName,
        userInitials,
        userDisplayName,
        userAvatar,
        roleDisplayName,
        isAdmin,
        isActivationManager,
        isWarehouseManager,
        isPromoter,
        isClient,
        canManageUsers,
        canManageActivations,
        canManageWarehouse,
        canViewReports,
        isUserActive,

        // Actions
        initializeAuth,
        login,
        register,
        logout,
        getCurrentUser,
        updateProfile,
        changePassword,
        forgotPassword,
        resetPassword,
        verifyEmail,
        checkPermission,
        canAccessRoute,
        updateLastActivity,
        getUserPreferences,
        updateUserPreferences,
        refreshAuth,
        clearLoginError
    }
})

// Export for use in router guards and other composables
export default useAuthStore