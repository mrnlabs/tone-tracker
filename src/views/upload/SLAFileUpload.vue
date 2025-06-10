<script setup>
import PDF from 'pdf-vue3';
import Drawer from 'primevue/drawer';
import { reactive, ref } from 'vue';
import useToaster from '@/composables/useToaster';
import { useDocUpload } from '@/stores/docUpload';
import { useAuth } from '@/stores/auth';


const authStore = useAuth();
const user = JSON.parse(authStore.user);

const toaster = useToaster();
const uploadStore = useDocUpload();

const showLoading = ref(false);
const file = ref(null);
const isDragging = ref(false);
const fileError = ref(null);

function onFileChange(event) {
  const selectedFile = event.target.files[0];

  fileError.value = null;
  if (selectedFile.size > 250000000) {
    file.value = null;
    fileError.value = "File size should be less than 250MB";
    return;
  }
  if (!selectedFile.name.includes(".pdf")) {
    file.value = null;
    fileError.value = "Only pdf files are allowed";
    return
  }


  if (selectedFile) {
    file.value = selectedFile;
  }
}

function onDrop(event) {
  const droppedFile = event.dataTransfer.files[0];
  if (!droppedFile.name.includes(".pdf")) {
     file.value = null;
     fileError.value = "Only pdf files are allowed";
    return
  }
  if (droppedFile) {
    file.value = droppedFile;
  }
  isDragging.value = false;
}

function onDragOver(event) {
  event.preventDefault();
}

function onDragEnter() {
  isDragging.value = true;
}

function onDragLeave() {
  isDragging.value = false;
}

function removeFile() {
  file.value = null;
}
const view_uploaded_file_visible = ref(false);
const base64PDF = ref(null);
const previewBase64PDF = () => {
    //convert brief file to base64
    const reader = new FileReader();
    reader.readAsDataURL(file.value);
    reader.onloadend = () => {
      base64PDF.value = reader.result;
        view_uploaded_file_visible.value = true;
    };
}
const emits = defineEmits(['done-uploading']);

const form = reactive({title: 'NDA', uploadedById:user.activeUserId});

const config = {
    useMultipartFormData: true
};

const submitFile = () => {
  if(!file.value) {return}
  const formData = new FormData();
  formData.append('documentFile', file.value);
  formData.append('title', "SLA");
  formData.append('uploadedById', user.activeUserId);
  showLoading.value = true;
  uploadStore.submit(formData, config).then(() => {
    emits('done-uploading');
    form.file = null;
    file.value = null;
    toaster.success("SLA uploaded successfully");
    showLoading.value = false;
  }).catch((error) => {
    toaster.error('Error uploading SLA');
    console.log(error);
  }).finally(() => {
    showLoading.value = false;
  })

}
</script>
<template>
  <div class="container col-md-6 mt-3">
    <h3>Upload SLA Document</h3>
    <div 
    class="file-drop-zone" 
    @dragover.prevent="onDragOver" 
    @drop.prevent="onDrop" 
    @dragleave="onDragLeave" 
    @dragenter="onDragEnter"
    :class="{ 'file-drop-zone-active': isDragging }"
  >
    <div class="text-center">
      <i class='bx bx-cloud-upload text-white fs-1' ></i>
      <p class="mt-2 text-white ">Drag and drop your SLA file here or <label for="sla-fileInput" class="text-primary" style="cursor: pointer;">select file to upload</label></p>
      <input id="sla-fileInput" type="file" accept="application/pdf" class="d-none" @change="onFileChange">
    </div>
  </div>

  <div v-if="file" class="file-details mt-3 p-1 border rounded d-flex align-items-center">
    <div class="file-icon me-3">
      <img @click="previewBase64PDF" src="/src/assets/images/pdf.png" alt="pdf" class="cursor-pointer img-fluid" style=" width: 100px; height: 100px; border-radius: 6px;"/>
    </div>
    <div class="file-info">
      <p class="m-0 text-white">{{ file.name }}</p>
      <small class="m-0 text-white">{{ (file.size / 1024).toFixed(2) }} KB</small>
    </div>
    <div class="ms-auto">
      <span class="cursor-pointer" @click="removeFile">
          <i class='bx bx-trash fs-3 text-danger' ></i>
      </span>
    </div>
  </div>
  <div class="text-center">
    <p v-if="fileError" class="text-danger mt-1">{{ fileError }}</p>
  </div>
  <div class="d-grid">
  <button @click="submitFile" type="button" class="btn  maz-gradient-btn w-100 text-white d-flex justify-content-center align-items-center mt-3">
    <span v-if="showLoading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
    {{ showLoading ? 'Uploading...' : 'Submit' }}
    </button>
</div>
  <div class="card flex justify-center">
    <Drawer v-model:visible="view_uploaded_file_visible" position="right" header="View Brief File" class="!w-full md:!w-80 lg:!w-[40rem]" style="width: 30rem!important;">
        <PDF :src="base64PDF" />
    </Drawer>
  </div>
</div>

</template>
<style scoped>
.file-drop-zone {
  border: 3px dashed #9A3AB1;
  border-radius: 10px;
  padding: 50px 20px;
  transition: background-color 0.3s, border-color 0.3s;
}
  
  .file-drop-zone-active {
    background-color: #e2efff;
    border-color: #0056b3;
  }
  
  .file-details {
    background-color: #333;
  }
  
  .file-icon svg {
    color: #ff4d6d;
  }
</style>