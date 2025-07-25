<template>
  <DashboardLayout>
    <div class="profile-page">
      <!-- Page Header -->
      <PageHeader 
        title="My Profile"
        description="Manage your profile information and settings"
        :loading="isLoading"
      />

      <!-- Profile Content with Tabs -->
      <div class="profile-content">
        <TabView v-model:activeIndex="activeTab">
          <!-- Profile Information Tab (Combined Personal & Professional) -->
          <TabPanel header="Profile Information">
            <div class="tab-content">
              <Card>
                <template #content>
                  <form @submit.prevent="updateProfile" class="profile-form">
                    <div class="form-section">
                      <h4 class="section-title">Basic Information</h4>
                      <div class="form-grid">
                        <div class="form-group">
                          <label for="firstName" class="form-label required">First Name</label>
                          <InputText
                            id="firstName"
                            v-model="profileForm.firstName"
                            class="form-input"
                            :class="{ 'p-invalid': errors.firstName }"
                            maxlength="50"
                          />
                          <small v-if="errors.firstName" class="p-error">{{ errors.firstName }}</small>
                        </div>

                        <div class="form-group">
                          <label for="lastName" class="form-label required">Last Name</label>
                          <InputText
                            id="lastName"
                            v-model="profileForm.lastName"
                            class="form-input"
                            :class="{ 'p-invalid': errors.lastName }"
                            maxlength="50"
                          />
                          <small v-if="errors.lastName" class="p-error">{{ errors.lastName }}</small>
                        </div>

                        <div class="form-group">
                          <label for="email" class="form-label required">Email Address</label>
                          <InputText
                            id="email"
                            v-model="profileForm.email"
                            type="email"
                            class="form-input"
                            :class="{ 'p-invalid': errors.email }"
                            maxlength="100"
                          />
                          <small v-if="errors.email" class="p-error">{{ errors.email }}</small>
                        </div>

                        <div class="form-group">
                          <label for="phone" class="form-label required">Phone Number</label>
                          <InputText
                            id="phone"
                            v-model="profileForm.phone"
                            type="tel"
                            class="form-input"
                            :class="{ 'p-invalid': errors.phone }"
                          />
                          <small v-if="errors.phone" class="p-error">{{ errors.phone }}</small>
                        </div>

                        <div class="form-group">
                          <label for="gender" class="form-label">Gender</label>
                          <Dropdown
                            id="gender"
                            v-model="profileForm.gender"
                            :options="genderOptions"
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Select Gender"
                            class="form-input"
                            showClear
                          />
                        </div>

                        <div class="form-group">
                          <label for="height" class="form-label">Height</label>
                          <Dropdown
                            id="height"
                            v-model="profileForm.height"
                            :options="heightOptions"
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Select Height"
                            class="form-input"
                            showClear
                          />
                        </div>
                      </div>
                    </div>

                    <Divider />

                    <div class="form-section" v-if="userRole !== 'PROMOTER'">
                      <h4 class="section-title">Professional Information</h4>
                      <div class="form-grid">
                        <div class="form-group">
                          <label for="jobTitle" class="form-label">Job Title</label>
                          <InputText
                            id="jobTitle"
                            v-model="profileForm.jobTitle"
                            class="form-input"
                          />
                        </div>

                        <div class="form-group">
                          <label for="department" class="form-label">Department</label>
                          <InputText
                            id="department"
                            v-model="profileForm.department"
                            class="form-input"
                          />
                        </div>

                        <div class="form-group">
                          <label for="companyName" class="form-label">Company Name</label>
                          <InputText
                            id="companyName"
                            v-model="profileForm.companyName"
                            class="form-input"
                            readonly
                            disabled
                          />
                        </div>

                        <div class="form-group">
                          <label for="role" class="form-label">System Role</label>
                          <Dropdown
                            id="role"
                            v-model="profileForm.role"
                            :options="roleOptions"
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Select Role"
                            class="form-input"
                            :disabled="!canEditRole"
                          />
                          <small v-if="!canEditRole" class="p-help">Role can only be changed by administrators</small>
                        </div>
                      </div>
                    </div>

                    <Divider />

                    <div class="form-section">
                      <h4 class="section-title">Size Information</h4>
                      <div class="form-grid">
                        <div class="form-group">
                          <label for="dressSize" class="form-label">Dress Size</label>
                          <Dropdown
                            id="dressSize"
                            v-model="profileForm.dressSize"
                            :options="dressSizeOptions"
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Select Dress Size"
                            class="form-input"
                            showClear
                          />
                        </div>

                        <div class="form-group">
                          <label for="topSize" class="form-label">Top Size</label>
                          <Dropdown
                            id="topSize"
                            v-model="profileForm.topSize"
                            :options="topSizeOptions"
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Select Top Size"
                            class="form-input"
                            showClear
                          />
                        </div>

                        <div class="form-group">
                          <label for="pantsSize" class="form-label">Pants Size</label>
                          <Dropdown
                            id="pantsSize"
                            v-model="profileForm.pantsSize"
                            :options="pantsSizeOptions"
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Select Pants Size"
                            class="form-input"
                            showClear
                          />
                        </div>
                      </div>
                    </div>

                    <Divider />

                    <div class="form-section">
                      <h4 class="section-title">Bio</h4>
                      <div class="form-group full-width">
                        <label for="bio" class="form-label">About Me</label>
                        <Textarea
                          id="bio"
                          v-model="profileForm.bio"
                          rows="4"
                          class="form-input"
                          :class="{ 'p-invalid': errors.bio }"
                          placeholder="Tell us about yourself..."
                          :maxlength="1000"
                        />
                        <small v-if="errors.bio" class="p-error">{{ errors.bio }}</small>
                        <small class="char-counter">{{ profileForm.bio?.length || 0 }}/1000</small>
                      </div>
                    </div>

                    <div class="form-actions">
                      <Button
                        type="submit"
                        label="Save Profile Information"
                        icon="pi pi-save"
                        :loading="isLoading"
                        :disabled="!isFormValid"
                      />
                      <Button
                        type="button"
                        label="Cancel"
                        icon="pi pi-times"
                        class="p-button-secondary"
                        @click="resetForm"
                      />
                    </div>
                  </form>
                </template>
              </Card>
            </div>
          </TabPanel>

          <!-- Profile Picture Tab -->
          <TabPanel header="Profile Picture">
            <div class="tab-content">
              <Card class="profile-picture-card">
                <template #content>
                  <div class="picture-section">
                    <div class="picture-upload">
                      <ProfilePictureUpload
                        v-model="fullProfilePictureUrl"
                        :key="`profile-pic-${profilePictureUrl}`"
                        :user-name="userFullName"
                        :user-id="userId"
                        :upload-handler="handleProfilePictureUpload"
                        :delete-handler="handleProfilePictureDelete"
                        @upload-success="onUploadSuccess"
                        @upload-error="onUploadError"
                        @delete-success="onDeleteSuccess"
                        @delete-error="onDeleteError"
                      />
                    </div>
                    <div class="picture-info">
                      <h4>Profile Picture Guidelines</h4>
                      <ul>
                        <li>Use a clear, professional photo</li>
                        <li>Square format works best (1:1 aspect ratio)</li>
                        <li>Maximum file size: 5MB</li>
                        <li>Supported formats: JPG, PNG, GIF</li>
                        <li>Minimum resolution: 200x200 pixels</li>
                      </ul>
                    </div>
                  </div>
                </template>
              </Card>
            </div>
          </TabPanel>

          <!-- Account Settings Tab -->
          <TabPanel header="Account Settings">
            <div class="tab-content">
              <Card>
                <template #content>
                  <div class="settings-sections">
                    <!-- Account Information -->
                    <div class="form-section">
                      <h4 class="section-title">Account Information</h4>
                      <div class="info-grid">
                        <div class="info-item">
                          <label>User ID</label>
                          <span>{{ userId }}</span>
                        </div>
                        <div class="info-item">
                          <label>Account Status</label>
                          <Tag :value="currentUser.isActive ? 'Active' : 'Inactive'" 
                               :severity="currentUser.isActive ? 'success' : 'danger'" />
                        </div>
                        <div class="info-item">
                          <label>Account Created</label>
                          <span>{{ formatDate(currentUser.dateCreated) }}</span>
                        </div>
                        <div class="info-item">
                          <label>Last Updated</label>
                          <span>{{ formatDate(currentUser.lastUpdated) }}</span>
                        </div>
                        <div class="info-item">
                          <label>Last Login</label>
                          <span>{{ formatDateTime(currentUser.lastLogin) }}</span>
                        </div>
                      </div>
                    </div>

                    <Divider />

                    <!-- Security Settings -->
                    <div class="form-section">
                      <h4 class="section-title">Security Settings</h4>
                      <div class="settings-grid">
                        <div class="setting-item">
                          <div class="setting-info">
                            <h5>Password</h5>
                            <p>Change your account password</p>
                          </div>
                          <Button
                            label="Change Password"
                            icon="pi pi-key"
                            class="p-button-outlined"
                            @click="showChangePasswordDialog = true"
                          />
                        </div>

                        <div class="setting-item">
                          <div class="setting-info">
                            <h5>Two-Factor Authentication</h5>
                            <p>Add an extra layer of security</p>
                          </div>
                          <Button
                            label="Setup 2FA"
                            icon="pi pi-shield"
                            class="p-button-outlined"
                            disabled
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </template>
              </Card>
            </div>
          </TabPanel>

          <!-- Gallery Tab (for Promoters/Admins) -->
          <TabPanel v-if="userRole === 'PROMOTER' || userRole === 'ADMIN'" header="My Gallery">
            <div class="tab-content">
              <Card>
                <template #content>
                  <PromoterImageGallery
                    :promoter-id="userId"
                    context="profile"
                    :can-upload="true"
                    @images-updated="handleGalleryUpdate"
                  />
                </template>
              </Card>
            </div>
          </TabPanel>
        </TabView>
      </div>
    </div>

    <!-- Change Password Dialog -->
    <Dialog
      v-model:visible="showChangePasswordDialog"
      modal
      header="Change Password"
      :style="{ width: '450px' }"
    >
      <form @submit.prevent="changePassword" class="password-form">
        <div class="form-group">
          <label for="currentPassword" class="form-label">Current Password</label>
          <Password
            id="currentPassword"
            v-model="passwordForm.currentPassword"
            class="form-input"
            :class="{ 'p-invalid': passwordErrors.currentPassword }"
            :feedback="false"
            toggleMask
          />
          <small v-if="passwordErrors.currentPassword" class="p-error">
            {{ passwordErrors.currentPassword }}
          </small>
        </div>

        <div class="form-group">
          <label for="newPassword" class="form-label">New Password</label>
          <Password
            id="newPassword"
            v-model="passwordForm.newPassword"
            class="form-input"
            :class="{ 'p-invalid': passwordErrors.newPassword }"
            toggleMask
          />
          <small v-if="passwordErrors.newPassword" class="p-error">
            {{ passwordErrors.newPassword }}
          </small>
        </div>

        <div class="form-group">
          <label for="confirmPassword" class="form-label">Confirm New Password</label>
          <Password
            id="confirmPassword"
            v-model="passwordForm.confirmPassword"
            class="form-input"
            :class="{ 'p-invalid': passwordErrors.confirmPassword }"
            :feedback="false"
            toggleMask
          />
          <small v-if="passwordErrors.confirmPassword" class="p-error">
            {{ passwordErrors.confirmPassword }}
          </small>
        </div>

        <div class="dialog-actions">
          <Button
            type="button"
            label="Cancel"
            icon="pi pi-times"
            class="p-button-text"
            @click="showChangePasswordDialog = false"
          />
          <Button
            type="submit"
            label="Change Password"
            icon="pi pi-check"
            :loading="isLoading"
            :disabled="!isPasswordFormValid"
          />
        </div>
      </form>
    </Dialog>
  </DashboardLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useAuthStore } from '@/stores/auth'
import DashboardLayout from '@/components/general/DashboardLayout.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import ProfilePictureUpload from '@/components/form-components/ProfilePictureUpload.vue'
import PromoterImageGallery from '@/components/promoters/PromoterImageGallery.vue'
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Dropdown from 'primevue/dropdown'
import Button from 'primevue/button'
import Password from 'primevue/password'
import Dialog from 'primevue/dialog'
import Divider from 'primevue/divider'
import Tag from 'primevue/tag'

const toast = useToast()
const authStore = useAuthStore()

// Reactive state
const activeTab = ref(0)
const profilePictureUrl = ref('')
const isLoading = ref(false)
const showChangePasswordDialog = ref(false)

// Form data - matching backend UserUpdateDTO
const profileForm = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  role: '',
  profileImagePath: '',
  bio: '',
  jobTitle: '',
  department: '',
  companyName: '',
  gender: '',
  height: '',
  dressSize: '',
  topSize: '',
  pantsSize: ''
})

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// Options for dropdowns
const genderOptions = [
  { label: 'Male', value: 'MALE' },
  { label: 'Female', value: 'FEMALE' },
  { label: 'Other', value: 'OTHER' }
]

const roleOptions = [
  { label: 'Admin', value: 'ADMIN' },
  { label: 'Activation Manager', value: 'ACTIVATION_MANAGER' },
  { label: 'Warehouse Manager', value: 'WAREHOUSE_MANAGER' },
  { label: 'Promoter', value: 'PROMOTER' },
  { label: 'Client', value: 'CLIENT' }
]

const heightOptions = [
  { label: '150cm', value: '150cm' },
  { label: '152cm', value: '152cm' },
  { label: '155cm', value: '155cm' },
  { label: '157cm', value: '157cm' },
  { label: '160cm', value: '160cm' },
  { label: '162cm', value: '162cm' },
  { label: '165cm', value: '165cm' },
  { label: '167cm', value: '167cm' },
  { label: '170cm', value: '170cm' },
  { label: '172cm', value: '172cm' },
  { label: '175cm', value: '175cm' },
  { label: '177cm', value: '177cm' },
  { label: '180cm', value: '180cm' },
  { label: '182cm', value: '182cm' },
  { label: '185cm', value: '185cm' },
  { label: '187cm', value: '187cm' },
  { label: '190cm', value: '190cm' },
  { label: '192cm', value: '192cm' },
  { label: '195cm', value: '195cm' }
]

const dressSizeOptions = [
  { label: 'XXS', value: 'XXS' },
  { label: 'XS', value: 'XS' },
  { label: 'S', value: 'S' },
  { label: 'M', value: 'M' },
  { label: 'L', value: 'L' },
  { label: 'XL', value: 'XL' },
  { label: 'XXL', value: 'XXL' },
  { label: 'XXXL', value: 'XXXL' }
]

const topSizeOptions = [
  { label: 'XXS', value: 'XXS' },
  { label: 'XS', value: 'XS' },
  { label: 'S', value: 'S' },
  { label: 'M', value: 'M' },
  { label: 'L', value: 'L' },
  { label: 'XL', value: 'XL' },
  { label: 'XXL', value: 'XXL' },
  { label: 'XXXL', value: 'XXXL' }
]

const pantsSizeOptions = [
  { label: '26', value: '26' },
  { label: '28', value: '28' },
  { label: '30', value: '30' },
  { label: '32', value: '32' },
  { label: '34', value: '34' },
  { label: '36', value: '36' },
  { label: '38', value: '38' },
  { label: '40', value: '40' },
  { label: '42', value: '42' },
  { label: '44', value: '44' },
  { label: '46', value: '46' },
  { label: '48', value: '48' }
]

// Form validation
const errors = ref({})
const passwordErrors = ref({})

// Computed properties
const userFullName = computed(() => authStore.userFullName)
const userId = computed(() => authStore.userId)
const userRole = computed(() => authStore.userRole)

const currentUser = computed(() => {
  return authStore.user || {}
})

const canEditRole = computed(() => {
  // Only allow role editing for admins, or if current user is admin
  return userRole.value === 'ADMIN'
})

// Computed property for full profile picture URL
const fullProfilePictureUrl = computed(() => {
  console.log('Computing fullProfilePictureUrl with profilePictureUrl:', profilePictureUrl.value)
  
  if (!profilePictureUrl.value) {
    console.log('No profilePictureUrl, returning empty string')
    return ''
  }

  // If it's already a full URL (http/https), use it as is
  if (profilePictureUrl.value.startsWith('http')) {
    console.log('Using full URL as-is:', profilePictureUrl.value)
    return profilePictureUrl.value
  }
  
  // Use S3 bucket for profile pictures
  const s3BucketUrl = import.meta.env.VITE_AWS_S3_BUCKET || 'https://client-activation-tracker.s3.af-south-1.amazonaws.com/'
  
  // Handle different URL formats - all should result in S3 URLs
  let filename = ''
  let folder = 'user_profile'
  
  if (profilePictureUrl.value.includes('/user_profile/')) {
    // Extract filename from paths like /user_profile/abc.jpg or user_profile/abc.jpg
    filename = profilePictureUrl.value.split('/user_profile/')[1]
  } else if (profilePictureUrl.value.startsWith('user_profile/')) {
    // Handle relative path like user_profile/abc.jpg
    filename = profilePictureUrl.value.split('user_profile/')[1]
  } else if (profilePictureUrl.value.startsWith('/')) {
    // Other absolute paths
    const parts = profilePictureUrl.value.split('/')
    filename = parts[parts.length - 1]
    folder = parts[parts.length - 2] || 'user_profile'
  } else {
    // Just a filename or other relative path
    filename = profilePictureUrl.value
  }
  
  const fullUrl = `${s3BucketUrl}${folder}/${filename}`
  console.log(`Constructed S3 URL: ${folder}/${filename} -> ${fullUrl}`)
  return fullUrl
})

const isFormValid = computed(() => {
  return profileForm.value.firstName.trim() &&
         profileForm.value.lastName.trim() &&
         profileForm.value.email.trim() &&
         profileForm.value.phone.trim() &&
         Object.keys(errors.value).length === 0
})

const isPasswordFormValid = computed(() => {
  return passwordForm.value.currentPassword &&
         passwordForm.value.newPassword &&
         passwordForm.value.confirmPassword &&
         passwordForm.value.newPassword === passwordForm.value.confirmPassword &&
         passwordForm.value.newPassword.length >= 8 &&
         Object.keys(passwordErrors.value).length === 0
})

// Methods
const initializeProfile = () => {
  const user = authStore.user
  if (user) {
    console.log('Initializing profile with user data:', user)
    console.log('User gender:', user.gender)
    console.log('User height:', user.height)
    console.log('User dressSize:', user.dressSize)
    console.log('User topSize:', user.topSize)
    console.log('User pantsSize:', user.pantsSize)
    
    profileForm.value = {
      // Required text fields - use empty string for null/undefined
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role || '',
      profileImagePath: user.profileImagePath || '',
      bio: user.bio || '',
      jobTitle: user.jobTitle || '',
      department: user.department || '',
      companyName: user.companyName || '',
      // Dropdown fields - keep null as null for proper dropdown binding
      gender: user.gender || null,
      height: user.height || null,
      dressSize: user.dressSize || null,
      topSize: user.topSize || null,
      pantsSize: user.pantsSize || null
    }
    
    console.log('Profile form after initialization:', profileForm.value)
    
    // Set the profile picture URL from the user data
    profilePictureUrl.value = user.profileImagePath || ''
    console.log('Set initial profilePictureUrl to:', profilePictureUrl.value)
    console.log('Computed fullProfilePictureUrl will be:', fullProfilePictureUrl.value)
  }
}

const validateForm = () => {
  errors.value = {}

  // Required fields validation
  if (!profileForm.value.firstName.trim()) {
    errors.value.firstName = 'First name is required'
  } else if (profileForm.value.firstName.length > 50) {
    errors.value.firstName = 'First name must be 50 characters or less'
  }

  if (!profileForm.value.lastName.trim()) {
    errors.value.lastName = 'Last name is required'
  } else if (profileForm.value.lastName.length > 50) {
    errors.value.lastName = 'Last name must be 50 characters or less'
  }

  if (!profileForm.value.email.trim()) {
    errors.value.email = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileForm.value.email)) {
    errors.value.email = 'Please enter a valid email address'
  } else if (profileForm.value.email.length > 100) {
    errors.value.email = 'Email must be 100 characters or less'
  }

  if (!profileForm.value.phone.trim()) {
    errors.value.phone = 'Phone number is required'
  } else if (!/^\+?[0-9\s\-\(\)]{10,20}$/.test(profileForm.value.phone)) {
    errors.value.phone = 'Phone number must be 10-20 characters with digits, spaces, hyphens, and parentheses'
  }

  // Bio validation (optional field)
  if (profileForm.value.bio && profileForm.value.bio.length > 1000) {
    errors.value.bio = 'Bio must be 1000 characters or less'
  }

  return Object.keys(errors.value).length === 0
}

const validatePasswordForm = () => {
  passwordErrors.value = {}

  if (!passwordForm.value.currentPassword) {
    passwordErrors.value.currentPassword = 'Current password is required'
  }

  if (!passwordForm.value.newPassword) {
    passwordErrors.value.newPassword = 'New password is required'
  } else if (passwordForm.value.newPassword.length < 8) {
    passwordErrors.value.newPassword = 'Password must be at least 8 characters long'
  }

  if (!passwordForm.value.confirmPassword) {
    passwordErrors.value.confirmPassword = 'Please confirm your new password'
  } else if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    passwordErrors.value.confirmPassword = 'Passwords do not match'
  }

  return Object.keys(passwordErrors.value).length === 0
}

// Update methods for different sections
const updateProfile = async () => {
  if (!validateForm()) return

  try {
    isLoading.value = true
    
    // Prepare payload matching UserUpdateDTO structure (all fields combined)
    const updatePayload = {
      // Required fields (always include)
      firstName: profileForm.value.firstName,
      lastName: profileForm.value.lastName,
      email: profileForm.value.email,
      phone: profileForm.value.phone,
      // Optional fields (only include if they have actual values, not null/empty)
      ...(profileForm.value.gender && profileForm.value.gender !== null && { gender: profileForm.value.gender }),
      ...(profileForm.value.height && profileForm.value.height !== null && { height: profileForm.value.height }),
      ...(profileForm.value.dressSize && profileForm.value.dressSize !== null && { dressSize: profileForm.value.dressSize }),
      ...(profileForm.value.topSize && profileForm.value.topSize !== null && { topSize: profileForm.value.topSize }),
      ...(profileForm.value.pantsSize && profileForm.value.pantsSize !== null && { pantsSize: profileForm.value.pantsSize }),
      ...(profileForm.value.jobTitle && profileForm.value.jobTitle !== '' && { jobTitle: profileForm.value.jobTitle }),
      ...(profileForm.value.department && profileForm.value.department !== '' && { department: profileForm.value.department }),
      ...(profileForm.value.bio && profileForm.value.bio !== '' && { bio: profileForm.value.bio }),
      // Role should always be included even if empty (system field)
      role: profileForm.value.role
    }
    
    console.log('Update payload being sent:', updatePayload)

    await authStore.updateProfile(updatePayload)
    
    toast.add({
      severity: 'success',
      summary: 'Profile Updated',
      detail: 'Profile information has been updated successfully',
      life: 3000
    })
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Update Failed',
      detail: error.message || 'Failed to update profile',
      life: 5000
    })
  } finally {
    isLoading.value = false
  }
}


const changePassword = async () => {
  if (!validatePasswordForm()) return

  try {
    isLoading.value = true
    await authStore.changePassword({
      currentPassword: passwordForm.value.currentPassword,
      newPassword: passwordForm.value.newPassword
    })
    
    showChangePasswordDialog.value = false
    passwordForm.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
    
    toast.add({
      severity: 'success',
      summary: 'Password Changed',
      detail: 'Your password has been changed successfully',
      life: 3000
    })
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Password Change Failed',
      detail: error.message || 'Failed to change password',
      life: 5000
    })
  } finally {
    isLoading.value = false
  }
}

const resetForm = () => {
  initializeProfile()
  errors.value = {}
}

// Profile picture handlers
const handleProfilePictureUpload = async (file, onProgress) => {
  return await authStore.uploadProfilePicture(file, onProgress)
}

const handleProfilePictureDelete = async () => {
  return await authStore.deleteProfilePicture()
}

const onUploadSuccess = (result) => {
  console.log('Profile upload success - Full result:', result)
  
  // Extract URL from FileUploadResponseDTO - prioritize in this order:
  // 1. publicUrl (for CDN/external URLs)
  // 2. downloadUrl (for API download endpoints)  
  // 3. filePath (for file system paths)
  const newUrl = result.publicUrl || result.downloadUrl || result.filePath || 
                 result.url || result.profilePictureUrl || result.profileImagePath ||
                 result.data?.publicUrl || result.data?.downloadUrl || result.data?.filePath
  
  console.log('Extracted URL from upload result:', newUrl)
  
  if (newUrl) {
    profilePictureUrl.value = newUrl
    profileForm.value.profileImagePath = newUrl
    
    // Update auth store user data
    if (authStore.user) {
      authStore.user.profileImagePath = newUrl
    }
    
    console.log('Set profilePictureUrl to:', newUrl)
    console.log('Computed fullProfilePictureUrl will be:', fullProfilePictureUrl.value)
    
    // Refresh user data to ensure consistency
    setTimeout(() => {
      authStore.refreshUserData()
    }, 1000)
  } else {
    console.error('No valid URL found in upload result:', result)
  }
}

const onUploadError = (error) => {
  console.error('Profile picture upload error:', error)
}

const onDeleteSuccess = () => {
  profilePictureUrl.value = ''
  profileForm.value.profileImagePath = ''
}

const onDeleteError = (error) => {
  console.error('Profile picture delete error:', error)
}

const handleGalleryUpdate = (images) => {
  console.log('Gallery updated with images:', images)
}

// Utility methods
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString()
}

const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleString()
}

// Watch for auth store user changes
watch(() => authStore.user, (newUser, oldUser) => {
  console.log('Auth store user changed:', { newUser, oldUser })
  if (newUser) {
    console.log('User data available, initializing profile...')
    initializeProfile()
  } else {
    console.log('No user data available')
  }
}, { immediate: true, deep: true })

// Watch for changes to profileForm to debug binding
watch(() => profileForm.value, (newForm) => {
  console.log('Profile form data changed:', newForm)
  console.log('Gender value:', newForm.gender)
  console.log('Height value:', newForm.height)
  console.log('DressSize value:', newForm.dressSize)
}, { deep: true })

// Watch for changes to fullProfilePictureUrl (v-model binding)
watch(fullProfilePictureUrl, (newUrl) => {
  if (newUrl && !newUrl.includes('undefined') && !newUrl.includes('null')) {
    if (newUrl.startsWith('http')) {
      const urlParts = newUrl.split('/files/')
      if (urlParts.length > 1) {
        profilePictureUrl.value = '/files/' + urlParts[1]
      } else {
        const s3Parts = newUrl.split('.amazonaws.com/')
        if (s3Parts.length > 1) {
          profilePictureUrl.value = s3Parts[1]
        } else {
          profilePictureUrl.value = newUrl
        }
      }
    }
  }
})

// Lifecycle
onMounted(async () => {
  if (authStore.isAuthenticated && !authStore.user) {
    try {
      await authStore.getCurrentUser()
    } catch (error) {
      console.error('Failed to fetch user data:', error)
    }
  }
  
  if (authStore.user) {
    initializeProfile()
  }
})
</script>

<style scoped>
.profile-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

.profile-content {
  width: 100%;
  margin-top: 2rem;
}

.tab-content {
  padding: 1.5rem 0;
}

.form-section {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #e2e8f0;
}

.profile-form {
  width: 100%;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group.full-width {
  grid-column: span 2;
}

.form-label {
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
}

.form-label.required::after {
  content: ' *';
  color: #ef4444;
}

.form-input {
  width: 100%;
}

.char-counter {
  text-align: right;
  color: #6b7280;
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

.profile-picture-card {
  max-width: 800px;
  margin: 0 auto;
}

.picture-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  align-items: start;
}

.picture-info h4 {
  margin: 0 0 1rem 0;
  color: #1e293b;
}

.picture-info ul {
  margin: 0;
  padding-left: 1.25rem;
  color: #64748b;
}

.picture-info li {
  margin-bottom: 0.5rem;
}

.settings-sections {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-item label {
  font-weight: 500;
  color: #6b7280;
  font-size: 0.875rem;
}

.info-item span {
  color: #1e293b;
  font-size: 0.875rem;
}

.settings-grid {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #f8fafc;
}

.setting-info h5 {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
}

.setting-info p {
  margin: 0;
  color: #64748b;
  font-size: 0.875rem;
}

.password-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.dialog-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1rem;
}

/* Responsive design */
@media (max-width: 1024px) {
  .profile-page {
    padding: 1.5rem;
  }
  
  .picture-section {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .profile-page {
    padding: 1rem;
  }

  .form-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .form-group.full-width {
    grid-column: span 1;
  }

  .form-actions {
    flex-direction: column;
  }

  .setting-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}

/* TabView styling */
:deep(.p-tabview-nav) {
  background: transparent;
  border-bottom: 2px solid #e2e8f0;
}

:deep(.p-tabview-nav-link) {
  background: transparent;
  border: none;
  font-weight: 500;
}

:deep(.p-tabview-nav-link:not(.p-disabled):not(.p-highlight):hover) {
  background: #f8fafc;
}

:deep(.p-highlight .p-tabview-nav-link) {
  background: transparent;
  border-color: #3b82f6;
  color: #3b82f6;
}

:deep(.p-tabview-panels) {
  background: transparent;
  padding: 0;
}
</style>