<template>
    <button @click="getLocation" :disabled="isLoading" class="rounded btn p-0  btn-sm rounded-5 maz-gradient-btn"> 
      {{ isLoading ? 'Loading...' : 'Check in' }}
    </button>
    
    
    <!-- <div v-if="error">
      Please allow location access in your browser settings
    </div> -->
  </template>
  
  <script setup>
  import { useGeolocation } from '@vueuse/core';
  import { ref } from 'vue';
  import { usePromoter } from '@/stores/promoter';
  import { useAuth } from '@/stores/auth';
  
  const { coords, error, resume, pause } = useGeolocation();
  const showLocationDetails = ref(false);
  const isLoading = ref(false);
  const user = JSON.parse(useAuth().user);

  const promoterStore = usePromoter();
  
  const getLocation = () => {
    isLoading.value = true;
    resume();
    showLocationDetails.value = true;
    isLoading.value = false;
    const coordObj = {
      "latitude": coords.value.latitude,
      "longitude": coords.value.longitude,
      "user": user.id,
      "promoter": user.activeUserId
    }
     promoterStore.checkIn(coordObj).then(function (response) {
      toaster.success("You have successfully Checked IN");
        isLoading.value = false;
        showLocationDetails.value = true;
        isLoading.value = false;
     })
  };
  </script>