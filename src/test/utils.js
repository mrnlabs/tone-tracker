import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import { mount } from '@vue/test-utils'
import { vi } from 'vitest'

// Test data factories
export const createMockUser = (overrides = {}) => ({
  id: 1,
  email: 'test@example.com',
  firstName: 'John',
  lastName: 'Doe',
  role: 'ADMIN',
  isActive: true,
  createdAt: new Date().toISOString(),
  ...overrides
})

export const createMockActivation = (overrides = {}) => ({
  id: 1,
  title: 'Test Activation',
  description: 'Test activation description',
  status: 'ACTIVE',
  clientId: 1,
  startDate: new Date().toISOString(),
  endDate: new Date(Date.now() + 86400000).toISOString(),
  location: 'Test Location',
  ...overrides
})

export const createMockClient = (overrides = {}) => ({
  id: 1,
  name: 'Test Client',
  email: 'client@example.com',
  phone: '+1234567890',
  address: 'Test Address',
  status: 'ACTIVE',
  ...overrides
})

// Pinia test helper
export const createTestPinia = () => {
  const pinia = createPinia()
  setActivePinia(pinia)
  return pinia
}

// Router test helper
export const createTestRouter = (routes = []) => {
  const defaultRoutes = [
    { path: '/', name: 'home', component: { template: '<div>Home</div>' } },
    { path: '/login', name: 'login', component: { template: '<div>Login</div>' } },
    { path: '/dashboard', name: 'dashboard', component: { template: '<div>Dashboard</div>' } }
  ]
  
  return createRouter({
    history: createWebHistory(),
    routes: [...defaultRoutes, ...routes]
  })
}

// Component mounting helper with common dependencies
export const mountComponent = (component, options = {}) => {
  const {
    pinia = createTestPinia(),
    router = createTestRouter(),
    props = {},
    global = {},
    ...mountOptions
  } = options

  return mount(component, {
    props,
    global: {
      plugins: [pinia, router],
      stubs: {
        'router-link': true,
        'router-view': true,
        ...global.stubs
      },
      mocks: {
        $t: (key) => key, // Mock i18n
        ...global.mocks
      },
      ...global
    },
    ...mountOptions
  })
}

// API response mocks
export const mockApiResponse = (data, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: () => Promise.resolve(data),
  text: () => Promise.resolve(JSON.stringify(data))
})

export const mockApiError = (message = 'API Error', status = 500) => ({
  ok: false,
  status,
  json: () => Promise.reject(new Error(message)),
  text: () => Promise.reject(new Error(message))
})

// Store test helpers
export const createMockStore = (storeName, initialState = {}, actions = {}) => {
  return {
    $id: storeName,
    $state: { ...initialState },
    $reset: vi.fn(),
    $patch: vi.fn(),
    ...actions
  }
}

// Async test helpers
export const waitForNextTick = () => new Promise(resolve => setTimeout(resolve, 0))

export const waitForElement = async (wrapper, selector, timeout = 1000) => {
  const start = Date.now()
  while (Date.now() - start < timeout) {
    await waitForNextTick()
    if (wrapper.find(selector).exists()) {
      return wrapper.find(selector)
    }
  }
  throw new Error(`Element ${selector} not found within ${timeout}ms`)
}

// Form testing helpers
export const fillForm = async (wrapper, formData) => {
  for (const [selector, value] of Object.entries(formData)) {
    const input = wrapper.find(selector)
    if (input.exists()) {
      if (input.element.type === 'checkbox') {
        await input.setChecked(value)
      } else if (input.element.tagName === 'SELECT') {
        await input.setValue(value)
      } else {
        await input.setValue(value)
      }
    }
  }
}

export const submitForm = async (wrapper, formSelector = 'form') => {
  const form = wrapper.find(formSelector)
  await form.trigger('submit')
  await waitForNextTick()
}

// Local storage test helpers
export const mockLocalStorage = () => {
  const store = new Map()
  
  return {
    getItem: vi.fn((key) => store.get(key) || null),
    setItem: vi.fn((key, value) => store.set(key, value)),
    removeItem: vi.fn((key) => store.delete(key)),
    clear: vi.fn(() => store.clear()),
    get size() { return store.size }
  }
}

// Date/time test helpers
export const mockDate = (date = '2024-01-01T00:00:00.000Z') => {
  const mockDate = new Date(date)
  vi.setSystemTime(mockDate)
  return mockDate
}

export const restoreDate = () => {
  vi.useRealTimers()
}

// Error testing helpers
export const expectToThrow = async (fn, errorMessage) => {
  let error
  try {
    await fn()
  } catch (e) {
    error = e
  }
  expect(error).toBeDefined()
  if (errorMessage) {
    expect(error.message).toContain(errorMessage)
  }
}

// Custom matchers
export const customMatchers = {
  toBeLoading: (received) => {
    const pass = received.loading === true
    return {
      message: () => `expected component ${pass ? 'not ' : ''}to be loading`,
      pass
    }
  },
  
  toHaveError: (received, errorMessage) => {
    const hasError = received.error !== null && received.error !== undefined
    const messageMatches = errorMessage ? received.error?.includes(errorMessage) : true
    const pass = hasError && messageMatches
    
    return {
      message: () => `expected component ${pass ? 'not ' : ''}to have error${errorMessage ? ` containing "${errorMessage}"` : ''}`,
      pass
    }
  }
}