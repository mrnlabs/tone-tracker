import { defineStore } from 'pinia';
import axiosInstance from '@/axiosInstance';

export const useCrmStore = defineStore('useCrm', () => {

    const getCrm = () => {
        
        return axiosInstance.get(`/api/leads/search`);
    }

    const createCrm = (form) => {
        console.log(form);
        return axiosInstance.post(`/api/leads`,form);
    }
    const crmFilterByActivation = (search,activationId) => {
        return axiosInstance.get(`/api/leads/search?searchkeyword=${search}&activation=${activationId}`);
    }

    const exportToPDF = (type, data) => {//handle both pdf and excel depending on type
        if(type == 'pdf'){
            return axiosInstance.post(`/api/pdf/crm/report`,data, { responseType: 'blob' });
        }
        return axiosInstance.post(`/api/excel/leads/export`, data, { responseType: 'blob' });
    }

    const importExcel = (formData,config) => {
        return axiosInstance.post(`/api/leads/csv`,formData, config);
    }

    return {getCrm, createCrm,crmFilterByActivation,exportToPDF,importExcel}
})