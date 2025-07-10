<!-- 5. FileUpload.vue - File upload component for activation briefs -->
<template>
  <div class="file-upload-wrapper">
    <div
        class="file-upload-area"
        :class="{
        'drag-over': isDragOver,
        'has-files': files.length > 0,
        'has-error': hasError
      }"
        @drop="handleDrop"
        @dragover="handleDragOver"
        @dragleave="handleDragLeave"
        @click="triggerFileInput"
    >
      <input
          ref="fileInput"
          type="file"
          :accept="accept"
          :multiple="multiple"
          @change="handleFileSelect"
          class="hidden-input"
      />

      <div v-if="files.length === 0" class="upload-prompt">
        <i class="pi pi-cloud-upload upload-icon"></i>
        <h4>{{ title }}</h4>
        <p>{{ description }}</p>
        <Button
            label="Browse Files"
            icon="pi pi-folder-open"
            class="p-button-outlined"
        />
      </div>

      <div v-else class="file-list">
        <div
            v-for="(file, index) in files"
            :key="index"
            class="file-item"
        >
          <div class="file-info">
            <i :class="getFileIcon(file)" class="file-icon"></i>
            <div class="file-details">
              <span class="file-name">{{ file.name }}</span>
              <span class="file-size">{{ formatFileSize(file.size) }}</span>
            </div>
          </div>
          <Button
              @click="removeFile(index)"
              icon="pi pi-times"
              class="p-button-text p-button-sm remove-file"
          />
        </div>
      </div>
    </div>

    <div v-if="hasError" class="upload-error">
      <InputError :error="errorMessage" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  accept: {
    type: String,
    default: '.pdf,.doc,.docx,.jpg,.png'
  },
  multiple: {
    type: Boolean,
    default: false
  },
  maxSize: {
    type: Number,
    default: 5 * 1024 * 1024 // 5MB
  },
  title: {
    type: String,
    default: 'Upload Files'
  },
  description: {
    type: String,
    default: 'Drag and drop files here, or click to browse'
  }
})

const emit = defineEmits(['update:modelValue', 'file-added', 'file-removed'])

const fileInput = ref(null)
const files = ref([...props.modelValue])
const isDragOver = ref(false)
const errorMessage = ref('')

const hasError = computed(() => !!errorMessage.value)

const handleDrop = (e) => {
  e.preventDefault()
  isDragOver.value = false

  const droppedFiles = Array.from(e.dataTransfer.files)
  processFiles(droppedFiles)
}

const handleDragOver = (e) => {
  e.preventDefault()
  isDragOver.value = true
}

const handleDragLeave = () => {
  isDragOver.value = false
}

const triggerFileInput = () => {
  fileInput.value.click()
}

const handleFileSelect = (e) => {
  const selectedFiles = Array.from(e.target.files)
  processFiles(selectedFiles)
}

const processFiles = (newFiles) => {
  errorMessage.value = ''

  for (const file of newFiles) {
    if (file.size > props.maxSize) {
      errorMessage.value = `File ${file.name} is too large. Maximum size is ${formatFileSize(props.maxSize)}.`
      continue
    }

    if (!props.multiple) {
      files.value = [file]
    } else {
      files.value.push(file)
    }

    emit('file-added', file)
  }

  emit('update:modelValue', files.value)
}

const removeFile = (index) => {
  const removedFile = files.value[index]
  files.value.splice(index, 1)
  emit('file-removed', removedFile)
  emit('update:modelValue', files.value)
}

const getFileIcon = (file) => {
  const extension = file.name.split('.').pop().toLowerCase()
  const iconMap = {
    pdf: 'pi-file-pdf',
    doc: 'pi-file-word',
    docx: 'pi-file-word',
    jpg: 'pi-image',
    jpeg: 'pi-image',
    png: 'pi-image',
    gif: 'pi-image'
  }
  return iconMap[extension] || 'pi-file'
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>

<style scoped>
.file-upload-wrapper {
  width: 100%;
}

.file-upload-area {
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: #f9fafb;
}

.file-upload-area:hover {
  border-color: #3b82f6;
  background-color: #f0f9ff;
}

.file-upload-area.drag-over {
  border-color: #3b82f6;
  background-color: #dbeafe;
}

.file-upload-area.has-files {
  border-style: solid;
  border-color: #10b981;
  background-color: #f0fdf4;
}

.file-upload-area.has-error {
  border-color: #dc2626;
  background-color: #fef2f2;
}

.hidden-input {
  display: none;
}

.upload-prompt .upload-icon {
  font-size: 3rem;
  color: #9ca3af;
  margin-bottom: 1rem;
}

.upload-prompt h4 {
  margin: 0 0 0.5rem 0;
  color: #111827;
}

.upload-prompt p {
  margin: 0 0 1rem 0;
  color: #6b7280;
}

.file-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.file-icon {
  font-size: 1.5rem;
  color: #3b82f6;
}

.file-details {
  display: flex;
  flex-direction: column;
}

.file-name {
  font-weight: 500;
  color: #111827;
}

.file-size {
  font-size: 0.875rem;
  color: #6b7280;
}

.remove-file {
  color: #dc2626;
}

.upload-error {
  margin-top: 0.5rem;
}
</style>