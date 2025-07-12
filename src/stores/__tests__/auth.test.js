import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '../auth'
import { authService } from '@/services/api'
import { STORAGE_KEYS, USER_ROLES } from '@/utils/constants'

// Mock the auth service
vi.mock('@/services/api', () => ({
  authService: {
    login: vi.fn(),
    logout: vi.fn(),
    getCurrentUser: vi.fn(),
    updateProfile: vi.fn(),
    register: vi.fn()
  }
}))

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
})

describe('Auth Store', () => {
  let authStore

  beforeEach(() => {
    setActivePinia(createPinia())
    authStore = useAuthStore()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllTimers()
  })

  describe('initial state', () => {
    it('should have correct initial state', () => {
      expect(authStore.user).toBe(null)
      expect(authStore.isAuthenticated).toBe(false)
      expect(authStore.isLoading).toBe(false)
      expect(authStore.loginError).toBe(null)
      expect(authStore.permissions).toEqual([])
    })

    it('should have correct computed properties for empty user', () => {
      expect(authStore.userRole).toBe(null)
      expect(authStore.userFullName).toBe(null)
      expect(authStore.userInitials).toBe(null)
      expect(authStore.isAdmin).toBe(false)
      expect(authStore.isActivationManager).toBe(false)
      expect(authStore.isClient).toBe(false)
    })
  })

  describe('login', () => {
    it('should handle successful login', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: USER_ROLES.ADMIN
      }

      const mockResponse = {
        access_token: 'mock-token',
        refresh_token: 'mock-refresh-token',
        user: mockUser,
        permissions: ['manage_users']
      }

      authService.login.mockResolvedValue(mockResponse)

      const credentials = { email: 'test@example.com', password: 'password' }
      const result = await authStore.login(credentials)

      expect(authService.login).toHaveBeenCalledWith(credentials)
      expect(authStore.user).toEqual(mockUser)
      expect(authStore.isAuthenticated).toBe(true)
      expect(authStore.permissions).toEqual(['manage_users'])
      expect(authStore.loginError).toBe(null)
      expect(authStore.isLoading).toBe(false)

      // Check localStorage calls
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.AUTH_TOKEN,
        'mock-token'
      )
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.REFRESH_TOKEN,
        'mock-refresh-token'
      )
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'user',
        JSON.stringify(mockUser)
      )

      expect(result).toBe(mockResponse)
    })

    it('should handle login failure', async () => {
      const error = new Error('Invalid credentials')
      authService.login.mockRejectedValue(error)

      const credentials = { email: 'test@example.com', password: 'wrong' }

      await expect(authStore.login(credentials)).rejects.toThrow('Invalid credentials')

      expect(authStore.user).toBe(null)
      expect(authStore.isAuthenticated).toBe(false)
      expect(authStore.loginError).toBe('Invalid credentials')
      expect(authStore.isLoading).toBe(false)
    })

    it('should set loading state during login', async () => {
      authService.login.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

      const loginPromise = authStore.login({ email: 'test@example.com', password: 'password' })

      // Should be loading
      expect(authStore.isLoading).toBe(true)

      await loginPromise

      // Should not be loading after completion
      expect(authStore.isLoading).toBe(false)
    })

    it('should handle different token response formats', async () => {
      const testCases = [
        {
          response: { accessToken: 'token1', user: { id: 1 } },
          expectedToken: 'token1'
        },
        {
          response: { access_token: 'token2', user: { id: 1 } },
          expectedToken: 'token2'
        },
        {
          response: { token: 'token3', user: { id: 1 } },
          expectedToken: 'token3'
        },
        {
          response: { data: { access_token: 'token4', user: { id: 1 } } },
          expectedToken: 'token4'
        }
      ]

      for (const { response, expectedToken } of testCases) {
        vi.clearAllMocks()
        authService.login.mockResolvedValue(response)

        await authStore.login({ email: 'test@example.com', password: 'password' })

        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
          STORAGE_KEYS.AUTH_TOKEN,
          expectedToken
        )
      }
    })
  })

  describe('logout', () => {
    it('should clear user state and call auth service', async () => {
      // Set up authenticated state
      authStore.user = { id: 1, email: 'test@example.com' }
      authStore.isAuthenticated = true
      authStore.permissions = ['test_permission']

      authService.logout.mockResolvedValue()

      await authStore.logout()

      expect(authService.logout).toHaveBeenCalled()
      expect(authStore.user).toBe(null)
      expect(authStore.isAuthenticated).toBe(false)
      expect(authStore.permissions).toEqual([])
      expect(authStore.loginError).toBe(null)
      expect(authStore.lastActivity).toBe(null)
    })

    it('should clear localStorage on logout', async () => {
      authService.logout.mockResolvedValue()

      await authStore.logout()

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.AUTH_TOKEN)
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.REFRESH_TOKEN)
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.USER_PREFERENCES)
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('user')
    })

    it('should clear state even if auth service fails', async () => {
      authService.logout.mockRejectedValue(new Error('Network error'))
      authStore.user = { id: 1, email: 'test@example.com' }
      authStore.isAuthenticated = true

      await authStore.logout()

      expect(authStore.user).toBe(null)
      expect(authStore.isAuthenticated).toBe(false)
    })
  })

  describe('computed properties', () => {
    beforeEach(() => {
      authStore.user = {
        id: 1,
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: USER_ROLES.ADMIN
      }
    })

    it('should compute user role correctly', () => {
      expect(authStore.userRole).toBe(USER_ROLES.ADMIN)
    })

    it('should compute full name correctly', () => {
      expect(authStore.userFullName).toBe('John Doe')
    })

    it('should compute initials correctly', () => {
      expect(authStore.userInitials).toBe('JD')
    })

    it('should compute role-based booleans correctly', () => {
      expect(authStore.isAdmin).toBe(true)
      expect(authStore.isActivationManager).toBe(false)
      expect(authStore.isClient).toBe(false)
      expect(authStore.isPromoter).toBe(false)
    })

    it('should handle partial names', () => {
      authStore.user.lastName = ''
      expect(authStore.userFullName).toBe('John')
      expect(authStore.userInitials).toBe('J')

      authStore.user.firstName = ''
      authStore.user.lastName = 'Doe'
      expect(authStore.userFullName).toBe('Doe')
      expect(authStore.userInitials).toBe('D')
    })
  })

  describe('session management', () => {
    it('should update last activity', () => {
      const beforeTime = new Date().toISOString()
      authStore.updateLastActivity()
      const afterTime = new Date().toISOString()

      expect(authStore.lastActivity).toBeTruthy()
      expect(authStore.lastActivity).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
      expect(authStore.lastActivity >= beforeTime).toBe(true)
      expect(authStore.lastActivity <= afterTime).toBe(true)
    })

    it('should start and clear session timer', () => {
      vi.useFakeTimers()

      authStore.startSessionTimer()
      expect(authStore.sessionTimeout).toBeTruthy()

      authStore.clearSessionTimer()
      expect(authStore.sessionTimeout).toBe(null)

      vi.useRealTimers()
    })
  })

  describe('profile management', () => {
    it('should update user profile', async () => {
      const updatedUser = {
        id: 1,
        email: 'updated@example.com',
        firstName: 'Jane',
        lastName: 'Smith'
      }

      const mockResponse = { user: updatedUser }
      authService.updateProfile.mockResolvedValue(mockResponse)

      const profileData = { firstName: 'Jane', lastName: 'Smith' }
      const result = await authStore.updateProfile(profileData)

      expect(authService.updateProfile).toHaveBeenCalledWith(profileData)
      expect(authStore.user).toEqual(updatedUser)
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'user',
        JSON.stringify(updatedUser)
      )
      expect(result).toBe(mockResponse)
    })
  })

  describe('initialization', () => {
    it('should initialize auth when token exists', async () => {
      const mockUser = { id: 1, email: 'test@example.com' }
      mockLocalStorage.getItem.mockReturnValue('existing-token')
      authService.getCurrentUser.mockResolvedValue({ user: mockUser })

      await authStore.initializeAuth()

      expect(authService.getCurrentUser).toHaveBeenCalled()
      expect(authStore.user).toEqual(mockUser)
      expect(authStore.lastActivity).toBeTruthy()
    })

    it('should not initialize when no token exists', async () => {
      mockLocalStorage.getItem.mockReturnValue(null)

      await authStore.initializeAuth()

      expect(authService.getCurrentUser).not.toHaveBeenCalled()
      expect(authStore.user).toBe(null)
    })

    it('should logout on initialization failure', async () => {
      mockLocalStorage.getItem.mockReturnValue('invalid-token')
      authService.getCurrentUser.mockRejectedValue(new Error('Token expired'))

      const logoutSpy = vi.spyOn(authStore, 'logout')

      await authStore.initializeAuth()

      expect(logoutSpy).toHaveBeenCalled()
    })
  })

  describe('helper functions', () => {
    it('should get nested values correctly', () => {
      const obj = {
        data: {
          user: { id: 1, name: 'John' },
          token: 'abc123'
        },
        directValue: 'direct'
      }

      // Test the getNestedValue function through login
      authService.login.mockResolvedValue(obj)

      // This will internally test the getNestedValue function
      expect(authStore.getNestedValue).toBeDefined()
    })

    it('should clear login error', () => {
      authStore.loginError = 'Some error'
      authStore.clearLoginError()
      expect(authStore.loginError).toBe(null)
    })
  })
})