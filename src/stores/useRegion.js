import { defineStore } from 'pinia';
import axiosInstance from '@/axiosInstance';
import { ref } from 'vue';

export const useRegion = defineStore('region', () => {

  const allRegions = ref([]);

    function submit(form) {
      return axiosInstance.post(`/api/regions`,form);
    }

    const getRegions = () => {
      return axiosInstance.get(`/api/regions`);
    }

    const getRegionsByStaffId = (id) => {
      return axiosInstance.get(`/api/regions/staff/${id}`);
    }

    const update = (client) => {
      let obj = {name: client.name}
      return axiosInstance.put(`/api/regions/${client.id}`,obj);
    }
    const deleteRegion = (id) => {
      return axiosInstance.delete(`/api/regions/${id}`);
    }

    // const addRegionalManager = (regionId, staffId) => {
    //   return axiosInstance.post(`/api/regions/${regionId}/${staffId}`);
    const addRegionalManager = (data) => {
      console.log("data", data);
      return axiosInstance.put(`/api/regions/${data.region}/${data.staff}`,);
    }
    
    const setAllRegions = (data) => {
      allRegions.value = data;
    }
  
    return { submit,setAllRegions, allRegions,getRegions,update,deleteRegion,addRegionalManager,getRegionsByStaffId }
  })