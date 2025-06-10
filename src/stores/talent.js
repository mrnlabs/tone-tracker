import { defineStore } from 'pinia';
import axiosInstance from '@/axiosInstance';

export const useTalentStore = defineStore('useTalententStore', () => {

    function submitTalent(form) {
      return axiosInstance.post(`/api/promoters`,form);
    }

    const getTalents = () => {
      return axiosInstance.get(`/api/promoters`);
    }

    const updateTalent = (Talent) => {
      let obj = {name: Talent.name}
      return axiosInstance.put(`/api/promoters/${Talent.id}`,obj);
    }
    const deleteTalent = (id) => {
      return axiosInstance.delete(`/api/Talent/${id}`);
    }

    const  getTalentByTalentId = (id) => {
      return axiosInstance.get(`/api/promoters/${id}`);
    }    
    
    const  getTalentByUserId = (id) => {
      return axiosInstance.get(`/api/promoters/${id}`);
    }
   
  
    return {getTalentByTalentId, submitTalent,getTalents,updateTalent,deleteTalent ,getTalentByUserId}
})