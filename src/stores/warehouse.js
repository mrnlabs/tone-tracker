import { defineStore } from 'pinia';
import axiosInstance from '@/axiosInstance';
import { ref } from 'vue';

export const useWarehouse = defineStore('warehouse', () => {

  const allWarehouses = ref([]);

    function submit(form) {
      return axiosInstance.post(`/api/warehouses`,form);
    }

    const getWarehouses = () => {
      return axiosInstance.get(`/api/warehouses`);
    }


    const getWarehousesByRegionId = (regionId) => {
      return axiosInstance.get(`/api/warehouses/region/${regionId}`);
    }

    const update = (id,formData) => {
      return axiosInstance.put(`/api/warehouses/${id}`,formData);
    }
    const deleteWarehouse = (id) => {
      return axiosInstance.delete(`/api/warehouses/${id}`);
    }

    const viewWarehouse = (id) => {
      return axiosInstance.get(`/api/warehouses/${id}`);
    }

    const setAllWarehouses = (data) => {
      allWarehouses.value = data;
    }

    const exportToExcel = (warehouseId) => {
      return axiosInstance.post(`/api/excel/warehouse/${warehouseId}/stock?id=${warehouseId}`,{}, { responseType: 'blob' });
  }

  const importExcel = (formData,config) => {
    return axiosInstance.post(`/api/stocks/csv`,formData, config);
  }
  
    return { allWarehouses,setAllWarehouses,exportToExcel,submit,getWarehouses,update,importExcel,deleteWarehouse,getWarehousesByRegionId,viewWarehouse }
  })