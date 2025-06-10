import { defineStore } from 'pinia';
import axiosInstance from '@/axiosInstance';
import { reactive, ref } from 'vue';
import client from '@/router/client';
import { generatePassword } from '@/utils';

export const useUserStore = defineStore('useUserStore', () => {

  const allUsers = ref([]);
  /**
   * Generates a random password of length 8 using a predefined character set.
   *
   * @return {string} The randomly generated password.
   */
  
  
    function submitUser(form) {
      const userData = reactive({
        email: form.email,
        firstName: form.firstName,
        lastName: form.lastName,
        role: form.role,
        phone: form.phone,
        height: form.height,
        location: [],
        topSize: form.topSize,
        pantsSize: form.pantsSize,
        dressSize: form.dressSize,
        bio: '',
        type : form.type,
        name: form.name,
        description:'',
        password: generatePassword(),
        duty: form.type ? form.type : null,//For authoritative and billing contacts ONLY
        client: form.client ? form.client : null
      });
      return axiosInstance.post(`/api/users`,userData);
    }

    function submitContact(form) {
      return axiosInstance.post(`/api/users`,form);
    }

    const getUsers = (page=null,filter='') => {
      return axiosInstance.get(`/api/users?page=${page}&filter=${filter}`);
    }

    const  getUser = (id) => {
      return axiosInstance.get(`/api/users/${id}`);
    } 

    const getUserByRole = (role) => {
      return axiosInstance.get(`/api/users/role?role=${role}`);
    }

    const createStaffMember = (data) => {
      return axiosInstance.post(`/api/users`,data);
    }

    const updateUser = (id, data) => {
      console.log('updateUser', id, data);
      return axiosInstance.put(`/api/users/${id}`,data);
    }
    const deleteUser = (id) => {
      return axiosInstance.delete(`/api/users/${id}`);
    }

    const updateProfile = (userId, data) => {
      return axiosInstance.put(`/api/users/${userId}`,data);
    }
    const updatePassword = (userId, password) => {
      return axiosInstance.post(`/api/users/reset/update-password?userId=${userId}&password=${password}`);      
    }

    const updatePasswordInternal = (userId, password) => {
      return axiosInstance.post(`/api/users/password/update?userId=${userId}&password=${password}`);      
    }

    const isFieldUnique = (field, email, id) => {
      return axiosInstance.get(`/api/users/${field}/check?id=${id}&${field}=${email}`);
    }

    const setAllUsers = (data) => {
      allUsers.value = data;
    }

    const deleteBulkContacts = (data) => { 
      console.log('data', data);
      return axiosInstance.delete(`/api/users/client`, {
        data,
        headers: { 'Content-Type': 'application/json' }
      });
    };
    
      
    return { updateProfile,isFieldUnique,setAllUsers,allUsers,updatePasswordInternal,deleteBulkContacts,
      submitUser,createStaffMember,getUsers,updateUser,deleteUser,getUser,getUserByRole,updatePassword,submitContact }
  })