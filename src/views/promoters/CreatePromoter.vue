<template>
  <DashboardLayout>
    <div class="create-promoter-page">
      <!-- Page Header -->
      <PageHeader 
        title="Add New Promoter"
        description="Create a new promoter account for field activations"
        :actions="headerActions"
        :loading="loading"
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
              </div>
            </div>

            <!-- Optional Information -->
            <div class="form-section">
              <h3 class="section-title">Optional Information</h3>
              
              <div class="form-grid">
                <div class="field full-width">
                  <label for="bio">Bio</label>
                  <Textarea
                    id="bio"
                    v-model="formData.bio"
                    placeholder="Enthusiastic promoter with retail experience..."
                    rows="3"
                    autoResize
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

                <div class="field">
                  <label for="height">Height</label>
                  <InputText
                    id="height"
                    v-model="formData.height"
                    placeholder="e.g., 5.6ft"
                  />
                </div>

                <div class="field">
                  <label for="dressSize">Dress Size</label>
                  <Dropdown
                    id="dressSize"
                    v-model="formData.dressSize"
                    :options="sizeOptions"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Select dress size"
                    showClear
                  />
                </div>

                <div class="field">
                  <label for="topSize">Top Size</label>
                  <Dropdown
                    id="topSize"
                    v-model="formData.topSize"
                    :options="sizeOptions"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Select top size"
                    showClear
                  />
                </div>

                <div class="field">
                  <label for="pantsSize">Pants Size</label>
                  <Dropdown
                    id="pantsSize"
                    v-model="formData.pantsSize"
                    :options="sizeOptions"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Select pants size"
                    showClear
                  />
                </div>
              </div>
            </div>

            <!-- Account Security -->
            <div class="form-section">
              <h3 class="section-title">Account Security</h3>
              
              <div class="form-grid">
                <div class="field full-width">
                  <div class="password-info-card">
                    <div class="password-info-content">
                      <div class="password-info-icon">
                        <i class="pi pi-shield"></i>
                      </div>
                      <div class="password-info-text">
                        <h4>Automatic Password Generation</h4>
                        <p>A secure random password will be automatically generated for this promoter. The password will be shown after successful account creation and can be shared with the promoter through secure channels.</p>
                      </div>
                    </div>
                    <div class="password-info-features">
                      <div class="feature-item">
                        <i class="pi pi-check-circle"></i>
                        <span>Cryptographically secure</span>
                      </div>
                      <div class="feature-item">
                        <i class="pi pi-check-circle"></i>
                        <span>Auto-generated on creation</span>
                      </div>
                      <div class="feature-item">
                        <i class="pi pi-check-circle"></i>
                        <span>Displayed once after creation</span>
                      </div>
                      <div class="feature-item">
                        <i class="pi pi-check-circle"></i>
                        <span>Promoter can change after first login</span>
                      </div>
                    </div>
                  </div>
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
                :label="saving ? 'Creating...' : 'Create Promoter'"
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
import { useValidation } from '@/composables/useValidation'
import { promoterService } from '@/services/api'
import DashboardLayout from '@/components/general/DashboardLayout.vue'
import PageHeader from '@/components/ui/PageHeader.vue'

const router = useRouter()
const toast = useToast()
const { validators } = useValidation()

// Password generation function
const generateSecurePassword = () => {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const numbers = '0123456789'
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?'
  const allChars = uppercase + lowercase + numbers + symbols
  
  let password = ''
  
  // Ensure at least one character from each category
  password += uppercase[Math.floor(Math.random() * uppercase.length)]
  password += lowercase[Math.floor(Math.random() * lowercase.length)]
  password += numbers[Math.floor(Math.random() * numbers.length)]
  password += symbols[Math.floor(Math.random() * symbols.length)]
  
  // Fill the rest randomly (total length: 12 characters)
  for (let i = 4; i < 12; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)]
  }
  
  // Shuffle the password to avoid predictable patterns
  return password.split('').sort(() => Math.random() - 0.5).join('')
}

// Generate password and set to form
const generatePassword = () => {
  formData.value.password = generateSecurePassword()
  validateField('password')
  
  toast.add({
    severity: 'success',
    summary: 'Password Generated',
    detail: 'A secure password has been generated',
    life: 3000
  })
}

// Form state
const loading = ref(false)
const saving = ref(false)
const formData = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  bio: '',
  gender: null,
  height: '',
  dressSize: null,
  topSize: null,
  pantsSize: null,
  profileImagePath: null
})

const errors = ref({})

// Options
const genderOptions = [
  { label: 'Male', value: 'MALE' },
  { label: 'Female', value: 'FEMALE' },
  { label: 'Other', value: 'OTHER' },
  { label: 'Prefer not to say', value: 'NOT_SPECIFIED' }
]

const sizeOptions = [
  { label: 'XS', value: 'XS' },
  { label: 'S', value: 'S' },
  { label: 'M', value: 'M' },
  { label: 'L', value: 'L' },
  { label: 'XL', value: 'XL' },
  { label: 'XXL', value: 'XXL' },
  { label: 'XXXL', value: 'XXXL' }
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
      bio: formData.value.bio?.trim() || null,
      gender: formData.value.gender || null,
      height: formData.value.height?.trim() || null,
      dressSize: formData.value.dressSize || null,
      topSize: formData.value.topSize || null,
      pantsSize: formData.value.pantsSize || null,
      profileImagePath: formData.value.profileImagePath || null
    }

    const response = await promoterService.createPromoter(promoterData)
    
    // Show success message with password information
    toast.add({
      severity: 'success',
      summary: 'Promoter Created Successfully',
      detail: `${promoterData.firstName} ${promoterData.lastName} has been created with auto-generated password: ${response.generatedPassword || 'Check server response'}`,
      life: 8000
    })
    
    // Navigate back to promoters list
    router.push('/promoters')
  } catch (error) {
    console.error('Failed to create promoter:', error)
    
    let errorMessage = 'Failed to create promoter'
    if (error.status === 409) {
      errorMessage = 'A promoter with this email already exists'
    } else if (error.status === 422) {
      errorMessage = 'Invalid promoter data provided'
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
  router.push('/promoters')
}
</script>

<style scoped>
.create-promoter-page {
  padding: 1.5rem;
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
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

.password-group {
  display: flex;
  gap: 0.5rem;
  align-items: stretch;
}

.password-group .p-password {
  flex: 1;
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
  .create-promoter-page {
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
  
  .password-group {
    flex-direction: column;
  }
}
</style>