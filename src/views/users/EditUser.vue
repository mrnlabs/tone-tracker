<template>
  <DashboardLayout>
    <div class="edit-user-page">
      <!-- Page Header -->
      <PageHeader 
        title="Edit User"
        :description="`Update ${userFullName} account information`"
        :actions="headerActions"
        :loading="loading"
      />

      <!-- User Form -->
      <Card v-if="!loading" class="user-form-card">
        <template #content>
          <form @submit.prevent="handleSubmit" class="user-form">
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
                  <label for="phone">Phone Number</label>
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

                <div class="field">
                  <label for="jobTitle">Job Title</label>
                  <InputText
                    id="jobTitle"
                    v-model="formData.jobTitle"
                    placeholder="Enter job title"
                  />
                </div>
              </div>
            </div>

            <!-- Account Information -->
            <div class="form-section">
              <h3 class="section-title">Account Information</h3>
              
              <div class="form-grid">
                <div class="field">
                  <label for="role" class="required">User Role</label>
                  <Dropdown
                    id="role"
                    v-model="formData.role"
                    :options="roleOptions"
                    optionLabel="label"
                    optionValue="value"
                    :class="{ 'p-invalid': errors.role }"
                    placeholder="Select user role"
                    @change="validateField('role')"
                  />
                  <small v-if="errors.role" class="p-error">{{ errors.role }}</small>
                </div>

                <div class="field">
                  <label for="department">Department</label>
                  <Dropdown
                    id="department"
                    v-model="formData.department"
                    :options="departmentOptions"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Select department"
                    showClear
                  />
                </div>

                <div class="field">
                  <label for="companyName">Company Name</label>
                  <InputText
                    id="companyName"
                    v-model="formData.companyName"
                    placeholder="Enter company name"
                  />
                </div>

                <div class="field full-width">
                  <label for="bio">Bio</label>
                  <Textarea
                    id="bio"
                    v-model="formData.bio"
                    placeholder="Enter user bio"
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
                <div class="field">
                  <div class="checkbox-field">
                    <Checkbox
                      id="isActive"
                      v-model="formData.isActive"
                      :binary="true"
                    />
                    <label for="isActive">Active Account</label>
                  </div>
                  <small class="field-help">Determines if the user can log in to the system</small>
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
                :label="saving ? 'Updating...' : 'Update User'"
                icon="pi pi-check"
                class="p-button-primary"
                :loading="saving"
                :disabled="!isFormValid || !hasChanges"
              />
            </div>
          </form>
        </template>
      </Card>

      <!-- Loading State -->
      <Card v-else class="user-form-card">
        <template #content>
          <div class="loading-state">
            <ProgressSpinner />
            <p>Loading user details...</p>
          </div>
        </template>
      </Card>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { useUsersStore } from '@/stores/user'
import { useValidation } from '@/composables/useValidation'
import DashboardLayout from '@/components/general/DashboardLayout.vue'
import PageHeader from '@/components/ui/PageHeader.vue'

const router = useRouter()
const route = useRoute()
const toast = useToast()
const usersStore = useUsersStore()
const { validators } = useValidation()

// State
const loading = ref(false)
const saving = ref(false)
const userId = ref(route.params.id)
const originalData = ref({})
const formData = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  gender: null,
  jobTitle: '',
  role: null,
  department: null,
  companyName: '',
  bio: '',
  isActive: true
})

const errors = ref({})

// Options
const roleOptions = [
  { label: 'Admin', value: 'ADMIN' },
  { label: 'Activation Manager', value: 'ACTIVATION_MANAGER' },
  { label: 'Warehouse Manager', value: 'WAREHOUSE_MANAGER' }
]

const departmentOptions = [
  { label: 'IT', value: 'IT' },
  { label: 'Marketing', value: 'Marketing' },
  { label: 'Sales', value: 'Sales' },
  { label: 'Operations', value: 'Operations' },
  { label: 'Finance', value: 'Finance' },
  { label: 'Human Resources', value: 'HR' }
]

const genderOptions = [
  { label: 'Male', value: 'MALE' },
  { label: 'Female', value: 'FEMALE' },
  { label: 'Other', value: 'OTHER' },
  { label: 'Prefer not to say', value: 'NOT_SPECIFIED' }
]

// Computed properties
const userFullName = computed(() => {
  if (formData.value.firstName && formData.value.lastName) {
    return `${formData.value.firstName} ${formData.value.lastName}`
  }
  return 'User'
})

const hasChanges = computed(() => {
  return JSON.stringify(formData.value) !== JSON.stringify(originalData.value)
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
    case 'role': {
      const result = validators.required(value, 'Role is required')
      if (result !== true) {
        errors.value[fieldName] = result
      } else {
        delete errors.value[fieldName]
      }
      break
    }
    case 'phone': {
      const result = validators.phone(value)
      if (result !== true) {
        errors.value[fieldName] = result
      } else {
        delete errors.value[fieldName]
      }
      break
    }
    default:
      delete errors.value[fieldName]
  }
}

const validateForm = () => {
  const fieldsToValidate = ['firstName', 'lastName', 'email', 'role']
  fieldsToValidate.forEach(validateField)
  
  // Validate phone if provided
  if (formData.value.phone) {
    validateField('phone')
  }
  
  return Object.keys(errors.value).length === 0
}

const isFormValid = computed(() => {
  return formData.value.firstName && 
         formData.value.lastName && 
         formData.value.email && 
         formData.value.role &&
         Object.keys(errors.value).length === 0
})

// Load user data
const loadUser = async () => {
  try {
    loading.value = true
    const user = await usersStore.getUser(userId.value)
    
    // Populate form with user data
    formData.value = {
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phone || '',
      gender: user.gender || null,
      jobTitle: user.jobTitle || '',
      role: user.role || null,
      department: user.department || null,
      companyName: user.companyName || '',
      bio: user.bio || '',
      isActive: user.isActive !== undefined ? user.isActive : true
    }
    
    // Store original data for change detection
    originalData.value = { ...formData.value }
    
  } catch (error) {
    console.error('Failed to load user:', error)
    
    let errorMessage = 'Failed to load user details'
    if (error.status === 404) {
      errorMessage = 'User not found'
    } else if (error.message) {
      errorMessage = error.message
    }
    
    toast.add({
      severity: 'error',
      summary: 'Load Failed',
      detail: errorMessage,
      life: 5000
    })
    
    // Redirect back to users list if user not found
    if (error.status === 404) {
      router.push('/users')
    }
  } finally {
    loading.value = false
  }
}

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

  if (!hasChanges.value) {
    toast.add({
      severity: 'info',
      summary: 'No Changes',
      detail: 'No changes detected to save',
      life: 3000
    })
    return
  }

  saving.value = true
  try {
    const userData = {
      ...formData.value,
      // Ensure required fields are not empty
      firstName: formData.value.firstName.trim(),
      lastName: formData.value.lastName.trim(),
      email: formData.value.email.trim().toLowerCase(),
      phone: formData.value.phone?.trim() || null,
      jobTitle: formData.value.jobTitle?.trim() || null,
      department: formData.value.department || null,
      companyName: formData.value.companyName?.trim() || null,
      bio: formData.value.bio?.trim() || null
    }

    await usersStore.updateUser(userId.value, userData)
    
    toast.add({
      severity: 'success',
      summary: 'User Updated',
      detail: `${userData.firstName} ${userData.lastName} has been updated successfully`,
      life: 4000
    })
    
    // Navigate back to users list
    router.push('/users')
  } catch (error) {
    console.error('Failed to update user:', error)
    
    let errorMessage = 'Failed to update user'
    if (error.status === 409) {
      errorMessage = 'A user with this email already exists'
    } else if (error.status === 422) {
      errorMessage = 'Invalid user data provided'
    } else if (error.status === 404) {
      errorMessage = 'User not found'
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
  if (hasChanges.value) {
    // Could add a confirmation dialog here
    if (confirm('You have unsaved changes. Are you sure you want to cancel?')) {
      router.push('/users')
    }
  } else {
    router.push('/users')
  }
}

// Watch for route parameter changes
watch(() => route.params.id, (newId) => {
  if (newId) {
    userId.value = newId
    loadUser()
  }
}, { immediate: true })

// Lifecycle
onMounted(() => {
  if (userId.value) {
    loadUser()
  }
})
</script>

<style scoped>
.edit-user-page {
  padding: 1.5rem;
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
}

.user-form-card {
  margin-top: 1.5rem;
}

.user-form {
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

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 3rem;
  color: #6b7280;
}

.p-error {
  color: #ef4444;
  font-size: 0.75rem;
}

.p-invalid {
  border-color: #ef4444;
}

@media (max-width: 768px) {
  .edit-user-page {
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