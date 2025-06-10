import { defineStore } from 'pinia';
import axiosInstance from '@/axiosInstance';
import { ref } from 'vue';

export const useSizes = defineStore('sizes', () => {
  const allSizes = ref([]); 

    const getSizes = () => {
      return axiosInstance.get(`/api/sizes`);
    }

    const setAllSizes = (sizes) => {
      allSizes.value = sizes;
    }

    return { getSizes, setAllSizes, allSizes }
  })