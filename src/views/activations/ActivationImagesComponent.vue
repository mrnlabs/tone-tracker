<script setup>
import { onMounted, ref } from 'vue';
import { useActivation } from '@/stores/activation';
import { useAuth } from '@/stores/auth';
import useToaster from '@/composables/useToaster';
import Image from 'primevue/image';
import Button from '@/components/buttons/Button.vue';
import Dialog from 'primevue/dialog';
import MultipleFileUpload from '../upload/MultipleFileUpload.vue';
import ProgressSpinner from 'primevue/progressspinner';

const envPath = import.meta.env.VITE_AWS_S3_BUCKET;


const toaster = useToaster();
const activationStore = useActivation();
const authStore = useAuth();
const user = JSON.parse(authStore.user);

const isLoading = ref(false);
const imagesLoading = ref(false);
const images = ref([]);
const files = ref([]);


const props = defineProps({
  activation: Object
})

onMounted(() => {
    getActivationImages();
});

const getActivationImages = async () => {
  imagesLoading.value = true;
    activationStore.getActivationImages(props.activation.id).then(function (response) {
      imagesLoading.value = false;
      images.value = response.data.content;
    }).catch(error => {
      imagesLoading.value = false;
    })
}

const onFileChange = (filesArr) => {
  files.value = filesArr
}
const openModal = ref(false)
const onMultipleFilesDropped = (e) => {
        files.value = e
    };

const onSubmit = () => {
  //if no images return
  if (files.value.length === 0) {
    return
  }
    isLoading.value = true;
    const formData = new FormData();  

    for (let i = 0; i < files.value.length; i++) {
        formData.append('imageFiles', files.value[i]);
    }

    formData.append('entity', "activations");
    formData.append('entityId', props.activation.id);
    formData.append('uploaderId', user.activeUserId);
    const config = {
        useMultipartFormData: true
         };
    activationStore.uploadImages(formData, config).then(function (response) {
      getActivationImages();
      openModal.value = false;
      toaster.success("Images uploaded successfully");
      files.value = [];
      isLoading.value = false;
    }).catch(error => {
      toaster.error("Error uploading images");
      console.log(error);
      isLoading.value = false;
    })
};

</script>
<template>
  <div class="row mt-2 row-cols-xl-9 gap-2">
    <div class="d-flex justify-content-between">
      <h5 class="card-title ">Activation Images</h5>
      <Button @click="openModal = true" classes=" btn maz-gradient-btn" type="button" 
      :disabled="false">
      <template #content>
      Add
      </template>									  
      <!-- <Spinner v-if="loading" class="spinner-border spinner-border-sm" /> -->
    </Button>
    </div>
    <hr>
    <div v-if="images?.length" v-for="activationImage in images" :key="activationImage.id" class="col-img ">
      <Image :src="`${envPath}${activationImage.path}`" alt="Image" width="250" preview style="min-height: 250px;" class="animate__animated animate__zoomIn" />
    </div>
    <div v-else class="text-center">
        <ProgressSpinner v-if="isLoading" style="width: 30px; height: 30px" strokeWidth="8" fill="transparent" animationDuration=".5s" aria-label="Custom ProgressSpinner" />
    
     <span v-else class="text-danger me-1"> No images found.</span><span @click="openModal=true" class="text-primary  cursor-pointer text-decoration-underline">Add?</span>
    </div>
    <Dialog v-model:visible="openModal" position="top" modal header="Add Activation Images" :style="{ width: '50rem' }">
      <MultipleFileUpload
      :showFilePreview="true" 
       accept="image/*" 
       fileType="image" 
       @fileUploaded="onFileChange"
       @fileDropped="onMultipleFilesDropped"
      />
      
      <Button v-if="!isLoading" @click="onSubmit" classes=" btn w-100 maz-gradient-btn" type="button" 
      :disabled="false">
      <template #content>
      Submit
      </template>									  
    </Button>
   <div class="text-center" v-else>
    <ProgressSpinner  style="width: 30px; height: 30px" strokeWidth="8" fill="transparent" animationDuration=".5s" aria-label="Custom ProgressSpinner" />
   </div>
   </Dialog>
     
    </div>
</template>
