<template>
  <div class="forgot-password">
    <div class="forgot-password-container">
      <div class="content-card">
        <div class="icon">
          <i class="pi pi-lock"></i>
        </div>
        <h2 class="title">Forgot Password</h2>
        <p class="subtitle">Enter your email address and we'll send you a link to reset your password.</p>
        
        <form @submit.prevent="handleSubmit" v-if="!isSuccess">
          <div class="form-group">
            <InputText
              v-model="email"
              type="email"
              placeholder="Enter your email address"
              :class="{ 'p-invalid': errors.email }"
              :disabled="isLoading"
              class="form-input"
            />
            <small v-if="errors.email" class="error-message">
              {{ errors.email }}
            </small>
          </div>

          <div v-if="generalError" class="error-alert">
            <i class="pi pi-exclamation-triangle"></i>
            <span>{{ generalError }}</span>
          </div>

          <Button
            type="submit"
            :loading="isLoading"
            :disabled="!email || isLoading"
            label="Send Reset Link"
            class="submit-btn"
            icon="pi pi-send"
          />
        </form>

        <div v-else class="success-message">
          <i class="pi pi-check-circle"></i>
          <h3>Check your email</h3>
          <p>We've sent a password reset link to {{ email }}</p>
          <p class="note">The link will expire in 1 hour</p>
        </div>

        <div class="actions">
          <button @click="goBack" class="back-btn">
            <i class="pi pi-arrow-left"></i>
            Back to Login
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { authService } from '@/services/api'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'

const router = useRouter()
const toast = useToast()

const email = ref('')
const isLoading = ref(false)
const isSuccess = ref(false)
const errors = ref({})
const generalError = ref('')

const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

const handleSubmit = async () => {
  errors.value = {}
  generalError.value = ''

  if (!email.value) {
    errors.value.email = 'Email is required'
    return
  }

  if (!validateEmail(email.value)) {
    errors.value.email = 'Please enter a valid email address'
    return
  }

  try {
    isLoading.value = true
    await authService.forgotPassword(email.value)
    
    isSuccess.value = true
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Password reset link has been sent to your email',
      life: 5000
    })
  } catch (error) {
    generalError.value = error.response?.data?.message || 'Failed to send reset link. Please try again.'
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

const goBack = () => {
  router.push('/login')
}
</script>

<style scoped>
.forgot-password {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.forgot-password-container {
  width: 100%;
  max-width: 450px;
}

.content-card {
  background: white;
  padding: 3rem 2rem;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.icon {
  margin-bottom: 1.5rem;
}

.icon i {
  font-size: 4rem;
  color: #3498db;
  opacity: 0.8;
}

.title {
  color: #2c3e50;
  font-size: 2rem;
  margin-bottom: 1rem;
  font-weight: 600;
}

.subtitle {
  color: #7f8c8d;
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
}

.description {
  color: #6c757d;
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: 2rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #17a2b8;
}

.actions {
  display: flex;
  justify-content: center;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 2rem;
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(52, 152, 219, 0.3);
}

.back-btn:active {
  transform: translateY(0);
}

.form-group {
  margin-bottom: 1.5rem;
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

.success-message {
  text-align: center;
  padding: 2rem 1rem;
  margin-bottom: 1.5rem;
}

.success-message i {
  font-size: 3rem;
  color: #10b981;
  margin-bottom: 1rem;
  display: block;
}

.success-message h3 {
  color: #1f2937;
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
}

.success-message p {
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.success-message .note {
  font-size: 0.875rem;
  color: #9ca3af;
  margin-top: 1rem;
}

@media (max-width: 480px) {
  .forgot-password {
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