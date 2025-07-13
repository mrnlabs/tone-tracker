<template>
  <DashboardLayout>
    <div class="create-user-page">
      <!-- Page Header -->
      <PageHeader 
        title="Add New Staff User"
        description="Create a new staff user account (Admin, Activation Manager, or Warehouse Manager)"
        :actions="headerActions"
        :loading="loading"
      />

      <!-- User Form -->
      <Card class="user-form-card">
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

              </div>
            </div>

            <!-- Additional Information -->
            <div class="form-section">
              <h3 class="section-title">Additional Information</h3>
              
              <div class="form-grid">
                <div class="field full-width">
                  <label for="bio">Bio</label>
                  <Textarea
                    id="bio"
                    v-model="formData.bio"
                    placeholder="Enter user bio and background"
                    rows="3"
                    autoResize
                  />
                </div>

                <div class="field full-width">
                  <label for="specializations">Specializations</label>
                  <Textarea
                    id="specializations"
                    v-model="formData.specializations"
                    placeholder="e.g., Inventory, Analytics, Team Management"
                    rows="2"
                    autoResize
                  />
                </div>

                <div class="field full-width">
                  <label for="internalNotes">Internal Notes</label>
                  <Textarea
                    id="internalNotes"
                    v-model="formData.internalNotes"
                    placeholder="Internal notes for staff reference"
                    rows="2"
                    autoResize
                  />
                </div>
              </div>
            </div>

            <!-- Security Information -->
            <div class="form-section">
              <h3 class="section-title">Security Information</h3>
              
              <div class="form-grid">
                <div class="field full-width">
                  <div class="password-info-card">
                    <div class="password-info-content">
                      <div class="password-info-icon">
                        <i class="pi pi-shield"></i>
                      </div>
                      <div class="password-info-text">
                        <h4>Automatic Password Generation</h4>
                        <p>A secure random password will be automatically generated for this user. The password will be shown after successful account creation and can be shared with the user through secure channels.</p>
                      </div>
                    </div>
                    <div class="password-info-features">
                      <div class="feature-item">
                        <i class="pi pi-check-circle"></i>
                        <span>12 characters long</span>
                      </div>
                      <div class="feature-item">
                        <i class="pi pi-check-circle"></i>
                        <span>Uppercase & lowercase letters</span>
                      </div>
                      <div class="feature-item">
                        <i class="pi pi-check-circle"></i>
                        <span>Numbers & special characters</span>
                      </div>
                      <div class="feature-item">
                        <i class="pi pi-check-circle"></i>
                        <span>Cryptographically secure</span>
                      </div>
                    </div>
                  </div>
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
                :label="saving ? 'Creating...' : 'Create User'"
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
  </DashboardLayout>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { useUsersStore } from '@/stores/user'
import { useValidation } from '@/composables/useValidation'
import DashboardLayout from '@/components/general/DashboardLayout.vue'
import PageHeader from '@/components/ui/PageHeader.vue'

const router = useRouter()
const toast = useToast()
const usersStore = useUsersStore()
const { validators } = useValidation()


// Form state
const loading = ref(false)
const saving = ref(false)
const formData = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  role: null,
  bio: '',
  specializations: '',
  internalNotes: '',
  profileImagePath: null
})

const errors = ref({})

// Options
const roleOptions = [
  { label: 'Admin', value: 'ADMIN' },
  { label: 'Activation Manager', value: 'ACTIVATION_MANAGER' },
  { label: 'Warehouse Manager', value: 'WAREHOUSE_MANAGER' }
]


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
  const fieldsToValidate = ['firstName', 'lastName', 'email', 'phone', 'role']
  fieldsToValidate.forEach(validateField)
  
  return Object.keys(errors.value).length === 0
}

const isFormValid = computed(() => {
  const hasRequiredFields = formData.value.firstName?.trim() && 
                           formData.value.lastName?.trim() && 
                           formData.value.email?.trim() && 
                           formData.value.phone?.trim() &&
                           formData.value.role
  
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
    // Prepare staff user data according to new API structure
    const userData = {
      firstName: formData.value.firstName.trim(),
      lastName: formData.value.lastName.trim(),
      email: formData.value.email.trim().toLowerCase(),
      phone: formData.value.phone.trim(),
      role: formData.value.role,
      bio: formData.value.bio?.trim() || null,
      specializations: formData.value.specializations?.trim() || null,
      internalNotes: formData.value.internalNotes?.trim() || null,
      profileImagePath: formData.value.profileImagePath || null
    }

    const response = await usersStore.createStaffUser(userData)
    
    // Show success message with password information
    toast.add({
      severity: 'success',
      summary: 'Staff User Created Successfully',
      detail: `${userData.firstName} ${userData.lastName} has been created with auto-generated password: ${response.generatedPassword || 'Check server response'}`,
      life: 8000
    })
    
    // Navigate back to users list
    router.push('/users')
  } catch (error) {
    console.error('Failed to create user:', error)
    
    let errorMessage = 'Failed to create user'
    if (error.status === 409) {
      errorMessage = 'A user with this email already exists'
    } else if (error.status === 422) {
      errorMessage = 'Invalid user data provided'
    } else if (error.message) {
      errorMessage = error.message
    }
    
    toast.add({
      severity: 'error',
      summary: 'Creation Failed',
      detail: errorMessage,
      life: 5000
    })
  } finally {
    saving.value = false
  }
}

const handleCancel = () => {
  router.push('/users')
}
</script>

<style scoped>
.create-user-page {
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

.p-error {
  color: #ef4444;
  font-size: 0.75rem;
}

.p-invalid {
  border-color: #ef4444;
}


.password-info-card {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 1px solid #0ea5e9;
  border-radius: 0.75rem;
  padding: 1.5rem;
}

.password-info-content {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.password-info-icon {
  background: #0ea5e9;
  color: white;
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.password-info-icon i {
  font-size: 1.25rem;
}

.password-info-text h4 {
  margin: 0 0 0.5rem 0;
  color: #0c4a6e;
  font-size: 1.125rem;
  font-weight: 600;
}

.password-info-text p {
  margin: 0;
  color: #075985;
  line-height: 1.6;
}

.password-info-features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #0c4a6e;
  font-size: 0.875rem;
  font-weight: 500;
}

.feature-item i {
  color: #10b981;
  font-size: 1rem;
}

@media (max-width: 768px) {
  .create-user-page {
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
  
  .password-info-content {
    flex-direction: column;
    text-align: center;
  }
  
  
  .password-info-features {
    grid-template-columns: 1fr;
  }
}
</style>