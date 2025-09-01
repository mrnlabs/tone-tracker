/**
 * Secure storage utility for sensitive data
 * Provides fallback mechanisms for token storage with security best practices
 */

import { STORAGE_KEYS } from '@/utils/constants'

class SecureStorage {
  constructor() {
    this.isSecureContext = window.isSecureContext
    this.supportsSessionStorage = this.checkSessionStorage()
    this.tokenKey = STORAGE_KEYS.AUTH_TOKEN
    this.refreshKey = STORAGE_KEYS.REFRESH_TOKEN
  }

  /**
   * Check if sessionStorage is available
   */
  checkSessionStorage() {
    try {
      const test = '__test__'
      sessionStorage.setItem(test, test)
      sessionStorage.removeItem(test)
      return true
    } catch {
      return false
    }
  }

  /**
   * Store authentication token securely
   * Priority: httpOnly cookie (backend) > sessionStorage > memory
   */
  setAuthToken(token, refreshToken = null) {
    if (!token) return

    // Store in sessionStorage for current session only
    if (this.supportsSessionStorage) {
      try {
        sessionStorage.setItem(this.tokenKey, token)
        if (refreshToken) {
          sessionStorage.setItem(this.refreshKey, refreshToken)
        }
      } catch (e) {
        // Fallback to memory storage
        this.memoryStorage = this.memoryStorage || {}
        this.memoryStorage[this.tokenKey] = token
        if (refreshToken) {
          this.memoryStorage[this.refreshKey] = refreshToken
        }
      }
    } else {
      // Use memory storage as fallback
      this.memoryStorage = this.memoryStorage || {}
      this.memoryStorage[this.tokenKey] = token
      if (refreshToken) {
        this.memoryStorage[this.refreshKey] = refreshToken
      }
    }

    // Set short-lived backup in localStorage with expiration
    this.setTemporaryStorage(this.tokenKey, token, 3600000) // 1 hour
    if (refreshToken) {
      this.setTemporaryStorage(this.refreshKey, refreshToken, 86400000) // 24 hours
    }
  }

  /**
   * Get authentication token
   */
  getAuthToken() {
    // Try sessionStorage first
    if (this.supportsSessionStorage) {
      const token = sessionStorage.getItem(this.tokenKey)
      if (token) return token
    }

    // Try memory storage
    if (this.memoryStorage && this.memoryStorage[this.tokenKey]) {
      return this.memoryStorage[this.tokenKey]
    }

    // Try temporary localStorage with expiration check
    const tempToken = this.getTemporaryStorage(this.tokenKey)
    if (tempToken) return tempToken

    // Final fallback to localStorage (for backward compatibility)
    return localStorage.getItem(this.tokenKey)
  }

  /**
   * Get refresh token
   */
  getRefreshToken() {
    if (this.supportsSessionStorage) {
      const token = sessionStorage.getItem(this.refreshKey)
      if (token) return token
    }

    if (this.memoryStorage && this.memoryStorage[this.refreshKey]) {
      return this.memoryStorage[this.refreshKey]
    }

    const tempToken = this.getTemporaryStorage(this.refreshKey)
    if (tempToken) return tempToken

    return localStorage.getItem(this.refreshKey)
  }

  /**
   * Clear all tokens
   */
  clearTokens() {
    // Clear from all storage locations
    if (this.supportsSessionStorage) {
      sessionStorage.removeItem(this.tokenKey)
      sessionStorage.removeItem(this.refreshKey)
    }

    if (this.memoryStorage) {
      delete this.memoryStorage[this.tokenKey]
      delete this.memoryStorage[this.refreshKey]
    }

    // Clear temporary storage
    this.clearTemporaryStorage(this.tokenKey)
    this.clearTemporaryStorage(this.refreshKey)

    // Clear legacy localStorage
    localStorage.removeItem(this.tokenKey)
    localStorage.removeItem(this.refreshKey)
  }

  /**
   * Set temporary storage with expiration
   */
  setTemporaryStorage(key, value, ttl) {
    const now = new Date()
    const item = {
      value: value,
      expiry: now.getTime() + ttl
    }
    try {
      localStorage.setItem(`_temp_${key}`, JSON.stringify(item))
    } catch {
      // Storage quota exceeded or unavailable
    }
  }

  /**
   * Get temporary storage with expiration check
   */
  getTemporaryStorage(key) {
    try {
      const itemStr = localStorage.getItem(`_temp_${key}`)
      if (!itemStr) return null

      const item = JSON.parse(itemStr)
      const now = new Date()

      if (now.getTime() > item.expiry) {
        localStorage.removeItem(`_temp_${key}`)
        return null
      }

      return item.value
    } catch {
      return null
    }
  }

  /**
   * Clear temporary storage
   */
  clearTemporaryStorage(key) {
    localStorage.removeItem(`_temp_${key}`)
  }

  /**
   * Migrate tokens from localStorage to secure storage
   */
  migrateFromLocalStorage() {
    const token = localStorage.getItem(this.tokenKey)
    const refreshToken = localStorage.getItem(this.refreshKey)

    if (token) {
      this.setAuthToken(token, refreshToken)
      // Don't remove from localStorage yet for backward compatibility
      // Will be removed in future version
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!this.getAuthToken()
  }

  /**
   * Get storage info for debugging (without exposing sensitive data)
   */
  getStorageInfo() {
    return {
      isSecureContext: this.isSecureContext,
      supportsSessionStorage: this.supportsSessionStorage,
      hasToken: this.isAuthenticated(),
      storageTypes: {
        session: !!(this.supportsSessionStorage && sessionStorage.getItem(this.tokenKey)),
        memory: !!(this.memoryStorage && this.memoryStorage[this.tokenKey]),
        temporary: !!this.getTemporaryStorage(this.tokenKey),
        legacy: !!localStorage.getItem(this.tokenKey)
      }
    }
  }
}

// Create singleton instance
const secureStorage = new SecureStorage()

// Migrate existing tokens on initialization
if (typeof window !== 'undefined') {
  secureStorage.migrateFromLocalStorage()
}

export default secureStorage

// Export individual methods for convenience
export const {
  setAuthToken,
  getAuthToken,
  getRefreshToken,
  clearTokens,
  isAuthenticated,
  getStorageInfo
} = {
  setAuthToken: secureStorage.setAuthToken.bind(secureStorage),
  getAuthToken: secureStorage.getAuthToken.bind(secureStorage),
  getRefreshToken: secureStorage.getRefreshToken.bind(secureStorage),
  clearTokens: secureStorage.clearTokens.bind(secureStorage),
  isAuthenticated: secureStorage.isAuthenticated.bind(secureStorage),
  getStorageInfo: secureStorage.getStorageInfo.bind(secureStorage)
}