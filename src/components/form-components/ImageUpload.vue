<template>
  <div class="image-upload-component">
    <div class="upload-header">
      <label v-if="label" :class="['upload-label', { required: required }]">
        {{ label }}
      </label>
      <div v-if="description" class="upload-description">
        {{ description }}
      </div>
    </div>

    <!-- Current Images Gallery -->
    <div v-if="currentImages.length > 0" class="current-images">
      <div class="images-grid">
        <div 
          v-for="(image, index) in currentImages" 
          :key="image.id || index" 
          class="image-item"
        >
          <div class="image-container">
            <img 
              :src="getImageUrl(image)" 
              :alt="image.description || `Image ${index + 1}`"
              class="image-preview"
              @click="viewImage(image)"
            />
            <div class="image-overlay">
              <Button
                @click="viewImage(image)"
                icon="pi pi-eye"
                class="p-button-rounded p-button-sm p-button-outlined"
                v-tooltip="'View'"
              />
              <Button
                @click="removeImage(image, index)"
                icon="pi pi-trash"
                class="p-button-rounded p-button-sm p-button-outlined p-button-danger"
                v-tooltip="'Remove'"
                :disabled="uploading"
              />
            </div>
          </div>
          <div class="image-info">
            <span class="image-name">{{ getImageName(image) }}</span>
            <span v-if="image.size" class="image-size">{{ formatFileSize(image.size) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Upload Area -->
    <div class="upload-area">
      <input
        ref="fileInput"
        type="file"
        :accept="accept"
        multiple
        @change="handleFileSelect"
        class="file-input"
      />

      <!-- Upload Dropzone -->
      <div 
        v-if="!uploading"
        class="dropzone"
        :class="{ 'dragover': isDragOver, 'has-error': !!error }"
        @click="triggerFileSelect"
        @dragover.prevent="isDragOver = true"
        @dragleave.prevent="isDragOver = false"
        @drop.prevent="handleFileDrop"
      >
        <div class="dropzone-content">
          <i class="pi pi-cloud-upload upload-icon"></i>
          <h3 class="upload-title">Upload Images</h3>
          <p class="upload-description">
            Click to browse or drag and drop your images here
          </p>
          <div class="upload-constraints">
            <span class="file-types">{{ acceptedTypesText }}</span>
            <span v-if="maxSize" class="max-size">Max size per image: {{ formatFileSize(maxSize) }}</span>
            <span v-if="maxFiles" class="max-files">Max {{ maxFiles }} images</span>
          </div>
        </div>
      </div>

      <!-- Upload Progress -->
      <div v-if="uploading" class="upload-progress-container">
        <Card class="progress-card">
          <template #content>
            <div class="upload-progress">
              <div class="progress-header">
                <i class="pi pi-cloud-upload"></i>
                <span>Uploading {{ uploadQueue.length }} image(s)...</span>
              </div>
              <ProgressBar 
                :value="overallProgress" 
                class="upload-progress-bar"
                :showValue="true"
              />
              <div class="upload-files">
                <div 
                  v-for="(upload, index) in uploadQueue" 
                  :key="index"
                  class="upload-file-item"
                >
                  <span class="file-name">{{ upload.file.name }}</span>
                  <ProgressBar 
                    :value="upload.progress" 
                    class="file-progress"
                    :showValue="false"
                  />
                  <span class="upload-status">
                    {{ upload.status === 'completed' ? 'Complete' : `${upload.progress}%` }}
                  </span>
                </div>
              </div>
              <Button
                @click="cancelUploads"
                label="Cancel"
                icon="pi pi-times"
                class="p-button-outlined p-button-danger p-button-sm"
                style="margin-top: 1rem;"
              />
            </div>
          </template>
        </Card>
      </div>
    </div>

    <!-- Error Display -->
    <div v-if="error" class="error-message">
      <i class="pi pi-exclamation-triangle"></i>
      {{ error }}
    </div>

    <!-- Image Viewer Dialog -->
    <Dialog 
      v-model:visible="showImageViewer" 
      modal 
      :header="viewingImage?.description || 'Image'"
      :style="{ width: '80vw', maxWidth: '800px' }"
      :maximizable="true"
    >
      <div v-if="viewingImage" class="image-viewer">
        <img 
          :src="getImageUrl(viewingImage)" 
          :alt="viewingImage.description || 'Image'"
          class="viewer-image"
        />
        <div class="image-details">
          <div class="detail-item">
            <strong>Name:</strong> {{ getImageName(viewingImage) }}
          </div>
          <div v-if="viewingImage.size" class="detail-item">
            <strong>Size:</strong> {{ formatFileSize(viewingImage.size) }}
          </div>
          <div v-if="viewingImage.uploadDate" class="detail-item">
            <strong>Uploaded:</strong> {{ formatDate(viewingImage.uploadDate) }}
          </div>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import { fileService } from '@/services/api'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  label: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  required: {
    type: Boolean,
    default: false
  },
  accept: {
    type: String,
    default: 'image/*'
  },
  maxSize: {
    type: Number,
    default: 5 * 1024 * 1024 // 5MB
  },
  maxFiles: {
    type: Number,
    default: 10
  },
  entityId: {
    type: [String, Number],
    default: null
  },
  entityType: {
    type: String,
    default: 'PROMOTER'
  },
  storeOnly: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'upload-success', 'upload-error', 'image-removed'])

const toast = useToast()
const fileInput = ref(null)
const currentImages = ref([...props.modelValue])
const isDragOver = ref(false)
const uploading = ref(false)
const uploadQueue = ref([])
const showImageViewer = ref(false)
const viewingImage = ref(null)
let uploadController = null

// Computed properties
const acceptedTypesText = computed(() => {
  if (props.accept === 'image/*') return 'Image files only'
  const types = props.accept.split(',').map(type => type.trim().replace('.', '').toUpperCase())
  return `${types.join(', ')} files only`
})

const overallProgress = computed(() => {
  if (uploadQueue.value.length === 0) return 0
  const totalProgress = uploadQueue.value.reduce((sum, upload) => sum + upload.progress, 0)
  return Math.round(totalProgress / uploadQueue.value.length)
})

// Watch for external changes to modelValue
watch(() => props.modelValue, (newValue) => {
  currentImages.value = [...newValue]
}, { deep: true })

// Methods
const triggerFileSelect = () => {
  if (currentImages.value.length >= props.maxFiles) {
    toast.add({
      severity: 'warn',
      summary: 'Maximum Files Reached',
      detail: `You can upload a maximum of ${props.maxFiles} images`,
      life: 3000
    })
    return
  }
  fileInput.value?.click()
}

const handleFileSelect = (event) => {
  const files = Array.from(event.target.files)
  processFiles(files)
  // Clear the input so the same file can be selected again
  event.target.value = ''
}

const handleFileDrop = (event) => {
  isDragOver.value = false
  const files = Array.from(event.dataTransfer.files)
  processFiles(files)
}

const processFiles = async (files) => {
  if (files.length === 0) return

  // Check total file limit
  const remainingSlots = props.maxFiles - currentImages.value.length
  if (files.length > remainingSlots) {
    toast.add({
      severity: 'warn',
      summary: 'Too Many Files',
      detail: `You can only upload ${remainingSlots} more image(s)`,
      life: 3000
    })
    files = files.slice(0, remainingSlots)
  }

  // Validate files
  const validFiles = []
  for (const file of files) {
    if (!validateFile(file)) continue
    validFiles.push(file)
  }

  if (validFiles.length === 0) return

  // Handle store-only mode or upload process
  if (props.storeOnly) {
    handleStoreOnlyFiles(validFiles)
  } else {
    await uploadFiles(validFiles)
  }
}

const validateFile = (file) => {
  // Check file type
  if (!file.type.startsWith('image/')) {
    toast.add({
      severity: 'error',
      summary: 'Invalid File Type',
      detail: `${file.name} is not an image file`,
      life: 3000
    })
    return false
  }

  // Check file size
  if (file.size > props.maxSize) {
    toast.add({
      severity: 'error',
      summary: 'File Too Large',
      detail: `${file.name} is larger than ${formatFileSize(props.maxSize)}`,
      life: 3000
    })
    return false
  }

  return true
}

const handleStoreOnlyFiles = (files) => {
  // In store-only mode, just create local image objects without uploading
  const localImages = files.map((file, index) => ({
    id: Date.now() + index,
    file: file,
    fileName: file.name,
    size: file.size,
    mimeType: file.type,
    description: file.name,
    uploadDate: new Date(),
    isLocal: true,
    // Create a local URL for preview
    url: URL.createObjectURL(file)
  }))

  // Add to current images
  currentImages.value.push(...localImages)
  emit('update:modelValue', [...currentImages.value])
  emit('upload-success', localImages)

  toast.add({
    severity: 'success',
    summary: 'Images Selected',
    detail: `${localImages.length} image(s) selected for upload`,
    life: 3000
  })
}

const uploadFiles = async (files) => {
  if (!props.entityId) {
    toast.add({
      severity: 'error',
      summary: 'Upload Error',
      detail: 'Entity ID is required for image upload',
      life: 3000
    })
    return
  }

  uploading.value = true
  uploadController = new AbortController()

  // Initialize upload queue
  uploadQueue.value = files.map(file => ({
    file,
    progress: 0,
    status: 'pending'
  }))

  try {
    const uploadedImages = []

    for (let i = 0; i < uploadQueue.value.length; i++) {
      const uploadItem = uploadQueue.value[i]
      
      try {
        uploadItem.status = 'uploading'
        
        const result = await fileService.uploadFile(
          uploadItem.file,
          (progressEvent) => {
            if (progressEvent.lengthComputable) {
              uploadItem.progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            }
          },
          {
            entityId: props.entityId,
            entityType: props.entityType,
            category: 'promoter-images'
          }
        )

        uploadItem.status = 'completed'
        uploadItem.progress = 100

        // Create image object
        const newImage = {
          id: result.id || Date.now() + i,
          filePath: result.filePath || result.path || result.url,
          fileName: uploadItem.file.name,
          size: uploadItem.file.size,
          mimeType: uploadItem.file.type,
          description: uploadItem.file.name,
          uploadDate: new Date()
        }

        uploadedImages.push(newImage)
        currentImages.value.push(newImage)

      } catch (error) {
        uploadItem.status = 'error'
        console.error(`Failed to upload ${uploadItem.file.name}:`, error)
        
        toast.add({
          severity: 'error',
          summary: 'Upload Failed',
          detail: `Failed to upload ${uploadItem.file.name}`,
          life: 3000
        })
      }
    }

    if (uploadedImages.length > 0) {
      emit('update:modelValue', [...currentImages.value])
      emit('upload-success', uploadedImages)

      toast.add({
        severity: 'success',
        summary: 'Upload Complete',
        detail: `Successfully uploaded ${uploadedImages.length} image(s)`,
        life: 3000
      })
    }

  } catch (error) {
    console.error('Upload process failed:', error)
    emit('upload-error', error)
  } finally {
    uploading.value = false
    uploadQueue.value = []
    uploadController = null
  }
}

const cancelUploads = () => {
  if (uploadController) {
    uploadController.abort()
  }
  uploading.value = false
  uploadQueue.value = []
  uploadController = null

  toast.add({
    severity: 'info',
    summary: 'Upload Cancelled',
    detail: 'Image upload has been cancelled',
    life: 3000
  })
}

const removeImage = async (image, index) => {
  try {
    // If image has an ID, try to delete from server
    if (image.id && typeof image.id === 'number') {
      await fileService.deleteFile(image.id)
    }

    currentImages.value.splice(index, 1)
    emit('update:modelValue', [...currentImages.value])
    emit('image-removed', image)

    toast.add({
      severity: 'success',
      summary: 'Image Removed',
      detail: 'Image has been removed successfully',
      life: 3000
    })

  } catch (error) {
    console.error('Failed to remove image:', error)
    toast.add({
      severity: 'error',
      summary: 'Remove Failed',
      detail: 'Failed to remove image',
      life: 3000
    })
  }
}

const viewImage = (image) => {
  viewingImage.value = image
  showImageViewer.value = true
}

const getImageUrl = (image) => {
  // Handle local files (store-only mode)
  if (image.isLocal && image.url) return image.url
  
  // If image already has a full URL, use it
  if (image.url && image.url.startsWith('http')) {
    return image.url
  }
  
  // Get S3 key from various possible properties
  const s3Key = image.s3Key || image.key || image.filePath || image.url
  
  if (s3Key) {
    // If it's already a full URL, return as is
    if (s3Key.startsWith('http')) return s3Key
    
    // Construct S3 URL
    const s3BucketUrl = import.meta.env.VITE_AWS_S3_BUCKET
    if (s3BucketUrl) {
      // Clean the S3 key
      let cleanKey = s3Key
      if (cleanKey.startsWith('/')) {
        cleanKey = cleanKey.substring(1)
      }
      
      // Ensure S3 bucket URL ends with slash
      const baseUrl = s3BucketUrl.endsWith('/') ? s3BucketUrl : s3BucketUrl + '/'
      
      // Return full S3 URL
      return baseUrl + cleanKey
    }
  }
  
  // Fallback to API-based URL if no S3 bucket configured
  if (image.filePath && !image.filePath.startsWith('http')) {
    return `${import.meta.env.VITE_API_BASE_URL}/files${image.filePath}`
  }
  
  return ''
}

const getImageName = (image) => {
  return image.fileName || image.name || image.description || 'Unknown'
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString()
}

// Initialize component
onMounted(() => {
  currentImages.value = [...props.modelValue]
})
</script>

<style scoped>
.image-upload-component {
  margin-bottom: 1rem;
}

.upload-header {
  margin-bottom: 1rem;
}

.upload-label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #374151;
}

.upload-label.required::after {
  content: ' *';
  color: #ef4444;
}

.upload-description {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.current-images {
  margin-bottom: 1rem;
}

.images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
}

.image-item {
  position: relative;
}

.image-container {
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
}

.image-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.2s;
}

.image-container:hover .image-preview {
  transform: scale(1.05);
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.2s;
}

.image-container:hover .image-overlay {
  opacity: 1;
}

.image-info {
  padding: 0.5rem 0;
  text-align: center;
}

.image-name {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.image-size {
  display: block;
  font-size: 0.75rem;
  color: #6b7280;
}

.upload-area {
  position: relative;
}

.file-input {
  display: none;
}

.dropzone {
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  background: #f9fafb;
}

.dropzone:hover {
  border-color: #3b82f6;
  background: #eff6ff;
}

.dropzone.dragover {
  border-color: #3b82f6;
  background: #dbeafe;
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
  font-size: 2rem;
  color: #6b7280;
}

.upload-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
}

.upload-description {
  margin: 0;
  color: #6b7280;
}

.upload-constraints {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: #6b7280;
}

.upload-progress-container {
  margin-top: 1rem;
}

.upload-progress {
  padding: 1rem;
}

.progress-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  font-weight: 600;
}

.upload-progress-bar {
  margin-bottom: 1rem;
}

.upload-files {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.upload-file-item {
  display: grid;
  grid-template-columns: 1fr auto 80px;
  gap: 0.5rem;
  align-items: center;
  font-size: 0.875rem;
}

.file-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-progress {
  height: 4px;
}

.upload-status {
  text-align: right;
  font-size: 0.75rem;
  color: #6b7280;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  color: #dc2626;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.image-viewer {
  text-align: center;
}

.viewer-image {
  max-width: 100%;
  max-height: 60vh;
  object-fit: contain;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.image-details {
  text-align: left;
  background: #f9fafb;
  padding: 1rem;
  border-radius: 8px;
}

.detail-item {
  margin-bottom: 0.5rem;
}

.detail-item:last-child {
  margin-bottom: 0;
}

@media (max-width: 768px) {
  .images-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
  
  .dropzone {
    padding: 1rem;
  }
  
  .upload-file-item {
    grid-template-columns: 1fr;
    text-align: center;
  }
}
</style>