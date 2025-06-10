import { defineStore } from 'pinia';
import axiosInstance from '@/axiosInstance';

export const useDocUpload = defineStore('docUpload', () => {

    function submit(formData, config) {
      return axiosInstance.post(`/api/documents`,formData, config);
    }

    const getDocs = () => {
      return axiosInstance.get(`/api/documents`);
    }
    const deleteDoc = (id) => {
      return axiosInstance.delete(`/api/documents/${id}`);
    }
    return { submit, getDocs, deleteDoc }
  
  })  