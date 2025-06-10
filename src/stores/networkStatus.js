import { defineStore } from 'pinia'
import { useOnline } from '@vueuse/core'

export const useNetworkStatus = defineStore('networkStatus', () => {
  const online = useOnline();
  return { online }
})
