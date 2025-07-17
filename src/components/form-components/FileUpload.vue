<template>
  <div class="file-upload-component">
    <div class="upload-header">
      <label v-if="label" :class="['upload-label', { required: required }]">
        {{ label }}
      </label>
    </div>

    <div class="upload-container">
      <!-- Current file display -->
      <div v-if="currentFile && !selectedFile" class="current-file">
        <Card class="file-card">
          <template #content>
            <div class="file-info">
              <div class="file-icon-container">
                <i class="pi pi-file-pdf file-icon"></i>
              </div>
              <div class="file-details">
                <h4 class="file-name">{{ currentFile.name }}</h4>
                <div class="file-meta">
                  <span v-if="currentFile.size" class="file-size">{{ formatFileSize(currentFile.size) }}</span>
                  <span v-if="currentFile.uploadDate" class="upload-date">
                    Uploaded: {{ formatDate(currentFile.uploadDate) }}
                  </span>
                </div>
              </div>
              <div class="file-actions">
                <Button
                  @click="downloadFile"
                  icon="pi pi-download"
                  class="p-button-outlined p-button-sm"
                  v-tooltip="'Download file'"
                  :disabled="downloading"
                  :loading="downloading"
                />
                <Button
                  @click="replaceFile"
                  icon="pi pi-refresh"
                  class="p-button-outlined p-button-sm"
                  v-tooltip="'Replace file'"
                />
                <Button
                  @click="removeFile"
                  icon="pi pi-trash"
                  class="p-button-outlined p-button-sm p-button-danger"
                  v-tooltip="'Remove file'"
                />
              </div>
            </div>
          </template>
        </Card>
      </div>

      <!-- File upload area -->
      <div v-show="!currentFile || selectedFile || showUploadArea" class="upload-area">
        <input
          ref="fileInput"
          type="file"
          :accept="accept"
          @change="handleFileSelect"
          class="file-input"
        />

        <!-- Upload dropzone -->
        <div 
          v-if="!selectedFile && !uploading"
          class="dropzone"
          :class="{ 'dragover': isDragOver, 'has-error': !!error }"
          @click="triggerFileSelect"
          @dragover.prevent="isDragOver = true"
          @dragleave.prevent="isDragOver = false"
          @drop.prevent="handleFileDrop"
        >
          <div class="dropzone-content">
            <i class="pi pi-cloud-upload upload-icon"></i>
            <h3 class="upload-title">
              {{ currentFile ? 'Upload new file' : 'Upload file' }}
            </h3>
            <p class="upload-description">
              Click to browse or drag and drop your file here
            </p>
            <div class="upload-constraints">
              <span class="file-types">{{ acceptedTypesText }}</span>
              <span v-if="maxSize" class="max-size">Max size: {{ formatFileSize(maxSize) }}</span>
            </div>
          </div>
        </div>

        <!-- Selected file preview -->
        <div v-else-if="selectedFile && !uploading" class="file-preview">
          <Card class="preview-card">
            <template #content>
              <div class="preview-content">
                <div class="preview-icon">
                  <i class="pi pi-file-pdf"></i>
                </div>
                <div class="preview-details">
                  <h4 class="preview-name">{{ selectedFile.name }}</h4>
                  <p class="preview-size">{{ formatFileSize(selectedFile.size) }}</p>
                  <div class="preview-actions">
                    <Button
                      @click="clearSelection"
                      label="Remove"
                      icon="pi pi-times"
                      class="p-button-text p-button-sm p-button-danger"
                    />
                    <Button
                      @click="uploadFile"
                      label="Upload"
                      icon="pi pi-upload"
                      class="p-button-sm"
                      :disabled="!isValidFile"
                    />
                  </div>
                </div>
              </div>
            </template>
          </Card>
        </div>

        <!-- Upload progress -->
        <div v-else-if="uploading" class="upload-progress-container">
          <Card class="progress-card">
            <template #content>
              <div class="progress-content">
                <div class="progress-header">
                  <i class="pi pi-spin pi-spinner"></i>
                  <span>Uploading {{ selectedFile?.name }}...</span>
                </div>
                <ProgressBar :value="uploadProgress" class="upload-progress" />
                <div class="progress-info">
                  <span>{{ uploadProgress }}% complete</span>
                  <Button
                    @click="cancelUpload"
                    label="Cancel"
                    icon="pi pi-times"
                    class="p-button-text p-button-sm"
                  />
                </div>
              </div>
            </template>
          </Card>
        </div>
      </div>
    </div>

    <!-- Error message -->
    <small v-if="error" class="error-message">{{ error }}</small>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { useToast } from 'primevue/usetoast'

const props = defineProps({
  modelValue: {
    type: Object,
    default: null
  },
  label: {
    type: String,
    default: ''
  },
  accept: {
    type: String,
    default: '.pdf'
  },
  maxSize: {
    type: Number,
    default: 10 * 1024 * 1024 // 10MB
  },
  required: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ''
  },
  uploadUrl: {
    type: String,
    default: '/api/files/upload'
  },
  storeOnly: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'upload-success', 'upload-error', 'file-removed'])

const toast = useToast()
const fileInput = ref(null)
const selectedFile = ref(null)
const currentFile = ref(props.modelValue)
const uploading = ref(false)
const downloading = ref(false)
const uploadProgress = ref(0)
const isDragOver = ref(false)
const showUploadArea = ref(false)
let uploadController = null

// Computed properties
const acceptedTypesText = computed(() => {
  const types = props.accept.split(',').map(type => type.trim().replace('.', '').toUpperCase())
  return `${types.join(', ')} files only`
})

const isValidFile = computed(() => {
  if (!selectedFile.value) return false
  
  // Check file type
  const fileType = selectedFile.value.type
  const fileName = selectedFile.value.name.toLowerCase()
  
  if (props.accept.includes('.pdf')) {
    if (!fileType.includes('pdf') && !fileName.endsWith('.pdf')) {
      return false
    }
  }
  
  // Check file size
  if (props.maxSize && selectedFile.value.size > props.maxSize) {
    return false
  }
  
  return true
})

// Methods
const triggerFileSelect = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    processFile(file)
  }
}

const handleFileDrop = (event) => {
  isDragOver.value = false
  const files = event.dataTransfer.files
  if (files.length > 0) {
    processFile(files[0])
  }
}

const processFile = (file) => {
  // Validate file
  if (props.maxSize && file.size > props.maxSize) {
    toast.add({
      severity: 'error',
      summary: 'File Too Large',
      detail: `File size must be less than ${formatFileSize(props.maxSize)}`,
      life: 5000
    })
    return
  }
  
  if (props.accept.includes('.pdf') && !file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
    toast.add({
      severity: 'error',
      summary: 'Invalid File Type',
      detail: 'Only PDF files are allowed',
      life: 5000
    })
    return
  }
  
  selectedFile.value = file
  
  // If store-only mode, immediately set as current file without uploading
  if (props.storeOnly) {
    currentFile.value = {
      name: file.name,
      size: file.size,
      file: file, // Store the actual file for later use
      uploadDate: new Date(),
      isLocal: true
    }
    
    selectedFile.value = null
    showUploadArea.value = false
    
    emit('update:modelValue', currentFile.value)
    emit('upload-success', { file: file, success: true })
    
    toast.add({
      severity: 'success',
      summary: 'File Selected',
      detail: `${file.name} is ready for submission`,
      life: 3000
    })
  }
  
  // Reset file input
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const clearSelection = () => {
  selectedFile.value = null
  showUploadArea.value = false
}

const uploadFile = async () => {
  if (!selectedFile.value || !isValidFile.value) return
  
  uploading.value = true
  uploadProgress.value = 0
  
  try {
    // Import the fileService for actual backend upload
    const { fileService } = await import('@/services/api')
    
    // Set up progress callback
    const onProgress = (progressEvent) => {
      if (progressEvent.lengthComputable) {
        uploadProgress.value = Math.round((progressEvent.loaded * 100) / progressEvent.total)
      }
    }
    
    // Create AbortController for cancellation support
    const controller = new AbortController()
    uploadController = controller
    
    // Prepare metadata
    const metadata = {
      type: 'brief_document',
      originalName: selectedFile.value.name,
      size: selectedFile.value.size
    }
    
    // Upload to backend
    const result = await fileService.uploadFile(selectedFile.value, onProgress, metadata)
    
    // Complete upload with real result
    completeUpload(result)
    
  } catch (error) {
    if (error.name !== 'AbortError') {
      console.error('Upload failed:', error)
      emit('upload-error', error)
      toast.add({
        severity: 'error',
        summary: 'Upload Failed',
        detail: error.response?.data?.message || error.message || 'Failed to upload file',
        life: 5000
      })
    }
    uploading.value = false
    uploadProgress.value = 0
    uploadController = null
  }
}

const completeUpload = (result) => {
  // Handle real backend upload result
  const uploadResult = result || {}
  
  // Update current file with backend response
  currentFile.value = {
    id: uploadResult.id,
    name: selectedFile.value.name,
    size: selectedFile.value.size,
    path: uploadResult.path,
    url: uploadResult.url || uploadResult.downloadUrl,
    uploadDate: new Date(),
    metadata: uploadResult.metadata
  }
  
  selectedFile.value = null
  showUploadArea.value = false
  uploading.value = false
  uploadProgress.value = 0
  uploadController = null
  
  emit('update:modelValue', currentFile.value)
  emit('upload-success', uploadResult)
  
  toast.add({
    severity: 'success',
    summary: 'Upload Successful',
    detail: `${currentFile.value.name} uploaded successfully`,
    life: 3000
  })
}

const cancelUpload = () => {
  if (uploadController) {
    uploadController.abort()
    uploading.value = false
    uploadProgress.value = 0
    uploadController = null
    
    toast.add({
      severity: 'info',
      summary: 'Upload Cancelled',
      detail: 'File upload has been cancelled',
      life: 2000
    })
  }
}

const downloadFile = async () => {
  if (!currentFile.value) return
  
  downloading.value = true
  try {
    // If we have a file ID, use the backend service to get the download URL
    if (currentFile.value.id) {
      const { fileService } = await import('@/services/api')
      const urlResponse = await fileService.getFileUrl(currentFile.value.id)
      const downloadUrl = urlResponse.url || urlResponse.downloadUrl || urlResponse
      
      // Use the backend-provided URL for download
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = currentFile.value.name
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else if (currentFile.value.url) {
      // Fallback for local URLs (legacy support)
      const response = await fetch(currentFile.value.url)
      const blob = await response.blob()
      
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = currentFile.value.name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } else {
      throw new Error('No download URL available')
    }
    
  } catch (error) {
    console.error('Download failed:', error)
    toast.add({
      severity: 'error',
      summary: 'Download Failed',
      detail: error.message || 'Failed to download file',
      life: 3000
    })
  } finally {
    downloading.value = false
  }
}

const replaceFile = () => {
  showUploadArea.value = true
}

const removeFile = () => {
  currentFile.value = null
  selectedFile.value = null
  showUploadArea.value = false
  emit('update:modelValue', null)
  emit('file-removed')
  
  toast.add({
    severity: 'info',
    summary: 'File Removed',
    detail: 'File has been removed',
    life: 2000
  })
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Cleanup
onUnmounted(() => {
  if (uploadController) {
    uploadController.abort()
  }
})
</script>

<style scoped>
.file-upload-component {
  width: 100%;
}

.upload-header {
  margin-bottom: 0.5rem;
}

.upload-label {
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
}

.upload-label.required::after {
  content: ' *';
  color: #ef4444;
}

.file-input {
  display: none;
}

/* Current file styles */
.current-file {
  margin-bottom: 1rem;
}

.file-card {
  border: 1px solid #e5e7eb;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.file-icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  background: #fef2f2;
  border-radius: 8px;
}

.file-icon {
  font-size: 1.5rem;
  color: #dc2626;
}

.file-details {
  flex: 1;
}

.file-name {
  margin: 0 0 0.25rem 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
}

.file-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.75rem;
  color: #6b7280;
}

.file-actions {
  display: flex;
  gap: 0.5rem;
}

/* Dropzone styles */
.dropzone {
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  background: #f9fafb;
  cursor: pointer;
  transition: all 0.3s ease;
}

.dropzone:hover,
.dropzone.dragover {
  border-color: #3b82f6;
  background: #eff6ff;
}

.dropzone.has-error {
  border-color: #ef4444;
  background: #fef2f2;
}

.dropzone-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.upload-icon {
  font-size: 2.5rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.upload-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
}

.upload-description {
  margin: 0;
  color: #6b7280;
  font-size: 0.875rem;
}

.upload-constraints {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: #9ca3af;
}

/* File preview styles */
.preview-card {
  border: 1px solid #e5e7eb;
}

.preview-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.preview-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  background: #fef2f2;
  border-radius: 8px;
  font-size: 1.5rem;
  color: #dc2626;
}

.preview-details {
  flex: 1;
}

.preview-name {
  margin: 0 0 0.25rem 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
}

.preview-size {
  margin: 0 0 0.5rem 0;
  font-size: 0.75rem;
  color: #6b7280;
}

.preview-actions {
  display: flex;
  gap: 0.5rem;
}

/* Upload progress styles */
.progress-card {
  border: 1px solid #e5e7eb;
}

.progress-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.progress-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  color: #374151;
}

.upload-progress {
  width: 100%;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
  color: #6b7280;
}

.error-message {
  color: #ef4444;
  font-size: 0.875rem;
  display: block;
  margin-top: 0.5rem;
}

/* Responsive design */
@media (max-width: 640px) {
  .file-info,
  .preview-content {
    flex-direction: column;
    text-align: center;
  }
  
  .file-actions,
  .preview-actions {
    justify-content: center;
  }
  
  .dropzone {
    padding: 1.5rem;
  }
}
</style>