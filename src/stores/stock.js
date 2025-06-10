import { defineStore } from 'pinia';
import axiosInstance from '@/axiosInstance';

export const useStock = defineStore('stock', () => {

    function addStock(form, config) {
      return axiosInstance.post(`/api/stocks`,form, config);
    }   

    const getStockByUnit = (unitId) => {
      return axiosInstance.get(`/api/stocks/unit/${unitId}`);
    }

    const updateStock = (stockId,formData, config) => {
      return axiosInstance.put(`/api/stocks/${stockId}`,formData, config);
    }
    
    const deleteStock = (stockId) => {
      return axiosInstance.delete(`/api/stocks/${stockId}`);
    }
     const stockMovement = (formData) => {
      return axiosInstance.post(`/api/stockMovements`,formData);
    }
  
    return { addStock, getStockByUnit,updateStock,stockMovement,deleteStock }
  })