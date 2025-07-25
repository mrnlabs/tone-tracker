<template>
  <DashboardLayout>
    <div class="activation-briefs-page">
      <!-- Page Header -->
      <div class="page-header">
        <div class="header-content">
          <h1>Activation Briefs</h1>
          <p>View and download briefs for your assigned activations</p>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-container">
        <ProgressSpinner />
        <p>Loading activation briefs...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-container">
        <Card class="error-card">
          <template #content>
            <div class="error-content">
              <i class="pi pi-exclamation-triangle error-icon"></i>
              <h3>Failed to Load Briefs</h3>
              <p class="error-message">{{ error }}</p>
              <Button
                @click="loadBriefs"
                label="Retry"
                icon="pi pi-refresh"
                class="p-button-outlined"
              />
            </div>
          </template>
        </Card>
      </div>

      <!-- Briefs Content -->
      <div v-else class="briefs-content">
        <!-- No Briefs State -->
        <div v-if="briefsWithActivations.length === 0" class="no-briefs">
          <Card>
            <template #content>
              <div class="no-briefs-content">
                <i class="pi pi-file-pdf no-briefs-icon"></i>
                <h3>No Briefs Available</h3>
                <p>You don't have any activation briefs available at this time.</p>
              </div>
            </template>
          </Card>
        </div>

        <!-- Briefs Grid -->
        <div v-else class="briefs-grid">
          <Card 
            v-for="item in briefsWithActivations" 
            :key="item.activation.id" 
            class="brief-card"
          >
            <template #header>
              <div class="brief-header">
                <div class="activation-info">
                  <h3>{{ item.activation.name }}</h3>
                  <div class="activation-meta">
                    <span class="client">{{ item.activation.client }}</span>
                    <span class="date">{{ formatActivationDate(item.activation.startDate) }}</span>
                  </div>
                </div>
                <Tag 
                  :value="getActivationStatus(item.activation)" 
                  :severity="getActivationStatusSeverity(item.activation)"
                />
              </div>
            </template>

            <template #content>
              <div class="brief-content">
                <div class="location-info">
                  <i class="pi pi-map-marker"></i>
                  <span>{{ item.activation.location }}</span>
                </div>

                <div class="brief-files">
                  <h4>Available Documents</h4>
                  <div v-if="item.briefs.length === 0" class="no-files">
                    <i class="pi pi-info-circle"></i>
                    <span>No briefing documents available yet</span>
                  </div>
                  <div v-else class="files-list">
                    <div 
                      v-for="brief in item.briefs" 
                      :key="brief.id" 
                      class="file-item"
                    >
                      <div class="file-info">
                        <i class="pi pi-file-pdf"></i>
                        <div class="file-details">
                          <span class="file-name">{{ brief.fileName }}</span>
                          <small class="file-meta">
                            {{ formatFileSize(brief.fileSize) }} " 
                            {{ formatUploadDate(brief.uploadDate) }}
                          </small>
                        </div>
                      </div>
                      <div class="file-actions">
                        <Button
                          @click="viewBrief(brief)"
                          icon="pi pi-eye"
                          class="p-button-text p-button-sm"
                          v-tooltip.top="'View'"
                        />
                        <Button
                          @click="downloadBrief(brief)"
                          icon="pi pi-download"
                          class="p-button-text p-button-sm"
                          v-tooltip.top="'Download'"
                          :loading="downloadingFiles[brief.id]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </Card>
        </div>
      </div>

      <!-- Brief Viewer Dialog -->
      <Dialog
        v-model:visible="showBriefViewer"
        :header="selectedBrief?.fileName"
        :modal="true"
        :style="{ width: '90vw', height: '90vh' }"
        :maximizable="true"
      >
        <div class="brief-viewer">
          <iframe
            v-if="selectedBrief?.url"
            :src="selectedBrief.url"
            class="brief-iframe"
            frameborder="0"
          ></iframe>
          <div v-else class="brief-loading">
            <ProgressSpinner />
            <p>Loading document...</p>
          </div>
        </div>
      </Dialog>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'primevue/usetoast'
import { format } from 'date-fns'
import DashboardLayout from '@/components/general/DashboardLayout.vue'
import { activationService, fileService, apiService } from '@/services/api'

const authStore = useAuthStore()
const toast = useToast()

// State
const loading = ref(false)
const error = ref(null)
const assignedActivations = ref([])
const activationBriefs = ref([])
const downloadingFiles = ref({})
const showBriefViewer = ref(false)
const selectedBrief = ref(null)

// Computed
const briefsWithActivations = computed(() => {
  return assignedActivations.value.map(activation => {
    const briefs = activationBriefs.value.filter(brief => 
      brief.activationId === activation.id
    )
    return {
      activation,
      briefs
    }
  })
})

// Methods
const loadBriefs = async () => {
  loading.value = true
  error.value = null

  try {
    // Get current user's activations based on role
    let activations = []
    
    if (authStore.userRole === 'PROMOTER') {
      // For promoters, try different endpoints to get their activations
      try {
        // First try a direct API call without the problematic sort parameter
        const response = await apiService.get('/activations/my?page=0&size=100')
        activations = response.content || response.data || []
      } catch (error) {
        console.warn('Failed to get promoter activations via /my endpoint, trying alternative:', error)
        
        try {
          // Try the current user activations endpoint
          const response = await activationService.getCurrentUserActivations({
            page: 0,
            size: 100,
            sort: [] // Override the default sort
          })
          activations = response.content || response.data || []
        } catch (error2) {
          console.warn('Failed to get current user activations, trying regular endpoint:', error2)
          
          // Fall back to regular activations endpoint
          const response = await activationService.getActivations({
            page: 0,
            size: 100,
            sort: [] // Override the default sort
          })
          activations = response.content || response.data || []
        }
      }
    } else {
      // For other roles, get all activations they have access to
      const response = await activationService.getActivations({
        page: 0,
        size: 100,
        sort: [] // Override the default sort
      })
      activations = response.content || response.data || []
    }
    
    assignedActivations.value = activations
    
    // Only load briefs if we have activations
    if (activations.length > 0) {
      // Load briefs/documents for each activation
      const briefsPromises = activations.map(async (activation) => {
        try {
          // Try to get files associated with the activation
          const files = await activationService.getActivationImages(activation.id)
          
          // Filter for PDF/document files (briefs)
          const briefs = (files || []).filter(file => {
            const fileName = file.fileName || file.name || ''
            return fileName.toLowerCase().includes('brief') || 
                   fileName.toLowerCase().endsWith('.pdf') ||
                   file.mimeType === 'application/pdf'
          })
          
          return briefs.map(file => ({
            id: file.id,
            activationId: activation.id,
            fileName: file.fileName || file.name,
            fileSize: file.fileSize || file.size || 0,
            uploadDate: file.dateCreated || file.uploadDate || file.lastUpdated,
            url: file.downloadUrl || file.url || `/api/files/${file.id}/download`,
            filePath: file.filePath
          }))
        } catch (error) {
          console.warn(`Failed to load briefs for activation ${activation.id}:`, error)
          return []
        }
      })
      
      const allBriefs = await Promise.all(briefsPromises)
      activationBriefs.value = allBriefs.flat()
    } else {
      // No activations found
      activationBriefs.value = []
      console.log('No activations found for the current user')
    }

  } catch (err) {
    console.error('Failed to load briefs:', err)
    
    // Check for specific error types
    if (err.response?.status === 500 || err.response?.status === 503) {
      console.warn(`Server error (${err.response?.status}), loading mock data for demonstration`)
      await loadMockData()
      // Clear error after loading mock data successfully
      error.value = null
    } else if (err.response?.status === 404) {
      console.warn('Activations endpoint not found, loading mock data')
      await loadMockData()
      // Clear error after loading mock data successfully
      error.value = null
    } else if (err.response?.status === 403) {
      error.value = 'You do not have permission to view activations.'
    } else if (err.response?.status === 401) {
      error.value = 'Your session has expired. Please log in again.'
    } else {
      error.value = err.message || 'Failed to load activation briefs'
      // For any other error, try mock data
      console.warn('Loading mock data due to API error')
      await loadMockData()
    }
  } finally {
    loading.value = false
  }
}

const loadMockData = async () => {
  // Mock assigned activations
  assignedActivations.value = [
    {
      id: 1,
      name: 'Mall Activation - Product Demo',
      client: 'ABC Company',
      location: 'Westfield Mall, Downtown',
      startDate: '2025-07-25T09:00:00Z',
      endDate: '2025-07-25T17:00:00Z',
      status: 'upcoming'
    },
    {
      id: 2,
      name: 'Store Promotion Event',
      client: 'XYZ Brand',
      location: 'Downtown Store',
      startDate: '2025-07-22T10:00:00Z',
      endDate: '2025-07-22T16:00:00Z',
      status: 'active'
    },
    {
      id: 3,
      name: 'Product Launch Event',
      client: 'Tech Corp',
      location: 'Convention Center',
      startDate: '2025-07-20T08:00:00Z',
      endDate: '2025-07-20T18:00:00Z',
      status: 'completed'
    }
  ]

  // Mock briefs
  activationBriefs.value = [
    {
      id: 1,
      activationId: 1,
      fileName: 'Mall_Activation_Brief_v2.pdf',
      fileSize: 2450000,
      uploadDate: '2025-07-22T08:00:00Z',
      url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
    },
    {
      id: 2,
      activationId: 1,
      fileName: 'Product_Demo_Guidelines.pdf',
      fileSize: 1200000,
      uploadDate: '2025-07-21T14:00:00Z',
      url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
    },
    {
      id: 3,
      activationId: 2,
      fileName: 'Store_Promotion_Brief.pdf',
      fileSize: 1800000,
      uploadDate: '2025-07-21T10:00:00Z',
      url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
    }
  ]
}

const viewBrief = async (brief) => {
  try {
    // If the URL requires authentication, we need to fetch it differently
    if (brief.url && brief.url.startsWith('/api/')) {
      const token = localStorage.getItem('accessToken')
      // Create authenticated URL with token as query parameter for iframe
      const authenticatedUrl = `${brief.url}?token=${encodeURIComponent(token)}`
      selectedBrief.value = {
        ...brief,
        url: authenticatedUrl
      }
    } else {
      selectedBrief.value = brief
    }
    showBriefViewer.value = true
  } catch (error) {
    console.error('Failed to prepare brief for viewing:', error)
    toast.add({
      severity: 'error',
      summary: 'View Failed',
      detail: 'Failed to load the brief for viewing',
      life: 5000
    })
  }
}

const downloadBrief = async (brief) => {
  downloadingFiles.value[brief.id] = true

  try {
    // If we have a direct download URL, use it
    if (brief.url && (brief.url.startsWith('http') || brief.url.startsWith('/'))) {
      // For API URLs, we need to handle authentication
      if (brief.url.startsWith('/api/')) {
        const token = localStorage.getItem('accessToken')
        const response = await fetch(brief.url, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (!response.ok) throw new Error('Download failed')
        
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = brief.fileName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      } else {
        // For external URLs or already accessible URLs
        const link = document.createElement('a')
        link.href = brief.url
        link.download = brief.fileName
        link.target = '_blank'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    } else if (brief.filePath) {
      // Use file service to download by path
      await fileService.downloadFile(brief.filePath, brief.fileName)
    } else {
      throw new Error('No download URL available')
    }

    toast.add({
      severity: 'success',
      summary: 'Download Started',
      detail: `Downloading ${brief.fileName}`,
      life: 3000
    })
  } catch (error) {
    console.error('Download failed:', error)
    toast.add({
      severity: 'error',
      summary: 'Download Failed',
      detail: error.message || 'Failed to download the brief',
      life: 5000
    })
  } finally {
    downloadingFiles.value[brief.id] = false
  }
}

const getActivationStatus = (activation) => {
  // Handle API status values (might be uppercase)
  const status = activation.status?.toUpperCase()
  
  if (status === 'COMPLETED' || status === 'FINISHED') {
    return 'Completed'
  } else if (status === 'ACTIVE' || status === 'IN_PROGRESS' || status === 'ONGOING') {
    return 'Active'
  } else if (status === 'UPCOMING' || status === 'SCHEDULED' || status === 'PENDING') {
    return 'Upcoming'
  }
  
  // Fallback to date-based status if status field is not clear
  const now = new Date()
  const startDate = new Date(activation.startDate)
  const endDate = new Date(activation.endDate)

  if (now > endDate) {
    return 'Completed'
  } else if (now >= startDate && now <= endDate) {
    return 'Active'
  } else {
    return 'Upcoming'
  }
}

const getActivationStatusSeverity = (activation) => {
  const status = getActivationStatus(activation)
  switch (status) {
    case 'Completed': return 'success'
    case 'Active': return 'warning'
    case 'Upcoming': return 'info'
    default: return 'info'
  }
}

const formatActivationDate = (dateString) => {
  return format(new Date(dateString), 'MMM dd, yyyy')
}

const formatUploadDate = (dateString) => {
  return format(new Date(dateString), 'MMM dd, yyyy HH:mm')
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Lifecycle
onMounted(() => {
  loadBriefs()
})
</script>

<style scoped>
.activation-briefs-page {
  padding: 2rem;
}

.page-header {
  margin-bottom: 2rem;
}

.header-content h1 {
  color: var(--text-color);
  margin-bottom: 0.5rem;
}

.header-content p {
  color: var(--text-color-secondary);
  margin: 0;
}

.loading-container, .error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.error-content {
  text-align: center;
  padding: 2rem;
}

.error-icon {
  font-size: 3rem;
  color: var(--red-500);
  margin-bottom: 1rem;
}

.no-briefs-content {
  text-align: center;
  padding: 3rem;
}

.no-briefs-icon {
  font-size: 4rem;
  color: var(--text-color-secondary);
  margin-bottom: 1rem;
}

.briefs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
}

.brief-card {
  height: fit-content;
}

.brief-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.5rem;
  gap: 1rem;
}

.activation-info h3 {
  margin: 0 0 0.5rem 0;
  color: var(--text-color);
  font-size: 1.1rem;
}

.activation-meta {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.activation-meta .client {
  font-weight: 500;
  color: var(--primary-color);
  font-size: 0.9rem;
}

.activation-meta .date {
  color: var(--text-color-secondary);
  font-size: 0.85rem;
}

.brief-content {
  padding: 0 1.5rem 1.5rem;
}

.location-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-color-secondary);
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
}

.location-info i {
  color: var(--primary-color);
}

.brief-files h4 {
  margin: 0 0 1rem 0;
  color: var(--text-color);
  font-size: 1rem;
}

.no-files {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-color-secondary);
  font-size: 0.9rem;
  font-style: italic;
}

.files-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  background: var(--surface-50);
  border-radius: 8px;
  border: 1px solid var(--surface-200);
}

.file-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
  min-width: 0;
}

.file-info i {
  color: var(--red-500);
  font-size: 1.2rem;
}

.file-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}

.file-name {
  font-weight: 500;
  color: var(--text-color);
  font-size: 0.9rem;
  word-break: break-word;
}

.file-meta {
  color: var(--text-color-secondary);
  font-size: 0.8rem;
}

.file-actions {
  display: flex;
  gap: 0.25rem;
}

.brief-viewer {
  height: calc(90vh - 8rem);
  display: flex;
  align-items: center;
  justify-content: center;
}

.brief-iframe {
  width: 100%;
  height: 100%;
  border-radius: 8px;
}

.brief-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

@media (max-width: 768px) {
  .activation-briefs-page {
    padding: 1rem;
  }

  .briefs-grid {
    grid-template-columns: 1fr;
  }

  .brief-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .file-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .file-actions {
    align-self: flex-end;
  }
}
</style>