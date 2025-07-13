<template>
  <DashboardLayout>
    <div class="activation-team-page">
      <!-- Page Header -->
      <div class="page-header">
        <div class="header-nav">
          <Button
              @click="$router.back()"
              icon="pi pi-arrow-left"
              class="p-button-text"
              label="Back to Activation"
          />
        </div>
        <div class="header-info">
          <h1 class="page-title">Manage Team</h1>
          <p class="page-description">
            Assign and manage team members for this activation
          </p>
        </div>
      </div>

      <!-- Coming Soon Message -->
      <Card class="coming-soon-card">
        <template #content>
          <div class="coming-soon-content">
            <i class="pi pi-users coming-soon-icon"></i>
            <h2>Team Management</h2>
            <p>
              The team management functionality is currently under development.
              You can view team details in the activation details page.
            </p>
            <div class="action-buttons">
              <Button
                  @click="$router.push(`/activations/${$route.params.id}`)"
                  label="View Activation Details"
                  icon="pi pi-eye"
                  class="p-button-outlined"
              />
              <Button
                  @click="$router.push('/activations')"
                  label="Back to Activations"
                  icon="pi pi-list"
                  class="p-button-outlined"
              />
            </div>
          </div>
        </template>
      </Card>

      <!-- Quick Info -->
      <Card class="info-card">
        <template #header>
          <h3>What's Coming</h3>
        </template>
        <template #content>
          <ul class="feature-list">
            <li>
              <i class="pi pi-check"></i>
              Add and remove team members
            </li>
            <li>
              <i class="pi pi-check"></i>
              Assign roles and responsibilities
            </li>
            <li>
              <i class="pi pi-check"></i>
              Set team member schedules
            </li>
            <li>
              <i class="pi pi-check"></i>
              Track individual performance
            </li>
            <li>
              <i class="pi pi-check"></i>
              Manage permissions and access
            </li>
            <li>
              <i class="pi pi-check"></i>
              Team communication tools
            </li>
          </ul>
        </template>
      </Card>
    </div>
  </DashboardLayout>
</template>

<script setup>
import DashboardLayout from '@/components/general/DashboardLayout.vue'
</script>

<style scoped>
.activation-team-page {
  padding: 1.5rem;
  max-width: 800px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
}

.header-nav {
  margin-bottom: 1rem;
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

.coming-soon-card {
  margin-bottom: 2rem;
}

.coming-soon-content {
  text-align: center;
  padding: 2rem;
}

.coming-soon-icon {
  font-size: 4rem;
  color: #3b82f6;
  margin-bottom: 1.5rem;
}

.coming-soon-content h2 {
  color: #111827;
  margin-bottom: 1rem;
}

.coming-soon-content p {
  color: #6b7280;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.info-card {
  margin-bottom: 2rem;
}

.feature-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.feature-list li {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e5e7eb;
}

.feature-list li:last-child {
  border-bottom: none;
}

.feature-list i {
  color: #10b981;
  font-weight: bold;
}

@media (max-width: 768px) {
  .activation-team-page {
    padding: 1rem;
  }

  .action-buttons {
    flex-direction: column;
    align-items: center;
  }
}
</style>