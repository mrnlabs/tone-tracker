<template>
  <div class="not-found">
    <div class="not-found-content">
      <div class="error-illustration">
        <div class="error-code">404</div>
        <div class="error-icon">
          <i class="pi pi-exclamation-triangle"></i>
        </div>
      </div>

      <div class="error-text">
        <h1>Page Not Found</h1>
        <p>Sorry, the page you are looking for doesn't exist or has been moved.</p>
      </div>

      <div class="error-actions">
        <Button
            @click="goHome"
            label="Go Home"
            icon="pi pi-home"
            class="p-button-lg"
        />
        <Button
            @click="goBack"
            label="Go Back"
            icon="pi pi-arrow-left"
            class="p-button-outlined p-button-lg"
        />
      </div>

      <div class="helpful-links">
        <h3>You might be looking for:</h3>
        <div class="links-grid">
          <router-link to="/dashboard" class="help-link">
            <i class="pi pi-home"></i>
            <span>Dashboard</span>
          </router-link>
          <router-link to="/activations" class="help-link">
            <i class="pi pi-calendar"></i>
            <span>Activations</span>
          </router-link>
          <router-link to="/clients" class="help-link">
            <i class="pi pi-building"></i>
            <span>Clients</span>
          </router-link>
          <router-link to="/warehouses" class="help-link">
            <i class="pi pi-box"></i>
            <span>Warehouses</span>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const goHome = () => {
  // Redirect based on user role or to login if not authenticated
  if (!authStore.isAuthenticated) {
    router.push('/')
    return
  }

  const userRole = authStore.userRole
  if (userRole === 'CLIENT') {
    router.push('/client-dashboard')
  } else if (userRole === 'ACTIVATION_MANAGER') {
    router.push('/activations-dashboard')
  } else if (userRole === 'WAREHOUSE_MANAGER') {
    router.push('/warehouse')
  } else if (userRole === 'PROMOTER') {
    router.push('/promoter-dashboard')
  } else if (userRole === 'ADMIN') {
    router.push('/dashboard')
  } else {
    router.push('/dashboard')
  }
}

const goBack = () => {
  // Go back in browser history, or to home if no history
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    goHome()
  }
}
</script>

<style scoped>
.not-found {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.not-found-content {
  max-width: 600px;
  width: 100%;
  text-align: center;
  background: white;
  border-radius: 20px;
  padding: 3rem 2rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.error-illustration {
  position: relative;
  margin-bottom: 2rem;
}

.error-code {
  font-size: 8rem;
  font-weight: 900;
  color: #f1f5f9;
  line-height: 1;
  margin-bottom: -2rem;
  user-select: none;
}

.error-icon {
  position: relative;
  z-index: 1;
}

.error-icon i {
  font-size: 4rem;
  color: #ef4444;
  filter: drop-shadow(0 4px 8px rgba(239, 68, 68, 0.3));
}

.error-text {
  margin-bottom: 2rem;
}

.error-text h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 1rem;
}

.error-text p {
  font-size: 1.1rem;
  color: #6b7280;
  line-height: 1.6;
  margin: 0;
}

.error-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 3rem;
  flex-wrap: wrap;
}

.helpful-links {
  border-top: 1px solid #e5e7eb;
  padding-top: 2rem;
}

.helpful-links h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1.5rem;
}

.links-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
}

.help-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  border-radius: 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  text-decoration: none;
  color: #64748b;
  transition: all 0.2s ease;
}

.help-link:hover {
  background: #e2e8f0;
  border-color: #cbd5e1;
  color: #475569;
  transform: translateY(-2px);
}

.help-link i {
  font-size: 1.5rem;
  color: #3b82f6;
}

.help-link span {
  font-size: 0.9rem;
  font-weight: 500;
}

/* Animations */
.error-illustration {
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

.error-icon {
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

/* Responsive design */
@media (max-width: 768px) {
  .not-found {
    padding: 1rem;
  }

  .not-found-content {
    padding: 2rem 1.5rem;
  }

  .error-code {
    font-size: 6rem;
  }

  .error-icon i {
    font-size: 3rem;
  }

  .error-text h1 {
    font-size: 2rem;
  }

  .error-text p {
    font-size: 1rem;
  }

  .error-actions {
    flex-direction: column;
    align-items: center;
  }

  .links-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .error-code {
    font-size: 4rem;
  }

  .error-icon i {
    font-size: 2.5rem;
  }

  .error-text h1 {
    font-size: 1.75rem;
  }

  .links-grid {
    grid-template-columns: 1fr;
  }
}
</style>