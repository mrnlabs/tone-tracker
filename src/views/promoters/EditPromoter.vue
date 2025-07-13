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
  </DashboardLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { useValidation } from '@/composables/useValidation'
import { promoterService } from '@/services/api'
import DashboardLayout from '@/components/general/DashboardLayout.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import EmptyState from '@/components/ui/EmptyState.vue'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const { validators } = useValidation()

// State
const loading = ref(true)
const saving = ref(false)
const error = ref(null)
const promoter = ref(null)
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
    promoter.value = await promoterService.getPromoter(promoterId)
    
    console.log('Promoter loaded successfully:', promoter.value)

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

    await promoterService.updatePromoter(route.params.id, promoterData)
    
    // Show success message
    toast.add({
      severity: 'success',
      summary: 'Promoter Updated Successfully',
      detail: `${promoterData.firstName} ${promoterData.lastName} has been updated successfully`,
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
</style>