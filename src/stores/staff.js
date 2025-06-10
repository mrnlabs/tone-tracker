import { defineStore } from 'pinia';
import axiosInstance from '@/axiosInstance';
import { reactive } from 'vue';

export const useStaff = defineStore('staff', () => {  

    const getStaff = () => {
      return axiosInstance.get(`/api/staffs`);
    }

    const createStaff = (data) => {
      return axiosInstance.post(`/api/staffs`,data);
    }

    const updateStaff = (id, data) => {
      return axiosInstance.put(`/api/staffs/${id}`,data);
    }
    const deleteStaff = (id) => {
      return axiosInstance.delete(`/api/staffs/${id}`);
    }
      
    return { createStaff,getStaff,updateStaff,deleteStaff }
  })