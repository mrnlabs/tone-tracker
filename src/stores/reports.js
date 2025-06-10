import { defineStore } from 'pinia';
import { ref, onMounted } from 'vue';
import axiosInstance from '@/axiosInstance';

export const useReports = defineStore('useReports', () => {

  const getCampaignReport = (id) => {
    return axiosInstance.get(`/api/campaigns/${id}/report`);
  };

  return { getCampaignReport };
});