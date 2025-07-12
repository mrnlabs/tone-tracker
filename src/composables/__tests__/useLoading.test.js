import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useLoading, useGlobalLoading, useApiLoading } from '../useLoading'

describe('useLoading', () => {
  let loading

  beforeEach(() => {
    loading = useLoading()
  })

  describe('basic loading state management', () => {
    it('should set and check loading state', () => {
      const { setLoading, isLoading } = loading
      
      expect(isLoading('test')).toBe(false)
      
      setLoading('test', true)
      expect(isLoading('test')).toBe(true)
      
      setLoading('test', false)
      expect(isLoading('test')).toBe(false)
    })

    it('should track multiple loading states', () => {
      const { setLoading, isLoading, isAnyLoading, getLoadingKeys } = loading
      
      expect(isAnyLoading.value).toBe(false)
      expect(getLoadingKeys.value).toEqual([])
      
      setLoading('operation1', true)
      setLoading('operation2', true)
      
      expect(isLoading('operation1')).toBe(true)
      expect(isLoading('operation2')).toBe(true)
      expect(isAnyLoading.value).toBe(true)
      expect(getLoadingKeys.value).toEqual(['operation1', 'operation2'])
      
      setLoading('operation1', false)
      
      expect(isLoading('operation1')).toBe(false)
      expect(isLoading('operation2')).toBe(true)
      expect(isAnyLoading.value).toBe(true)
      expect(getLoadingKeys.value).toEqual(['operation2'])
    })

    it('should clear all loading states', () => {
      const { setLoading, clearAllLoading, isAnyLoading, getLoadingKeys } = loading
      
      setLoading('test1', true)
      setLoading('test2', true)
      
      expect(isAnyLoading.value).toBe(true)
      expect(getLoadingKeys.value).toHaveLength(2)
      
      clearAllLoading()
      
      expect(isAnyLoading.value).toBe(false)
      expect(getLoadingKeys.value).toEqual([])
    })
  })

  describe('withLoading wrapper', () => {
    it('should handle successful async operation', async () => {
      const { withLoading, isLoading } = loading
      
      const asyncOperation = vi.fn().mockResolvedValue('success')
      
      expect(isLoading('test')).toBe(false)
      
      const promise = withLoading('test', asyncOperation)
      
      // Should be loading during execution
      expect(isLoading('test')).toBe(true)
      
      const result = await promise
      
      // Should not be loading after completion
      expect(isLoading('test')).toBe(false)
      expect(result).toBe('success')
      expect(asyncOperation).toHaveBeenCalledOnce()
    })

    it('should handle failed async operation', async () => {
      const { withLoading, isLoading } = loading
      
      const error = new Error('Operation failed')
      const asyncOperation = vi.fn().mockRejectedValue(error)
      
      expect(isLoading('test')).toBe(false)
      
      let thrownError
      try {
        await withLoading('test', asyncOperation)
      } catch (e) {
        thrownError = e
      }
      
      // Should not be loading after error
      expect(isLoading('test')).toBe(false)
      expect(thrownError).toBe(error)
      expect(asyncOperation).toHaveBeenCalledOnce()
    })
  })

  describe('useMultipleLoading', () => {
    it('should manage multiple predefined loading states', () => {
      const { useMultipleLoading } = loading
      const multiLoading = useMultipleLoading(['fetch', 'create', 'update'])
      
      const { states, setLoadingState, isLoadingState, isAnyLoadingState } = multiLoading
      
      // Initial state
      expect(states.value).toEqual({
        fetch: false,
        create: false,
        update: false
      })
      expect(isAnyLoadingState.value).toBe(false)
      
      // Set individual states
      setLoadingState('fetch', true)
      expect(isLoadingState('fetch')).toBe(true)
      expect(isLoadingState('create')).toBe(false)
      expect(isAnyLoadingState.value).toBe(true)
      
      setLoadingState('create', true)
      expect(isLoadingState('create')).toBe(true)
      expect(isAnyLoadingState.value).toBe(true)
      
      // Clear states
      setLoadingState('fetch', false)
      setLoadingState('create', false)
      expect(isAnyLoadingState.value).toBe(false)
    })

    it('should handle async operations with withLoadingState', async () => {
      const { useMultipleLoading } = loading
      const multiLoading = useMultipleLoading(['test'])
      
      const { withLoadingState, isLoadingState } = multiLoading
      
      const asyncOperation = vi.fn().mockResolvedValue('result')
      
      const promise = withLoadingState('test', asyncOperation)
      expect(isLoadingState('test')).toBe(true)
      
      const result = await promise
      expect(isLoadingState('test')).toBe(false)
      expect(result).toBe('result')
    })
  })

  describe('specialized loading hooks', () => {
    it('should create API loading states', () => {
      const apiLoading = useApiLoading()
      const { states, setLoadingState, isLoadingState } = apiLoading
      
      expect(states.value).toEqual({
        fetch: false,
        create: false,
        update: false,
        delete: false,
        upload: false,
        download: false
      })
      
      setLoadingState('fetch', true)
      expect(isLoadingState('fetch')).toBe(true)
    })

    it('should maintain global loading state', () => {
      const globalLoading1 = useGlobalLoading()
      const globalLoading2 = useGlobalLoading()
      
      // Should be the same instance (singleton)
      expect(globalLoading1).toBe(globalLoading2)
      
      globalLoading1.setLoading('global-test', true)
      expect(globalLoading2.isLoading('global-test')).toBe(true)
    })
  })

  describe('error handling in async operations', () => {
    it('should ensure loading state is cleared even if operation throws', async () => {
      const { withLoading, isLoading } = loading
      
      const error = new Error('Async error')
      const failingOperation = vi.fn().mockImplementation(() => {
        throw error
      })
      
      let caughtError
      try {
        await withLoading('error-test', failingOperation)
      } catch (e) {
        caughtError = e
      }
      
      expect(caughtError).toBe(error)
      expect(isLoading('error-test')).toBe(false)
    })

    it('should handle promise rejection properly', async () => {
      const { withLoading, isLoading } = loading
      
      const rejectedOperation = () => Promise.reject(new Error('Rejected'))
      
      let caughtError
      try {
        await withLoading('reject-test', rejectedOperation)
      } catch (e) {
        caughtError = e
      }
      
      expect(caughtError).toBeInstanceOf(Error)
      expect(caughtError.message).toBe('Rejected')
      expect(isLoading('reject-test')).toBe(false)
    })
  })
})