<template>
  <div class="reset-password">
    <div class="reset-password-container">
      <div class="content-card">
        <div class="icon">
          <i class="pi pi-shield"></i>
        </div>
        <h2 class="title">Reset Your Password</h2>
        <p class="subtitle">Enter your new password below</p>
        
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label for="password" class="form-label">New Password</label>
            <Password
              id="password"
              v-model="formData.password"
              :class="{ 'p-invalid': errors.password }"
              placeholder="Enter new password"
              :disabled="isLoading"
              toggleMask
              :feedback="true"
              class="form-input"
              inputClass="w-full"
            />
            <small v-if="errors.password" class="error-message">
              {{ errors.password }}
            </small>
          </div>

          <div class="form-group">
            <label for="confirmPassword" class="form-label">Confirm Password</label>
            <Password
              id="confirmPassword"
              v-model="formData.confirmPassword"
              :class="{ 'p-invalid': errors.confirmPassword }"
              placeholder="Confirm new password"
              :disabled="isLoading"
              toggleMask
              :feedback="false"
              class="form-input"
              inputClass="w-full"
            />
            <small v-if="errors.confirmPassword" class="error-message">
              {{ errors.confirmPassword }}
            </small>
          </div>

          <div v-if="generalError" class="error-alert">
            <i class="pi pi-exclamation-triangle"></i>
            <span>{{ generalError }}</span>
          </div>

          <Button
            type="submit"
            :loading="isLoading"
            :disabled="!isFormValid || isLoading"
            label="Reset Password"
            class="submit-btn"
            icon="pi pi-check"
          />
        </form>

        <div class="actions">
          <router-link to="/login" class="back-link">
            <i class="pi pi-arrow-left"></i>
            Back to Login
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { authService } from '@/services/api'
import Password from 'primevue/password'
import Button from 'primevue/button'

const router = useRouter()
const route = useRoute()
const toast = useToast()

const formData = ref({
  password: '',
  confirmPassword: ''
})

const isLoading = ref(false)
const errors = ref({})
const generalError = ref('')
const token = ref('')

const isFormValid = computed(() => {
  return formData.value.password.length >= 6 &&
    formData.value.confirmPassword.length >= 6 &&
    Object.keys(errors.value).length === 0
})

const validateForm = () => {
  const newErrors = {}

  if (!formData.value.password) {
    newErrors.password = 'Password is required'
  } else if (formData.value.password.length < 6) {
    newErrors.password = 'Password must be at least 6 characters'
  }

  if (!formData.value.confirmPassword) {
    newErrors.confirmPassword = 'Please confirm your password'
  } else if (formData.value.password !== formData.value.confirmPassword) {
    newErrors.confirmPassword = 'Passwords do not match'
  }

  errors.value = newErrors
  return Object.keys(newErrors).length === 0
}

const handleSubmit = async () => {
  generalError.value = ''

  if (!validateForm()) {
    return
  }

  if (!token.value) {
    generalError.value = 'Invalid or expired reset link'
    return
  }

  try {
    isLoading.value = true
    await authService.resetPassword(token.value, formData.value.password)
    
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Your password has been reset successfully',
      life: 5000
    })

    setTimeout(() => {
      router.push('/login')
    }, 2000)
  } catch (error) {
    generalError.value = error.response?.data?.message || 'Failed to reset password. The link may have expired.'
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: generalError.value,
      life: 5000
    })
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  token.value = route.query.token || ''
  
  if (!token.value) {
    toast.add({
      severity: 'error',
      summary: 'Invalid Link',
      detail: 'This password reset link is invalid or has expired',
      life: 5000
    })
    
    setTimeout(() => {
      router.push('/forgot-password')
    }, 3000)
  }
})
</script>

<style scoped>
.reset-password {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.reset-password-container {
  width: 100%;
  max-width: 450px;
}

.content-card {
  background: white;
  padding: 3rem 2rem;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.icon {
  text-align: center;
  margin-bottom: 1.5rem;
}

.icon i {
  font-size: 4rem;
  color: #10b981;
  opacity: 0.8;
}

.title {
  color: #2c3e50;
  font-size: 2rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
  text-align: center;
}

.subtitle {
  color: #7f8c8d;
  font-size: 1rem;
  margin-bottom: 2rem;
  text-align: center;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.form-input {
  width: 100%;
}

.error-message {
  color: #dc2626;
  font-size: 0.75rem;
  margin-top: 0.25rem;
  display: block;
}

.error-alert {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background-color: #fef2f2;
  border: 1px solid #fca5a5;
  border-radius: 8px;
  color: #dc2626;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.submit-btn {
  width: 100%;
  height: 3rem;
  font-weight: 600;
  font-size: 1rem;
  margin-bottom: 1.5rem;
}

.actions {
  text-align: center;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #3b82f6;
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  transition: color 0.2s;
}

.back-link:hover {
  color: #1d4ed8;
  text-decoration: underline;
}

:deep(.p-password input) {
  width: 100%;
}

@media (max-width: 480px) {
  .reset-password {
    padding: 1rem;
  }

  .content-card {
    padding: 2rem 1.5rem;
  }

  .title {
    font-size: 1.75rem;
  }

  .icon i {
    font-size: 3rem;
  }
}
</style>