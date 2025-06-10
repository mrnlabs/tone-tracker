<script setup>
import { ref } from 'vue';
import useToaster from '@/composables/useToaster';

const props = defineProps({
  title: String,
  docType: String,
  accept: String,
  fileType: String,
  showFilePreview: Boolean
})

const emit = defineEmits(['fileUploaded','fileDropped']);
const toaster = useToaster();

const file = ref(null);
const isDragging = ref(false);
const fileError = ref(null);

function onFileChange(event) {
  const selectedFile = event.target.files;

  fileError.value = null;
  if (selectedFile.size > 250000000) {
    file.value = null;
    fileError.value = "File size should be less than 250MB";
    return;
  }

  if (selectedFile) {
    file.value = selectedFile;
    emit('fileUploaded', event);
  }
}

function onDrop(event) {  
  const droppedFiles = event.dataTransfer.files;
  fileError.value = null;
  console.log(event);
  if (droppedFiles.length === 0) {
    return;
  }
  const droppedFile = droppedFiles[0];
  
  if (droppedFile.size > 250000000) {
    file.value = null;
    fileError.value = "File size should be less than 250MB";
    return;
  }

  if (!droppedFile.type.includes("image")) {
    file.value = null;
    toaster.error("Only image files are allowed");
    return;
  }
  file.value = droppedFile;
  emit('fileDropped', event.dataTransfer.files);
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
      <i class='bx bx-cloud-upload text-white fs-1' ></i>
      <p class="mt-2">Drag and drop your file here or <label for="fileInput-cropper" class="text-primary" style="cursor: pointer;">select file to upload</label></p>
      <input id="fileInput-cropper" type="file" :accept="accept" class="d-none" @change="onFileChange">
    </div>
  </div>
  <div class="text-center">
    <p v-if="fileError" class="text-danger mt-1">{{ fileError }}</p>
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