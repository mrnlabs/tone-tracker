<template>
  <div class="profile-picture-upload">
    <div class="upload-header">
      <label v-if="label" :class="['upload-label', { required: required }]">
        {{ label }}
      </label>
    </div>

    <div class="upload-container">
      <!-- Current profile picture display -->
      <div class="profile-picture-container">
        <div class="profile-picture" :class="{ 'has-picture': hasProfilePicture }">
          <img 
            v-if="imageUrl" 
            :src="imageUrl" 
            :alt="userName || 'Profile picture'"
            @error="handleImageError"
          />
          <div v-else class="avatar-placeholder">
            <i class="pi pi-user"></i>
          </div>
          
          <!-- Overlay actions -->
          <div class="picture-overlay">
            <div class="overlay-actions">
              <Button
                v-if="!uploading"
                @click="triggerFileSelect"
                icon="pi pi-camera"
                class="p-button-rounded p-button-sm"
                v-tooltip="hasProfilePicture ? 'Change picture' : 'Upload picture'"
              />
              <Button
                v-if="hasProfilePicture && !uploading"
                @click="removePicture"
                icon="pi pi-trash"
                class="p-button-rounded p-button-danger p-button-sm"
                v-tooltip="'Remove picture'"
              />
            </div>
          </div>

          <!-- Upload progress overlay -->
          <div v-if="uploading" class="upload-progress-overlay">
            <ProgressSpinner 
              style="width: 50px; height: 50px" 
              strokeWidth="4"
              animationDuration=".5s"
            />
            <div class="progress-text">{{ uploadProgress }}%</div>
          </div>
        </div>
      </div>

      <!-- File input -->
      <input
        ref="fileInput"
        type="file"
        :accept="accept"
        @change="handleFileSelect"
        class="file-input"
      />

      <!-- Upload info -->
      <div class="upload-info">
        <p class="info-text">{{ infoText }}</p>
        <small class="constraint-text">{{ constraintText }}</small>
      </div>
    </div>

    <!-- Error message -->
    <small v-if="error" class="error-message">{{ error }}</small>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useToast } from 'primevue/usetoast'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  label: {
    type: String,
    default: 'Profile Picture'
  },
  accept: {
    type: String,
    default: 'image/jpeg,image/jpg,image/png,image/gif,image/webp'
  },
  maxSize: {
    type: Number,
    default: 5 * 1024 * 1024 // 5MB
  },
  required: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ''
  },
  userName: {
    type: String,
    default: ''
  },
  userId: {
    type: [String, Number],
    default: null
  },
  uploadHandler: {
    type: Function,
    default: null
  },
  deleteHandler: {
    type: Function,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'upload-success', 'upload-error', 'delete-success', 'delete-error'])

const toast = useToast()
const fileInput = ref(null)
const uploading = ref(false)
const uploadProgress = ref(0)
const imageUrl = ref(props.modelValue)
const imageLoadError = ref(false)

// Watch for external changes to modelValue
watch(() => props.modelValue, (newValue) => {
  imageUrl.value = newValue
  imageLoadError.value = false
})

// Computed properties
const hasProfilePicture = computed(() => {
  return !!imageUrl.value && !imageLoadError.value
})

const infoText = computed(() => {
  return hasProfilePicture.value 
    ? 'Click the camera icon to change your profile picture'
    : 'Click the camera icon to upload a profile picture'
})

const constraintText = computed(() => {
  const types = ['JPG', 'PNG', 'GIF', 'WebP']
  return `Accepted: ${types.join(', ')} • Max size: ${formatFileSize(props.maxSize)}`
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

const processFile = async (file) => {
  // Validate file type
  if (!file.type.startsWith('image/')) {
    toast.add({
      severity: 'error',
      summary: 'Invalid File Type',
      detail: 'Please select an image file',
      life: 5000
    })
    return
  }

  // Validate file size (before compression)
  if (props.maxSize && file.size > props.maxSize) {
    console.log(`File size ${formatFileSize(file.size)} exceeds ${formatFileSize(props.maxSize)}, will compress`)
  }

  // Preview image before upload
  const reader = new FileReader()
  reader.onload = async (e) => {
    // Show preview immediately
    imageUrl.value = e.target.result
    imageLoadError.value = false
    
    // Compress file if needed, then upload
    const processedFile = await compressImage(file)
    await uploadFile(processedFile)
  }
  reader.readAsDataURL(file)

  // Reset file input
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const uploadFile = async (file) => {
  uploading.value = true
  uploadProgress.value = 0

  try {
    let result

    if (props.uploadHandler) {
      // Use custom upload handler if provided
      result = await props.uploadHandler(file, (progress) => {
        uploadProgress.value = progress
      })
    } else {
      // Use default API upload
      const formData = new FormData()
      formData.append('file', file)

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        if (uploadProgress.value < 90) {
          uploadProgress.value += 10
        }
      }, 100)

      const { authService } = await import('@/services/api')
      result = await authService.uploadProfilePicture(props.userId || 'current', formData)

      clearInterval(progressInterval)
      uploadProgress.value = 100
    }

    // Update image URL with the server response
    console.log('ProfilePictureUpload: Upload handler result:', result)
    const newUrl = result.url || result.profilePictureUrl || result.profileImagePath || result.filePath || result.data?.url || result.data?.profilePictureUrl
    
    if (newUrl) {
      console.log('ProfilePictureUpload: Setting image URL to:', newUrl)
      
      imageUrl.value = newUrl
      emit('update:modelValue', imageUrl.value)
      emit('upload-success', result)
      
      toast.add({
        severity: 'success',
        summary: 'Upload Successful',
        detail: 'Profile picture updated successfully',
        life: 3000
      })
    }

  } catch (error) {
    console.error('Upload failed:', error)
    
    // Revert to previous image on error
    imageUrl.value = props.modelValue
    imageLoadError.value = false
    
    emit('upload-error', error)
    toast.add({
      severity: 'error',
      summary: 'Upload Failed',
      detail: error.response?.data?.message || error.message || 'Failed to upload profile picture',
      life: 5000
    })
  } finally {
    uploading.value = false
    uploadProgress.value = 0
  }
}

const removePicture = async () => {
  const confirmed = window.confirm('Are you sure you want to remove your profile picture?')
  if (!confirmed) return

  uploading.value = true

  try {
    if (props.deleteHandler) {
      // Use custom delete handler if provided
      await props.deleteHandler()
    } else {
      // Use default API delete
      const { authService } = await import('@/services/api')
      await authService.deleteProfilePicture(props.userId || 'current')
    }

    imageUrl.value = ''
    imageLoadError.value = false
    emit('update:modelValue', '')
    emit('delete-success')
    
    toast.add({
      severity: 'success',
      summary: 'Picture Removed',
      detail: 'Profile picture removed successfully',
      life: 3000
    })

  } catch (error) {
    console.error('Delete failed:', error)
    emit('delete-error', error)
    
    toast.add({
      severity: 'error',
      summary: 'Delete Failed',
      detail: error.response?.data?.message || error.message || 'Failed to remove profile picture',
      life: 5000
    })
  } finally {
    uploading.value = false
  }
}

const handleImageError = (event) => {
  console.error('Failed to load profile picture')
  console.error('Failed URL was:', event?.target?.src || imageUrl.value)
  console.error('Current imageUrl value:', imageUrl.value)
  console.error('Props modelValue:', props.modelValue)
  imageLoadError.value = true
  
  // Log the base URLs being used
  console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL)
  console.log('S3 Bucket URL:', import.meta.env.VITE_AWS_S3_BUCKET)
}

const compressImage = async (file) => {
  // If file is already small enough, return as-is
  if (file.size <= props.maxSize) {
    return file
  }

  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      // Calculate new dimensions (max 800x800 for profile pictures)
      const maxSize = 800
      let { width, height } = img
      
      if (width > height) {
        if (width > maxSize) {
          height = (height * maxSize) / width
          width = maxSize
        }
      } else {
        if (height > maxSize) {
          width = (width * maxSize) / height
          height = maxSize
        }
      }
      
      canvas.width = width
      canvas.height = height
      
      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height)
      
      // Start with high quality and reduce until file size is acceptable
      let quality = 0.9
      const tryCompress = () => {
        canvas.toBlob((blob) => {
          if (blob.size <= props.maxSize || quality <= 0.1) {
            // Create new File object with compressed data
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            })
            
            console.log(`Compressed ${formatFileSize(file.size)} → ${formatFileSize(compressedFile.size)}`)
            resolve(compressedFile)
          } else {
            // Reduce quality and try again
            quality -= 0.1
            tryCompress()
          }
        }, file.type, quality)
      }
      
      tryCompress()
    }
    
    img.src = URL.createObjectURL(file)
  })
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
.profile-picture-upload {
  width: 100%;
}

.upload-header {
  margin-bottom: 0.75rem;
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

.upload-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.profile-picture-container {
  position: relative;
}

.profile-picture {
  position: relative;
  width: 150px;
  height: 150px;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid #e5e7eb;
  background: #f3f4f6;
  transition: all 0.3s ease;
}

.profile-picture.has-picture {
  border-color: #3b82f6;
}

.profile-picture img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e5e7eb;
}

.avatar-placeholder i {
  font-size: 4rem;
  color: #9ca3af;
}

.picture-overlay {
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
  transition: opacity 0.3s ease;
}

.profile-picture:hover .picture-overlay {
  opacity: 1;
}

.overlay-actions {
  display: flex;
  gap: 0.5rem;
}

.overlay-actions .p-button {
  background: rgba(255, 255, 255, 0.9);
  color: #374151;
  border: none;
}

.overlay-actions .p-button:hover {
  background: white;
}

.overlay-actions .p-button-danger {
  color: #dc2626;
}

.upload-progress-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.progress-text {
  font-weight: 600;
  color: #374151;
}

.file-input {
  display: none;
}

.upload-info {
  text-align: center;
}

.info-text {
  margin: 0 0 0.25rem 0;
  color: #6b7280;
  font-size: 0.875rem;
}

.constraint-text {
  color: #9ca3af;
  font-size: 0.75rem;
}

.error-message {
  color: #ef4444;
  font-size: 0.875rem;
  display: block;
  margin-top: 0.5rem;
  text-align: center;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .upload-label {
    color: #f3f4f6;
  }

  .profile-picture {
    border-color: #374151;
    background: #1f2937;
  }

  .profile-picture.has-picture {
    border-color: #3b82f6;
  }

  .avatar-placeholder {
    background: #374151;
  }

  .avatar-placeholder i {
    color: #6b7280;
  }

  .info-text {
    color: #d1d5db;
  }

  .constraint-text {
    color: #6b7280;
  }
}
</style>