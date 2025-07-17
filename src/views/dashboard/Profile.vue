<template>
  <DashboardLayout>
    <div class="profile-page">
      <!-- Page Header -->
      <PageHeader 
        title="My Profile"
        description="Manage your profile information and settings"
        :loading="isLoading"
      />


      <!-- Profile Content -->
    <div class="profile-content">
      <div class="profile-grid">
        <!-- Profile Picture Section -->
        <Card class="profile-picture-section">
          <template #header>
            <div class="section-header">
              <h3>Profile Picture</h3>
              <p>Upload your profile picture to personalize your account</p>
            </div>
          </template>
          <template #content>
            <ProfilePictureUpload
              v-model="fullProfilePictureUrl"
              :user-name="userFullName"
              :user-id="userId"
              :upload-handler="handleProfilePictureUpload"
              :delete-handler="handleProfilePictureDelete"
              @upload-success="onUploadSuccess"
              @upload-error="onUploadError"
              @delete-success="onDeleteSuccess"
              @delete-error="onDeleteError"
            />
          </template>
        </Card>

        <!-- Profile Information Section -->
        <Card class="profile-info-section">
          <template #header>
            <div class="section-header">
              <h3>Profile Information</h3>
              <p>Update your personal information and contact details</p>
            </div>
          </template>
          <template #content>
            <form @submit.prevent="updateProfile" class="profile-form">
              <div class="form-grid">
                <div class="form-group">
                  <label for="firstName" class="form-label">First Name</label>
                  <InputText
                    id="firstName"
                    v-model="profileForm.firstName"
                    class="form-input"
                    :class="{ 'p-invalid': errors.firstName }"
                  />
                  <small v-if="errors.firstName" class="p-error">{{ errors.firstName }}</small>
                </div>

                <div class="form-group">
                  <label for="lastName" class="form-label">Last Name</label>
                  <InputText
                    id="lastName"
                    v-model="profileForm.lastName"
                    class="form-input"
                    :class="{ 'p-invalid': errors.lastName }"
                  />
                  <small v-if="errors.lastName" class="p-error">{{ errors.lastName }}</small>
                </div>

                <div class="form-group">
                  <label for="email" class="form-label">Email Address</label>
                  <InputText
                    id="email"
                    v-model="profileForm.email"
                    type="email"
                    class="form-input"
                    :class="{ 'p-invalid': errors.email }"
                  />
                  <small v-if="errors.email" class="p-error">{{ errors.email }}</small>
                </div>

                <div class="form-group">
                  <label for="phone" class="form-label">Phone Number</label>
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
                  <label for="role" class="form-label">Role</label>
                  <InputText
                    id="role"
                    :value="userRole"
                    class="form-input"
                    readonly
                    disabled
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
              </div>

              <div class="form-actions">
                <Button
                  type="submit"
                  label="Update Profile"
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

        <!-- Account Settings Section -->
        <Card class="account-settings-section">
          <template #header>
            <div class="section-header">
              <h3>Account Settings</h3>
              <p>Manage your account security and preferences</p>
            </div>
          </template>
          <template #content>
            <div class="settings-grid">
              <div class="setting-item">
                <div class="setting-info">
                  <h4>Password</h4>
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
                  <h4>Email Notifications</h4>
                  <p>Manage your email notification preferences</p>
                </div>
                <ToggleButton
                  v-model="emailNotifications"
                  onIcon="pi pi-bell"
                  offIcon="pi pi-bell-slash"
                  onLabel="Enabled"
                  offLabel="Disabled"
                  @change="updateNotificationSettings"
                />
              </div>

              <div class="setting-item">
                <div class="setting-info">
                  <h4>Two-Factor Authentication</h4>
                  <p>Add an extra layer of security to your account</p>
                </div>
                <Button
                  label="Setup 2FA"
                  icon="pi pi-shield"
                  class="p-button-outlined"
                  disabled
                />
              </div>
            </div>
          </template>
        </Card>
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
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useAuthStore } from '@/stores/auth'
import DashboardLayout from '@/components/general/DashboardLayout.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import ProfilePictureUpload from '@/components/form-components/ProfilePictureUpload.vue'

const toast = useToast()
const authStore = useAuthStore()

// Reactive state
const profilePictureUrl = ref('')
const isLoading = ref(false)
const showChangePasswordDialog = ref(false)
const emailNotifications = ref(true)

// Form data
const profileForm = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  department: '',
  role: ''
})

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// Form validation
const errors = ref({})
const passwordErrors = ref({})

// Computed properties
const userFullName = computed(() => authStore.userFullName)
const userId = computed(() => authStore.userId)
const userRole = computed(() => authStore.userRole)

// Computed property for full profile picture URL
const fullProfilePictureUrl = computed(() => {
  if (profilePictureUrl.value) {
    // If it's already a full URL, use it as is
    if (profilePictureUrl.value.startsWith('http')) {
      return profilePictureUrl.value
    }
    // Otherwise, construct the full URL using S3 bucket
    const s3BaseUrl = import.meta.env.VITE_AWS_S3_BUCKET || 'https://client-activation-tracker.s3.af-south-1.amazonaws.com/'
    return `${s3BaseUrl}${profilePictureUrl.value}`
  }
  return ''
})

const isFormValid = computed(() => {
  return profileForm.value.firstName.trim() &&
         profileForm.value.lastName.trim() &&
         profileForm.value.email.trim() &&
         Object.keys(errors.value).length === 0
})

const isPasswordFormValid = computed(() => {
  return passwordForm.value.currentPassword &&
         passwordForm.value.newPassword &&
         passwordForm.value.confirmPassword &&
         passwordForm.value.newPassword === passwordForm.value.confirmPassword &&
         Object.keys(passwordErrors.value).length === 0
})

// Methods
const initializeProfile = () => {
  const user = authStore.user
  if (user) {
    profileForm.value = {
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phone || '',
      department: user.department || '',
      role: user.role || authStore.userRole || ''
    }
    profilePictureUrl.value = user.profilePictureUrl || user.profileImagePath || ''
  }
}

const validateForm = () => {
  errors.value = {}

  if (!profileForm.value.firstName.trim()) {
    errors.value.firstName = 'First name is required'
  }

  if (!profileForm.value.lastName.trim()) {
    errors.value.lastName = 'Last name is required'
  }

  if (!profileForm.value.email.trim()) {
    errors.value.email = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileForm.value.email)) {
    errors.value.email = 'Please enter a valid email address'
  }

  if (profileForm.value.phone && !/^\+?[\d\s-()]+$/.test(profileForm.value.phone)) {
    errors.value.phone = 'Please enter a valid phone number'
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

const updateProfile = async () => {
  if (!validateForm()) return

  try {
    await authStore.updateProfile(profileForm.value)
    toast.add({
      severity: 'success',
      summary: 'Profile Updated',
      detail: 'Your profile has been updated successfully',
      life: 3000
    })
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Update Failed',
      detail: error.message || 'Failed to update profile',
      life: 5000
    })
  }
}

const changePassword = async () => {
  if (!validatePasswordForm()) return

  try {
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
  }
}

const resetForm = () => {
  initializeProfile()
  errors.value = {}
}

const handleProfilePictureUpload = async (file, onProgress) => {
  return await authStore.uploadProfilePicture(file, onProgress)
}

const handleProfilePictureDelete = async () => {
  return await authStore.deleteProfilePicture()
}

const onUploadSuccess = (result) => {
  profilePictureUrl.value = result.url || result.profilePictureUrl
}

const onUploadError = (error) => {
  console.error('Profile picture upload error:', error)
}

const onDeleteSuccess = () => {
  profilePictureUrl.value = ''
}

const onDeleteError = (error) => {
  console.error('Profile picture delete error:', error)
}

const updateNotificationSettings = async () => {
  try {
    // This would be implemented when notification settings API is available
    toast.add({
      severity: 'info',
      summary: 'Settings Updated',
      detail: 'Notification settings have been updated',
      life: 3000
    })
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Update Failed',
      detail: 'Failed to update notification settings',
      life: 5000
    })
  }
}

// Watch for auth store user changes
watch(() => authStore.user, (newUser) => {
  if (newUser) {
    initializeProfile()
  }
}, { immediate: true })

// Lifecycle
onMounted(async () => {
  // If authenticated but no user data, try to fetch it
  if (authStore.isAuthenticated && !authStore.user) {
    try {
      await authStore.getCurrentUser()
    } catch (error) {
      console.error('Failed to fetch user data:', error)
    }
  }
  
  // Ensure we initialize even if user is already loaded
  if (authStore.user) {
    initializeProfile()
  }
})
</script>

<style scoped>
.profile-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}


.profile-content {
  width: 100%;
}

.profile-grid {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 2rem;
  align-items: start;
}

.profile-picture-section {
  grid-column: 1;
}

.profile-info-section {
  grid-column: 2;
}

.account-settings-section {
  grid-column: 1 / -1;
  margin-top: 2rem;
}

.section-header {
  padding: 1rem 0;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 1.5rem;
}

.section-header h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
}

.section-header p {
  margin: 0;
  color: #64748b;
  font-size: 0.875rem;
}

.profile-form {
  width: 100%;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
}

.form-input {
  width: 100%;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
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
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #f8fafc;
}

.setting-info h4 {
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
@media (max-width: 768px) {
  .profile-page {
    padding: 1rem;
  }


  .profile-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .profile-picture-section {
    grid-column: 1;
  }

  .profile-info-section {
    grid-column: 1;
  }

  .account-settings-section {
    grid-column: 1;
    margin-top: 1.5rem;
  }

  .form-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
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

@media (max-width: 480px) {
  .profile-page {
    padding: 0.5rem;
  }

}
</style>