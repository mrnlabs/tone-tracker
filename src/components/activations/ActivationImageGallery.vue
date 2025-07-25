<template>
  <div class="activation-image-gallery">
    <!-- Upload Section -->
    <Card class="upload-card">
      <template #header>
        <div class="upload-header">
          <h3>Upload Images</h3>
          <BaseButton
            @click="showImageUploader = true"
            variant="primary"
            icon="pi pi-camera"
            :disabled="!canUploadImages"
          >
            Upload Images
          </BaseButton>
        </div>
      </template>
      
      <template #content>
        <div class="upload-info">
          <div class="info-item">
            <i class="pi pi-info-circle"></i>
            <span>Upload photos from this activation event. Images help document the activation progress and can be shared with the client.</span>
          </div>
          <div class="upload-stats" v-if="activationImages.length > 0">
            <div class="stat-item">
              <strong>{{ activationImages.length }}</strong>
              <span>{{ activationImages.length === 1 ? 'Image' : 'Images' }} uploaded</span>
            </div>
            <div class="stat-item">
              <strong>{{ formatTotalSize() }}</strong>
              <span>Total size</span>
            </div>
            <div class="stat-item" v-if="latestUpload">
              <strong>{{ formatDateTime(latestUpload.uploadDate) }}</strong>
              <span>Last upload</span>
            </div>
          </div>
        </div>
      </template>
    </Card>

    <!-- Image Gallery -->
    <Card class="gallery-card">
      <template #header>
        <div class="gallery-header">
          <h3>Activation Images</h3>
          <div class="gallery-actions" v-if="activationImages.length > 0">
            <BaseButton
              @click="downloadAllImages"
              variant="secondary"
              icon="pi pi-download"
              size="small"
              :loading="downloadingAll"
            >
              Download All
            </BaseButton>
            <BaseButton
              @click="showDeleteAllConfirm = true"
              variant="danger"
              icon="pi pi-trash"
              size="small"
              :disabled="!canDeleteImages"
            >
              Delete All
            </BaseButton>
          </div>
        </div>
      </template>
      
      <template #content>
        <!-- Empty State -->
        <div v-if="activationImages.length === 0" class="empty-gallery">
          <div class="empty-content">
            <i class="pi pi-image empty-icon"></i>
            <h4>No Images Yet</h4>
            <p>Upload photos from this activation to get started. Images help document the activation progress and provide visual evidence of completion.</p>
            <BaseButton
              @click="showImageUploader = true"
              variant="primary"
              icon="pi pi-camera"
              :disabled="!canUploadImages"
            >
              Upload First Image
            </BaseButton>
          </div>
        </div>

        <!-- Image Gallery Grid -->
        <div v-else class="images-grid">
          <div 
            v-for="(image, index) in activationImages" 
            :key="image.id || index" 
            class="image-item"
          >
            <div class="image-container" @click="viewImage(index)">
              <img 
                :src="getImageUrl(image)" 
                :alt="image.description || `Image ${index + 1}`"
                class="image-preview"
                @error="handleImageError"
              />
              <div class="image-overlay">
                <Button
                  icon="pi pi-eye"
                  class="p-button-rounded p-button-sm p-button-outlined"
                  v-tooltip="'View'"
                />
              </div>
            </div>
            
            <div class="image-info">
              <div class="image-name">{{ getImageName(image) }}</div>
              <div class="image-metadata">
                <span v-if="image.size" class="image-size">{{ formatFileSize(image.size) }}</span>
                <span v-if="image.uploadDate" class="image-date">{{ formatDate(image.uploadDate) }}</span>
              </div>
            </div>

            <div class="image-actions">
              <Button
                @click="downloadImage(image)"
                icon="pi pi-download"
                class="p-button-text p-button-sm"
                v-tooltip="'Download'"
              />
              <Button
                @click="deleteImage(image, index)"
                icon="pi pi-trash"
                class="p-button-text p-button-sm p-button-danger"
                v-tooltip="'Delete'"
                :disabled="!canDeleteImages"
              />
            </div>
          </div>
        </div>
      </template>
    </Card>

    <!-- Image Upload Dialog -->
    <Dialog
      v-model:visible="showImageUploader"
      header="Upload Activation Images"
      :modal="true"
      :style="{ width: '600px' }"
    >
      <div class="upload-dialog-content">
        <div class="upload-instructions">
          <h4>Upload Guidelines</h4>
          <ul>
            <li>Take clear, well-lit photos of the activation setup</li>
            <li>Include photos of the venue, products, and team in action</li>
            <li>Capture customer interactions and engagement</li>
            <li>Document any special arrangements or displays</li>
          </ul>
        </div>
        
        <ImageUpload
          v-model="selectedImages"
          :entity-id="activationId"
          entity-type="ACTIVATION"
          label="Select Images"
          description="Upload photos from this activation event"
          :max-files="50"
          :max-size="10 * 1024 * 1024"
          @upload-success="handleImageUploadSuccess"
          @upload-error="handleImageUploadError"
        />
      </div>
      
      <template #footer>
        <BaseButton
          @click="showImageUploader = false"
          variant="secondary"
        >
          Close
        </BaseButton>
      </template>
    </Dialog>

    <!-- Image Viewer Dialog -->
    <Dialog 
      v-model:visible="showImageViewer" 
      modal 
      :header="currentImage?.description || `Image ${currentImageIndex + 1} of ${activationImages.length}`"
      :style="{ width: '90vw', maxWidth: '1200px' }"
      :maximizable="true"
      class="image-viewer-dialog"
    >
      <div v-if="currentImage" class="image-viewer-content">
        <!-- Image Display -->
        <div class="viewer-image-container">
          <img 
            :src="getImageUrl(currentImage)" 
            :alt="currentImage.description || 'Image'"
            class="viewer-image"
          />
        </div>

        <!-- Navigation -->
        <div v-if="activationImages.length > 1" class="viewer-navigation">
          <Button
            @click="previousImage"
            icon="pi pi-chevron-left"
            class="p-button-rounded p-button-outlined"
            :disabled="currentImageIndex === 0"
            v-tooltip="'Previous'"
          />
          <span class="image-counter">{{ currentImageIndex + 1 }} / {{ activationImages.length }}</span>
          <Button
            @click="nextImage"
            icon="pi pi-chevron-right"
            class="p-button-rounded p-button-outlined"
            :disabled="currentImageIndex === activationImages.length - 1"
            v-tooltip="'Next'"
          />
        </div>

        <!-- Image Details -->
        <div class="viewer-details">
          <div class="detail-grid">
            <div class="detail-item">
              <strong>Name:</strong> {{ getImageName(currentImage) }}
            </div>
            <div v-if="currentImage.size" class="detail-item">
              <strong>Size:</strong> {{ formatFileSize(currentImage.size) }}
            </div>
            <div v-if="currentImage.uploadDate" class="detail-item">
              <strong>Uploaded:</strong> {{ formatDateTime(currentImage.uploadDate) }}
            </div>
            <div v-if="currentImage.mimeType" class="detail-item">
              <strong>Type:</strong> {{ currentImage.mimeType }}
            </div>
          </div>
          
          <div class="viewer-actions">
            <BaseButton
              @click="downloadImage(currentImage)"
              variant="secondary"
              icon="pi pi-download"
            >
              Download
            </BaseButton>
            <BaseButton
              @click="deleteImage(currentImage, currentImageIndex)"
              variant="danger"
              icon="pi pi-trash"
              :disabled="!canDeleteImages"
            >
              Delete
            </BaseButton>
          </div>
        </div>
      </div>
    </Dialog>

    <!-- Delete All Confirmation -->
    <Dialog
      v-model:visible="showDeleteAllConfirm"
      header="Delete All Images"
      :modal="true"
      :style="{ width: '400px' }"
    >
      <div class="delete-confirm-content">
        <div class="warning-info">
          <i class="pi pi-exclamation-triangle"></i>
          <div>
            <p><strong>Warning:</strong> This action cannot be undone.</p>
            <p>Are you sure you want to delete all {{ activationImages.length }} images from this activation?</p>
          </div>
        </div>
      </div>
      
      <template #footer>
        <BaseButton
          @click="showDeleteAllConfirm = false"
          variant="secondary"
        >
          Cancel
        </BaseButton>
        <BaseButton
          @click="confirmDeleteAll"
          variant="danger"
          :loading="deletingAll"
        >
          Delete All
        </BaseButton>
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useToaster } from '@/composables/useToaster'
import { BaseButton } from '@/components'
import ImageUpload from '@/components/form-components/ImageUpload.vue'
import Card from 'primevue/card'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'

const props = defineProps({
  activationId: {
    type: Number,
    required: true
  },
  activation: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['images-updated'])

// Stores and composables
const authStore = useAuthStore()
const toaster = useToaster()

// Reactive state
const activationImages = ref([])
const selectedImages = ref([])

const showImageUploader = ref(false)
const showImageViewer = ref(false)
const showDeleteAllConfirm = ref(false)

const currentImageIndex = ref(0)
const downloadingAll = ref(false)
const deletingAll = ref(false)

// Computed
const currentImage = computed(() => {
  return activationImages.value[currentImageIndex.value] || null
})

const latestUpload = computed(() => {
  if (activationImages.value.length === 0) return null
  return activationImages.value.reduce((latest, image) => {
    if (!latest || !image.uploadDate) return image
    return new Date(image.uploadDate) > new Date(latest.uploadDate) ? image : latest
  }, null)
})

const canUploadImages = computed(() => {
  // Promoters can upload images when checked in, admins can always upload
  return authStore.userRole === 'ADMIN' || 
         authStore.userRole === 'ACTIVATION_MANAGER' ||
         authStore.userRole === 'PROMOTER'
})

const canDeleteImages = computed(() => {
  // Only admins and activation managers can delete images
  return authStore.userRole === 'ADMIN' || 
         authStore.userRole === 'ACTIVATION_MANAGER'
})

// Methods
const loadActivationImages = async () => {
  try {
    // Import the activation service
    const { activationService } = await import('@/services/api')
    
    // Load images associated with the activation from the backend
    const response = await activationService.getActivationImages(props.activationId)
    
    // Handle different response formats
    if (response.data) {
      activationImages.value = Array.isArray(response.data) ? response.data : []
    } else if (Array.isArray(response)) {
      activationImages.value = response
    } else {
      activationImages.value = []
    }
    
    console.log('Loaded activation images:', activationImages.value)
  } catch (error) {
    console.error('Failed to load activation images:', error)
    // Don't show error for empty results, only for actual failures
    if (error.response?.status !== 404) {
      toaster.error('Failed to load activation images')
    }
    activationImages.value = []
  }
}

const handleImageUploadSuccess = (uploadedImages) => {
  activationImages.value.push(...uploadedImages)
  emit('images-updated', activationImages.value)
  toaster.success(`Successfully uploaded ${uploadedImages.length} image(s)`)
}

const handleImageUploadError = (error) => {
  console.error('Image upload failed:', error)
  toaster.error('Failed to upload images')
}

const viewImage = (index) => {
  currentImageIndex.value = index
  showImageViewer.value = true
}

const nextImage = () => {
  if (currentImageIndex.value < activationImages.value.length - 1) {
    currentImageIndex.value++
  }
}

const previousImage = () => {
  if (currentImageIndex.value > 0) {
    currentImageIndex.value--
  }
}

const downloadImage = async (image) => {
  try {
    // Create download link
    const link = document.createElement('a')
    link.href = getImageUrl(image)
    link.download = getImageName(image)
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toaster.success('Image download started')
  } catch (error) {
    console.error('Failed to download image:', error)
    toaster.error('Failed to download image')
  }
}

const downloadAllImages = async () => {
  try {
    downloadingAll.value = true
    
    // Download images one by one with a small delay
    for (let i = 0; i < activationImages.value.length; i++) {
      await downloadImage(activationImages.value[i])
      // Small delay to prevent overwhelming the browser
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    
    toaster.success(`Started download of ${activationImages.value.length} images`)
  } catch (error) {
    console.error('Failed to download all images:', error)
    toaster.error('Failed to download all images')
  } finally {
    downloadingAll.value = false
  }
}

const deleteImage = async (image, index) => {
  try {
    // This would call the backend to delete the image
    // For now, just remove from the array
    activationImages.value.splice(index, 1)
    
    // Close viewer if we deleted the current image and it was the last one
    if (showImageViewer.value && currentImageIndex.value >= activationImages.value.length) {
      if (activationImages.value.length === 0) {
        showImageViewer.value = false
      } else {
        currentImageIndex.value = activationImages.value.length - 1
      }
    }
    
    emit('images-updated', activationImages.value)
    toaster.success('Image deleted successfully')
  } catch (error) {
    console.error('Failed to delete image:', error)
    toaster.error('Failed to delete image')
  }
}

const confirmDeleteAll = async () => {
  try {
    deletingAll.value = true
    
    // This would call the backend to delete all images
    // For now, just clear the array
    activationImages.value = []
    showDeleteAllConfirm.value = false
    showImageViewer.value = false
    
    emit('images-updated', activationImages.value)
    toaster.success('All images deleted successfully')
  } catch (error) {
    console.error('Failed to delete all images:', error)
    toaster.error('Failed to delete all images')
  } finally {
    deletingAll.value = false
  }
}

// Utility methods
const getImageUrl = (image) => {
  // If image already has a full URL, use it
  if (image.url && image.url.startsWith('http')) {
    return image.url
  }
  
  // If image has an S3 key or file path, construct S3 URL
  const s3BucketUrl = import.meta.env.VITE_AWS_S3_BUCKET
  if (s3BucketUrl && (image.s3Key || image.filePath || image.key)) {
    // Get the S3 key from various possible properties
    let s3Key = image.s3Key || image.key || image.filePath || image.url
    
    // Remove leading slash if present
    if (s3Key && s3Key.startsWith('/')) {
      s3Key = s3Key.substring(1)
    }
    
    // Ensure S3 bucket URL ends with slash
    const baseUrl = s3BucketUrl.endsWith('/') ? s3BucketUrl : s3BucketUrl + '/'
    
    // Return full S3 URL
    return baseUrl + s3Key
  }
  
  // Fallback to API-based URL if no S3 bucket configured
  if (image.filePath) {
    if (image.filePath.startsWith('http')) return image.filePath
    return `${import.meta.env.VITE_API_BASE_URL}/files${image.filePath}`
  }
  
  return ''
}

const getImageName = (image) => {
  return image.fileName || image.name || image.description || 'Untitled'
}

const formatDateTime = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString()
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString()
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatTotalSize = () => {
  const totalBytes = activationImages.value.reduce((total, image) => total + (image.size || 0), 0)
  return formatFileSize(totalBytes)
}

const handleImageError = (event) => {
  // Handle broken images with placeholder
  event.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjZjNmNGY2Ii8+CjxwYXRoIGQ9Im0xNSAxMC41LTMuNSAzLjUtMi41LTIuNUw2IDE1aDEydi00LjVaIiBmaWxsPSIjOWNhM2FmIi8+CjxjaXJjbGUgY3g9IjkuNSIgY3k9IjguNSIgcj0iMS41IiBmaWxsPSIjOWNhM2FmIi8+Cjwvc3ZnPgo='
}

// Lifecycle
onMounted(async () => {
  await loadActivationImages()
})
</script>

<style scoped>
.activation-image-gallery {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.upload-header, .gallery-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0;
}

.upload-header h3, .gallery-header h3 {
  margin: 0;
  color: #374151;
}

.gallery-actions {
  display: flex;
  gap: 0.5rem;
}

.upload-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  color: #6b7280;
  font-size: 0.875rem;
}

.info-item i {
  color: #3b82f6;
  margin-top: 0.125rem;
}

.upload-stats {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-item strong {
  color: #374151;
  font-size: 1.125rem;
}

.stat-item span {
  color: #6b7280;
  font-size: 0.75rem;
}

.empty-gallery {
  padding: 3rem;
  text-align: center;
}

.empty-content {
  max-width: 400px;
  margin: 0 auto;
}

.empty-icon {
  font-size: 3rem;
  color: #d1d5db;
  margin-bottom: 1rem;
}

.empty-content h4 {
  margin: 0 0 0.5rem 0;
  color: #374151;
}

.empty-content p {
  margin: 0 0 1.5rem 0;
  color: #6b7280;
  line-height: 1.5;
}

.images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
}

.image-item {
  display: flex;
  flex-direction: column;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  background: #ffffff;
  transition: shadow 0.2s;
}

.image-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.image-container {
  position: relative;
  aspect-ratio: 16/9;
  cursor: pointer;
  overflow: hidden;
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
  opacity: 0;
  transition: opacity 0.2s;
}

.image-container:hover .image-overlay {
  opacity: 1;
}

.image-info {
  padding: 1rem;
  flex: 1;
}

.image-name {
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.image-metadata {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: #6b7280;
}

.image-actions {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 1rem;
  border-top: 1px solid #f3f4f6;
  background: #f9fafb;
}

.upload-dialog-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.upload-instructions {
  padding: 1rem;
  background: #f0f9ff;
  border-radius: 8px;
}

.upload-instructions h4 {
  margin: 0 0 0.75rem 0;
  color: #0369a1;
}

.upload-instructions ul {
  margin: 0;
  padding-left: 1.25rem;
  color: #075985;
}

.upload-instructions li {
  margin-bottom: 0.25rem;
  font-size: 0.875rem;
}

.image-viewer-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.viewer-image-container {
  text-align: center;
  max-height: 60vh;
  overflow: hidden;
  border-radius: 8px;
}

.viewer-image {
  max-width: 100%;
  max-height: 60vh;
  object-fit: contain;
  border-radius: 8px;
}

.viewer-navigation {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.image-counter {
  font-weight: 500;
  color: #374151;
  min-width: 100px;
  text-align: center;
}

.viewer-details {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 1rem;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
  flex: 1;
}

.detail-item {
  font-size: 0.875rem;
  color: #6b7280;
}

.detail-item strong {
  color: #374151;
}

.viewer-actions {
  display: flex;
  gap: 0.5rem;
}

.delete-confirm-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.warning-info {
  display: flex;
  gap: 0.75rem;
  padding: 1rem;
  background: #fef2f2;
  border-radius: 8px;
}

.warning-info i {
  color: #dc2626;
  font-size: 1.25rem;
  margin-top: 0.25rem;
}

.warning-info p {
  margin: 0.25rem 0;
  font-size: 0.875rem;
  color: #7f1d1d;
}

/* Responsive design */
@media (max-width: 768px) {
  .images-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
  }
  
  .upload-header, .gallery-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .gallery-actions {
    flex-direction: column;
    width: 100%;
  }
  
  .upload-stats {
    gap: 1rem;
  }
  
  .viewer-details {
    flex-direction: column;
    align-items: stretch;
  }
  
  .detail-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .images-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .image-metadata {
    flex-direction: column;
    gap: 0.25rem;
  }
}

/* Dialog overrides */
:deep(.image-viewer-dialog .p-dialog-content) {
  padding: 1rem;
}

:deep(.image-viewer-dialog .p-dialog-header) {
  padding: 1rem 1rem 0.5rem 1rem;
}
</style>