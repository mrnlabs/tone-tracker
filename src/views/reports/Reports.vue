<template>
  <DashboardLayout>
    <div class="reports-page">
      <div class="page-header">
        <h1 class="page-title">Reports</h1>
        <p class="page-description">Analytics and reporting dashboard</p>
      </div>
      
      <div class="reports-grid">
        <!-- Stock Movement Report -->
        <Card class="report-card" v-if="canViewStockReports">
          <template #content>
            <div class="report-content">
              <div class="report-icon">
                <i class="pi pi-box"></i>
              </div>
              <div class="report-details">
                <h3>Stock Movement Report</h3>
                <p>Comprehensive analysis of all stock movements including sales, adjustments, transfers, and samples.</p>
                <ul class="report-features">
                  <li>Movement trends and patterns</li>
                  <li>Warehouse performance metrics</li>
                  <li>Product movement analysis</li>
                  <li>Export capabilities</li>
                </ul>
              </div>
              <div class="report-actions">
                <BaseButton
                  variant="primary"
                  icon="pi pi-arrow-right"
                  @click="navigateToStockMovementReport"
                >
                  View Report
                </BaseButton>
              </div>
            </div>
          </template>
        </Card>

        <!-- Activation Report -->
        <Card class="report-card" v-if="canViewActivationReports">
          <template #content>
            <div class="report-content">
              <div class="report-icon">
                <i class="pi pi-chart-line"></i>
              </div>
              <div class="report-details">
                <h3>Activation Performance</h3>
                <p>Track activation campaign performance, sales metrics, and ROI analysis.</p>
                <ul class="report-features">
                  <li>Campaign effectiveness</li>
                  <li>Sales performance</li>
                  <li>Team productivity</li>
                  <li>ROI calculations</li>
                </ul>
              </div>
              <div class="report-actions">
                <BaseButton
                  variant="secondary"
                  disabled
                >
                  Coming Soon
                </BaseButton>
              </div>
            </div>
          </template>
        </Card>

        <!-- Warehouse Report -->
        <Card class="report-card" v-if="canViewWarehouseReports">
          <template #content>
            <div class="report-content">
              <div class="report-icon">
                <i class="pi pi-building"></i>
              </div>
              <div class="report-details">
                <h3>Warehouse Analytics</h3>
                <p>Comprehensive warehouse operations and inventory management reports.</p>
                <ul class="report-features">
                  <li>Inventory levels</li>
                  <li>Storage efficiency</li>
                  <li>Movement velocity</li>
                  <li>Stock alerts</li>
                </ul>
              </div>
              <div class="report-actions">
                <BaseButton
                  variant="secondary"
                  disabled
                >
                  Coming Soon
                </BaseButton>
              </div>
            </div>
          </template>
        </Card>

        <!-- Sales Report -->
        <Card class="report-card" v-if="canViewSalesReports">
          <template #content>
            <div class="report-content">
              <div class="report-icon">
                <i class="pi pi-shopping-cart"></i>
              </div>
              <div class="report-details">
                <h3>Sales Analytics</h3>
                <p>Detailed sales performance, customer insights, and revenue tracking.</p>
                <ul class="report-features">
                  <li>Revenue trends</li>
                  <li>Customer analysis</li>
                  <li>Product performance</li>
                  <li>Sales forecasting</li>
                </ul>
              </div>
              <div class="report-actions">
                <BaseButton
                  variant="secondary"
                  disabled
                >
                  Coming Soon
                </BaseButton>
              </div>
            </div>
          </template>
        </Card>

        <!-- User Performance Report -->
        <Card class="report-card" v-if="canViewUserReports">
          <template #content>
            <div class="report-content">
              <div class="report-icon">
                <i class="pi pi-users"></i>
              </div>
              <div class="report-details">
                <h3>Team Performance</h3>
                <p>User activity, performance metrics, and productivity analysis.</p>
                <ul class="report-features">
                  <li>Individual performance</li>
                  <li>Team comparisons</li>
                  <li>Activity tracking</li>
                  <li>Goal achievement</li>
                </ul>
              </div>
              <div class="report-actions">
                <BaseButton
                  variant="secondary"
                  disabled
                >
                  Coming Soon
                </BaseButton>
              </div>
            </div>
          </template>
        </Card>

        <!-- Client Report -->
        <Card class="report-card" v-if="canViewClientReports">
          <template #content>
            <div class="report-content">
              <div class="report-icon">
                <i class="pi pi-briefcase"></i>
              </div>
              <div class="report-details">
                <h3>Client Analytics</h3>
                <p>Client engagement, satisfaction metrics, and business insights.</p>
                <ul class="report-features">
                  <li>Client satisfaction</li>
                  <li>Engagement metrics</li>
                  <li>Business value</li>
                  <li>Growth opportunities</li>
                </ul>
              </div>
              <div class="report-actions">
                <BaseButton
                  variant="secondary"
                  disabled
                >
                  Coming Soon
                </BaseButton>
              </div>
            </div>
          </template>
        </Card>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { BaseButton } from '@/components'
import DashboardLayout from '@/components/general/DashboardLayout.vue'
import Card from 'primevue/card'

const router = useRouter()
const authStore = useAuthStore()

// Computed permissions
const canViewStockReports = computed(() => {
  return authStore.isAdmin || authStore.canManageWarehouse
})

const canViewActivationReports = computed(() => {
  return authStore.isAdmin || authStore.canManageActivations
})

const canViewWarehouseReports = computed(() => {
  return authStore.isAdmin || authStore.canManageWarehouse
})

const canViewSalesReports = computed(() => {
  return authStore.isAdmin || authStore.canManageActivations || authStore.isPromoter
})

const canViewUserReports = computed(() => {
  return authStore.isAdmin
})

const canViewClientReports = computed(() => {
  return authStore.isAdmin || authStore.canManageActivations
})

// Navigation methods
const navigateToStockMovementReport = () => {
  router.push('/reports/stock-movements')
}
</script>

<style scoped>
.reports-page {
  padding: 1.5rem;
}

.page-header {
  margin-bottom: 2rem;
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

.reports-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
}

.report-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.report-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.report-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 1.5rem;
}

.report-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}

.report-icon i {
  font-size: 1.5rem;
  color: white;
}

.report-details {
  flex: 1;
  margin-bottom: 1.5rem;
}

.report-details h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.75rem 0;
}

.report-details p {
  color: #6b7280;
  line-height: 1.5;
  margin: 0 0 1rem 0;
}

.report-features {
  list-style: none;
  padding: 0;
  margin: 0;
}

.report-features li {
  color: #374151;
  font-size: 0.875rem;
  padding: 0.25rem 0;
  position: relative;
  padding-left: 1rem;
}

.report-features li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: #10b981;
  font-weight: 600;
}

.report-actions {
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .reports-page {
    padding: 1rem;
  }
  
  .reports-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .report-content {
    padding: 1rem;
  }
}
</style>