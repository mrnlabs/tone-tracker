<template>
  <DashboardLayout>
    <div class="edit-promoter-page">
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

      <!-- Edit Form -->
      <div v-else-if="promoter" class="edit-content">
        <!-- Page Header -->
        <PageHeader 
          :title="`Edit ${promoter.firstName} ${promoter.lastName}`"
          description="Update promoter information and settings"
          :actions="headerActions"
          :loading="saving"
        />

        <!-- Promoter Form -->
        <Card class="promoter-form-card">
          <template #content>
            <form @submit.prevent="handleSubmit" class="promoter-form">
              <!-- Personal Information -->
              <div class="form-section">
                <h3 class="section-title">Personal Information</h3>
                
                <div class="form-grid">
                  <div class="field">
                    <label for="firstName" class="required">First Name</label>
                    <InputText
                      id="firstName"
                      v-model="formData.firstName"
                      :class="{ 'p-invalid': errors.firstName }"
                      placeholder="Enter first name"
                      @blur="validateField('firstName')"
                    />
                    <small v-if="errors.firstName" class="p-error">{{ errors.firstName }}</small>
                  </div>

                  <div class="field">
                    <label for="lastName" class="required">Last Name</label>
                    <InputText
                      id="lastName"
                      v-model="formData.lastName"
                      :class="{ 'p-invalid': errors.lastName }"
                      placeholder="Enter last name"
                      @blur="validateField('lastName')"
                    />
                    <small v-if="errors.lastName" class="p-error">{{ errors.lastName }}</small>
                  </div>

                  <div class="field">
                    <label for="email" class="required">Email Address</label>
                    <InputText
                      id="email"
                      v-model="formData.email"
                      :class="{ 'p-invalid': errors.email }"
                      placeholder="Enter email address"
                      type="email"
                      @blur="validateField('email')"
                    />
                    <small v-if="errors.email" class="p-error">{{ errors.email }}</small>
                  </div>

                  <div class="field">
                    <label for="phone" class="required">Phone Number</label>
                    <InputText
                      id="phone"
                      v-model="formData.phone"
                      :class="{ 'p-invalid': errors.phone }"
                      placeholder="e.g., +263 772 999 9999, +263 650 987 726, or 072 999 9999"
                      @blur="validateField('phone')"
                    />
                    <small v-if="errors.phone" class="p-error">{{ errors.phone }}</small>
                    <small v-else class="field-help">Formats: +263 7XX XXX XXXX or +263 6XX XXX XXXX (international), 07X XXX XXXX or 06X XXX XXXX (local)</small>
                  </div>

                  <div class="field">
                    <label for="dateOfBirth">Date of Birth</label>
                    <Calendar
                      id="dateOfBirth"
                      v-model="formData.dateOfBirth"
                      placeholder="Select date of birth"
                      :maxDate="maxDate"
                      dateFormat="dd/mm/yy"
                      showIcon
                    />
                  </div>

                  <div class="field">
                    <label for="gender">Gender</label>
                    <Dropdown
                      id="gender"
                      v-model="formData.gender"
                      :options="genderOptions"
                      optionLabel="label"
                      optionValue="value"
                      placeholder="Select gender"
                      showClear
                    />
                  </div>
                </div>
              </div>

              <!-- Profile Picture -->
              <div class="form-section">
                <h3 class="section-title">Profile Picture</h3>
                <p class="section-description">Upload a profile picture for the promoter</p>
                
                <div class="form-grid">
                  <!-- Current Profile Picture Display -->
                  <div v-if="currentProfilePictureUrl" class="field full-width">
                    <label>Current Profile Picture</label>
                    <div class="current-profile-picture">
                      <div class="profile-picture-display">
                        <img 
                          :src="currentProfilePictureUrl" 
                          :alt="`${formData.firstName} ${formData.lastName} Profile Picture`"
                          class="profile-picture-preview"
                          @click="viewCurrentProfilePicture"
                          @error="handleProfilePictureError"
                        />
                        <div class="profile-picture-overlay" @click="viewCurrentProfilePicture">
                          <Button
                            icon="pi pi-eye"
                            class="p-button-rounded p-button-outlined"
                            v-tooltip="'View Current Picture'"
                          />
                        </div>
                      </div>
                      <Button
                        @click="removeCurrentProfilePicture"
                        label="Remove Current Picture"
                        icon="pi pi-trash"
                        class="p-button-outlined p-button-danger p-button-sm"
                        style="margin-top: 1rem;"
                      />
                    </div>
                  </div>

                  <!-- Profile Picture Upload -->
                  <div class="field full-width">
                    <FileUpload
                      ref="profilePictureUpload"
                      mode="basic"
                      :auto="false"
                      accept="image/*"
                      :maxFileSize="5000000"
                      chooseLabel="Choose Profile Picture"
                      class="profile-picture-upload"
                      @select="handleProfilePictureSelect"
                    />
                    <small class="field-help">Recommended: Square image, minimum 200x200px, maximum 5MB</small>
                  </div>

                  <!-- New Profile Picture Preview -->
                  <div v-if="newProfilePicturePreview" class="field full-width">
                    <label>New Profile Picture Preview</label>
                    <div class="new-profile-picture-preview">
                      <div class="profile-picture-display">
                        <img 
                          :src="newProfilePicturePreview" 
                          alt="New Profile Picture Preview"
                          class="profile-picture-preview"
                          @click="viewNewProfilePicture"
                        />
                        <div class="profile-picture-overlay" @click="viewNewProfilePicture">
                          <Button
                            icon="pi pi-eye"
                            class="p-button-rounded p-button-outlined"
                            v-tooltip="'View New Picture'"
                          />
                        </div>
                      </div>
                      <Button
                        @click="clearNewProfilePicture"
                        label="Clear New Picture"
                        icon="pi pi-times"
                        class="p-button-outlined p-button-secondary p-button-sm"
                        style="margin-top: 1rem;"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Contact & Location -->
              <div class="form-section">
                <h3 class="section-title">Contact & Location</h3>
                
                <div class="form-grid">
                  <div class="field">
                    <label for="address">Address</label>
                    <Textarea
                      id="address"
                      v-model="formData.address"
                      placeholder="Enter home address"
                      rows="2"
                      autoResize
                    />
                  </div>

                  <div class="field">
                    <label for="city">City</label>
                    <Dropdown
                      id="city"
                      v-model="formData.city"
                      :options="cityOptions"
                      optionLabel="label"
                      optionValue="value"
                      placeholder="Select city"
                      showClear
                    />
                  </div>

                  <div class="field">
                    <label for="emergencyContact">Emergency Contact</label>
                    <InputText
                      id="emergencyContact"
                      v-model="formData.emergencyContact"
                      placeholder="Emergency contact number"
                    />
                  </div>

                  <div class="field">
                    <label for="emergencyContactName">Emergency Contact Name</label>
                    <InputText
                      id="emergencyContactName"
                      v-model="formData.emergencyContactName"
                      placeholder="Emergency contact person name"
                    />
                  </div>
                </div>
              </div>

              <!-- Professional Information -->
              <div class="form-section">
                <h3 class="section-title">Professional Information</h3>
                
                <div class="form-grid">
                  <div class="field">
                    <label for="experienceYears">Years of Experience</label>
                    <InputNumber
                      id="experienceYears"
                      v-model="formData.experienceYears"
                      placeholder="Years of field experience"
                      :min="0"
                      :max="50"
                    />
                  </div>

                  <div class="field">
                    <label for="education">Education Level</label>
                    <Dropdown
                      id="education"
                      v-model="formData.education"
                      :options="educationOptions"
                      optionLabel="label"
                      optionValue="value"
                      placeholder="Select education level"
                      showClear
                    />
                  </div>

                  <div class="field">
                    <label for="languages">Languages Spoken</label>
                    <MultiSelect
                      id="languages"
                      v-model="formData.languages"
                      :options="languageOptions"
                      optionLabel="label"
                      optionValue="value"
                      placeholder="Select languages"
                      display="chip"
                    />
                  </div>

                  <div class="field">
                    <label for="skills">Skills & Specializations</label>
                    <Textarea
                      id="skills"
                      v-model="formData.skills"
                      placeholder="Describe relevant skills and experience"
                      rows="3"
                      autoResize
                    />
                  </div>
                </div>
              </div>

              <!-- Account Status -->
              <div class="form-section">
                <h3 class="section-title">Account Status</h3>
                
                <div class="form-grid">
                  <div class="field full-width">
                    <div class="checkbox-field">
                      <Checkbox
                        id="isActive"
                        v-model="formData.isActive"
                        :binary="true"
                      />
                      <label for="isActive">Active Account</label>
                    </div>
                    <small class="field-help">Determines if the promoter can log in and be assigned to activations</small>
                  </div>

                  <div class="field full-width">
                    <div class="checkbox-field">
                      <Checkbox
                        id="availableForAssignment"
                        v-model="formData.availableForAssignment"
                        :binary="true"
                      />
                      <label for="availableForAssignment">Available for Assignment</label>
                    </div>
                    <small class="field-help">Indicates if the promoter is currently available for new activation assignments</small>
                  </div>
                </div>
              </div>

              <!-- Form Actions -->
              <div class="form-actions">
                <Button
                  type="button"
                  @click="handleCancel"
                  label="Cancel"
                  icon="pi pi-times"
                  class="p-button-outlined"
                  :disabled="saving"
                />
                <Button
                  type="submit"
                  :label="saving ? 'Updating...' : 'Update Promoter'"
                  icon="pi pi-check"
                  class="p-button-success"
                  :loading="saving"
                  :disabled="!isFormValid"
                />
              </div>
            </form>
          </template>
        </Card>
      </div>
    </div>

    <!-- Profile Picture Viewer Dialog -->
    <Dialog 
      v-model:visible="showProfilePictureViewer" 
      modal 
      :header="viewingProfilePicture?.title || 'Profile Picture'"
      :style="{ width: '80vw', maxWidth: '800px' }"
      :maximizable="true"
      class="profile-picture-dialog"
    >
      <div v-if="viewingProfilePicture" class="profile-picture-viewer">
        <img 
          :src="viewingProfilePicture.url" 
          alt="Profile Picture"
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
import { useValidation } from '@/composables/useValidation'
import { promoterService, fileService } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import DashboardLayout from '@/components/general/DashboardLayout.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import EmptyState from '@/components/ui/EmptyState.vue'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const { validators } = useValidation()
const authStore = useAuthStore()

// State
const loading = ref(true)
const saving = ref(false)
const error = ref(null)
const promoter = ref(null)
const currentProfilePictureUrl = ref(null)
const newProfilePictureFile = ref(null)
const newProfilePicturePreview = ref(null)
const showProfilePictureViewer = ref(false)
const viewingProfilePicture = ref(null)
const profilePictureUpload = ref(null)
const formData = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dateOfBirth: null,
  gender: null,
  address: '',
  city: null,
  emergencyContact: '',
  emergencyContactName: '',
  experienceYears: 0,
  education: null,
  languages: [],
  skills: '',
  isActive: true,
  availableForAssignment: true
})

const errors = ref({})

// Options
const genderOptions = [
  { label: 'Male', value: 'MALE' },
  { label: 'Female', value: 'FEMALE' },
  { label: 'Other', value: 'OTHER' },
  { label: 'Prefer not to say', value: 'NOT_SPECIFIED' }
]

const cityOptions = [
  { label: 'Harare', value: 'Harare' },
  { label: 'Bulawayo', value: 'Bulawayo' },
  { label: 'Chitungwiza', value: 'Chitungwiza' },
  { label: 'Mutare', value: 'Mutare' },
  { label: 'Epworth', value: 'Epworth' },
  { label: 'Gweru', value: 'Gweru' },
  { label: 'Kwekwe', value: 'Kwekwe' },
  { label: 'Kadoma', value: 'Kadoma' },
  { label: 'Masvingo', value: 'Masvingo' },
  { label: 'Chinhoyi', value: 'Chinhoyi' }
]

const educationOptions = [
  { label: 'Primary Education', value: 'PRIMARY' },
  { label: 'Secondary Education (O-Level)', value: 'SECONDARY' },
  { label: 'Advanced Level (A-Level)', value: 'ADVANCED' },
  { label: 'Certificate', value: 'CERTIFICATE' },
  { label: 'Diploma', value: 'DIPLOMA' },
  { label: 'Degree', value: 'DEGREE' },
  { label: 'Post Graduate', value: 'POSTGRADUATE' }
]

const languageOptions = [
  { label: 'English', value: 'English' },
  { label: 'Shona', value: 'Shona' },
  { label: 'Ndebele', value: 'Ndebele' },
  { label: 'Tonga', value: 'Tonga' },
  { label: 'Chewa', value: 'Chewa' },
  { label: 'Chibarwe', value: 'Chibarwe' },
  { label: 'Kalanga', value: 'Kalanga' },
  { label: 'Koisan', value: 'Koisan' },
  { label: 'Nambya', value: 'Nambya' },
  { label: 'Ndau', value: 'Ndau' },
  { label: 'Shangani', value: 'Shangani' },
  { label: 'Sotho', value: 'Sotho' },
  { label: 'Tswana', value: 'Tswana' },
  { label: 'Venda', value: 'Venda' },
  { label: 'Xhosa', value: 'Xhosa' }
]

// Date constraints
const maxDate = computed(() => {
  const today = new Date()
  const eighteenYearsAgo = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate())
  return eighteenYearsAgo
})

// Header actions
const headerActions = computed(() => [
  {
    key: 'cancel',
    label: 'Cancel',
    icon: 'pi pi-times',
    class: 'p-button-outlined',
    handler: handleCancel
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

    // Set current profile picture URL
    if (promoter.value.profileImagePath) {
      currentProfilePictureUrl.value = getProfilePictureUrl(promoter.value.profileImagePath)
    }

    // Populate form with existing data
    formData.value = {
      firstName: promoter.value.firstName || '',
      lastName: promoter.value.lastName || '',
      email: promoter.value.email || '',
      phone: promoter.value.phone || '',
      dateOfBirth: promoter.value.dateOfBirth ? new Date(promoter.value.dateOfBirth) : null,
      gender: promoter.value.gender || null,
      address: promoter.value.address || '',
      city: promoter.value.city || null,
      emergencyContact: promoter.value.emergencyContact || '',
      emergencyContactName: promoter.value.emergencyContactName || '',
      experienceYears: promoter.value.experienceYears || 0,
      education: promoter.value.education || null,
      languages: promoter.value.languages || [],
      skills: promoter.value.skills || '',
      isActive: promoter.value.isActive !== false,
      availableForAssignment: promoter.value.availableForAssignment !== false
    }
    
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

// Validation
const validateField = (fieldName) => {
  const value = formData.value[fieldName]
  
  switch (fieldName) {
    case 'firstName':
    case 'lastName': {
      const result = validators.required(value, `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`)
      if (result !== true) {
        errors.value[fieldName] = result
      } else {
        delete errors.value[fieldName]
      }
      break
    }
    case 'email': {
      const requiredResult = validators.required(value, 'Email is required')
      if (requiredResult !== true) {
        errors.value[fieldName] = requiredResult
      } else {
        const emailResult = validators.email(value)
        if (emailResult !== true) {
          errors.value[fieldName] = emailResult
        } else {
          delete errors.value[fieldName]
        }
      }
      break
    }
    case 'phone': {
      const requiredResult = validators.required(value, 'Phone number is required')
      if (requiredResult !== true) {
        errors.value[fieldName] = requiredResult
      } else {
        const phoneResult = validators.phone(value)
        if (phoneResult !== true) {
          errors.value[fieldName] = phoneResult
        } else {
          delete errors.value[fieldName]
        }
      }
      break
    }
    default:
      delete errors.value[fieldName]
  }
}

const validateForm = () => {
  const fieldsToValidate = ['firstName', 'lastName', 'email', 'phone']
  fieldsToValidate.forEach(validateField)
  
  return Object.keys(errors.value).length === 0
}

const isFormValid = computed(() => {
  const hasRequiredFields = formData.value.firstName?.trim() && 
                           formData.value.lastName?.trim() && 
                           formData.value.email?.trim() && 
                           formData.value.phone?.trim()
  
  const hasNoErrors = Object.keys(errors.value).length === 0
  
  return hasRequiredFields && hasNoErrors
})

// Form handlers
const handleSubmit = async () => {
  if (!validateForm()) {
    toast.add({
      severity: 'error',
      summary: 'Validation Error',
      detail: 'Please fix the errors before submitting',
      life: 5000
    })
    return
  }

  saving.value = true
  try {
    const promoterData = {
      firstName: formData.value.firstName.trim(),
      lastName: formData.value.lastName.trim(),
      email: formData.value.email.trim().toLowerCase(),
      phone: formData.value.phone.trim(),
      dateOfBirth: formData.value.dateOfBirth?.toISOString().split('T')[0] || null,
      gender: formData.value.gender || null,
      address: formData.value.address?.trim() || null,
      city: formData.value.city || null,
      emergencyContact: formData.value.emergencyContact?.trim() || null,
      emergencyContactName: formData.value.emergencyContactName?.trim() || null,
      experienceYears: formData.value.experienceYears || 0,
      education: formData.value.education || null,
      languages: formData.value.languages || [],
      skills: formData.value.skills?.trim() || null,
      isActive: formData.value.isActive,
      availableForAssignment: formData.value.availableForAssignment
    }

    // Handle profile picture upload/removal
    let profilePictureMessage = ''
    if (newProfilePictureFile.value) {
      try {
        const profilePicturePath = await uploadProfilePicture(route.params.id)
        promoterData.profileImagePath = profilePicturePath
        profilePictureMessage = ' and profile picture updated'
      } catch (error) {
        console.error('Profile picture upload failed:', error)
        profilePictureMessage = ' (note: profile picture upload failed)'
      }
    } else if (!currentProfilePictureUrl.value && promoter.value?.profileImagePath) {
      // Profile picture was removed
      promoterData.profileImagePath = null
      profilePictureMessage = ' and profile picture removed'
    }

    await promoterService.updatePromoter(route.params.id, promoterData)
    
    // Show success message
    toast.add({
      severity: 'success',
      summary: 'Promoter Updated Successfully',
      detail: `${promoterData.firstName} ${promoterData.lastName} has been updated successfully${profilePictureMessage}`,
      life: 4000
    })
    
    // Navigate back to promoters list
    router.push('/promoters')
  } catch (error) {
    console.error('Failed to update promoter:', error)
    
    let errorMessage = 'Failed to update promoter'
    if (error.status === 409) {
      errorMessage = 'A promoter with this email already exists'
    } else if (error.status === 422) {
      errorMessage = 'Invalid promoter data provided'
    } else if (error.status === 404) {
      errorMessage = 'Promoter not found'
    } else if (error.message) {
      errorMessage = error.message
    }
    
    toast.add({
      severity: 'error',
      summary: 'Update Failed',
      detail: errorMessage,
      life: 5000
    })
  } finally {
    saving.value = false
  }
}

const handleCancel = () => {
  router.push('/promoters')
}

// Profile picture handling
const getProfilePictureUrl = (profilePath) => {
  if (!profilePath) return null
  
  // If it's a full URL, return as is
  if (profilePath.startsWith('http')) return profilePath
  
  // Otherwise, construct the API URL
  return `${import.meta.env.VITE_API_BASE_URL}/files${profilePath}`
}

const handleProfilePictureSelect = (event) => {
  const file = event.files[0]
  if (!file) return
  
  // Validate file type
  if (!file.type.startsWith('image/')) {
    toast.add({
      severity: 'error',
      summary: 'Invalid File',
      detail: 'Please select an image file',
      life: 3000
    })
    return
  }
  
  // Store the file and create preview
  newProfilePictureFile.value = file
  newProfilePicturePreview.value = URL.createObjectURL(file)
  
  toast.add({
    severity: 'success',
    summary: 'Profile Picture Selected',
    detail: 'Profile picture ready for upload',
    life: 3000
  })
}

const clearNewProfilePicture = () => {
  newProfilePictureFile.value = null
  if (newProfilePicturePreview.value) {
    URL.revokeObjectURL(newProfilePicturePreview.value)
    newProfilePicturePreview.value = null
  }
  
  // Clear the file upload component
  if (profilePictureUpload.value) {
    profilePictureUpload.value.clear()
  }
}

const removeCurrentProfilePicture = async () => {
  try {
    // If there's a profile picture, try to delete it from server
    if (promoter.value?.profileImagePath) {
      // Note: We'll handle deletion on form submit
      currentProfilePictureUrl.value = null
      
      toast.add({
        severity: 'success',
        summary: 'Profile Picture Removed',
        detail: 'Profile picture will be removed when you save changes',
        life: 3000
      })
    }
  } catch (error) {
    console.error('Error removing profile picture:', error)
    toast.add({
      severity: 'error',
      summary: 'Remove Failed',
      detail: 'Failed to remove profile picture',
      life: 3000
    })
  }
}

const viewCurrentProfilePicture = () => {
  if (currentProfilePictureUrl.value) {
    viewingProfilePicture.value = {
      url: currentProfilePictureUrl.value,
      title: 'Current Profile Picture'
    }
    showProfilePictureViewer.value = true
  }
}

const viewNewProfilePicture = () => {
  if (newProfilePicturePreview.value) {
    viewingProfilePicture.value = {
      url: newProfilePicturePreview.value,
      title: 'New Profile Picture Preview'
    }
    showProfilePictureViewer.value = true
  }
}

const handleProfilePictureError = (event) => {
  event.target.style.display = 'none'
  currentProfilePictureUrl.value = null
}

const uploadProfilePicture = async (promoterId) => {
  if (!newProfilePictureFile.value) return null
  
  try {
    const result = await fileService.uploadFile(
      newProfilePictureFile.value,
      null, // No progress callback for now
      {
        entityId: promoterId,
        entityType: 'PROMOTER',
        category: 'profile-picture'
      }
    )
    
    console.log('Profile picture uploaded successfully:', result)
    return result.filePath || result.path || result.url
  } catch (error) {
    console.error('Error uploading profile picture:', error)
    throw error
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
.edit-promoter-page {
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

.promoter-form-card {
  margin-top: 1.5rem;
}

.promoter-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.section-title {
  margin: 0;
  color: #1f2937;
  font-size: 1.25rem;
  font-weight: 600;
  border-bottom: 2px solid #e5e7eb;
  padding-bottom: 0.5rem;
}

.section-description {
  color: #6b7280;
  font-size: 0.875rem;
  margin: 0.5rem 0 0 0;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field.full-width {
  grid-column: 1 / -1;
}

.field label {
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
}

.field label.required::after {
  content: ' *';
  color: #ef4444;
}

.field-help {
  color: #6b7280;
  font-size: 0.75rem;
  margin-top: -0.25rem;
}

.checkbox-field {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.checkbox-field label {
  margin: 0;
  font-weight: normal;
  cursor: pointer;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.p-error {
  color: #ef4444;
  font-size: 0.75rem;
}

.p-invalid {
  border-color: #ef4444;
}

@media (max-width: 768px) {
  .edit-promoter-page {
    padding: 1rem;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column-reverse;
  }
  
  .form-actions .p-button {
    width: 100%;
  }
}

/* Profile Picture Styles */
.current-profile-picture,
.new-profile-picture-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.profile-picture-display {
  position: relative;
  width: 150px;
  height: 150px;
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

.profile-picture-preview {
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

.profile-picture-upload {
  width: 100%;
}

.profile-picture-upload :deep(.p-fileupload-choose) {
  width: 100%;
  justify-content: center;
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

@media (max-width: 768px) {
  .profile-picture-display {
    width: 120px;
    height: 120px;
  }
}
</style>