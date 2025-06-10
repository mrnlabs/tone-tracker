<script setup>
import Layout from '../shared/Layout.vue';
import BreadCrumb from '../../components/BreadCrumb.vue';
import { onMounted, ref } from 'vue';
import { useActivation } from '@/stores/activation';
import { useRoute } from 'vue-router';
import { useAuth } from '@/stores/auth';
import MultipleFileUpload from '../upload/MultipleFileUpload.vue';
import useToaster from '@/composables/useToaster';
import Image from 'primevue/image';
import Accordion from 'primevue/accordion';
import AccordionPanel from 'primevue/accordionpanel';
import AccordionHeader from 'primevue/accordionheader';
import AccordionContent from 'primevue/accordioncontent';
import Button from '@/components/buttons/Button.vue';

const envPath = import.meta.env.VITE_AWS_S3_BUCKET;


const toaster = useToaster();
const route = useRoute();
const activationStore = useActivation();
const activationId = ref(route.query.activation);
const activationData = ref({});
const authStore = useAuth();
const user = JSON.parse(authStore.user);

const isLoading = ref(false);
const imagesLoading = ref(false);
const images = ref([]);
const files = ref([]);

onMounted(() => {
    getActivationById();
});

const getActivationImages = async () => {
  imagesLoading.value = true;
    activationStore.getActivationImages(activationId.value).then(function (response) {
      imagesLoading.value = false;
      images.value = response.data.content;
        // activationData.value = response.data;
    }).catch(error => {
      imagesLoading.value = false;
    })
}

const getActivationById = async () => {
    activationStore.getActivationById(activationId.value).then(function (response) {
      console.log(response.data);
        activationData.value = response.data;
        getActivationImages();
    }).catch(error => {
      console.log(error);
      
    })
}

const onFileChange = (filesArr) => {
    console.log(filesArr)
  files.value = filesArr
}

const onMultipleFilesDropped = (e) => {
        console.log('e', e);
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
    formData.append('entityId', activationId.value);
    formData.append('uploaderId', user.activeUserId);
    const config = {
        useMultipartFormData: true
         };
    activationStore.uploadImages(formData, config).then(function (response) {
      getActivationImages();
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
  <Layout>
    <!--start page wrapper -->
    <div class="page-wrapper">
      <div class="page-content">
        <BreadCrumb :title="activationData.name" icon="bx bx-line-chart" />
        <div class="row mt-6 row-cols-xl-9 gap-4">
          <div class="mt-6">
          <div class="">
            <h4 class="mb-2 ml-2">{{ activationData?.name }} Images</h4>
          </div>
          <div v-if="images?.length > 0" class="gallery-container">
            <div v-for="image in images" :key="image.id" class="gallery">
              <div class="card">
                <Image alt="Image" preview class="gallery-image" style="height: 180px;">
                  <template #previewicon>
                    <i class='bx bx-search-alt-2'></i>
                  </template>
                  <template #image>
                    <img :src="envPath + image.path" :alt="image.title || 'image'" class="img-fluid">
                  </template>
                  <template #preview="slotProps">
                    <img :src="envPath + image.path" :alt="image.title || 'preview'" :style="slotProps.style" @click="slotProps.onClick" class="img-fluid">
                  </template>
                </Image>
              </div>
            </div>
              </div>

          <div class="col" v-if="activation?.team?.length > 0" v-for="team in activation?.team" :key="team.id">
              <div class="gallery">
                <div class="asc py-3">{{ team.firstName }} {{ team.lastName }}</div>
                <router-link :to="`${ team.staff ? '/staff-profile/' + team.staff + '/' + team?.id : '#!' }`">
                  <img :src="team.path ? envPath + team.path : `https://ui-avatars.com/api/?name=${ team.firstName + ' ' + team.lastName }&background=random`" alt="Cinque Terre" class="img-fluid">
                </router-link>
              </div>
          </div>

          <!-- <div v-else class="text-center text-danger">{{ imagesLoading ? 'Loading...' : 'No images found.' }}</div> -->
        </div>
          
         
        </div>


        <Accordion value="0">
          <AccordionPanel value="1">
              <AccordionHeader>
                  <h5>Upload Images</h5>
              
              </AccordionHeader>
              <AccordionContent>
                <div class="card">
            
                  <MultipleFileUpload
                  :showFilePreview="true" 
                   accept="image/*" 
                   fileType="image" 
                   @fileUploaded="onFileChange"
                   @fileDropped="onMultipleFilesDropped"
                  />
        
                </div>
                    <div class="d-grid" >

                      <Button @click="onSubmit" classes="btn maz-gradient-btn" type="button" :disabled="isLoading">
                        <template #content>
                          {{ isLoading ?  'Uploading...' : 'Upload' }}
                        </template>									  
                        <Spinner v-if="isLoading" class="spinner-border spinner-border-sm" />
                      </Button>
                    </div>
              </AccordionContent>
          </AccordionPanel>
      </Accordion>
      </div>

 

    
    </div>
    <!--start switcher-->
  </Layout>
</template>



<!-- <style scoped>

.main-dashboard-head {
  display: flex;
  align-items: center;
}

.page-icon {
  max-width: 4rem !important;
  fill: linear-gradient(to right, #9A3AB1, #117A);
  margin-right: 1rem
}

.maz-height {
  font-size: 3rem;
  height: 7rem;
}

html.dark-theme .widgets-icons {
  color: #fff;
}

.maz-table-row-height {
  height: 55px;
}

.col-width-30 {
  width: 4.5%;
}

.col-width-10 {
  width: 10%;
}

div.gallery {
  margin: 5px;
  border: 1px solid #12181A;
  float: left;
  width: 180px;
}

div.gallery:hover {
  border: 1px solid #777;
}

div.gallery img {
  width: 100%;
  height: auto;
}

.col-img {
  position: relative;
  display: inline-block;
  width: 200px;
  
}

.gallery {
  position: relative;
}

.gallery img {
  width: 100%;
  height: auto;
}

.desc {
  text-align: center;
  padding: 10px;
  font-size: 18px;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
}

.checkbox {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 24px;
  height: 24px;
  background-color: white;
  border: 2px solid #000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.checkbox input[type="checkbox"] {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  width: 100%;
  height: 100%;
  margin: 0;
}

.checkbox input[type="checkbox"]:checked+span {
  background-color: white;
  font-weight: 1000;
  color: black;
  background-color: transparent;
}

div.desc {
  padding: 13px;
  text-align: center;
}

.col-img {
  flex: 0 0 0%;
}

.mt-6 {
  margin-top: 2rem !important;
}

.asc {
  text-align: center;
  background: #12181A;
  width: 180px;
  line-height: 1;
  /* font-size: 1.2rem; */
  font-weight: 600;
}

.maz-table {
  background: #575757;
}

html.dark-theme .table td,
html.dark-theme .table th {
  border-color: #141414;
}

@media (max-width: 768px) {
  .main-dashboard-head {
    flex-direction: column;
    align-items: flex-start;
  }

  .col-img {
    width: 100%;
  }

  .gallery {
    width: 100%;
  }

  .table-responsive {
    overflow-x: auto;
  }

  .my-table {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}

/* ///////////// */
.img-fluid {
            /* border-radius: 8px; */
            transition: transform 0.2s;
        }

        .img-fluid:hover {
            transform: scale(1.05);
        }

        .container {
            text-align: center;
        }

        @media (max-width: 576px) {
            .col-sm-6 {
                flex: 0 0 100%;
                max-width: 100%;
            }
        }


/* image fluid */
.image-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 6rem;
  margin-top: 2rem;
  margin-bottom: 2rem;
}

.image-container {
  aspect-ratio: 1 / 1;
  overflow: hidden;
}

.card {
  height: 100%;
}

.gallery-image {
  width: 100%;
  height: 100%;
}

.gallery-image :deep(img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.gallery-image:hover :deep(img) {
  transform: scale(1.05);
}

/* image fluid */

.gallery-container {
  display: flex;
  overflow-x: auto;
  gap: 20px;
  padding: 20px 0;
}

.gallery {
  flex: 0 0 auto;
  width: 180px;
  border: 1px solid #ccc;
  transition: border-color 0.3s ease;
}

.gallery:hover {
  border-color: #777;
}

.card {
  height: 180px;
  overflow: hidden;
}

.gallery-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.asc {
  padding: 15px;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.img-fluid {
  max-width: 100%;
  height: 100%;
  object-fit: cover;
}



</style> -->
