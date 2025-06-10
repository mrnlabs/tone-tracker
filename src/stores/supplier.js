import { defineStore } from 'pinia';
import axiosInstance from '@/axiosInstance';
import { ref } from 'vue';

export const useSupplier = defineStore('supplier', () => {
  const allSuppliers = ref([]);

  function submit(data, supplierId) {
    return axiosInstance.post(`/api/costs/thirdPartyId/${supplierId}`, data);
  }

  function submitSupplier(data) {
    return axiosInstance.post(`/api/users`, data);
  }

  const getThirdParties = () => {
    return axiosInstance.get(`/api/thirdParties`);
  }


  const getAllSuppliers = (page=null,filter='') => {
    return axiosInstance.get(`api/users/role?role=SUPPLIER&page=${page}&filter=${filter}`);
  }

  const getThirdPartyTasks = (thirdPartyId) => {
    return axiosInstance.get(`api/bids/thirdParty/${thirdPartyId}`);
  }

  const getThirdPartyAwardedTasks = (awardId) => {
    return axiosInstance.get(`api/taskAwards/${awardId}`);
  }

  const uploadSignedDocuments = (formData, config) => {
    return axiosInstance.post(`api/documents/signed`, formData, config);
  }

  const getSignedDocuments = (supplierId, type) => {
    return axiosInstance.get(`api/documents/signed/${supplierId}/${type}`);
  }

  const submitBid = (data, bidId) => {
    return axiosInstance.post(`/api/bids/${bidId}/costs`, data);
  }

  const setAllSuppliers = (data) => {
    allSuppliers.value = data;
  }

  const importExcel = (formData,config) => {
    return axiosInstance.post(`/api/thirdParties/csv`,formData, config);
}

  return { submit,allSuppliers, importExcel, setAllSuppliers, getAllSuppliers, getSignedDocuments, getThirdParties, getThirdPartyTasks, submitBid, getThirdPartyAwardedTasks, uploadSignedDocuments, submitSupplier }

})  