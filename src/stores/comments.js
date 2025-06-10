import { defineStore } from 'pinia';
import axiosInstance from '@/axiosInstance';

export const useComments = defineStore('comments', () => {
  
    function submitComment(formData) {
      console.log("comment", formData);
      return axiosInstance.post(`/api/promoters/rating`,formData);
    }

    const getComments = () => {
      return axiosInstance.get(`/api/comments`);
    }

    const deleteComment = (id) => {
      return axiosInstance.delete(`/api/promoters/rating/${id}`);
    }

    return {  submitComment, getComments, deleteComment}
  })