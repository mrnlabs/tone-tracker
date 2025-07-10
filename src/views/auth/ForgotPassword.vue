<template>
  <div class="forgot-password">
    <div class="forgot-password-container">
      <div class="content-card">
        <div class="icon">
          <i class="pi pi-lock"></i>
        </div>
        <h2 class="title">Forgot Password</h2>
        <p class="subtitle">This feature will be implemented soon.</p>
        <p class="description">
          For now, please contact your administrator to reset your password.
        </p>

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
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
  router.push('/')
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