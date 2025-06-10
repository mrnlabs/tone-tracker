<script setup>
import PDF from 'pdf-vue3';
import Drawer from 'primevue/drawer';
import { reactive, ref } from 'vue';
import useToaster from '@/composables/useToaster';
import { useDocUpload } from '@/stores/docUpload';

const props = defineProps({
  title: String,
  docType: String,
  accept: String,
  fileType: String,
  showFilePreview: Boolean
})

const emit = defineEmits(['SLAFileUploaded']);
const toaster = useToaster();
const uploadStore = useDocUpload();

const file = ref(null);
const isDragging = ref(false);
const showLoading = ref(false);

function onFileChange(event) {
  let selectedFile = null;
   selectedFile = event.target.files[0];
   if (!selectedFile.name.includes(".pdf")) {
		selectedFile = null;
		toaster.error("Only pdf files are allowed");
		return;
	}
  if (selectedFile) {
    file.value = selectedFile;
    emit('SLAFileUploaded', selectedFile);
  }
}

function onDrop(event) {
  const droppedFile = event.dataTransfer.files[0];
  if (!droppedFile.name.includes(".pdf")) {
    file.value = null;
    toaster.error("Only pdf files are allowed");
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
        base64PDF.value = reader.result
     
        
        view_uploaded_file_visible.value = true;
    };
}

</script>
<template>
    <div class="container col-md-12 mt-3">
    <div 
    class="file-drop-zone" 
    @dragover.prevent="onDragOver" 
    @drop.prevent="onDrop" 
    @dragleave="onDragLeave" 
    @dragenter="onDragEnter"
    :class="{ 'file-drop-zone-active': isDragging }"
  >
    <div class="text-center">
      <i class='bx bx-cloud-upload fs-1 text-white' ></i>
      <p class="mt-2">Drag and drop your file here or <label for="sla-fileInput" class="text-primary" style="cursor: pointer;">select file to upload</label></p>
      <input id="sla-fileInput" type="file" :accept="accept" class="d-none" @change="onFileChange">
    </div>
  </div>

  <div v-if="file && showFilePreview" class="file-details mt-3 p-1 border rounded d-flex align-items-center">
    <div class="file-icon me-3">
      <img v-if="fileType === 'pdf'" @click="previewBase64PDF" 
      src="/src/assets/images/pdf.png" 
      alt="" class="img-fluid cursor-pointer" style=" width: 100px; height: 100px; border-radius: 6px;"/>
      <i v-else class='bx bx-image-alt fs-1 maz-gradient-txt cursor-pointer' @click="previewBase64PDF"></i>
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
  <div class="card flex justify-center">
    <Drawer v-model:visible="view_uploaded_file_visible" position="right" :header="`Preview ${fileType} File`" class="!w-full md:!w-80 lg:!w-[40rem]" style="width: 30rem!important;">
        <PDF v-if="fileType === 'pdf'" :src="base64PDF" />
        <img v-else :src="base64PDF" style="width: 26rem!important;" />
    </Drawer>
</div>
</div>

</template>
<style scoped>
.file-drop-zone {
    border: 3px dashed #9A3AB1;
    border-radius: 10px;
    padding: 50px 20px;
    background-color: #f8f9fa;
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