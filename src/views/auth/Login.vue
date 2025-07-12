<template>
  <div class="login-form-container">
    <!-- Main Login Card -->
    <div class="login-card">
      <!-- Header Section -->
      <div class="login-header">
        <div class="logo-section">
          <i class="pi pi-chart-line logo-icon"></i>
          <h1 class="app-title">Activation Tracker</h1>
        </div>
        <p class="app-subtitle">
          Sign in to access your dashboard
        </p>
      </div>

      <!-- Login Form -->
      <form @submit.prevent="handleSubmit" class="login-form">
        <!-- Email/Username Field -->
        <div class="form-group">
          <label for="email" class="form-label">Email or Username</label>
          <InputText
              id="email"
              v-model="formData.email"
              :class="{ 'p-invalid': errors.email }"
              placeholder="Enter your email or username"
              autocomplete="email"
              :disabled="isLoading"
              class="form-input"
          />
          <small v-if="errors.email" class="error-message">
            {{ errors.email }}
          </small>
        </div>

        <!-- Password Field -->
        <div class="form-group">
          <label for="password" class="form-label">Password</label>
          <Password
              id="password"
              v-model="formData.password"
              :class="{ 'p-invalid': errors.password }"
              placeholder="Enter your password"
              :feedback="false"
              toggleMask
              autocomplete="current-password"
              :disabled="isLoading"
              class="form-input"
              inputClass="w-full"
          />
          <small v-if="errors.password" class="error-message">
            {{ errors.password }}
          </small>
        </div>

        <!-- Remember Me -->
        <div class="form-group">
          <div class="checkbox-wrapper">
            <Checkbox
                id="rememberMe"
                v-model="formData.rememberMe"
                :binary="true"
                :disabled="isLoading"
            />
            <label for="rememberMe" class="checkbox-label">
              Remember me for 30 days
            </label>
          </div>
        </div>

        <!-- General Error Message -->
        <div v-if="generalError" class="error-alert">
          <i class="pi pi-exclamation-triangle error-icon"></i>
          <span>{{ generalError }}</span>
        </div>

        <!-- Submit Button -->
        <Button
            type="submit"
            :loading="isLoading"
            :disabled="!isFormValid || isLoading"
            label="Sign In"
            class="login-button"
            icon="pi pi-sign-in"
        />

        <!-- Forgot Password Link -->
        <div class="forgot-password-section">
          <router-link to="/forgot-password" class="forgot-link">
            Forgot your password?
          </router-link>
        </div>
      </form>

      <!-- Divider -->
      <div class="divider">
        <hr class="divider-line">
        <span class="divider-text">New to Activation Tracker?</span>
        <hr class="divider-line">
      </div>

      <!-- Sign Up Section -->
      <div class="signup-section">
        <p class="signup-text">
          Don't have an account?
          <router-link to="/register" class="signup-link">
            Sign up here
          </router-link>
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div class="login-footer">
      <p class="footer-text">
        © {{ currentYear }} Activation Tracker. All rights reserved.
      </p>
      <div class="footer-links">
        <a href="/privacy" class="footer-link">Privacy Policy</a>
        <a href="/terms" class="footer-link">Terms of Service</a>
        <a href="/support" class="footer-link">Support</a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { useAuthStore } from '@/stores/auth'

const props = defineProps({
  redirectTo: {
    type: String,
    default: '/dashboard'
  }
})

const emit = defineEmits(['login-success', 'login-error'])

const router = useRouter()
const route = useRoute()
const toast = useToast()
const authStore = useAuthStore()

// Form data
const formData = ref({
  email: '',
  password: '',
  rememberMe: false
})

// Form state
const isLoading = ref(false)
const errors = ref({})
const generalError = ref('')

// Computed properties
const currentYear = computed(() => new Date().getFullYear())

const isFormValid = computed(() => {
  return formData.value.email.length > 0 &&
      formData.value.password.length > 0 &&
      Object.keys(errors.value).length === 0
})

// Methods
const validateForm = () => {
  const newErrors = {}

  if (!formData.value.email) {
    newErrors.email = 'Email or username is required'
  }

  if (!formData.value.password) {
    newErrors.password = 'Password is required'
  } else if (formData.value.password.length < 6) {
    newErrors.password = 'Password must be at least 6 characters'
  }

  errors.value = newErrors
  return Object.keys(newErrors).length === 0
}

const clearFieldError = (field) => {
  if (errors.value[field]) {
    delete errors.value[field]
  }
}

const handleSubmit = async () => {
  console.log('🚀 Form submitted with data:', {
    email: formData.value.email,
    rememberMe: formData.value.rememberMe
  })

  // Clear previous errors
  generalError.value = ''
  if (authStore.clearLoginError) {
    authStore.clearLoginError()
  }

  // Validate form
  if (!validateForm()) {
    console.log('❌ Form validation failed:', errors.value)
    return
  }

  try {
    isLoading.value = true
    console.log('🔄 Starting login process...')

    // Prepare login credentials
    const credentials = {
      email: formData.value.email,
      password: formData.value.password,
      rememberMe: formData.value.rememberMe
    }

    // Attempt login
    const response = await authStore.login(credentials)
    console.log('✅ Login response received:', response)

    // Verify stored data
    const storedToken = localStorage.getItem('activation_auth_token')
    const storedUser = localStorage.getItem('user')

    console.log('🔍 Verification - Token stored:', storedToken ? 'YES' : 'NO')
    console.log('🔍 Verification - User stored:', storedUser ? 'YES' : 'NO')
    console.log('🔍 Verification - Auth state:', authStore.isAuthenticated)

    // Success handling
    toast.add({
      severity: 'success',
      summary: 'Welcome!',
      detail: 'Logged in successfully',
      life: 3000
    })

    emit('login-success', response)

    // Small delay to ensure storage is complete
    await new Promise(resolve => setTimeout(resolve, 100))

    // Navigate to dashboard
    console.log('🏠 Redirecting to dashboard...')
    await router.push('/dashboard')

  } catch (error) {
    console.error('❌ Login error:', error)

    generalError.value = error.message || 'Login failed. Please check your credentials and try again.'

    emit('login-error', error)

    toast.add({
      severity: 'error',
      summary: 'Login Failed',
      detail: generalError.value,
      life: 5000
    })
  } finally {
    isLoading.value = false
  }
}

// Lifecycle
onMounted(() => {
  console.log('🔧 LoginForm mounted')

  // Check if user is already logged in
  if (authStore.isAuthenticated) {
    console.log('🔄 User already authenticated, redirecting to dashboard...')
    router.push('/dashboard')
    return
  }

  // Pre-fill email from query params if available
  if (route.query.email) {
    formData.value.email = route.query.email
  }

  // Show any messages from query params
  if (route.query.message) {
    toast.add({
      severity: 'info',
      summary: 'Information',
      detail: route.query.message,
      life: 5000
    })
  }

  // Focus on first input
  setTimeout(() => {
    const firstInput = document.getElementById('email')
    if (firstInput) {
      firstInput.focus()
    }
  }, 100)
})

// Watch for field changes to clear errors
watch(() => formData.value.email, () => clearFieldError('email'))
watch(() => formData.value.password, () => clearFieldError('password'))
</script>

<style scoped>
.login-form-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem 1rem;
}

.login-card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  padding: 3rem;
  width: 100%;
  max-width: 450px;
  position: relative;
  overflow: hidden;
  animation: slideIn 0.5s ease-out;
}

.login-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.logo-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.logo-icon {
  font-size: 2.5rem;
  color: #3b82f6;
}

.app-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.app-subtitle {
  color: #6b7280;
  font-size: 1rem;
  margin: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
}

.form-input {
  width: 100%;
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.checkbox-label {
  color: #6b7280;
  font-size: 0.875rem;
  cursor: pointer;
}

.error-message {
  color: #dc2626;
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

.error-alert {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background-color: #fef2f2;
  border: 1px solid #fca5a5;
  border-radius: 0.5rem;
  color: #dc2626;
  font-size: 0.875rem;
}

.error-icon {
  font-size: 1rem;
}

.login-button {
  width: 100%;
  height: 3rem;
  font-weight: 600;
  font-size: 1rem;
  margin-top: 0.5rem;
}

.forgot-password-section {
  text-align: center;
  margin-top: 1rem;
}

.forgot-link {
  color: #3b82f6;
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  transition: color 0.2s;
}

.forgot-link:hover {
  color: #1d4ed8;
  text-decoration: underline;
}

.divider {
  display: flex;
  align-items: center;
  margin: 2rem 0;
  gap: 1rem;
}

.divider-line {
  flex: 1;
  height: 1px;
  background-color: #e5e7eb;
  border: none;
}

.divider-text {
  color: #9ca3af;
  font-size: 0.875rem;
  white-space: nowrap;
}

.signup-section {
  text-align: center;
}

.signup-text {
  color: #6b7280;
  font-size: 0.875rem;
  margin: 0;
}

.signup-link {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s;
}

.signup-link:hover {
  color: #1d4ed8;
  text-decoration: underline;
}

.login-footer {
  margin-top: 2rem;
  text-align: center;
}

.footer-text {
  color: #d1d5db;
  font-size: 0.75rem;
  margin: 0 0 1rem 0;
}

.footer-links {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.footer-link {
  color: #d1d5db;
  text-decoration: none;
  font-size: 0.75rem;
  transition: color 0.2s;
}

.footer-link:hover {
  color: #ffffff;
  text-decoration: underline;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive Design */
@media (max-width: 640px) {
  .login-form-container {
    padding: 1rem;
  }

  .login-card {
    padding: 2rem;
    max-width: 100%;
  }

  .app-title {
    font-size: 1.75rem;
  }

  .footer-links {
    gap: 1rem;
  }
}
</style>