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
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { promoterService } from '@/services/api'
import DashboardLayout from '@/components/general/DashboardLayout.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import EmptyState from '@/components/ui/EmptyState.vue'

const route = useRoute()
const router = useRouter()
const toast = useToast()

// State
const loading = ref(true)
const saving = ref(false)
const error = ref(null)
const promoter = ref(null)

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
    promoter.value = await promoterService.getPromoter(promoterId)
    
    console.log('Promoter loaded successfully:', promoter.value)
    
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
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
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