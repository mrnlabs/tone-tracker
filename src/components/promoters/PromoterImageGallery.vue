<template>
  <div class="promoter-image-gallery">
    <Card>
      <template #header>
        <div class="gallery-header">
          <h3>{{ context.value === 'profile' ? 'My Gallery' : 'Activation Gallery' }}</h3>
          <div class="header-actions">
            <Button
              @click="showUploadDialog = true"
              icon="pi pi-upload"
              label="Upload Images"
              class="p-button-primary"
              :disabled="!canUpload.value"
            />
          </div>
        </div>
      </template>

      <template #content>
        <!-- Gallery Loading State -->
        <div v-if="loading" class="loading-container">
          <ProgressSpinner />
          <p>Loading gallery...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="galleryImages.length === 0" class="empty-gallery">
          <i class="pi pi-images empty-icon"></i>
          <h4>No images uploaded yet</h4>
          <p>Start building your activation gallery by uploading photos</p>
          <Button
            @click="showUploadDialog = true"
            icon="pi pi-upload"
            label="Upload First Images"
            class="p-button-outlined"
          />
        </div>

        <!-- Image Grid -->
        <div v-else class="image-grid">
          <div
            v-for="image in galleryImages"
            :key="image.id"
            class="image-item"
          >
            <div class="image-container">
              <img
                :src="image.thumbnailUrl || image.url"
                :alt="image.description || 'Activation image'"
                @click="viewImage(image)"
                loading="lazy"
              />
              <div class="image-overlay">
                <Button
                  @click="viewImage(image)"
                  icon="pi pi-eye"
                  class="p-button-rounded p-button-text p-button-sm overlay-btn"
                  v-tooltip.top="'View'"
                />
                <Button
                  @click="editImageDescription(image)"
                  icon="pi pi-pencil"
                  class="p-button-rounded p-button-text p-button-sm overlay-btn"
                  v-tooltip.top="'Edit Description'"
                />
                <Button
                  @click="confirmDeleteImage(image)"
                  icon="pi pi-trash"
                  class="p-button-rounded p-button-text p-button-sm overlay-btn"
                  v-tooltip.top="'Delete'"
                  :disabled="deletingImages[image.id]"
                />
              </div>
            </div>
            <div class="image-info">
              <p class="image-description">{{ image.description || 'No description' }}</p>
              <small class="image-meta">
                {{ formatDate(image.uploadDate) }}
                <span v-if="image.fileSize"> • {{ formatFileSize(image.fileSize) }}</span>
              </small>
            </div>
          </div>
        </div>

        <!-- Load More -->
        <div v-if="hasMore && !loading" class="load-more">
          <Button
            @click="loadMoreImages"
            label="Load More Images"
            icon="pi pi-refresh"
            class="p-button-outlined"
            :loading="loadingMore"
          />
        </div>
      </template>
    </Card>

    <!-- Upload Dialog -->
    <Dialog
      v-model:visible="showUploadDialog"
      header="Upload Images"
      :modal="true"
      :style="{ width: '600px' }"
      :closable="!uploading"
    >
      <div class="upload-dialog">
        <div class="upload-info">
          <i class="pi pi-info-circle"></i>
          <p>You can upload multiple images at once. Supported formats: JPG, PNG, GIF (max 5MB each)</p>
        </div>

        <FileUpload
          name="images[]"
          :multiple="true"
          accept="image/*"
          :maxFileSize="5000000"
          :fileLimit="10"
          :showUploadButton="false"
          :showCancelButton="false"
          @select="onFilesSelect"
          :disabled="uploading"
        >
          <template #empty>
            <div class="upload-empty">
              <i class="pi pi-cloud-upload"></i>
              <p>Drag and drop images here or click to browse</p>
            </div>
          </template>
        </FileUpload>

        <!-- Selected Files Preview -->
        <div v-if="selectedFiles.length > 0" class="selected-files">
          <h4>Selected Images ({{ selectedFiles.length }})</h4>
          <div class="files-preview">
            <div
              v-for="(file, index) in selectedFiles"
              :key="index"
              class="file-preview"
            >
              <img
                :src="file.objectURL"
                :alt="file.name"
                class="preview-image"
              />
              <div class="file-info">
                <p class="file-name">{{ file.name }}</p>
                <input
                  v-model="file.description"
                  type="text"
                  placeholder="Add description (optional)"
                  class="description-input"
                  :disabled="uploading"
                />
              </div>
              <Button
                @click="removeSelectedFile(index)"
                icon="pi pi-times"
                class="p-button-rounded p-button-text p-button-sm remove-btn"
                :disabled="uploading"
              />
            </div>
          </div>
        </div>

        <!-- Upload Progress -->
        <div v-if="uploading" class="upload-progress">
          <ProgressBar :value="uploadProgress" :showValue="true" />
          <p>Uploading {{ currentUploadIndex + 1 }} of {{ selectedFiles.length }}...</p>
        </div>
      </div>

      <template #footer>
        <Button
          @click="cancelUpload"
          label="Cancel"
          class="p-button-text"
          :disabled="uploading"
        />
        <Button
          @click="uploadImages"
          label="Upload All"
          icon="pi pi-upload"
          :loading="uploading"
          :disabled="selectedFiles.length === 0"
        />
      </template>
    </Dialog>

    <!-- Image Viewer Dialog -->
    <Dialog
      v-model:visible="showImageViewer"
      :header="selectedImage?.description || 'Image View'"
      :modal="true"
      :style="{ width: '90vw', maxWidth: '1200px' }"
      :maximizable="true"
    >
      <div class="image-viewer" v-if="selectedImage">
        <img
          :src="selectedImage.url"
          :alt="selectedImage.description"
          class="viewer-image"
        />
        <div class="viewer-info">
          <p><strong>Description:</strong> {{ selectedImage.description || 'No description' }}</p>
          <p><strong>Uploaded:</strong> {{ formatDateTime(selectedImage.uploadDate) }}</p>
          <p><strong>Size:</strong> {{ formatFileSize(selectedImage.fileSize) }}</p>
          <p v-if="selectedImage.tags?.length > 0">
            <strong>Tags:</strong>
            <Tag v-for="tag in selectedImage.tags" :key="tag" :value="tag" class="image-tag" />
          </p>
        </div>
      </div>
    </Dialog>

    <!-- Edit Description Dialog -->
    <Dialog
      v-model:visible="showEditDialog"
      header="Edit Image Description"
      :modal="true"
      :style="{ width: '500px' }"
    >
      <div class="edit-dialog" v-if="editingImage">
        <img
          :src="editingImage.thumbnailUrl || editingImage.url"
          :alt="editingImage.description"
          class="edit-preview"
        />
        <div class="form-group">
          <label for="imageDescription">Description</label>
          <Textarea
            id="imageDescription"
            v-model="editForm.description"
            rows="3"
            class="w-full"
            placeholder="Describe what's in this image..."
          />
        </div>
        <div class="form-group">
          <label for="imageTags">Tags (comma-separated)</label>
          <InputText
            id="imageTags"
            v-model="editForm.tags"
            class="w-full"
            placeholder="e.g., product demo, customer engagement, setup"
          />
        </div>
      </div>

      <template #footer>
        <Button
          @click="showEditDialog = false"
          label="Cancel"
          class="p-button-text"
        />
        <Button
          @click="saveImageDescription"
          label="Save"
          icon="pi pi-check"
          :loading="savingDescription"
        />
      </template>
    </Dialog>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, toRefs } from 'vue'
import { useToast } from 'primevue/usetoast'
import { format } from 'date-fns'
import { activationService, fileService } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import FileUpload from 'primevue/fileupload'
import ProgressSpinner from 'primevue/progressspinner'
import ProgressBar from 'primevue/progressbar'
import Textarea from 'primevue/textarea'
import InputText from 'primevue/inputtext'
import Tag from 'primevue/tag'

const props = defineProps({
  activationId: {
    type: [Number, String],
    required: false,
    default: null
  },
  promoterId: {
    type: [Number, String],
    required: false,
    default: null
  },
  canUpload: {
    type: Boolean,
    default: true
  },
  context: {
    type: String,
    default: 'activation', // 'activation' or 'profile'
    validator: (value) => ['activation', 'profile'].includes(value)
  }
})

const emit = defineEmits(['images-updated'])

// Destructure props for template access
const { activationId, promoterId, canUpload, context } = toRefs(props)

const toast = useToast()
const authStore = useAuthStore()

// State
const loading = ref(false)
const loadingMore = ref(false)
const uploading = ref(false)
const savingDescription = ref(false)
const galleryImages = ref([])
const selectedFiles = ref([])
const deletingImages = ref({})
const currentPage = ref(0)
const pageSize = 12
const hasMore = ref(false)
const totalImages = ref(0)
const uploadProgress = ref(0)
const currentUploadIndex = ref(0)

// Dialogs
const showUploadDialog = ref(false)
const showImageViewer = ref(false)
const showEditDialog = ref(false)
const selectedImage = ref(null)
const editingImage = ref(null)
const editForm = ref({
  description: '',
  tags: ''
})

// Methods
const loadGalleryImages = async (append = false) => {
  
  if (!append) {
    loading.value = true
  } else {
    loadingMore.value = true
  }

  try {
    let response
    
    if (props.context === 'profile' && props.promoterId) {
      // Get images for this user's gallery using new endpoints
      try {
        const { default: api } = await import('@/services/api')
        const currentUserId = authStore.userId
        
        let apiResponse
        // Check if it's the current user or a specific user
        if (props.promoterId === 'current' || props.promoterId === currentUserId || !props.promoterId) {
          console.log('Attempting to load current user gallery...')
          apiResponse = await api.get('/users/current/gallery')
        } else {
          console.log(`Attempting to load user ${props.promoterId} gallery...`)
          apiResponse = await api.get(`/users/${props.promoterId}/gallery`)
        }
        
        console.log('Gallery API response status:', apiResponse?.status)
        
        if (apiResponse && apiResponse.data !== undefined) {
          response = apiResponse.data
          console.log('Successfully loaded from gallery API:', response)
        } else {
          console.warn('Gallery API returned no data, using fallback')
          throw new Error('Gallery API returned no data')
        }
      } catch (error) {
        console.warn('Gallery API not available or failed, using fallback service')
        if (error.response) {
          console.log('API error status:', error.response.status)
          console.log('API error message:', error.response.data?.message || 'No message')
        }
        
        // Fallback: get all files for the promoter
        response = await fileService.getFilesByEntity('PROMOTER', props.promoterId)
        console.log('Using fallback service, loaded', response?.length || 0, 'items')
      }
    } else if (props.activationId) {
      // Get images for this activation
      response = await activationService.getActivationImages(props.activationId)
    } else {
      const errorMsg = 'Either activationId or promoterId must be provided'
      console.error(errorMsg)
      throw new Error(errorMsg)
    }
    
    // Handle both array and paginated responses
    let images = []
    
    console.log('Gallery response structure:', response)
    
    if (Array.isArray(response)) {
      images = response
      hasMore.value = false
    } else if (response && response.content) {
      images = response.content
      hasMore.value = currentPage.value < response.totalPages - 1
      totalImages.value = response.totalElements
    } else if (response && response.data) {
      if (Array.isArray(response.data)) {
        images = response.data
      } else if (response.data.content) {
        images = response.data.content
        hasMore.value = currentPage.value < response.data.totalPages - 1
        totalImages.value = response.data.totalElements
      }
      hasMore.value = false
    } else if (response && typeof response === 'object') {
      // Handle case where response is an object but not paginated
      // Try to find an array property
      const possibleArrays = Object.values(response).filter(Array.isArray)
      if (possibleArrays.length > 0) {
        images = possibleArrays[0]
      } else {
        // If response is a single object, wrap it in an array
        images = [response]
      }
      hasMore.value = false
    } else {
      console.warn('Unexpected response format:', response)
      images = []
      hasMore.value = false
    }

    console.log('Raw images array:', images)
    console.log('Images array length:', images.length)
    
    // Filter for image files only
    const imageFiles = images.filter(file => {
      const mimeType = file.mimeType || file.contentType || ''
      const isImage = mimeType.startsWith('image/') || 
             /\.(jpg|jpeg|png|gif|webp)$/i.test(file.fileName || file.name || '')
      console.log('File:', file.fileName || file.name, 'isImage:', isImage, 'mimeType:', mimeType)
      return isImage
    })
    
    console.log('Filtered image files:', imageFiles)
    console.log('Image files count:', imageFiles.length)

    // Transform to gallery format
    const galleryItems = imageFiles.map(file => {
      // Construct proper URLs using S3 bucket
      const s3BucketUrl = import.meta.env.VITE_AWS_S3_BUCKET || 'https://client-activation-tracker.s3.af-south-1.amazonaws.com/'
      
      let imageUrl = file.downloadUrl || file.url || file.filePath
      let thumbnailUrl = file.thumbnailUrl || file.url || file.filePath
      
      // Handle different URL formats
      if (imageUrl) {
        if (imageUrl.startsWith('/api/files/download/')) {
          // Extract filename from API URL like /api/files/download/promoter/filename.png
          const parts = imageUrl.split('/')
          const filename = parts[parts.length - 1]
          const folder = parts[parts.length - 2] || 'uploads'
          imageUrl = `${s3BucketUrl}${folder}/${filename}`
        } else if (!imageUrl.startsWith('http') && !imageUrl.startsWith('/api/')) {
          // If it's a relative path (like uploads/gallery/filename.jpg), prepend S3 bucket URL
          imageUrl = s3BucketUrl + (imageUrl.startsWith('/') ? imageUrl.substring(1) : imageUrl)
        }
      } else {
        // Fallback to API endpoint if no URL provided
        imageUrl = `/api/files/${file.id}/download`
      }
      
      if (thumbnailUrl) {
        if (thumbnailUrl.startsWith('/api/files/download/')) {
          // Extract filename from API URL
          const parts = thumbnailUrl.split('/')
          const filename = parts[parts.length - 1]
          const folder = parts[parts.length - 2] || 'uploads'
          thumbnailUrl = `${s3BucketUrl}${folder}/${filename}`
        } else if (!thumbnailUrl.startsWith('http') && !thumbnailUrl.startsWith('/api/')) {
          // If it's a relative path, prepend S3 bucket URL
          thumbnailUrl = s3BucketUrl + (thumbnailUrl.startsWith('/') ? thumbnailUrl.substring(1) : thumbnailUrl)
        }
      } else {
        // Use the same URL as main image for thumbnail
        thumbnailUrl = imageUrl
      }
      
      return {
        id: file.id,
        url: imageUrl,
        thumbnailUrl: thumbnailUrl,
        description: file.description || file.fileName || file.name,
        uploadDate: file.uploadDate || file.dateCreated || file.lastUpdated,
        fileSize: file.fileSize || file.size,
        fileName: file.fileName || file.name,
        tags: file.tags || []
      }
    })

    console.log('Final gallery items:', galleryItems)
    console.log('Gallery items count:', galleryItems.length)
    
    if (append) {
      galleryImages.value.push(...galleryItems)
    } else {
      galleryImages.value = galleryItems
    }
    
    console.log('Final galleryImages.value:', galleryImages.value)
    console.log('Final galleryImages.value.length:', galleryImages.value.length)

  } catch (error) {
    console.error('Failed to load gallery images:', error)
    toast.add({
      severity: 'error',
      summary: 'Load Failed',
      detail: 'Failed to load gallery images',
      life: 5000
    })
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

const loadMoreImages = () => {
  currentPage.value++
  loadGalleryImages(true)
}

const onFilesSelect = (event) => {
  const files = event.files || []
  
  selectedFiles.value = files.map(file => ({
    file,
    name: file.name,
    size: file.size,
    objectURL: URL.createObjectURL(file),
    description: ''
  }))
}

const removeSelectedFile = (index) => {
  const file = selectedFiles.value[index]
  URL.revokeObjectURL(file.objectURL)
  selectedFiles.value.splice(index, 1)
}

const uploadImages = async () => {
  if (selectedFiles.value.length === 0) return

  uploading.value = true
  uploadProgress.value = 0
  currentUploadIndex.value = 0

  try {
    const totalFiles = selectedFiles.value.length
    const uploadedImages = []

    for (let i = 0; i < totalFiles; i++) {
      currentUploadIndex.value = i
      const fileData = selectedFiles.value[i]
      
      try {
        let response
        
        if (props.context === 'profile' && props.promoterId) {
          // Upload to user gallery using new endpoint
          const formData = new FormData()
          formData.append('file', fileData.file)
          formData.append('description', fileData.description || '')
          
          try {
            const { default: api } = await import('@/services/api')
            console.log('Attempting to upload to user gallery API...')
            
            // Use current user gallery endpoint
            const apiResponse = await api.post('/users/current/gallery', formData, {
              headers: {
                'Content-Type': 'multipart/form-data'
              },
              onUploadProgress: (progressEvent) => {
                const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
                const fileProgress = (i * 100 + progress) / totalFiles
                uploadProgress.value = Math.round(fileProgress)
              }
            })
            
            response = apiResponse.data
            console.log('Successfully uploaded to gallery API')
          } catch (error) {
            console.warn('Gallery upload API not available, using fallback service')
            if (error.response) {
              console.log('Upload API error status:', error.response.status)
              console.log('Upload API error:', error.response.data?.message || 'No message')
            }
            
            // Fallback to original file service
            response = await fileService.uploadFile(
              fileData.file,
              (progress) => {
                const fileProgress = (i * 100 + progress) / totalFiles
                uploadProgress.value = Math.round(fileProgress)
              },
              {
                entityType: 'PROMOTER',
                entityId: props.promoterId,
                description: fileData.description
              }
            )
            console.log('Upload completed via fallback service')
          }
        } else {
          // Upload to activation gallery
          const formData = new FormData()
          formData.append('file', fileData.file)
          formData.append('entityType', 'ACTIVATION')
          formData.append('entityId', props.activationId)
          formData.append('description', fileData.description || '')
          
          response = await fileService.uploadFile(
            fileData.file,
            (progress) => {
              const fileProgress = (i * 100 + progress) / totalFiles
              uploadProgress.value = Math.round(fileProgress)
            },
            {
              entityType: 'ACTIVATION',
              entityId: props.activationId,
              description: fileData.description
            }
          )
        }
        
        uploadedImages.push(response)
      } catch (error) {
        console.error(`Failed to upload ${fileData.name}:`, error)
        toast.add({
          severity: 'warn',
          summary: 'Upload Failed',
          detail: `Failed to upload ${fileData.name}`,
          life: 3000
        })
      }
    }

    if (uploadedImages.length > 0) {
      toast.add({
        severity: 'success',
        summary: 'Upload Complete',
        detail: `Successfully uploaded ${uploadedImages.length} image(s)`,
        life: 3000
      })

      // Reload gallery
      await loadGalleryImages()
      emit('images-updated', galleryImages.value)
    }

    // Clear and close
    cancelUpload()

  } catch (error) {
    console.error('Upload failed:', error)
    toast.add({
      severity: 'error',
      summary: 'Upload Failed',
      detail: 'Failed to upload images',
      life: 5000
    })
  } finally {
    uploading.value = false
    uploadProgress.value = 0
  }
}

const cancelUpload = () => {
  // Clean up object URLs
  selectedFiles.value.forEach(file => {
    URL.revokeObjectURL(file.objectURL)
  })
  selectedFiles.value = []
  showUploadDialog.value = false
  uploadProgress.value = 0
  currentUploadIndex.value = 0
}

const viewImage = (image) => {
  selectedImage.value = image
  showImageViewer.value = true
}

const editImageDescription = (image) => {
  editingImage.value = image
  editForm.value = {
    description: image.description || '',
    tags: (image.tags || []).join(', ')
  }
  showEditDialog.value = true
}

const saveImageDescription = async () => {
  if (!editingImage.value) return

  savingDescription.value = true

  try {
    // Update image metadata
    const tags = editForm.value.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)

    // Since we might not have a specific update endpoint, 
    // we'll need to use what's available or create a workaround
    await fileService.updateFileMetadata(editingImage.value.id, {
      description: editForm.value.description,
      tags
    })

    // Update local data
    const imageIndex = galleryImages.value.findIndex(img => img.id === editingImage.value.id)
    if (imageIndex !== -1) {
      galleryImages.value[imageIndex] = {
        ...galleryImages.value[imageIndex],
        description: editForm.value.description,
        tags
      }
    }

    toast.add({
      severity: 'success',
      summary: 'Updated',
      detail: 'Image description updated successfully',
      life: 3000
    })

    showEditDialog.value = false
    emit('images-updated', galleryImages.value)

  } catch (error) {
    console.error('Failed to update image description:', error)
    toast.add({
      severity: 'error',
      summary: 'Update Failed',
      detail: 'Failed to update image description',
      life: 5000
    })
  } finally {
    savingDescription.value = false
  }
}

const confirmDeleteImage = (image) => {
  if (window.confirm('Are you sure you want to delete this image?')) {
    deleteImage(image)
  }
}

const deleteImage = async (image) => {
  deletingImages.value[image.id] = true

  try {
    await fileService.deleteFile(image.id)
    
    // Remove from local array
    const index = galleryImages.value.findIndex(img => img.id === image.id)
    if (index !== -1) {
      galleryImages.value.splice(index, 1)
    }

    toast.add({
      severity: 'success',
      summary: 'Deleted',
      detail: 'Image deleted successfully',
      life: 3000
    })

    emit('images-updated', galleryImages.value)

  } catch (error) {
    console.error('Failed to delete image:', error)
    toast.add({
      severity: 'error',
      summary: 'Delete Failed',
      detail: 'Failed to delete image',
      life: 5000
    })
  } finally {
    deletingImages.value[image.id] = false
  }
}

// Utility functions
const formatDate = (date) => {
  if (!date) return ''
  return format(new Date(date), 'MMM dd, yyyy')
}

const formatDateTime = (date) => {
  if (!date) return ''
  return format(new Date(date), 'MMM dd, yyyy HH:mm')
}

const formatFileSize = (bytes) => {
  if (!bytes) return ''
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  if (bytes === 0) return '0 Bytes'
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
}

// Lifecycle
onMounted(() => {
  
  try {
    loadGalleryImages()
  } catch (error) {
    console.error('Error loading gallery images on mount:', error)
  }
})

onUnmounted(() => {
  // Clean up any object URLs
  selectedFiles.value.forEach(file => {
    URL.revokeObjectURL(file.objectURL)
  })
})
</script>

<style scoped>
.promoter-image-gallery {
  width: 100%;
}

.gallery-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.gallery-header h3 {
  margin: 0;
  color: var(--text-color);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
}

.empty-gallery {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
}

.empty-icon {
  font-size: 4rem;
  color: var(--text-color-secondary);
  margin-bottom: 1rem;
}

.empty-gallery h4 {
  margin: 0 0 0.5rem 0;
  color: var(--text-color);
}

.empty-gallery p {
  margin: 0 0 1.5rem 0;
  color: var(--text-color-secondary);
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
}

.image-item {
  position: relative;
  background: var(--surface-50);
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.2s;
}

.image-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.image-container {
  position: relative;
  width: 100%;
  padding-top: 75%; /* 4:3 Aspect Ratio */
  overflow: hidden;
  background: var(--surface-100);
}

.image-container img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  cursor: pointer;
  transition: transform 0.3s;
}

.image-container:hover img {
  transform: scale(1.05);
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.3s;
}

.image-container:hover .image-overlay {
  opacity: 1;
}

.overlay-btn {
  color: white !important;
}

.image-info {
  padding: 1rem;
}

.image-description {
  margin: 0 0 0.5rem 0;
  color: var(--text-color);
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.image-meta {
  color: var(--text-color-secondary);
  font-size: 0.8rem;
}

.load-more {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

/* Upload Dialog */
.upload-dialog {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.upload-info {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--blue-50);
  border-radius: 6px;
  color: var(--blue-700);
}

.upload-info i {
  font-size: 1.2rem;
  margin-top: 0.1rem;
}

.upload-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
  color: var(--text-color-secondary);
}

.upload-empty i {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.selected-files h4 {
  margin: 0 0 1rem 0;
  color: var(--text-color);
}

.files-preview {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 300px;
  overflow-y: auto;
}

.file-preview {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: var(--surface-50);
  border-radius: 6px;
}

.preview-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
}

.file-info {
  flex: 1;
  min-width: 0;
}

.file-name {
  margin: 0 0 0.5rem 0;
  font-weight: 500;
  color: var(--text-color);
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.description-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--surface-300);
  border-radius: 4px;
  font-size: 0.875rem;
}

.remove-btn {
  flex-shrink: 0;
}

.upload-progress {
  text-align: center;
}

.upload-progress p {
  margin: 0.5rem 0 0 0;
  color: var(--text-color-secondary);
  font-size: 0.9rem;
}

/* Image Viewer */
.image-viewer {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.viewer-image {
  width: 100%;
  max-height: 70vh;
  object-fit: contain;
  border-radius: 8px;
}

.viewer-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.viewer-info p {
  margin: 0;
  color: var(--text-color);
}

.image-tag {
  margin-left: 0.5rem;
}

/* Edit Dialog */
.edit-dialog {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.edit-preview {
  width: 100%;
  max-height: 200px;
  object-fit: contain;
  border-radius: 8px;
  background: var(--surface-100);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: var(--text-color);
}

@media (max-width: 768px) {
  .image-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;
  }

  .gallery-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .header-actions {
    width: 100%;
  }

  .header-actions .p-button {
    width: 100%;
  }
}
</style>