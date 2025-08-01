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
                <h3>Live Metrics Dashboard</h3>
                <p>Real-time activation performance monitoring, alerts, and system health.</p>
                <ul class="report-features">
                  <li>Real-time performance data</li>
                  <li>System alerts and notifications</li>
                  <li>Promoter performance overview</li>
                  <li>System health monitoring</li>
                </ul>
              </div>
              <div class="report-actions">
                <BaseButton
                  variant="primary"
                  icon="pi pi-arrow-right"
                  @click="navigateToLiveMetrics"
                >
                  View Dashboard
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
                <h3>Performance Reports</h3>
                <p>Individual and team performance tracking with detailed analytics.</p>
                <ul class="report-features">
                  <li>Daily performance summaries</li>
                  <li>Weekly trend analysis</li>
                  <li>Performance scoring</li>
                  <li>Export capabilities</li>
                </ul>
              </div>
              <div class="report-actions">
                <BaseButton
                  variant="primary"
                  icon="pi pi-arrow-right"
                  @click="navigateToPromoterReports"
                >
                  View Reports
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
                <h3>ROI Analysis</h3>
                <p>Investment performance analysis with cost breakdown and profitability insights.</p>
                <ul class="report-features">
                  <li>Investment performance tracking</li>
                  <li>Cost breakdown analysis</li>
                  <li>Profit margin calculations</li>
                  <li>Benchmark comparisons</li>
                </ul>
              </div>
              <div class="report-actions">
                <BaseButton
                  variant="primary"
                  icon="pi pi-arrow-right"
                  @click="navigateToROIAnalysis"
                >
                  View Analysis
                </BaseButton>
              </div>
            </div>
          </template>
        </Card>

        <!-- Reports Overview Dashboard -->
        <Card class="report-card">
          <template #content>
            <div class="report-content">
              <div class="report-icon">
                <i class="pi pi-th-large"></i>
              </div>
              <div class="report-details">
                <h3>Reports Overview</h3>
                <p>Comprehensive dashboard with quick access to all available reports and analytics.</p>
                <ul class="report-features">
                  <li>Role-based report access</li>
                  <li>Recent reports history</li>
                  <li>Quick export options</li>
                  <li>Report scheduling</li>
                </ul>
              </div>
              <div class="report-actions">
                <BaseButton
                  variant="secondary"
                  icon="pi pi-arrow-right"
                  @click="navigateToReportsOverview"
                >
                  View Overview
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

// User role for easier access
const userRole = computed(() => authStore.user?.role)

// Computed permissions
const canViewStockReports = computed(() => {
  return ['ADMIN', 'WAREHOUSE_MANAGER'].includes(userRole.value)
})

const canViewActivationReports = computed(() => {
  return ['ADMIN', 'ACTIVATION_MANAGER'].includes(userRole.value)
})

const canViewWarehouseReports = computed(() => {
  return ['ADMIN', 'WAREHOUSE_MANAGER'].includes(userRole.value)
})

const canViewSalesReports = computed(() => {
  return ['ADMIN', 'ACTIVATION_MANAGER', 'PROMOTER'].includes(userRole.value)
})

const canViewUserReports = computed(() => {
  return userRole.value === 'ADMIN'
})

const canViewClientReports = computed(() => {
  return ['ADMIN', 'CLIENT'].includes(userRole.value)
})

// Navigation methods
const navigateToStockMovementReport = () => {
  router.push('/reports/stock-movements')
}

const navigateToLiveMetrics = () => {
  router.push('/reports/live-metrics')
}

const navigateToPromoterReports = () => {
  router.push('/reports/promoter-reports')
}

const navigateToROIAnalysis = () => {
  router.push('/reports/roi-analysis')
}

const navigateToReportsOverview = () => {
  router.push('/reports/overview')
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