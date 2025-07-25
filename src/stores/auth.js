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

    const userId = computed(() => user.value?.id || null)

    const profilePictureUrl = computed(() => user.value?.profilePictureUrl || user.value?.profileImagePath || null)

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
        console.group('🔐 Initializing Authentication')
        
        // Clean up any invalid storage data first
        cleanupInvalidStorageData()
        
        const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
        const storedUserStr = localStorage.getItem('user')
        
        console.log('Token found:', !!token)
        console.log('Stored user data found:', !!storedUserStr)
        
        if (token) {
            isLoading.value = true
            
            // Try to restore user from localStorage first for faster UI
            if (storedUserStr && storedUserStr !== 'undefined' && storedUserStr !== 'null') {
                try {
                    const storedUser = JSON.parse(storedUserStr)
                    if (storedUser && typeof storedUser === 'object' && storedUser.id) {
                        user.value = storedUser
                        isAuthenticated.value = true
                        permissions.value = storedUser.permissions || []
                    }
                } catch (parseError) {
                    console.warn('Failed to parse stored user data:', parseError)
                }
            }
            
            // Validate token and get fresh user data from API
            // Skip API validation if we have recent cached data and this is initial load
            const hasRecentCache = user.value && user.value.id && user.value.lastUpdated && 
                                  (Date.now() - new Date(user.value.lastUpdated).getTime()) < 5 * 60 * 1000 // 5 minutes
            
            if (hasRecentCache && !user.value.forceRefresh) {
                console.log('Using recent cached data, skipping API validation')
                updateLastActivity()
                startSessionTimer()
            } else {
                try {
                    console.log('Attempting to validate token with API...')
                    await getCurrentUser()
                    console.log('✅ Token validation successful')
                    updateLastActivity()
                    startSessionTimer()
                } catch (apiError) {
                console.warn('Failed to validate token with API:', apiError)
                
                // Check if this is a server error (5xx) vs auth error (4xx)
                const isServerError = apiError.status >= 500
                const isAuthError = apiError.status === 401 || apiError.status === 403
                
                if (isServerError && user.value && user.value.id) {
                    // Server error + we have cached data = continue in offline mode
                    console.info('🔄 Server error detected, continuing in offline mode with cached user data')
                    
                    // Show user notification about offline mode
                    if (typeof window !== 'undefined' && window.toast) {
                        window.toast.add({
                            severity: 'info',
                            summary: 'Working Offline',
                            detail: 'Server is temporarily unavailable. Using cached data.',
                            life: 5000
                        })
                    }
                    
                    updateLastActivity()
                    startSessionTimer()
                } else if (isAuthError) {
                    // Auth error = token is invalid, clear everything
                    console.info('🚫 Authentication error, clearing auth state')
                    user.value = null
                    isAuthenticated.value = false
                    permissions.value = []
                    clearStoredData()
                } else {
                    // Other error or no cached data, clear everything
                    console.info('❌ API error with no cached data, clearing auth state')
                    user.value = null
                    isAuthenticated.value = false
                    permissions.value = []
                    clearStoredData()
                }
                }
            }
            
            isLoading.value = false
        } else {
            // No token found, ensure we're in logged out state
            console.log('No token found, clearing auth state')
            user.value = null
            isAuthenticated.value = false
            permissions.value = []
        }
        
        console.log('Final auth state:', {
            isAuthenticated: isAuthenticated.value,
            hasUser: !!user.value,
            userRole: userRole.value
        })
        console.groupEnd()
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
                storeUserData(userData)
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
                storeUserData(response.user)

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
            // Call logout API only if we have a valid token
            const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
            if (token) {
                authService.logout().catch((error) => {
                    console.warn('Logout API call failed:', error)
                    // Don't throw error - we still want to clear local state
                })
            }
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
     * Get current user from API with retry logic
     */
    const getCurrentUser = async (retryCount = 0) => {
        try {
            const response = await authService.getCurrentUser()
            console.log('getCurrentUser response:', response)
            
            // Handle both response.user and direct response formats
            const userData = response.user || response
            user.value = userData
            permissions.value = response.permissions || userData.permissions || []
            
            console.log('User profile picture fields:', {
                profilePictureUrl: userData.profilePictureUrl,
                profileImagePath: userData.profileImagePath,
                profilePicture: userData.profilePicture
            })

            // Update user in localStorage
            storeUserData(userData)

            return response
        } catch (error) {
            // Retry on server errors (5xx) up to 2 times with exponential backoff
            if (error.status >= 500 && retryCount < 2) {
                const delay = Math.pow(2, retryCount) * 1000 // 1s, 2s delays
                console.log(`Retrying getCurrentUser in ${delay}ms... (attempt ${retryCount + 1}/2)`)
                
                await new Promise(resolve => setTimeout(resolve, delay))
                return getCurrentUser(retryCount + 1)
            }
            
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
            storeUserData(response.user)

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
                storeUserData(user.value)
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
     * Safely store user data in localStorage
     */
    const storeUserData = (userData) => {
        if (userData && typeof userData === 'object') {
            // Store user data with current permissions and timestamp for complete state restoration
            const userDataWithPermissions = {
                ...userData,
                permissions: permissions.value || userData.permissions || [],
                lastUpdated: new Date().toISOString()
            }
            localStorage.setItem('user', JSON.stringify(userDataWithPermissions))
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
            'activation_auth_token' // Legacy key, now using STORAGE_KEYS.AUTH_TOKEN
        ]
        
        keysToRemove.forEach(key => {
            localStorage.removeItem(key)
        })
    }

    /**
     * Clean up invalid localStorage data
     */
    const cleanupInvalidStorageData = () => {
        try {
            const userStr = localStorage.getItem('user')
            if (userStr === 'undefined' || userStr === 'null') {
                localStorage.removeItem('user')
            }
        } catch (error) {
            console.warn('Error cleaning up storage:', error)
        }
    }

    /**
     * Force refresh user data from API
     */
    const refreshUserData = async () => {
        if (user.value) {
            user.value.forceRefresh = true
        }
        try {
            isLoading.value = true
            await getCurrentUser()
            updateLastActivity()
            return true
        } catch (error) {
            console.error('Failed to refresh user data:', error)
            return false
        } finally {
            isLoading.value = false
        }
    }

    /**
     * Debug helper to log current auth state
     */
    const debugAuthState = () => {
        console.group('🔍 Auth Store Debug State')
        console.log('User:', user.value)
        console.log('Is Authenticated:', isAuthenticated.value)
        console.log('Permissions:', permissions.value)
        console.log('User Role:', userRole.value)
        console.log('Profile Picture URL:', profilePictureUrl.value)
        console.log('Token in localStorage:', !!localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN))
        console.log('User in localStorage:', localStorage.getItem('user'))
        console.groupEnd()
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

    /**
     * Upload profile picture
     */
    const uploadProfilePicture = async (file, onProgress = null) => {
        try {
            isLoading.value = true
            const formData = new FormData()
            formData.append('file', file)

            console.log('Uploading profile picture for user:', userId.value || 'current')
            console.log('Current user role:', userRole.value)
            const response = await authService.uploadProfilePicture(userId.value || 'current', formData)
            console.log('Profile picture upload response:', response)
            console.log('Response data structure:', {
                hasData: !!response.data,
                hasUrl: !!response.url,
                hasProfilePictureUrl: !!response.profilePictureUrl,
                hasProfileImagePath: !!response.profileImagePath,
                fullResponse: JSON.stringify(response)
            })
            
            // Update user profile picture URL - check all possible response fields
            if (user.value) {
                const newProfileUrl = response.url || response.profilePictureUrl || response.profileImagePath || response.filePath || response.data?.url || response.data?.profilePictureUrl
                console.log('Setting new profile picture URL to:', newProfileUrl)
                
                user.value.profilePictureUrl = newProfileUrl
                user.value.profileImagePath = newProfileUrl
                storeUserData(user.value)
                
                // Force a refresh to ensure consistency
                console.log('Updated user data:', user.value)
            }

            return response
        } catch (error) {
            console.error('Profile picture upload error:', error)
            throw error
        } finally {
            isLoading.value = false
        }
    }

    /**
     * Delete profile picture
     */
    const deleteProfilePicture = async () => {
        try {
            isLoading.value = true
            const response = await authService.deleteProfilePicture(userId.value || 'current')
            
            // Remove profile picture URL from user
            if (user.value) {
                user.value.profilePictureUrl = null
                user.value.profileImagePath = null
                storeUserData(user.value)
            }

            return response
        } catch (error) {
            throw error
        } finally {
            isLoading.value = false
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
        userId,
        profilePictureUrl,
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
        saveUserPreferences,
        uploadProfilePicture,
        deleteProfilePicture,
        refreshUserData,
        debugAuthState
    }
})