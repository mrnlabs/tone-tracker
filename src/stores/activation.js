import { defineStore } from 'pinia';
import axiosInstance from '@/axiosInstance';
import { ref } from 'vue';

export const useActivation = defineStore('activation', () => {
  const allActivations = ref([]);

    function submit(formData, config) {
      return axiosInstance.post(`/api/activations`,formData, config);
    }

    const getActivations = () => {
      return axiosInstance.get(`/api/activations`);
    }

    const getActivationImages = (activationId) => {
      return axiosInstance.get(`/api/images/all/${'activations'}/${activationId}`);
    }

    const update = (id,form, config) => {
      return axiosInstance.put(`/api/activations/${id}`,form,config);
    }
    const deleteActivation = (id) => {
      return axiosInstance.delete(`/api/activations/${id}`);
    }

    const getActivationById = (id) => {
      return axiosInstance.get(`/api/activations/${id}`);
    }

    //make the id optional parameter

    const getAllActivations = ( userRole, id=null) => { console.log(id);
      switch (userRole) {
        case 'TTG_REGIONAL_MANAGER':
          return axiosInstance.get(`/api/activations/region/${id}`);
        case 'TTG_ACTIVATION_MANAGER':
          return axiosInstance.get(`/api/activations/staff/${id}`);
        case 'TTG_TALENT':
          return axiosInstance.get(`/api/activations/promoter/${id}`);
        case 'SUPPLIER':
            return axiosInstance.get(`/api/activations/thirdParty/${id}`);
        case 'CLIENT':
          return axiosInstance.get(`/api/activations/client/${id}`);
        default:
          return axiosInstance.get(`/api/activations/campaign/${id}`);
      }
      
    }

    const getAllActivationsForTemporal = () => { //getting all activations for temporal, we need to re-visit this endpoint
      return axiosInstance.get(`/api/activations/admins`);
    }

    const getActivationsByCampaignId = (campaignId) => {
      return axiosInstance.get(`/api/activations/campaign/${campaignId}`);
    }
    
    const getTimeSheetReport = (activationId) => {
      return axiosInstance.get(`/api/activations/${activationId}/timesheet`);
    }
  
    const getActivationByStaffId = (staffId) => {
      return axiosInstance.get(`/api/activations/staff/${staffId}`);
    }

    const uploadImages = (formData, config) => {

      console.log(formData);
      // change this endpoint @Busani
      return axiosInstance.post(`/api/images`,formData, config);
    }


    //GET ALL ACTIVATIONS LOCATIONS
    const getAllActivationsAdmins = () => {

      return axiosInstance.get(`/api/activations/admins`);
    }


    const getAllActivationsRegionalManager = (StaffId) => {

      return axiosInstance.get(`/api/activations/region/staff/${StaffId}`);
    }

    const getAllActivationsManager = (StaffId) => {

      return axiosInstance.get(`/api/activations/manager/staff/${StaffId}`);
    }

    const getAllActivationsPromoter = (promoterId) => {

      return axiosInstance.get(`/api/activations/promoter/${promoterId}`);
    }

    const getAllActivationsSupplier = (supplierId) => {

      return axiosInstance.get(`/api/activations/thirdParty/${supplierId}`);
    }    

    const getAllTasksLocation = (userId, role) => {
      return axiosInstance.get(`/api/tasks/location/${userId}/role/${role}`);
    }

    const getAllActivationByRegionId = (regionId) => {
      return axiosInstance.get(`/api/activations/region/${regionId}`);
    }

    const getAllTrainingMaterial = (activationId) => {
      return axiosInstance.get(`/api/approaches/activation/${activationId}`);
    }

    const recordUserOpenedFile = (approachId, promoterId) => {

      return axiosInstance.post(`/api/approaches/read?approachId=${approachId}&promoterId=${promoterId}`);
    }

    const submitTrainingMaterial = (formData, config) => {

      return axiosInstance.post(`/api/approaches`, formData, config);
    }

    const deleteTrainingMaterial = (materialId) => {
      return axiosInstance.delete(`/api/approaches/${materialId}`);
    }
    
    const getActivationReport = (activationId) => {
      return axiosInstance.get(`/api/activations/${activationId}/report`);
    }

    const exportToPDF = (type, data) => {//This will handle both pdf and excel depending on type
      if(type == 'pdf'){
          return axiosInstance.post(`/api/pdf/activation/report`,data, { responseType: 'blob' });
      }
      return axiosInstance.post(`/api/activation/export?activation=${type}`);
    }

    const setAllActivations = (data) => {
      allActivations.value = data;
    }
  
    return { submit,getActivations,update,deleteActivation,getActivationById,getActivationsByCampaignId,getActivationByStaffId,getAllActivationsForTemporal,
             uploadImages , setAllActivations, getAllActivations, getActivationImages, getAllActivationsAdmins, getAllActivationsRegionalManager, getTimeSheetReport,
             getAllActivationsManager, getAllTasksLocation, getAllTrainingMaterial,recordUserOpenedFile, submitTrainingMaterial,allActivations,
             deleteTrainingMaterial, getAllActivationsPromoter, getAllActivationsSupplier, getAllActivationByRegionId,getActivationReport,exportToPDF
            }
  })