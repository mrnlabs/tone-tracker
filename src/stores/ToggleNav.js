import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useNavStore = defineStore('navStore', () => {
  const isNavVisible = ref(false)

  function setIsNavVisible () {
    isNavVisible.value = !isNavVisible.value;
  }

  return { isNavVisible, setIsNavVisible }
})
