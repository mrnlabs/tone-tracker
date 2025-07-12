// src/stores/auth.js
// Authentication store for the Activation Tracking System - DEBUG VERSION

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

            // Extract tokens using helper function
            const accessToken = getNestedValue(response, [
                'accessToken', 'access_token', 'token',
                'data.accessToken', 'data.access_token', 'data.token'
            ])
            
            const refreshToken = getNestedValue(response, [
                'refreshToken', 'refresh_token',
                'data.refreshToken', 'data.refresh_token'
            ])

            if (accessToken) {
                localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, accessToken)
            }

            if (refreshToken) {
                localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken)
            }

            // Extract user data
            const userData = getNestedValue(response, [
                'user', 'data.user', 'data'
            ], (value) => value && (value.id || value.email || value.firstName))

            if (userData) {
                user.value = userData
                isAuthenticated.value = true
                localStorage.setItem('user', JSON.stringify(userData))
            }

            permissions.value = response.permissions || []
            updateLastActivity()
            startSessionTimer()

            // Store user preferences if available
            if (userData?.preferences) {
                localStorage.setItem(
                    STORAGE_KEYS.USER_PREFERENCES,
                    JSON.stringify(userData.preferences)
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
     * Helper function to get nested object values
     */
    const getNestedValue = (obj, paths, validator = null) => {
        const pathArray = Array.isArray(paths) ? paths : [paths]
        
        for (const path of pathArray) {
            const value = path.split('.').reduce((current, key) => {
                return current && current[key] !== undefined ? current[key] : null
            }, obj)
            
            if (value && (!validator || validator(value))) {
                return value
            }
        }
        return null
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
                // Store tokens
                const accessToken = response.accessToken || response.access_token || response.token
                const refreshToken = response.refreshToken || response.refresh_token

                if (accessToken) {
                    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, accessToken)
                }
                if (refreshToken) {
                    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken)
                }

                user.value = response.user
                isAuthenticated.value = true
                permissions.value = response.permissions || []

                // Store user in localStorage
                localStorage.setItem('user', JSON.stringify(response.user))

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
     * Get current user from API
     */
    const getCurrentUser = async () => {
        try {
            const response = await authService.getCurrentUser()
            user.value = response.user
            permissions.value = response.permissions || []

            // Update user in localStorage
            localStorage.setItem('user', JSON.stringify(response.user))

            return response
        } catch (error) {
            throw error
        }
    }

    /**
     * Update current user profile
     */
    const updateProfile = async (profileData) => {
        try {
            isLoading.value = true
            const response = await authService.updateProfile(profileData)

            user.value = response.user
            // Update user in localStorage
            localStorage.setItem('user', JSON.stringify(response.user))

            return response
        } catch (error) {
            throw error
        } finally {
            isLoading.value = false
        }
    }

    /**
     * Change user password
     */
    const changePassword = async (passwordData) => {
        try {
            isLoading.value = true
            const response = await authService.changePassword(passwordData)
            return response
        } catch (error) {
            throw error
        } finally {
            isLoading.value = false
        }
    }

    /**
     * Request password reset
     */
    const requestPasswordReset = async (email) => {
        try {
            isLoading.value = true
            const response = await authService.requestPasswordReset(email)
            return response
        } catch (error) {
            throw error
        } finally {
            isLoading.value = false
        }
    }

    /**
     * Reset password with token
     */
    const resetPassword = async (token, password) => {
        try {
            isLoading.value = true
            const response = await authService.resetPassword(token, password)
            return response
        } catch (error) {
            throw error
        } finally {
            isLoading.value = false
        }
    }

    /**
     * Verify email address
     */
    const verifyEmail = async (token) => {
        try {
            isLoading.value = true
            const response = await authService.verifyEmail(token)

            // Update user verification status
            if (user.value) {
                user.value.emailVerified = true
                localStorage.setItem('user', JSON.stringify(user.value))
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
        // Clear all possible token storage keys for security
        const keysToRemove = [
            STORAGE_KEYS.AUTH_TOKEN,
            STORAGE_KEYS.REFRESH_TOKEN,
            STORAGE_KEYS.USER_PREFERENCES,
            'user',
            'authToken', // Legacy key from axiosInstance
            'activation_auth_token' // Ensure consistency
        ]
        
        keysToRemove.forEach(key => {
            localStorage.removeItem(key)
        })
    }

    /**
     * Clear login error
     */
    const clearLoginError = () => {
        loginError.value = null
    }

    /**
     * Get user preferences
     */
    const getUserPreferences = () => {
        try {
            const stored = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES)
            return stored ? JSON.parse(stored) : {}
        } catch (error) {
            console.error('Failed to parse user preferences:', error)
            return {}
        }
    }

    /**
     * Save user preferences
     */
    const saveUserPreferences = (preferences) => {
        try {
            localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(preferences))
            return true
        } catch (error) {
            console.error('Failed to save user preferences:', error)
            return false
        }
    }

    // Return all the state, getters, and actions
    return {
        // State
        user,
        isAuthenticated,
        isLoading,
        loginError,
        permissions,
        lastActivity,
        sessionTimeout,

        // Getters
        userRole,
        userFullName,
        userInitials,
        isAdmin,
        isActivationManager,
        isWarehouseManager,
        isPromoter,
        isClient,
        canManageUsers,
        canManageActivations,
        canManageWarehouse,
        canViewReports,

        // Actions
        initializeAuth,
        login,
        register,
        logout,
        getCurrentUser,
        updateProfile,
        changePassword,
        requestPasswordReset,
        resetPassword,
        verifyEmail,
        checkPermission,
        canAccessRoute,
        updateLastActivity,
        startSessionTimer,
        clearSessionTimer,
        clearStoredData,
        clearLoginError,
        getUserPreferences,
        saveUserPreferences
    }
})