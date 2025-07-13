<template>
  <DashboardLayout>
    <div class="reports-page">
      <div class="page-header">
        <h1 class="page-title">Reports</h1>
        <p class="page-description">Analytics and reporting dashboard</p>
      </div>
      
      <Card>
        <template #content>
          <div class="empty-state">
            <i class="pi pi-chart-line empty-icon"></i>
            <h3>Reports Coming Soon</h3>
            <p>Advanced reporting and analytics features will be available here.</p>
          </div>
        </template>
      </Card>
    </div>
  </DashboardLayout>
</template>

<script setup>
import DashboardLayout from '@/components/general/DashboardLayout.vue'
</script>

<style scoped>
.reports-page {
  padding: 1.5rem;
}

.page-header {
  margin-bottom: 1.5rem;
}

.page-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.5rem 0;
}

.page-description {
  color: #6b7280;
  margin: 0;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
}

.empty-icon {
  font-size: 4rem;
  color: #d1d5db;
  margin-bottom: 1rem;
}

.empty-state h3 {
  color: #111827;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: #6b7280;
  margin: 0;
}
</style>