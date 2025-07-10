<!-- LoginForm.vue - Fixed to use email field -->
<template>
  <div class="login-form-container">
    <div class="login-card">
      <!-- Logo and Header -->
      <div class="login-header">
        <div class="logo-section">
          <i class="pi pi-chart-line logo-icon"></i>
          <h1 class="app-title">Activation Tracker</h1>
        </div>
        <p class="login-subtitle">Sign in to your account</p>
      </div>

      <!-- Login Form -->
      <form @submit.prevent="handleSubmit" class="login-form">
        <!-- Email/Username Field -->
        <div class="form-group">
          <label for="email" class="form-label">
            Email or Username
            <span class="required">*</span>
          </label>
          <div class="input-container">
            <i class="pi pi-user input-icon"></i>
            <InputText
                id="email"
                v-model="formData.email"
                :class="{ 'p-invalid': errors.email }"
                placeholder="Enter your email or username"
                autocomplete="username"
                :disabled="isLoading"
            />
          </div>
          <div v-if="errors.email" class="error-message">
            <i class="pi pi-exclamation-circle"></i>
            {{ errors.email }}
          </div>
        </div>

        <!-- Password Field -->
        <div class="form-group">
          <label for="password" class="form-label">
            Password
            <span class="required">*</span>
          </label>
          <div class="input-container">
            <i class="pi pi-lock input-icon"></i>
            <Password
                id="password"
                v-model="formData.password"
                :class="{ 'p-invalid': errors.password }"
                placeholder="Enter your password"
                :feedback="false"
                toggleMask
                autocomplete="current-password"
                :disabled="isLoading"
            />
          </div>
          <div v-if="errors.password" class="error-message">
            <i class="pi pi-exclamation-circle"></i>
            {{ errors.password }}
          </div>
        </div>

        <!-- Remember Me and Forgot Password -->
        <div class="form-options">
          <div class="remember-me">
            <Checkbox
                id="rememberMe"
                v-model="formData.rememberMe"
                :binary="true"
                :disabled="isLoading"
            />
            <label for="rememberMe" class="remember-label">Remember me</label>
          </div>
          <router-link to="/forgot-password" class="forgot-link">
            Forgot password?
          </router-link>
        </div>

        <!-- Submit Button -->
        <Button
            type="submit"
            :label="isLoading ? 'Signing In...' : 'Sign In'"
            icon="pi pi-sign-in"
            :loading="isLoading"
            :disabled="!isFormValid || isLoading"
            class="login-button"
        />

        <!-- General Error Display -->
        <div v-if="generalError" class="error-message general-error">
          <i class="pi pi-exclamation-circle"></i>
          {{ generalError }}
        </div>
      </form>

      <!-- Loading Overlay -->
      <div v-if="isLoading" class="loading-overlay">
        <div class="spinner">
          <div class="spinner-circle"></div>
        </div>
        <span class="loading-text">Signing you in...</span>
      </div>

      <!-- Sign Up Link -->
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

// Form data - Fixed to use 'email' instead of 'identifier'
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
  console.log('Form submitted with data:', formData.value) // Debug log

  // Clear previous errors
  generalError.value = ''
  authStore.clearLoginError()

  // Validate form
  if (!validateForm()) {
    console.log('Form validation failed:', errors.value)
    return
  }

  try {
    isLoading.value = true
    console.log('Starting login process...')

    // Prepare login credentials
    const credentials = {
      email: formData.value.email,
      password: formData.value.password,
      rememberMe: formData.value.rememberMe
    }

    console.log('Sending login request with credentials:', {
      email: credentials.email,
      rememberMe: credentials.rememberMe
      // Don't log password for security
    })

    // Attempt login
    const response = await authStore.login(credentials)
    console.log('Login response:', response)

    // Success handling
    toast.add({
      severity: 'success',
      summary: 'Welcome!',
      detail: 'Logged in successfully',
      life: 3000
    })

    emit('login-success', response)

    // Redirect to intended page or dashboard
    const redirectPath = route.query.redirect || props.redirectTo
    console.log('Redirecting to:', redirectPath)
    await router.push(redirectPath)

  } catch (error) {
    console.error('Login error:', error)

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
  console.log('LoginForm mounted')

  // Check if user is already logged in
  if (authStore.isAuthenticated) {
    console.log('User already authenticated, redirecting...')
    router.push(props.redirectTo)
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
  color: #111827;
  margin: 0;
}

.login-subtitle {
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
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
}

.required {
  color: #ef4444;
  margin-left: 0.25rem;
}

.input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 1rem;
  color: #6b7280;
  z-index: 1;
  font-size: 0.875rem;
}

:deep(.p-inputtext),
:deep(.p-password .p-inputtext) {
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: all 0.2s ease-in-out;
}

:deep(.p-inputtext:focus),
:deep(.p-password .p-inputtext:focus) {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

:deep(.p-password) {
  width: 100%;
}

:deep(.p-password .p-password-toggle) {
  right: 1rem;
  color: #6b7280;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0.5rem 0;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.remember-label {
  font-size: 0.875rem;
  color: #6b7280;
  cursor: pointer;
}

.forgot-link {
  font-size: 0.875rem;
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
}

.forgot-link:hover {
  text-decoration: underline;
}

.login-button {
  margin-top: 0.5rem;
  padding: 1rem;
  font-size: 1rem;
  font-weight: 600;
  width: 100%;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.25rem;
  padding: 0.5rem;
  background-color: rgba(239, 68, 68, 0.1);
  border-radius: 0.375rem;
}

.general-error {
  margin-top: 0.5rem;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 999;
  border-radius: 1rem;
  gap: 1rem;
}

.spinner {
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner-circle {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 500;
}

.signup-section {
  text-align: center;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.signup-text {
  color: #6b7280;
  font-size: 0.875rem;
  margin: 0;
}

.signup-link {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
  margin-left: 0.25rem;
}

.signup-link:hover {
  text-decoration: underline;
}

.login-footer {
  margin-top: 2rem;
  text-align: center;
}

.footer-text {
  color: rgba(255, 255, 255, 0.8);
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
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  font-size: 0.75rem;
  transition: color 0.2s;
}

.footer-link:hover {
  color: white;
  text-decoration: underline;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive design */
@media (max-width: 768px) {
  .login-form-container {
    padding: 1rem;
  }

  .login-card {
    padding: 2rem;
  }

  .app-title {
    font-size: 1.75rem;
  }

  .logo-section {
    flex-direction: column;
    gap: 0.5rem;
  }

  .form-options {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .footer-links {
    flex-direction: column;
    gap: 0.75rem;
  }
}
</style>