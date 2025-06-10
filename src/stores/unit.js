import { defineStore } from 'pinia';
import axiosInstance from '@/axiosInstance';

export const useUnit = defineStore('unit', () => {

    function addUnit(form) {
      return axiosInstance.post(`/api/units`,form);
    }

    

    const getUnits = () => {//dont know wat this does yet
      return axiosInstance.get(`/api/units`);
    }

    const getUnitsByWarehouseId = (warehouseId) => {
      return axiosInstance.get(`/api/units/${warehouseId}`);
    }

    const updateUnit = (id,formData) => {
      return axiosInstance.put(`/api/units/${id}`,formData);
    }
    const deleteUnit = (id) => {
      return axiosInstance.delete(`/api/units/${id}`);
    }

  
    return { addUnit,getUnits,updateUnit,deleteUnit,getUnitsByWarehouseId }
  })