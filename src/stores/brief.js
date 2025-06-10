import { defineStore } from 'pinia';
import axiosInstance from '@/axiosInstance';

export const useBrief = defineStore('brief', () => {

    function submit(formData, config) {
      return axiosInstance.post(`/api/briefs`,formData, config);
    }

    

    const getBriefs = (userRole, id = null) => {
      console.log(id);
      switch (userRole) {
        case 'TTG_REGIONAL_MANAGER':
          return axiosInstance.get(`/api/activations/brief/region/${id}`);
        case 'TTG_ACTIVATION_MANAGER':
          return axiosInstance.get(`/api/activations/brief/staff/${id}`);
        case 'TTG_TALENT':
          return axiosInstance.get(`/api/activations/brief/promoter/${id}`);
        case 'SUPPLIER':
          return axiosInstance.get(`/api/activations/brief/thirdParty/${id}`);
        case 'CLIENT':
          return axiosInstance.get(`/api/activations/brief/client/${id}`);
        default:
          return axiosInstance.get(`/api/briefs`);
      }
    };
    

    const update = (id,form) => {
      return axiosInstance.put(`/api/briefs/${id}`,form);
    }
    const deleteBrief = (id) => {
      return axiosInstance.delete(`/api/briefs/${id}`);
    }

    const getBriefById = (id) => {
      return axiosInstance.get(`/api/briefs/${id}`);
    }

    const getDocument = (path) => {
      return axiosInstance.get(`/api/briefs/document`, { params: { path }, responseType: 'blob' });
    }

    return { submit, getBriefs, update, deleteBrief, getBriefById, getDocument }
  
  })  