<script setup>
import Layout from '../shared/Layout.vue';
import BreadCrumb from '../../components/BreadCrumb.vue';
import { onMounted, ref } from 'vue';
import { usePrimeVue } from 'primevue/config';
import { useClientStore } from '@/stores/useClient';
import { usePromoter } from '@/stores/promoter';
import { useRoute } from 'vue-router';
import Image from 'primevue/image';
import FileUpload from 'primevue/fileupload';
import Badge from 'primevue/badge';
import Button from 'primevue/button';
import { useAuth } from '@/stores/auth';



const $primevue = usePrimeVue();
const route = useRoute();
const promoterStore = usePromoter();
const promoterId = ref(route.query.promoter);
const promoterData = ref({});
const authStore = useAuth();
const user = JSON.parse(authStore.user);

const totalSize = ref(0);
const totalSizePercent = ref(0);
const files = ref([]);

onMounted(() => {
    getActivationById();
});

const getPromoterById = async () => {
    promoterStore.getPromoterById(promoterId.value).then(function (response) {
        console.log(response.data);
        promoterData.value = response.data;
    })
}
const onRemoveTemplatingFile = (file, removeFileCallback, index) => {
    removeFileCallback(index);
    totalSize.value -= parseInt(formatSize(file.size));
    totalSizePercent.value = totalSize.value / 10;
};


const onSelectedFiles = (event) => {
    files.value = event.files;
    files.value.forEach((file) => {
        totalSize.value += parseInt(formatSize(file.size));
    });
};

const uploadEvent = (callback) => {
    totalSizePercent.value = totalSize.value / 10;
    callback();
};

const onSubmit = () => {
  
    const formData = new FormData();

    for (let i = 0; i < files.value.length; i++) {
        formData.append('imageFiles', files.value[i]);
    }

    formData.append('entity', "promoters");
    formData.append('entityId', activationId.value);
    formData.append('uploaderId', user.activeUserId);

    const config = {
        useMultipartFormData: true // Add this flag to the request config
         };
    promoterStore.uploadImages(formData, config).then(function (response) {
        console.log(response.data);
    })
};

const formatSize = (bytes) => {
    const k = 1024;
    const dm = 3;
    const sizes = $primevue.config.locale.fileSizeTypes;

    if (bytes === 0) {
        return `0 ${sizes[0]}`;
    }

    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const formattedSize = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));

    return `${formattedSize} ${sizes[i]}`;
};




</script>
<template>
  <Layout>
    <!--start page wrapper -->
    <div class="page-wrapper">
      <div class="page-content">
        <BreadCrumb :title="activationData.name" icon="bx bx-line-chart" />
      
        <div class="row mt-6 row-cols-xl-9 gap-4">
          <div class="col-img ">
            <div class="gallery">
              <router-link to="/profile">
                <img src="../../assets/images/avatars/avatar-1.png" alt="Cinque Terre" class="img-fluid">
              </router-link>
              <!-- <div class="checkbox">
                <input type="checkbox" id="select">
                <span>&#x2713;</span>
              </div> -->
              <div>
                <div><button class="btn btn-danger rounded-0 w-100"><i class='bx bx-trash'></i><span class="mt-2">Remove</span></button></div>
              </div>
            </div>
          </div>
        </div>


        <div class="card">
            
            <FileUpload name="demo[]" url="/api/upload" :multiple="true" accept="image/*" @select="onSelectedFiles">
                <template #header="{ chooseCallback, uploadCallback, clearCallback, files }">
                    <div class="d-flex flex-wrap justify-content-between align-items-center flex-grow-1 gap-4">
                        <div class="d-flex gap-2">
                            <Button @click="chooseCallback()" icon="bx bx-images" class="btn btn-outline-secondary text-white rounded"></Button>
                            <Button @click="clearCallback()" icon="bx bx-x" class="btn btn-outline-danger rounded" :disabled="!files || files.length === 0"></Button>
                        </div>
                    </div>
                </template>
                <template #content="{ files, uploadedFiles, removeUploadedFileCallback, removeFileCallback }">
                    <div class="d-flex flex-column gap-4 pt-4">
                        <div v-if="files.length > 0">
                            <div class="d-flex flex-wrap gap-4">
                                <div v-for="(file, index) of files" :key="file.name + file.type + file.size" class="p-4 rounded border d-flex flex-column border-secondary align-items-center gap-2">
                                    <div>
                                        <img role="presentation" :alt="file.name" :src="file.objectURL" width="100" height="50" />
                                    </div>
                                    <span class="font-weight-bold text-truncate w-75">{{ file.name }}</span>
                                    <div>{{ formatSize(file.size) }}</div>
                                    <Button icon="bx bx-x" @click="onRemoveTemplatingFile(file, removeFileCallback, index)" class="btn btn-outline-danger rounded" />
                                </div>
                            </div>
                        </div>
    
                        <div v-if="uploadedFiles.length > 0">
                            <div class="d-flex flex-wrap gap-4">
                                <div v-for="(file, index) of uploadedFiles" :key="file.name + file.type + file.size" class="p-4 rounded border d-flex flex-column border-secondary align-items-center gap-2">
                                    <div>
                                        <img role="presentation" :alt="file.name" :src="file.objectURL" width="100" height="50" />
                                    </div>
                                    <span class="font-weight-bold text-truncate w-75">{{ file.name }}</span>
                                    <div>{{ formatSize(file.size) }}</div>
                                    <Badge value="Completed" class="mt-4 badge bg-success" />
                                    <Button icon="bx bx-x" @click="removeUploadedFileCallback(index)" class="btn btn-outline-danger rounded" />
                                </div>
                            </div>
                        </div>
                    </div>
                </template>
                <template #empty>
                    <div class="d-flex align-items-center justify-content-center flex-column">
                        <i class="bx bx-cloud-upload border border-2 rounded-circle p-4 fs-6 text-muted" />
                        <p class="mt-3 mb-0">Drag and drop files to here to upload.</p>
                    </div>
                </template>
            </FileUpload>
        </div>
            <div class="d-grid">
              <button @click="onSubmit" class="btn maz-gradient-btn d-flex justify-content-center align-items-center" type="button"> 
                  Submit
              </button>
            </div>
     

     
      </div>

 

    
    </div>
    <!--start switcher-->
  </Layout>
</template>



<style scoped>
@import 'lightbox2/dist/css/lightbox.css';

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
</style>
