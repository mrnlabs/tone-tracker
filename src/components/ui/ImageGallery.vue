<template>
  <div class="image-gallery">
    <!-- Empty State -->
    <div v-if="images.length === 0" class="empty-state">
      <i class="pi pi-image empty-icon"></i>
      <p class="empty-text">No images available</p>
    </div>

    <!-- Images Grid -->
    <div v-else class="images-grid">
      <div 
        v-for="(image, index) in images" 
        :key="image.id || index" 
        class="image-item"
        @click="openLightbox(index)"
      >
        <div class="image-container">
          <img 
            :src="getImageUrl(image)" 
            :alt="image.description || `Image ${index + 1}`"
            class="image-preview"
            @error="(event) => handleImageError(event, image)"
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
          <span class="image-name">{{ getImageName(image) }}</span>
          <span v-if="image.uploadDate" class="image-date">
            {{ formatDate(image.uploadDate) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Lightbox -->
    <Dialog 
      v-model:visible="showLightbox" 
      modal 
      :header="currentImage?.description || `Image ${currentIndex + 1} of ${images.length}`"
      :style="{ width: '90vw', maxWidth: '1200px' }"
      :maximizable="true"
      class="image-lightbox"
    >
      <div v-if="currentImage" class="lightbox-content">
        <!-- Image -->
        <div class="lightbox-image-container">
          <img 
            :src="getImageUrl(currentImage)" 
            :alt="currentImage.description || 'Image'"
            class="lightbox-image"
          />
        </div>

        <!-- Navigation -->
        <div v-if="images.length > 1" class="lightbox-navigation">
          <Button
            @click="previousImage"
            icon="pi pi-chevron-left"
            class="p-button-rounded p-button-outlined"
            :disabled="currentIndex === 0"
            v-tooltip="'Previous'"
          />
          <span class="image-counter">{{ currentIndex + 1 }} / {{ images.length }}</span>
          <Button
            @click="nextImage"
            icon="pi pi-chevron-right"
            class="p-button-rounded p-button-outlined"
            :disabled="currentIndex === images.length - 1"
            v-tooltip="'Next'"
          />
        </div>

        <!-- Image Details -->
        <div class="lightbox-details">
          <div class="detail-item">
            <strong>Name:</strong> {{ getImageName(currentImage) }}
          </div>
          <div v-if="currentImage.size" class="detail-item">
            <strong>Size:</strong> {{ formatFileSize(currentImage.size) }}
          </div>
          <div v-if="currentImage.uploadDate" class="detail-item">
            <strong>Uploaded:</strong> {{ formatDate(currentImage.uploadDate) }}
          </div>
          <div v-if="currentImage.mimeType" class="detail-item">
            <strong>Type:</strong> {{ currentImage.mimeType }}
          </div>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'

const props = defineProps({
  images: {
    type: Array,
    default: () => []
  },
  columns: {
    type: Number,
    default: 4
  }
})

// State
const showLightbox = ref(false)
const currentIndex = ref(0)

// Computed
const currentImage = computed(() => {
  return props.images[currentIndex.value] || null
})

// Methods
const getImageUrl = (image) => {
  // Prioritize S3 URLs over API download URLs
  if (image.filePath) {
    // If it's a full URL (S3 bucket URL), return as is
    if (image.filePath.startsWith('http')) return image.filePath
    // For relative paths, concatenate with S3 bucket URL
    const s3BucketUrl = import.meta.env.VITE_AWS_S3_BUCKET || 'https://client-activation-tracker.s3.af-south-1.amazonaws.com/'
    // Ensure proper URL formatting
    const bucketUrl = s3BucketUrl.endsWith('/') ? s3BucketUrl : s3BucketUrl + '/'
    const filePath = image.filePath.startsWith('/') ? image.filePath.substring(1) : image.filePath
    return bucketUrl + filePath
  }
  
  // Fallback to image.url if no filePath (for local images, etc.)
  if (image.url) return image.url
  
  return ''
}

const getImageName = (image) => {
  return image.fileName || image.name || image.description || 'Untitled'
}

const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString()
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const openLightbox = (index) => {
  currentIndex.value = index
  showLightbox.value = true
}

const nextImage = () => {
  if (currentIndex.value < props.images.length - 1) {
    currentIndex.value++
  }
}

const previousImage = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
  }
}

const handleImageError = (event, image) => {
  // Handle broken images
  console.error('Image failed to load:', event.target.src)
  console.error('Image object:', image)
  
  // Try fallback to API download URL if S3 fails
  if (event.target.src.includes('s3.af-south-1.amazonaws.com') && image.url) {
    console.log('S3 failed, trying API fallback:', image.url)
    event.target.src = `${import.meta.env.VITE_API_BASE_URL}${image.url}`
    return
  }
  
  // Final fallback to placeholder
  event.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjZjNmNGY2Ii8+CjxwYXRoIGQ9Im0xNSAxMC41LTMuNSAzLjUtMi41LTIuNUw2IDE1aDEydi00LjVaIiBmaWxsPSIjOWNhM2FmIi8+CjxjaXJjbGUgY3g9IjkuNSIgY3k9IjguNSIgcj0iMS41IiBmaWxsPSIjOWNhM2FmIi8+Cjwvc3ZnPgo='
}
</script>

<style scoped>
.image-gallery {
  width: 100%;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: #6b7280;
  text-align: center;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-text {
  margin: 0;
  font-size: 1.125rem;
}

.images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.image-item {
  cursor: pointer;
  transition: transform 0.2s;
}

.image-item:hover {
  transform: translateY(-2px);
}

.image-container {
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background: #f3f4f6;
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
  padding: 0.75rem 0;
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
  margin-bottom: 0.25rem;
}

.image-date {
  display: block;
  font-size: 0.75rem;
  color: #6b7280;
}

.lightbox-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.lightbox-image-container {
  text-align: center;
  max-height: 70vh;
  overflow: hidden;
  border-radius: 8px;
}

.lightbox-image {
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
  border-radius: 8px;
}

.lightbox-navigation {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.image-counter {
  font-weight: 500;
  color: #374151;
  min-width: 80px;
  text-align: center;
}

.lightbox-details {
  background: #f9fafb;
  padding: 1rem;
  border-radius: 8px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
}

.detail-item {
  font-size: 0.875rem;
}

.detail-item strong {
  color: #374151;
}

/* Responsive design */
@media (max-width: 768px) {
  .images-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 0.75rem;
  }
  
  .image-info {
    padding: 0.5rem 0;
  }
  
  .lightbox-details {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .images-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .empty-state {
    padding: 2rem;
  }
  
  .empty-icon {
    font-size: 2rem;
  }
}

/* Lightbox dialog styles */
:deep(.image-lightbox .p-dialog-content) {
  padding: 1rem;
}

:deep(.image-lightbox .p-dialog-header) {
  padding: 1rem 1rem 0.5rem 1rem;
}
</style>