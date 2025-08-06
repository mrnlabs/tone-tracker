<template>
  <DashboardLayout>
    <div class="capture-lead-page">
      <div class="page-header">
        <div class="header-content">
          <h1>Capture Lead</h1>
          <p>Capture customer lead information quickly and efficiently</p>
        </div>
      </div>

      <div class="form-container">
        <Card class="capture-form-card">
          <template #content>
            <LeadCaptureForm
              @lead-captured="onLeadCaptured"
              @form-reset="onFormReset"
            />
          </template>
        </Card>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import DashboardLayout from '@/components/general/DashboardLayout.vue'
import LeadCaptureForm from '@/components/leads/LeadCaptureForm.vue'
import Card from 'primevue/card'
import Button from 'primevue/button'

const router = useRouter()
const toast = useToast()

const onLeadCaptured = (lead) => {
  toast.add({
    severity: 'success',
    summary: 'Success',
    detail: 'Lead captured successfully!',
    life: 3000
  })
  
  // Option 1: Stay on page for capturing more leads
  // (form will auto-reset)
  
  // Option 2: Navigate to leads list (uncomment if preferred)
  // setTimeout(() => {
  //   router.push('/leads')
  // }, 1500)
}

const onFormReset = () => {
  // Handle form reset if needed
  console.log('Form reset')
}
</script>

<style scoped>
.capture-lead-page {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
}

.header-content {
}

.header-content h1 {
  margin: 0 0 0.5rem 0;
  color: var(--text-color);
  font-size: 2rem;
  font-weight: 600;
}

.header-content p {
  margin: 0;
  color: var(--text-color-secondary);
  font-size: 1.1rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.form-container {
  width: 100%;
}

.capture-form-card {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
}

:deep(.capture-form-card .p-card-content) {
  padding: 2rem;
}

@media (max-width: 768px) {
  .capture-lead-page {
    padding: 1rem;
  }
  
  .page-header {
    margin-bottom: 1rem;
  }
  
  .header-content h1 {
    font-size: 1.5rem;
  }
  
  :deep(.capture-form-card .p-card-content) {
    padding: 1rem;
  }
}
</style>