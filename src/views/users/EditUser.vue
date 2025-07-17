<template>
  <DashboardLayout>
    <div class="edit-user-page">
      <!-- Page Header -->
      <PageHeader 
        :title="`Edit ${userFullName}`"
        :description="`Update ${getUserTypeLabel} profile information`"
        :actions="headerActions"
        :loading="loading"
      />

      <!-- User Form -->
      <Card v-if="!loading && formData" class="user-form-card">
        <template #content>
          <form @submit.prevent="handleSubmit" class="user-form">
            <!-- Profile Picture Section -->
            <div class="form-section">
              <h3 class="section-title">Profile Picture</h3>
              
              <div class="profile-picture-section">
                <div class="current-picture">
                  <Avatar
                    :image="currentProfilePicture"
                    :label="getInitials(formData.firstName, formData.lastName)"
                    size="xlarge"
                    shape="circle"
                    :style="{ backgroundColor: getUserColor(userId), color: 'white', fontSize: '2rem' }"
                  />
                  <div class="picture-info">
                    <h4>Current Profile Picture</h4>
                    <p>JPG, PNG or GIF. Max size 5MB.</p>
                  </div>
                </div>
                
                <div class="picture-upload">
                  <FileUpload
                    ref="profilePictureUpload"
                    mode="basic"
                    accept="image/*"
                    :maxFileSize="5000000"
                    :auto="false"
                    chooseLabel="Upload New Picture"
                    @select="onProfilePictureSelect"
                    @clear="onProfilePictureClear"
                    class="profile-upload"
                  />
                  <Button
                    v-if="formData.profileImagePath"
                    @click="removeProfilePicture"
                    label="Remove Picture"
                    icon="pi pi-trash"
                    class="p-button-outlined p-button-danger"
                    :disabled="saving"
                  />
                </div>
              </div>
            </div>

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
                  <label for="email">Email Address</label>
                  <InputText
                    id="email"
                    v-model="formData.email"
                    placeholder="Email cannot be changed"
                    readonly
                    class="readonly-field"
                  />
                  <small class="field-help">Email address cannot be modified for security reasons</small>
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
                  <label for="dateOfBirth">Date of Birth</label>
                  <Calendar
                    id="dateOfBirth"
                    v-model="formData.dateOfBirth"
                    placeholder="Select date of birth"
                    showIcon
                    :maxDate="new Date()"
                    dateFormat="yy-mm-dd"
                  />
                </div>

                <div class="field full-width">
                  <label for="bio">Bio</label>
                  <Textarea
                    id="bio"
                    v-model="formData.bio"
                    placeholder="Tell us about yourself..."
                    rows="3"
                    autoResize
                  />
                </div>
              </div>
            </div>

            <!-- Account Information (Staff Only) -->
            <div v-if="!isPromoter" class="form-section">
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
                  <label for="jobTitle">Job Title</label>
                  <InputText
                    id="jobTitle"
                    v-model="formData.jobTitle"
                    placeholder="Enter job title"
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
              </div>
            </div>

            <!-- Promoter Specific Fields -->
            <div v-if="isPromoter" class="form-section">
              <h3 class="section-title">Promoter Information</h3>
              
              <div class="form-grid">
                <div class="field">
                  <label for="yearsOfExperience">Years of Experience</label>
                  <InputNumber
                    id="yearsOfExperience"
                    v-model="formData.yearsOfExperience"
                    :min="0"
                    :max="50"
                    placeholder="Enter years of experience"
                  />
                </div>

                <div class="field">
                  <label for="educationLevel">Education Level</label>
                  <Dropdown
                    id="educationLevel"
                    v-model="formData.educationLevel"
                    :options="educationOptions"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Select education level"
                    showClear
                  />
                </div>

                <div class="field">
                  <label for="languages">Languages</label>
                  <Chips
                    id="languages"
                    v-model="formData.languages"
                    placeholder="Add languages (press Enter)"
                  />
                  <small class="field-help">Press Enter to add each language</small>
                </div>

                <div class="field">
                  <label for="skills">Skills</label>
                  <Chips
                    id="skills"
                    v-model="formData.skills"
                    placeholder="Add skills (press Enter)"
                  />
                  <small class="field-help">Press Enter to add each skill</small>
                </div>

                <div class="field full-width">
                  <label for="certifications">Certifications</label>
                  <Textarea
                    id="certifications"
                    v-model="formData.certifications"
                    placeholder="List your certifications..."
                    rows="2"
                    autoResize
                  />
                </div>
              </div>
            </div>

            <!-- Work Experience (Promoter Only) -->
            <div v-if="isPromoter" class="form-section">
              <h3 class="section-title">Work Experience</h3>
              
              <div class="work-experience-section">
                <div
                  v-for="(experience, index) in workExperience"
                  :key="index"
                  class="experience-item"
                >
                  <div class="experience-header">
                    <h4>Experience {{ index + 1 }}</h4>
                    <Button
                      @click="removeExperience(index)"
                      icon="pi pi-trash"
                      class="p-button-text p-button-danger"
                      :disabled="saving"
                    />
                  </div>
                  
                  <div class="form-grid">
                    <div class="field">
                      <label>Company Name</label>
                      <InputText
                        v-model="experience.companyName"
                        placeholder="Enter company name"
                      />
                    </div>

                    <div class="field">
                      <label>Position</label>
                      <InputText
                        v-model="experience.position"
                        placeholder="Enter position"
                      />
                    </div>

                    <div class="field">
                      <label>Start Date</label>
                      <Calendar
                        v-model="experience.startDate"
                        placeholder="Select start date"
                        showIcon
                        dateFormat="yy-mm-dd"
                      />
                    </div>

                    <div class="field">
                      <label>End Date</label>
                      <Calendar
                        v-model="experience.endDate"
                        placeholder="Current position if ongoing"
                        showIcon
                        dateFormat="yy-mm-dd"
                      />
                    </div>

                    <div class="field full-width">
                      <label>Description</label>
                      <Textarea
                        v-model="experience.description"
                        placeholder="Describe your role and achievements..."
                        rows="2"
                        autoResize
                      />
                    </div>
                  </div>
                </div>

                <Button
                  @click="addExperience"
                  label="Add Work Experience"
                  icon="pi pi-plus"
                  class="p-button-outlined"
                  :disabled="saving"
                />
              </div>
            </div>

            <!-- Portfolio Images (Promoter Only) -->
            <div v-if="isPromoter" class="form-section">
              <h3 class="section-title">Portfolio Images</h3>
              
              <div class="portfolio-section">
                <div class="current-images" v-if="portfolioImages.length > 0">
                  <div
                    v-for="(image, index) in portfolioImages"
                    :key="index"
                    class="portfolio-image"
                  >
                    <img :src="image.url" :alt="`Portfolio ${index + 1}`" />
                    <div class="image-overlay">
                      <Button
                        @click="removePortfolioImage(index)"
                        icon="pi pi-trash"
                        class="p-button-rounded p-button-danger"
                        :disabled="saving"
                      />
                    </div>
                  </div>
                </div>

                <FileUpload
                  ref="portfolioUpload"
                  mode="advanced"
                  accept="image/*"
                  :maxFileSize="5000000"
                  :multiple="true"
                  :auto="false"
                  chooseLabel="Upload Portfolio Images"
                  @select="onPortfolioImagesSelect"
                  class="portfolio-upload"
                />
                
                <small class="field-help">Upload up to 10 portfolio images. Max 5MB each. JPG, PNG or GIF format.</small>
              </div>
            </div>

            <!-- Password Update Section -->
            <div class="form-section">
              <h3 class="section-title">Update Password</h3>
              
              <div class="password-section">
                <div class="form-grid">
                  <div class="field">
                    <label for="currentPassword">Current Password</label>
                    <Password
                      id="currentPassword"
                      v-model="passwordData.currentPassword"
                      :class="{ 'p-invalid': errors.currentPassword }"
                      placeholder="Enter current password"
                      :feedback="false"
                      @blur="validatePasswordField('currentPassword')"
                    />
                    <small v-if="errors.currentPassword" class="p-error">{{ errors.currentPassword }}</small>
                  </div>

                  <div class="field">
                    <label for="newPassword">New Password</label>
                    <Password
                      id="newPassword"
                      v-model="passwordData.newPassword"
                      :class="{ 'p-invalid': errors.newPassword }"
                      placeholder="Enter new password"
                      :feedback="true"
                      @blur="validatePasswordField('newPassword')"
                    />
                    <small v-if="errors.newPassword" class="p-error">{{ errors.newPassword }}</small>
                  </div>

                  <div class="field">
                    <label for="confirmPassword">Confirm New Password</label>
                    <Password
                      id="confirmPassword"
                      v-model="passwordData.confirmPassword"
                      :class="{ 'p-invalid': errors.confirmPassword }"
                      placeholder="Confirm new password"
                      :feedback="false"
                      @blur="validatePasswordField('confirmPassword')"
                    />
                    <small v-if="errors.confirmPassword" class="p-error">{{ errors.confirmPassword }}</small>
                  </div>
                </div>

                <Button
                  @click="updatePassword"
                  label="Update Password"
                  icon="pi pi-key"
                  class="p-button-outlined"
                  :loading="updatingPassword"
                  :disabled="!isPasswordFormValid || saving"
                />
              </div>
            </div>

            <!-- Account Status (Staff Only) -->
            <div v-if="!isPromoter" class="form-section">
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
                :label="saving ? 'Updating...' : 'Update Profile'"
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
import { userService, promoterService, fileService } from '@/services/api'
import DashboardLayout from '@/components/general/DashboardLayout.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import FileUpload from '@/components/form-components/FileUpload.vue'

const router = useRouter()
const route = useRoute()
const toast = useToast()
const usersStore = useUsersStore()
const { validators } = useValidation()

// State
const loading = ref(false)
const saving = ref(false)
const updatingPassword = ref(false)
const userId = ref(route.params.id)
const originalData = ref({})
const profilePictureUpload = ref(null)
const portfolioUpload = ref(null)

const formData = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  gender: null,
  dateOfBirth: null,
  jobTitle: '',
  role: null,
  department: null,
  bio: '',
  specializations: '',
  isActive: true,
  profileImagePath: null,
  // Promoter specific fields
  yearsOfExperience: null,
  educationLevel: null,
  languages: [],
  skills: [],
  certifications: ''
})

const passwordData = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const workExperience = ref([])
const portfolioImages = ref([])
const errors = ref({})
const currentProfilePicture = ref(null)

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

const educationOptions = [
  { label: 'High School', value: 'HIGH_SCHOOL' },
  { label: 'Certificate', value: 'CERTIFICATE' },
  { label: 'Diploma', value: 'DIPLOMA' },
  { label: 'Bachelor\'s Degree', value: 'BACHELORS' },
  { label: 'Master\'s Degree', value: 'MASTERS' },
  { label: 'PhD/Doctorate', value: 'PHD' }
]

// Computed properties
const isPromoter = computed(() => {
  return formData.value.role === 'PROMOTER'
})

const userFullName = computed(() => {
  if (formData.value.firstName && formData.value.lastName) {
    return `${formData.value.firstName} ${formData.value.lastName}`
  }
  return 'User'
})

const getUserTypeLabel = computed(() => {
  return isPromoter.value ? 'promoter' : 'staff member'
})

const hasChanges = computed(() => {
  return JSON.stringify(formData.value) !== JSON.stringify(originalData.value)
})

const isFormValid = computed(() => {
  return formData.value.firstName && 
         formData.value.lastName && 
         formData.value.email &&
         (!isPromoter.value ? formData.value.role : true) &&
         Object.keys(errors.value).length === 0
})

const isPasswordFormValid = computed(() => {
  return passwordData.value.currentPassword && 
         passwordData.value.newPassword && 
         passwordData.value.confirmPassword &&
         passwordData.value.newPassword === passwordData.value.confirmPassword &&
         !errors.value.currentPassword &&
         !errors.value.newPassword &&
         !errors.value.confirmPassword
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

// Utility functions
const getUserColor = (userId) => {
  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#84cc16']
  return colors[userId % colors.length]
}

const getInitials = (firstName, lastName) => {
  if (!firstName && !lastName) return '?'
  const first = firstName ? firstName.charAt(0).toUpperCase() : ''
  const last = lastName ? lastName.charAt(0).toUpperCase() : ''
  return first + last || '?'
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
    case 'role': {
      if (!isPromoter.value) {
        const result = validators.required(value, 'Role is required')
        if (result !== true) {
          errors.value[fieldName] = result
        } else {
          delete errors.value[fieldName]
        }
      }
      break
    }
    case 'phone': {
      if (value) {
        const result = validators.phone(value)
        if (result !== true) {
          errors.value[fieldName] = result
        } else {
          delete errors.value[fieldName]
        }
      } else {
        delete errors.value[fieldName]
      }
      break
    }
    default:
      delete errors.value[fieldName]
  }
}

const validatePasswordField = (fieldName) => {
  const value = passwordData.value[fieldName]
  
  switch (fieldName) {
    case 'currentPassword': {
      const result = validators.required(value, 'Current password is required')
      if (result !== true) {
        errors.value[fieldName] = result
      } else {
        delete errors.value[fieldName]
      }
      break
    }
    case 'newPassword': {
      const result = validators.password(value)
      if (result !== true) {
        errors.value[fieldName] = result
      } else {
        delete errors.value[fieldName]
      }
      break
    }
    case 'confirmPassword': {
      if (value !== passwordData.value.newPassword) {
        errors.value[fieldName] = 'Passwords do not match'
      } else {
        delete errors.value[fieldName]
      }
      break
    }
  }
}

const validateForm = () => {
  const fieldsToValidate = ['firstName', 'lastName']
  if (!isPromoter.value) {
    fieldsToValidate.push('role')
  }
  fieldsToValidate.forEach(validateField)
  
  // Validate phone if provided
  if (formData.value.phone) {
    validateField('phone')
  }
  
  return Object.keys(errors.value).length === 0
}

// Load user data
const loadUser = async () => {
  try {
    loading.value = true
    let user
    
    if (isPromoter.value) {
      user = await promoterService.getPromoter(userId.value)
      // Load work experience
      if (user.workExperience) {
        workExperience.value = user.workExperience
      }
      // Load portfolio images
      if (user.portfolioImages) {
        portfolioImages.value = user.portfolioImages
      }
    } else {
      user = await usersStore.getUser(userId.value)
    }
    
    // Populate form with user data
    formData.value = {
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phone || '',
      gender: user.gender || null,
      dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth) : null,
      jobTitle: user.jobTitle || '',
      role: user.role || null,
      department: user.department || null,
      bio: user.bio || '',
      specializations: user.specializations || '',
      isActive: user.isActive !== undefined ? user.isActive : true,
      profileImagePath: user.profileImagePath || null,
      // Promoter specific
      yearsOfExperience: user.yearsOfExperience || null,
      educationLevel: user.educationLevel || null,
      languages: user.languages || [],
      skills: user.skills || [],
      certifications: user.certifications || ''
    }
    
    // Load profile picture URL
    if (user.profileImagePath) {
      try {
        currentProfilePicture.value = await fileService.getS3FileUrl(user.profileImagePath)
      } catch (error) {
        console.warn('Failed to load profile picture:', error)
      }
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
    
    if (error.status === 404) {
      router.push('/users')
    }
  } finally {
    loading.value = false
  }
}

// File upload handlers
const onProfilePictureSelect = (event) => {
  const file = event.files[0]
  if (file) {
    // Preview the selected image
    const reader = new FileReader()
    reader.onload = (e) => {
      currentProfilePicture.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const onProfilePictureClear = () => {
  currentProfilePicture.value = null
}

const removeProfilePicture = () => {
  formData.value.profileImagePath = null
  currentProfilePicture.value = null
  if (profilePictureUpload.value) {
    profilePictureUpload.value.clear()
  }
}

const onPortfolioImagesSelect = (event) => {
  // Handle multiple portfolio image selection
  const files = event.files
  files.forEach((file, index) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      portfolioImages.value.push({
        url: e.target.result,
        file: file,
        isNew: true
      })
    }
    reader.readAsDataURL(file)
  })
}

const removePortfolioImage = (index) => {
  portfolioImages.value.splice(index, 1)
}

// Work experience handlers
const addExperience = () => {
  workExperience.value.push({
    companyName: '',
    position: '',
    startDate: null,
    endDate: null,
    description: ''
  })
}

const removeExperience = (index) => {
  workExperience.value.splice(index, 1)
}

// Password update
const updatePassword = async () => {
  if (!isPasswordFormValid.value) {
    toast.add({
      severity: 'error',
      summary: 'Validation Error',
      detail: 'Please fix password errors before updating',
      life: 5000
    })
    return
  }

  updatingPassword.value = true
  try {
    await userService.updatePassword(userId.value, {
      currentPassword: passwordData.value.currentPassword,
      newPassword: passwordData.value.newPassword
    })
    
    // Clear password fields
    passwordData.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
    
    toast.add({
      severity: 'success',
      summary: 'Password Updated',
      detail: 'Your password has been updated successfully',
      life: 4000
    })
  } catch (error) {
    console.error('Failed to update password:', error)
    
    let errorMessage = 'Failed to update password'
    if (error.status === 400) {
      errorMessage = 'Current password is incorrect'
    } else if (error.message) {
      errorMessage = error.message
    }
    
    toast.add({
      severity: 'error',
      summary: 'Password Update Failed',
      detail: errorMessage,
      life: 5000
    })
  } finally {
    updatingPassword.value = false
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
    let userData = {
      ...formData.value,
      firstName: formData.value.firstName.trim(),
      lastName: formData.value.lastName.trim(),
      phone: formData.value.phone?.trim() || null,
      jobTitle: formData.value.jobTitle?.trim() || null,
      department: formData.value.department || null,
      bio: formData.value.bio?.trim() || null,
      specializations: formData.value.specializations?.trim() || null,
      certifications: formData.value.certifications?.trim() || null
    }

    // Handle profile picture upload
    if (profilePictureUpload.value?.files?.length > 0) {
      const file = profilePictureUpload.value.files[0]
      const uploadResult = await fileService.uploadFile(file, null, { type: 'profile-picture' })
      userData.profileImagePath = uploadResult.filePath
    }

    // Handle promoter-specific data
    if (isPromoter.value) {
      userData.workExperience = workExperience.value
      
      // Upload new portfolio images
      const newPortfolioImages = portfolioImages.value.filter(img => img.isNew)
      if (newPortfolioImages.length > 0) {
        const uploadPromises = newPortfolioImages.map(img => 
          fileService.uploadFile(img.file, null, { type: 'portfolio' })
        )
        const uploadResults = await Promise.all(uploadPromises)
        
        // Update portfolio images with uploaded paths
        const existingImages = portfolioImages.value.filter(img => !img.isNew)
        userData.portfolioImages = [
          ...existingImages,
          ...uploadResults.map(result => ({ url: result.filePath }))
        ]
      } else {
        userData.portfolioImages = portfolioImages.value.filter(img => !img.isNew)
      }

      await promoterService.updatePromoter(userId.value, userData)
    } else {
      await usersStore.updateUser(userId.value, userData)
    }
    
    toast.add({
      severity: 'success',
      summary: 'Profile Updated',
      detail: `${userData.firstName} ${userData.lastName} has been updated successfully`,
      life: 4000
    })
    
    // Navigate back
    router.push('/users')
  } catch (error) {
    console.error('Failed to update user:', error)
    
    let errorMessage = 'Failed to update profile'
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

.readonly-field {
  background-color: #f9fafb;
  color: #6b7280;
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

/* Profile Picture Section */
.profile-picture-section {
  display: flex;
  align-items: center;
  gap: 2rem;
  padding: 1.5rem;
  background: #f8fafc;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
}

.current-picture {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.picture-info h4 {
  margin: 0 0 0.5rem 0;
  color: #1f2937;
  font-size: 1rem;
  font-weight: 600;
}

.picture-info p {
  margin: 0;
  color: #6b7280;
  font-size: 0.875rem;
}

.picture-upload {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Work Experience Section */
.work-experience-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.experience-item {
  padding: 1.5rem;
  background: #f8fafc;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
}

.experience-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.experience-header h4 {
  margin: 0;
  color: #1f2937;
  font-size: 1rem;
  font-weight: 600;
}

/* Portfolio Section */
.portfolio-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.current-images {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
}

.portfolio-image {
  position: relative;
  aspect-ratio: 1;
  border-radius: 0.5rem;
  overflow: hidden;
}

.portfolio-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-overlay {
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
  transition: opacity 0.2s;
}

.portfolio-image:hover .image-overlay {
  opacity: 1;
}

/* Password Section */
.password-section {
  padding: 1.5rem;
  background: #f8fafc;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
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
  
  .profile-picture-section {
    flex-direction: column;
    text-align: center;
  }
  
  .form-actions {
    flex-direction: column-reverse;
  }
  
  .form-actions .p-button {
    width: 100%;
  }
  
  .current-images {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
}
</style>