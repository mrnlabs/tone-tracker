<template>
  <DashboardLayout>
    <div class="promoter-details-page">
      <!-- Loading State -->
      <div v-if="loading" class="loading-container">
        <ProgressSpinner />
        <p>Loading promoter details...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-container">
        <EmptyState
          type="error"
          title="Error Loading Promoter"
          :message="error"
          :actions="[{ label: 'Back to Promoters', action: 'back', icon: 'pi pi-arrow-left' }]"
          @action="handleEmptyStateAction"
        />
      </div>

      <!-- Promoter Details -->
      <div v-else-if="promoter" class="promoter-content">
        <!-- Page Header -->
        <PageHeader 
          :title="`${promoter.firstName} ${promoter.lastName}`"
          :description="`Promoter ID: ${promoter.id} • ${promoter.isActive ? 'Active' : 'Inactive'}`"
          :actions="headerActions"
          :loading="saving"
        />

        <!-- Profile Picture Section -->
        <Card class="profile-picture-card">
          <template #header>
            <div class="card-header">
              <i class="pi pi-image card-icon"></i>
              <h3>Profile Picture</h3>
            </div>
          </template>
          <template #content>
            <div class="profile-picture-container">
              <div v-if="getProfilePictureUrl(promoter)" class="profile-picture-display">
                <img 
                  :src="getProfilePictureUrl(promoter)" 
                  :alt="`${promoter.firstName} ${promoter.lastName} Profile Picture`"
                  class="profile-picture-image"
                  @click="viewProfilePicture"
                  @error="handleProfilePictureError"
                />
                <div class="profile-picture-overlay" @click="viewProfilePicture">
                  <Button
                    icon="pi pi-eye"
                    class="p-button-rounded p-button-outlined"
                    v-tooltip="'View Profile Picture'"
                  />
                </div>
              </div>
              <div v-else class="no-profile-picture">
                <div class="profile-picture-placeholder">
                  <i class="pi pi-user placeholder-icon"></i>
                </div>
                <p class="no-picture-text">No profile picture uploaded</p>
              </div>
            </div>
          </template>
        </Card>

        <!-- Promoter Info Cards -->
        <div class="info-grid">
          <!-- Personal Information -->
          <Card class="info-card">
            <template #header>
              <div class="card-header">
                <i class="pi pi-user card-icon"></i>
                <h3>Personal Information</h3>
              </div>
            </template>
            <template #content>
              <div class="info-grid-content">
                <div class="info-item">
                  <label>Full Name</label>
                  <span>{{ promoter.firstName }} {{ promoter.lastName }}</span>
                </div>
                <div class="info-item">
                  <label>Email</label>
                  <span>{{ promoter.email || 'N/A' }}</span>
                </div>
                <div class="info-item">
                  <label>Phone</label>
                  <span>{{ promoter.phone || 'N/A' }}</span>
                </div>
                <div class="info-item">
                  <label>Gender</label>
                  <span>{{ formatGender(promoter.gender) }}</span>
                </div>
                <div class="info-item">
                  <label>Date of Birth</label>
                  <span>{{ formatDate(promoter.dateOfBirth) }}</span>
                </div>
                <div class="info-item">
                  <label>Height</label>
                  <span>{{ promoter.height || 'N/A' }}</span>
                </div>
              </div>
            </template>
          </Card>

          <!-- Contact & Location -->
          <Card class="info-card">
            <template #header>
              <div class="card-header">
                <i class="pi pi-map-marker card-icon"></i>
                <h3>Contact & Location</h3>
              </div>
            </template>
            <template #content>
              <div class="info-grid-content">
                <div class="info-item">
                  <label>City</label>
                  <span>{{ promoter.city || 'N/A' }}</span>
                </div>
                <div class="info-item">
                  <label>Address</label>
                  <span>{{ promoter.address || 'N/A' }}</span>
                </div>
                <div class="info-item">
                  <label>Emergency Contact</label>
                  <span>{{ promoter.emergencyContact || 'N/A' }}</span>
                </div>
                <div class="info-item">
                  <label>Emergency Contact Name</label>
                  <span>{{ promoter.emergencyContactName || 'N/A' }}</span>
                </div>
              </div>
            </template>
          </Card>

          <!-- Professional Info -->
          <Card class="info-card">
            <template #header>
              <div class="card-header">
                <i class="pi pi-briefcase card-icon"></i>
                <h3>Professional Information</h3>
              </div>
            </template>
            <template #content>
              <div class="info-grid-content">
                <div class="info-item">
                  <label>Experience</label>
                  <span>{{ promoter.experienceYears || 0 }} years</span>
                </div>
                <div class="info-item">
                  <label>Education</label>
                  <span>{{ formatEducation(promoter.education) }}</span>
                </div>
                <div class="info-item">
                  <label>Languages</label>
                  <span>{{ formatLanguages(promoter.languages) }}</span>
                </div>
                <div class="info-item full-width">
                  <label>Skills</label>
                  <span>{{ promoter.skills || 'N/A' }}</span>
                </div>
              </div>
            </template>
          </Card>

          <!-- Account Status -->
          <Card class="info-card">
            <template #header>
              <div class="card-header">
                <i class="pi pi-shield card-icon"></i>
                <h3>Account Status</h3>
              </div>
            </template>
            <template #content>
              <div class="info-grid-content">
                <div class="info-item">
                  <label>Status</label>
                  <Tag
                    :value="promoter.isActive ? 'Active' : 'Inactive'"
                    :severity="promoter.isActive ? 'success' : 'secondary'"
                  />
                </div>
                <div class="info-item">
                  <label>Available for Assignment</label>
                  <Tag
                    :value="promoter.availableForAssignment ? 'Yes' : 'No'"
                    :severity="promoter.availableForAssignment ? 'success' : 'warning'"
                  />
                </div>
                <div class="info-item">
                  <label>Date Created</label>
                  <span>{{ formatDate(promoter.dateCreated) }}</span>
                </div>
                <div class="info-item">
                  <label>Last Updated</label>
                  <span>{{ formatDate(promoter.lastUpdated) }}</span>
                </div>
              </div>
            </template>
          </Card>

          <!-- Bio -->
          <Card v-if="promoter.bio" class="info-card full-width">
            <template #header>
              <div class="card-header">
                <i class="pi pi-file-edit card-icon"></i>
                <h3>Bio</h3>
              </div>
            </template>
            <template #content>
              <p class="bio-text">{{ promoter.bio }}</p>
            </template>
          </Card>

          <!-- Promoter Images -->
          <Card class="info-card full-width">
            <template #header>
              <div class="card-header">
                <i class="pi pi-images card-icon"></i>
                <h3>Promoter Images</h3>
                <div class="card-header-actions">
                  <Button
                    v-if="promoterImages.length > 0"
                    @click="refreshImages"
                    icon="pi pi-refresh"
                    class="p-button-text p-button-sm"
                    v-tooltip="'Refresh Images'"
                    :loading="loading"
                  />
                </div>
              </div>
            </template>
            <template #content>
              <ImageGallery :images="promoterImages" :columns="4" />
            </template>
          </Card>
        </div>
      </div>
    </div>

    <!-- Profile Picture Viewer Dialog -->
    <Dialog 
      v-model:visible="showProfilePictureViewer" 
      modal 
      :header="`${promoter?.firstName} ${promoter?.lastName} - Profile Picture`"
      :style="{ width: '80vw', maxWidth: '800px' }"
      :maximizable="true"
      class="profile-picture-dialog"
    >
      <div v-if="promoter" class="profile-picture-viewer">
        <img 
          :src="getProfilePictureUrl(promoter)" 
          :alt="`${promoter.firstName} ${promoter.lastName} Profile Picture`"
          class="profile-viewer-image"
        />
      </div>
    </Dialog>
  </DashboardLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { promoterService } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import DashboardLayout from '@/components/general/DashboardLayout.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import ImageGallery from '@/components/ui/ImageGallery.vue'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const authStore = useAuthStore()

// State
const loading = ref(true)
const saving = ref(false)
const error = ref(null)
const promoter = ref(null)
const promoterImages = ref([])
const showProfilePictureViewer = ref(false)

// Header actions
const headerActions = computed(() => [
  {
    key: 'edit',
    label: 'Edit Promoter',
    icon: 'pi pi-pencil',
    class: 'p-button-success',
    handler: () => router.push(`/promoters/${route.params.id}/edit`)
  },
  {
    key: 'back',
    label: 'Back to Promoters',
    icon: 'pi pi-arrow-left',
    class: 'p-button-outlined',
    handler: () => router.push('/promoters')
  }
])

// Load promoter data
const loadPromoter = async () => {
  try {
    loading.value = true
    error.value = null
    const promoterId = route.params.id

    console.log('Loading promoter with ID:', promoterId)

    // Load promoter from API
    promoter.value = await promoterService.getPromoter(promoterId, authStore.userId)
    
    console.log('Promoter loaded successfully:', promoter.value)
    
    // Load promoter images
    await loadPromoterImages(promoterId)
    
  } catch (err) {
    error.value = err.message || 'Failed to load promoter data'
    console.error('Error loading promoter:', err)
    console.error('Error details:', {
      message: err.message,
      status: err.status,
      response: err.response
    })
  } finally {
    loading.value = false
  }
}

// Utility functions
const formatGender = (gender) => {
  const genderMap = {
    'MALE': 'Male',
    'FEMALE': 'Female',
    'OTHER': 'Other',
    'NOT_SPECIFIED': 'Prefer not to say'
  }
  return genderMap[gender] || 'N/A'
}

const formatEducation = (education) => {
  const educationMap = {
    'PRIMARY': 'Primary Education',
    'SECONDARY': 'Secondary Education (O-Level)',
    'ADVANCED': 'Advanced Level (A-Level)',
    'CERTIFICATE': 'Certificate',
    'DIPLOMA': 'Diploma',
    'DEGREE': 'Degree',
    'POSTGRADUATE': 'Post Graduate'
  }
  return educationMap[education] || 'N/A'
}

const formatLanguages = (languages) => {
  if (!languages || !Array.isArray(languages) || languages.length === 0) {
    return 'N/A'
  }
  return languages.join(', ')
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch (error) {
    return 'Invalid Date'
  }
}

const handleEmptyStateAction = (action) => {
  if (action === 'back') {
    router.push('/promoters')
  }
}

// Load promoter images
const loadPromoterImages = async (promoterId) => {
  try {
    const { fileService } = await import('@/services/api')
    const response = await fileService.getFilesByEntity('PROMOTER', promoterId)
    
    // Filter for image files only
    const imageFiles = (response || []).filter(file => {
      const mimeType = file.mimeType || file.contentType || ''
      return mimeType.startsWith('image/') || 
             /\.(jpg|jpeg|png|gif|webp)$/i.test(file.fileName || file.name || '')
    })
    
    // Transform images to include S3 URLs
    const s3BucketUrl = import.meta.env.VITE_AWS_S3_BUCKET || 'https://client-activation-tracker.s3.af-south-1.amazonaws.com/'
    
    const images = imageFiles.map(file => {
      let imageUrl = file.downloadUrl || file.url || file.filePath || `/api/files/${file.id}/download`
      
      // Convert API URLs to S3 URLs
      if (imageUrl.startsWith('/api/files/download/')) {
        // Extract filename from API URL like /api/files/download/promoter/filename.png
        const parts = imageUrl.split('/')
        const filename = parts[parts.length - 1]
        const folder = parts[parts.length - 2] || 'promoter'
        imageUrl = `${s3BucketUrl}${folder}/${filename}`
      } else if (!imageUrl.startsWith('http') && !imageUrl.startsWith('/api/')) {
        // If it's a relative path, prepend S3 bucket URL
        imageUrl = s3BucketUrl + (imageUrl.startsWith('/') ? imageUrl.substring(1) : imageUrl)
      }
      
      return {
        ...file,
        url: imageUrl,
        thumbnailUrl: imageUrl, // Use same URL for thumbnail
        src: imageUrl, // Some gallery components expect 'src'
        alt: file.description || file.fileName || file.name || 'Promoter image'
      }
    })
    
    promoterImages.value = images
    console.log('Loaded promoter images with S3 URLs:', images.length)
  } catch (error) {
    console.error('Error loading promoter images:', error)
    promoterImages.value = []
  }
}

// Refresh images
const refreshImages = async () => {
  if (!promoter.value?.id) return
  
  try {
    loading.value = true
    await loadPromoterImages(promoter.value.id)
    toast.add({
      severity: 'success',
      summary: 'Images Refreshed',
      detail: 'Promoter images have been refreshed',
      life: 3000
    })
  } catch (error) {
    console.error('Error refreshing images:', error)
    toast.add({
      severity: 'error',
      summary: 'Refresh Failed',
      detail: 'Failed to refresh promoter images',
      life: 3000
    })
  } finally {
    loading.value = false
  }
}

// Profile picture functions
const getProfilePictureUrl = (promoter) => {
  if (!promoter) return null
  
  const profilePath = promoter.profileImagePath || promoter.profilePictureUrl
  if (!profilePath) return null
  
  // If it's a full URL, return as is
  if (profilePath.startsWith('http')) return profilePath
  
  // Otherwise, construct the API URL
  return `${import.meta.env.VITE_API_BASE_URL}/files${profilePath}`
}

const viewProfilePicture = () => {
  const profileUrl = getProfilePictureUrl(promoter.value)
  if (profileUrl) {
    showProfilePictureViewer.value = true
  }
}

const handleProfilePictureError = (event) => {
  // Handle broken profile picture
  event.target.style.display = 'none'
  event.target.parentElement.innerHTML = `
    <div class="profile-picture-placeholder">
      <i class="pi pi-user placeholder-icon"></i>
    </div>
    <p class="no-picture-text">Profile picture unavailable</p>
  `
}

onMounted(() => {
  loadPromoter()
})
</script>

<style scoped>
.promoter-details-page {
  padding: 1.5rem;
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
}

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  text-align: center;
}

.promoter-content {
  max-width: 1200px;
  margin: 0 auto;
}

.profile-picture-card {
  margin-top: 1.5rem;
  margin-bottom: 1.5rem;
}

.profile-picture-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}

.profile-picture-display {
  position: relative;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.profile-picture-display:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

.profile-picture-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.profile-picture-overlay {
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
  border-radius: 50%;
}

.profile-picture-display:hover .profile-picture-overlay {
  opacity: 1;
}

.no-profile-picture {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.profile-picture-placeholder {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed #d1d5db;
}

.placeholder-icon {
  font-size: 4rem;
  color: #9ca3af;
}

.no-picture-text {
  margin: 0;
  color: #6b7280;
  font-size: 0.875rem;
  text-align: center;
}

.profile-picture-viewer {
  text-align: center;
}

.profile-viewer-image {
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
  border-radius: 8px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.info-card {
  height: fit-content;
}

.info-card.full-width {
  grid-column: 1 / -1;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.card-header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.card-icon {
  color: #3b82f6;
  font-size: 1.25rem;
}

.card-header h3 {
  margin: 0;
  color: #1f2937;
  font-size: 1.125rem;
  font-weight: 600;
  flex: 1;
}

.info-grid-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  padding: 1.5rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-item.full-width {
  grid-column: 1 / -1;
}

.info-item label {
  font-weight: 600;
  color: #6b7280;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.info-item span {
  color: #1f2937;
  font-size: 0.875rem;
  word-break: break-word;
}

.bio-text {
  color: #374151;
  line-height: 1.6;
  margin: 0;
  padding: 1.5rem;
  white-space: pre-wrap;
}

@media (max-width: 768px) {
  .promoter-details-page {
    padding: 1rem;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .info-grid-content {
    grid-template-columns: 1fr;
    padding: 1rem;
  }
  
  .card-header {
    padding: 1rem;
  }
  
  .bio-text {
    padding: 1rem;
  }
  
  .profile-picture-display,
  .profile-picture-placeholder {
    width: 150px;
    height: 150px;
  }
  
  .profile-picture-container {
    padding: 1rem;
  }
  
  .placeholder-icon {
    font-size: 3rem;
  }
}

@media (max-width: 480px) {
  .promoter-details-page {
    padding: 0.75rem;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>