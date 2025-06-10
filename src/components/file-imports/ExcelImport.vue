<script setup>
import { ref } from 'vue';

const fileError = ref(null);

const props = defineProps({
  title: String,
  docType: String,
  accept: String,
  fileType: String,
  showFilePreview: Boolean
})

const emit = defineEmits(['fileUploaded','fileDropped']);

const file = ref(null);
const isDragging = ref(false);

function onFileChange(event) {
  const selectedFile = event.target.files[0];
  fileError.value = null;
  if (!selectedFile.name.includes(".csv")) {
    fileError.value = "Only csv files are allowed";
    file.value = null;
    return;
  }
  if (selectedFile) {
    file.value = selectedFile;
    emit('fileUploaded', selectedFile);
  }
}

function onDrop(event) {  
  const droppedFiles = event.dataTransfer.files;
  fileError.value = null;
  if (droppedFiles.length === 0) {
    return;
  }
  const droppedFile = droppedFiles[0];
  //if its not image 
  if (props.fileType === 'image' && !droppedFile.type.includes("image")) {
    file.value = null;
    fileError.value = "Only image files are allowed";
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



</script>
<template>
    <div class="container col-md-12 mt-3 mb-3">
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
      <p class="mt-2 text-white">Drag and drop your file here or <label for="fileInput" class="text-primary" style="cursor: pointer;">select file to upload</label></p>
      <input id="fileInput" type="file" class="d-none" @change="onFileChange">
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