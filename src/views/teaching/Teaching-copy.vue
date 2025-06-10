<script setup>
import Layout from '@/views/shared/Layout.vue';
import BreadCrumb from '@/components/BreadCrumb.vue';
import InputText from 'primevue/inputtext';
import FileUploadGeneric from '../upload/FileUploadGeneric.vue';
import Dialog from 'primevue/dialog';
import { onMounted, ref, watch } from "vue";
import { useActivation } from '@/stores/activation';
import { useAuth } from '@/stores/auth';
import useToaster from '@/composables/useToaster';
import { useRoute } from 'vue-router';
import Drawer from "primevue/drawer";
import PDF from "pdf-vue3";

// Reactive variables
const materials = ref([]);
const authStore = useAuth();
const activationStore = useActivation();
const user = JSON.parse(authStore.user);
const toaster = useToaster();
const showLoading = ref(false);
const route = useRoute();
const activationId = ref(route.params.id);
const addTrainingMaterial = ref(false);  // Control the dialog visibility
const visible = ref(false);
const docName = ref('');
const filePath = ref(null);
const showAddingModal = ref(false);
const title = ref('');  
const selectedFile = ref(null);

watch(() => route.params.id, (newId) => {
    activationId.value = newId;
    getAllTrainingMaterial(newId);
});

onMounted(() => {
    getAllTrainingMaterial(activationId.value);
});

const openDocument = (material) => {
    if (user.role == 'SUPPLIER' || user.role == 'TTG_TALENT') {
        recordUserOpenedFile(material.id, user.activeUserId);
    }
    filePath.value = import.meta.env.VITE_AWS_S3_BUCKET + material.path;
    visible.value = true;
    docName.value = material.title;
};

const download = () => {
  try {
    const link = document.createElement("a");
    link.href = filePath.value;
    link.setAttribute("download", "");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Error downloading document:", error);
  }
};

const getAllTrainingMaterial = async (activationId) => {
    try {
        const response = await activationStore.getAllTrainingMaterial(activationId);
        materials.value = response.data;
    } catch (error) {
        console.error('Error fetching training materials:', error);
        toaster.error("Error fetching training materials");
    }
};

const recordUserOpenedFile = async (approachId, userId) => {
    const response = await activationStore.recordUserOpenedFile(approachId, userId);
};

const showAddTrainingMaterialDialog = () => {
    addTrainingMaterial.value = true;  // Show the dialog
};

const onFileChange = (uploadedFile) => {
    console.log('event', uploadedFile);
    selectedFile.value = uploadedFile;
}

const onSubmitTrainingMaterial = () => {
    showLoading.value = true;
  const trainingMaterial = new FormData();
  trainingMaterial.append("file", selectedFile.value);
  trainingMaterial.append("activation", activationId.value);
  trainingMaterial.append("title", title.value);
  const config = {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }

  activationStore.submitTrainingMaterial(trainingMaterial,config).then(response => {
    showLoading.value = false;
    toaster.success("Training Material submitted successfully");
    getAllTrainingMaterial(activationId.value);
    addTrainingMaterial.value = false;
    selectedFile.value = null;
    title.value = '';
  }).catch(error => {
    showLoading.value = false;
    toaster.error("Error submitting Training Material Document");
    console.log(error);
    addTrainingMaterial.value = false;
  })
}

const deleteTrainingMaterial = (materialId) => {
    const confirmed = window.confirm("Are you sure you want to delete this training material?");
    if(!confirmed){
        return;
    }
    activationStore.deleteTrainingMaterial(materialId)
        .then(() => {
            // Filter out the deleted material from the materials array
            materials.value = materials.value.filter(material => material.id !== materialId);
            toaster.success("Training material deleted successfully");
        })
        .catch(error => {
            toaster.error("Error deleting Training Material Document");
            console.log(error);
        });
};


const canAddMaterial = () => {
    return user.role == 'TTG_SUPER_ADMIN'  
        || user.role == 'TTG_HEAD_ADMIN' 
        || user.role == 'TTG_REGIONAL_MANAGER'
        || user.role == 'TTG_ACTIVATION_MANAGER';
};
</script>

<template>
    <Layout>
        <div class="page-wrapper">
            <div class="page-content">
                <BreadCrumb title="Teaching and Learning" icon="" />
                <p>Procedures when running an activation</p>
                <div class="d-flex">
                    <p>Duties for promoters</p>
                    <div v-if="canAddMaterial()" class="ms-auto mb-2">
                        <!-- Button to trigger the dialog -->
                        <button @click="showAddTrainingMaterialDialog" class="btn maz-gradient-btn mt-2 mt-lg-0">
                        <i class="bx bxs-plus-square"></i>Add Training Material
                        </button>
                    </div>
                </div>

                <div class="card">
                    <div class="card-body">

                        

                        <div class="row">
                            <div v-for="material in materials" :key="material.id" class="col-md-3 col-lg-2">
                                <div class="brief-card mb-4">
                                    <h5 class="py-1 px-4 mb-0 text-center bg-black">{{ material.title }}</h5>
                                    <img 
                                        :src="material.path 
                                            ? 'https://www.iconpacks.net/icons/2/free-file-icon-1453-thumb.png'
                                            : 'https://www.iconpacks.net/icons/1/free-document-icon-901-thumb.png'" 
                                        class="bg-white"
                                    >
                                    <div class="d-flex justify-content-between align-items-center">
                                        <button
                                            v-if="material.path && user.role == 'TTG_TALENT' || user.role == 'SUPPLIER'"
                                            @click="openDocument(material)"
                                            class="btn bg-black text-white w-100 rounded-0 btn-outline-light"
                                        >
                                            Read <span class="round-guest online"></span>
                                        </button>
                                        
                                    </div>
                                    <div class="d-flex justify-content-between align-items-center mt-2">
                                        <button 
                                            v-if="user.role != 'TTG_TALENT' && user.role != 'SUPPLIER' && user.role != 'CLIENT'"
                                            @click="deleteTrainingMaterial(material.id)" 
                                            class="btn bg-danger text-white w-100 rounded-0 btn-outline-light"
                                        >
                                            Delete <i class="bx bx-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <Drawer
            v-model:visible="visible"
            position="right"
            :header="docName"
            class="!w-full md:!w-80 lg:!w-[40rem]"
            style="width: 30rem !important"
        >
            <PDF :src="filePath" />
            <a
                @click="download"
                href="javascript:;"
                class="w-80 btn d-flex justify-content-center align-items-center maz-gradient-btn radius-30 mt-lg-0"
            >
                <i class="bx bxs-download"></i>
                Download
            </a>
        </Drawer>

        <!-- Add training material -->
        <Dialog v-model:visible="addTrainingMaterial" position="top" modal header="Upload Training Material" :style="{ width: '30rem' }">
            <div class="card flex justify-center">
            <!-- Title Input -->
            <div class="p-field mb-3">
                <label for="title">Document Title</label>
                <InputText v-model="title" id="title" placeholder="Enter document title" class="w-100"/>
            </div>
            <!-- File Upload -->
            <FileUploadGeneric 
               docId="teaching-file"
                :showFilePreview="true" 
                accept="application/pdf" 
                fileType="pdf" 
                @fileUploaded="onFileChange"
            />
            <button @click="onSubmitTrainingMaterial" type="button" class="btn w-100 maz-gradient-btn">Submit</button>
            </div>
        </Dialog>
        <!-- end training material -->

    </Layout>
</template>
<style scoped>
bg-white {
    background-color: #dedede;
}

.bg-black {
    background-color: black !important;
}

.brief-card {
    margin-bottom: 1rem;
}

.brief-card img {
    width: 100%;
    height: auto;
}

.new-badge {
    background-color: orange;
    color: white;
    padding: 0.2rem 0.5rem;
    border-radius: 0.3rem;
    font-size: 0.8rem;
}

.btn-save {
    background-color: #007bff;
    border: none;
}

.btn-save:hover {
    background-color: #0056b3;
}

.custom-checkbox input[type="checkbox"] {
    margin-right: 0.5rem;
}
</style>
