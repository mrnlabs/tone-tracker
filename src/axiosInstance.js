/**
 * Author: Mazisi Msebele
 * Date: 2023-06-01 23:58
 * 
 */
import axios from 'axios';
import { useAuth } from '@/stores/auth';
import { useNetworkStatus } from './stores/networkStatus';
import router from '@/router';
import useToaster from './composables/useToaster';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const auth = useAuth();
    // const user = JSON.parse(auth.user);
    // if(!user){
    //   router.push('/');
    //   window.location.reload();
    // }

    const isOnline = useNetworkStatus();
    if (!isOnline.online) {
      const toaster = useToaster();
      //return toaster.error('Internet connection lost.');
    }
    
    if (localStorage.getItem('token')) {
      config.headers['Authorization'] = `Bearer ${auth.token}`;
    } else {
      // const router = useRouter();
      console.log('no token');
      router.push('/');
    }
    
    if (config.useMultipartFormData) {
      config.headers['Content-Type'] = 'multipart/form-data';
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
