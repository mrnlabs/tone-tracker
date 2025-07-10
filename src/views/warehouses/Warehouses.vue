<template>
  <DashboardLayout>
    <div class="warehouses-page">
      <!-- Page Header -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-info">
            <h1 class="page-title">Warehouse Management</h1>
            <p class="page-description">
              Manage warehouses, inventory, and stock distribution across locations
            </p>
          </div>
          <div class="header-actions">
            <Button
                v-if="canManageWarehouses"
                @click="$router.push('/warehouses/create')"
                icon="pi pi-plus"
                label="Add Warehouse"
                class="p-button-success"
            />
          </div>
        </div>
      </div>

      <!-- Quick Navigation Cards -->
      <div class="nav-cards">
        <Card
            class="nav-card"
            @click="$router.push('/warehouses/inventory')"
        >
          <template #content>
            <div class="nav-card-content">
              <div class="nav-icon inventory">
                <i class="pi pi-box"></i>
              </div>
              <div class="nav-info">
                <h3>Inventory Management</h3>
                <p>Monitor stock levels and manage inventory across all warehouses</p>
              </div>
            </div>
          </template>
        </Card>

        <Card
            class="nav-card"
            @click="$router.push('/warehouses/stock')"
        >
          <template #content>
            <div class="nav-card-content">
              <div class="nav-icon stock">
                <i class="pi pi-arrow-right-arrow-left"></i>
              </div>
              <div class="nav-info">
                <h3>Stock Management</h3>
                <p>Handle stock movements, transfers, and allocations</p>
              </div>
            </div>
          </template>
        </Card>

        <Card
            class="nav-card"
            @click="$router.push('/warehouses/reports')"
        >
          <template #content>
            <div class="nav-card-content">
              <div class="nav-icon reports">
                <i class="pi pi-chart-bar"></i>
              </div>
              <div class="nav-info">
                <h3>Reports & Analytics</h3>
                <p>Generate reports and analyze warehouse performance</p>
              </div>
            </div>
          </template>
        </Card>
      </div>

      <!-- Quick Stats -->
      <div class="stats-grid">
        <Card class="stat-card">
          <template #content>
            <div class="stat-content">
              <div class="stat-icon total">
                <i class="pi pi-building"></i>
              </div>
              <div class="stat-info">
                <h3>Total Warehouses</h3>
                <p class="stat-number">{{ warehouseStats.total }}</p>
              </div>
            </div>
          </template>
        </Card>

        <Card class="stat-card">
          <template #content>
            <div class="stat-content">
              <div class="stat-icon skus">
                <i class="pi pi-box"></i>
              </div>
              <div class="stat-info">
                <h3>Total SKUs</h3>
                <p class="stat-number">{{ warehouseStats.totalSKUs }}</p>
              </div>
            </div>
          </template>
        </Card>

        <Card class="stat-card">
          <template #content>
            <div class="stat-content">
              <div class="stat-icon value">
                <i class="pi pi-dollar"></i>
              </div>
              <div class="stat-info">
                <h3>Inventory Value</h3>
                <p class="stat-number">${{ warehouseStats.totalValue.toLocaleString() }}</p>
              </div>
            </div>
          </template>
        </Card>

        <Card class="stat-card">
          <template #content>
            <div class="stat-content">
              <div class="stat-icon alerts">
                <i class="pi pi-exclamation-triangle"></i>
              </div>
              <div class="stat-info">
                <h3>Low Stock Alerts</h3>
                <p class="stat-number">{{ warehouseStats.lowStockAlerts }}</p>
              </div>
            </div>
          </template>
        </Card>
      </div>

      <!-- Warehouses List -->
      <Card class="warehouses-list-card">
        <template #header>
          <div class="list-header">
            <h3>Your Warehouses</h3>
            <Button
                v-if="canManageWarehouses"
                @click="$router.push('/warehouses/create')"
                icon="pi pi-plus"
                label="Add Warehouse"
                class="p-button-outlined"
            />
          </div>
        </template>
        <template #content>
          <div class="warehouses-grid">
            <div
                v-for="warehouse in warehouses"
                :key="warehouse.id"
                class="warehouse-card"
                @click="viewWarehouse(warehouse.id)"
            >
              <div class="warehouse-header">
                <div class="warehouse-info">
                  <h4>{{ warehouse.name }}</h4>
                  <span class="warehouse-code">{{ warehouse.code }}</span>
                </div>
                <Tag
                    :value="warehouse.status"
                    :severity="getStatusSeverity(warehouse.status)"
                />
              </div>

              <div class="warehouse-details">
                <div class="detail-row">
                  <i class="pi pi-map-marker"></i>
                  <span>{{ warehouse.location }}</span>
                </div>
                <div class="detail-row">
                  <i class="pi pi-user"></i>
                  <span>{{ warehouse.manager }}</span>
                </div>
                <div class="detail-row">
                  <i class="pi pi-box"></i>
                  <span>{{ warehouse.skuCount }} SKUs</span>
                </div>
              </div>

              <div class="warehouse-metrics">
                <div class="metric">
                  <span class="metric-label">Utilization</span>
                  <div class="metric-value">
                    <ProgressBar :value="warehouse.utilization" class="utilization-bar" />
                    <span class="percentage">{{ warehouse.utilization }}%</span>
                  </div>
                </div>
                <div class="metric">
                  <span class="metric-label">Inventory Value</span>
                  <span class="metric-amount">${{ warehouse.inventoryValue.toLocaleString() }}</span>
                </div>
              </div>

              <div class="warehouse-actions">
                <Button
                    @click.stop="viewInventory(warehouse.id)"
                    icon="pi pi-list"
                    label="Inventory"
                    class="p-button-outlined p-button-sm"
                />
                <Button
                    @click.stop="viewDetails(warehouse.id)"
                    icon="pi pi-eye"
                    label="Details"
                    class="p-button-outlined p-button-sm"
                />
              </div>
            </div>
          </div>

          <div v-if="warehouses.length === 0" class="empty-state">
            <i class="pi pi-building empty-icon"></i>
            <h3>No warehouses found</h3>
            <p>Start by adding your first warehouse to manage inventory.</p>
            <Button
                v-if="canManageWarehouses"
                @click="$router.push('/warehouses/create')"
                label="Add Your First Warehouse"
                icon="pi pi-plus"
                class="p-button-outlined"
            />
          </div>
        </template>
      </Card>

      <!-- Recent Activity -->
      <Card class="recent-activity-card">
        <template #header>
          <div class="activity-header">
            <h3>Recent Activity</h3>
            <router-link to="/warehouses/stock" class="view-all-link">
              View All
            </router-link>
          </div>
        </template>
        <template #content>
          <div class="activity-list">
            <div
                v-for="activity in recentActivity"
                :key="activity.id"
                class="activity-item"
            >
              <div :class="['activity-icon', activity.type]">
                <i :class="activity.icon"></i>
              </div>
              <div class="activity-content">
                <p class="activity-text">{{ activity.text }}</p>
                <span class="activity-time">{{ formatTime(activity.timestamp) }}</span>
              </div>
            </div>
          </div>
        </template>
      </Card>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import DashboardLayout from '@/components/general/DashboardLayout.vue'

const router = useRouter()
const authStore = useAuthStore()

// State
const warehouses = ref([])
const warehouseStats = ref({
  total: 0,
  totalSKUs: 0,
  totalValue: 0,
  lowStockAlerts: 0
})
const recentActivity = ref([])

// Computed
const userRole = computed(() => authStore.user?.role)

const canManageWarehouses = computed(() => {
  return ['ADMIN', 'WAREHOUSE_MANAGER'].includes(userRole.value)
})

// Methods
const loadWarehouseData = async () => {
  try {
    // Mock data - replace with actual API calls
    warehouses.value = [
      {
        id: 1,
        name: 'Main Distribution Center',
        code: 'MDC-001',
        location: 'New York, NY',
        manager: 'John Smith',
        status: 'Active',
        skuCount: 245,
        utilization: 78,
        inventoryValue: 485000
      },
      {
        id: 2,
        name: 'West Coast Depot',
        code: 'WCD-002',
        location: 'Los Angeles, CA',
        manager: 'Sarah Johnson',
        status: 'Active',
        skuCount: 180,
        utilization: 65,
        inventoryValue: 320000
      },
      {
        id: 3,
        name: 'Central Hub',
        code: 'CH-003',
        location: 'Chicago, IL',
        manager: 'Mike Chen',
        status: 'Maintenance',
        skuCount: 210,
        utilization: 85,
        inventoryValue: 395000
      }
    ]

    warehouseStats.value = {
      total: warehouses.value.length,
      totalSKUs: warehouses.value.reduce((sum, w) => sum + w.skuCount, 0),
      totalValue: warehouses.value.reduce((sum, w) => sum + w.inventoryValue, 0),
      lowStockAlerts: 8
    }

    recentActivity.value = [
      {
        id: 1,
        type: 'stock-in',
        icon: 'pi pi-arrow-down',
        text: 'Stock received at Main Distribution Center - 500 units',
        timestamp: new Date(Date.now() - 1000 * 60 * 30)
      },
      {
        id: 2,
        type: 'transfer',
        icon: 'pi pi-arrow-right-arrow-left',
        text: 'Stock transfer from Central Hub to West Coast Depot - 200 units',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2)
      },
      {
        id: 3,
        type: 'alert',
        icon: 'pi pi-exclamation-triangle',
        text: 'Low stock alert: Product SKU-123 below minimum threshold',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4)
      }
    ]
  } catch (error) {
    console.error('Failed to load warehouse data:', error)
  }
}

const getStatusSeverity = (status) => {
  const severityMap = {
    'Active': 'success',
    'Inactive': 'secondary',
    'Maintenance': 'warning'
  }
  return severityMap[status] || 'info'
}

const formatTime = (timestamp) => {
  const now = new Date()
  const diff = now - timestamp
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))

  if (minutes < 60) {
    return `${minutes} minutes ago`
  } else {
    return `${hours} hours ago`
  }
}

const viewWarehouse = (warehouseId) => {
  router.push(`/warehouses/${warehouseId}`)
}

const viewInventory = (warehouseId) => {
  router.push(`/warehouses/${warehouseId}/inventory`)
}

const viewDetails = (warehouseId) => {
  router.push(`/warehouses/${warehouseId}`)
}

onMounted(() => {
  loadWarehouseData()
})
</script>

<style scoped>
.warehouses-page {
  padding: 1.5rem;
}

.page-header {
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
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

.nav-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.nav-card {
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid #e5e7eb;
}

.nav-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #3b82f6;
}

.nav-card-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.nav-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.nav-icon.inventory { background: linear-gradient(135deg, #8b5cf6, #7c3aed); }
.nav-icon.stock { background: linear-gradient(135deg, #3b82f6, #1d4ed8); }
.nav-icon.reports { background: linear-gradient(135deg, #10b981, #059669); }

.nav-info h3 {
  margin: 0 0 0.5rem 0;
  color: #111827;
  font-size: 1.1rem;
}

.nav-info p {
  margin: 0;
  color: #6b7280;
  font-size: 0.875rem;
  line-height: 1.4;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  transition: transform 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
}

.stat-icon.total { background: linear-gradient(135deg, #3b82f6, #1d4ed8); }
.stat-icon.skus { background: linear-gradient(135deg, #8b5cf6, #7c3aed); }
.stat-icon.value { background: linear-gradient(135deg, #10b981, #059669); }
.stat-icon.alerts { background: linear-gradient(135deg, #ef4444, #dc2626); }

.stat-info h3 {
  margin: 0;
  font-size: 0.9rem;
  color: #6b7280;
  font-weight: 500;
}

.stat-number {
  margin: 0.25rem 0 0 0;
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
}

.warehouses-list-card {
  margin-bottom: 2rem;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0;
}

.list-header h3 {
  margin: 0;
  color: #111827;
}

.warehouses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
}

.warehouse-card {
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.warehouse-card:hover {
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.warehouse-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.warehouse-info h4 {
  margin: 0;
  color: #111827;
  font-size: 1.1rem;
}

.warehouse-code {
  font-family: monospace;
  font-size: 0.8rem;
  color: #6b7280;
  background: #f3f4f6;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  margin-top: 0.25rem;
  display: inline-block;
}

.warehouse-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  font-size: 0.875rem;
}

.detail-row i {
  color: #9ca3af;
  width: 16px;
}

.warehouse-metrics {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.metric {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.metric-label {
  font-size: 0.875rem;
  color: #6b7280;
}

.metric-value {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.utilization-bar {
  width: 80px;
  height: 0.5rem;
}

.percentage {
  font-size: 0.875rem;
  font-weight: 500;
  color: #111827;
  min-width: 35px;
}

.metric-amount {
  font-size: 0.875rem;
  font-weight: 600;
  color: #10b981;
}

.warehouse-actions {
  display: flex;
  gap: 0.5rem;
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
  margin-bottom: 1.5rem;
}

.recent-activity-card {
  margin-bottom: 2rem;
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0;
}

.activity-header h3 {
  margin: 0;
  color: #111827;
}

.view-all-link {
  color: #3b82f6;
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
}

.view-all-link:hover {
  text-decoration: underline;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.activity-icon.stock-in {
  background: #10b981;
}

.activity-icon.transfer {
  background: #3b82f6;
}

.activity-icon.alert {
  background: #ef4444;
}

.activity-content {
  flex: 1;
}

.activity-text {
  margin: 0 0 0.25rem 0;
  color: #111827;
  font-size: 0.9rem;
}

.activity-time {
  font-size: 0.8rem;
  color: #6b7280;
}

@media (max-width: 768px) {
  .warehouses-page {
    padding: 1rem;
  }

  .header-content {
    flex-direction: column;
    align-items: stretch;
  }

  .nav-cards {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .warehouses-grid {
    grid-template-columns: 1fr;
  }

  .list-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .warehouse-actions {
    flex-direction: column;
  }

  .activity-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}

@media (max-width: 480px) {
  .nav-card-content {
    flex-direction: column;
    text-align: center;
  }

  .stat-content {
    flex-direction: column;
    text-align: center;
  }

  .stat-number {
    font-size: 1.5rem;
  }

  .warehouse-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .warehouse-metrics {
    gap: 0.5rem;
  }

  .metric {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }

  .metric-value {
    width: 100%;
  }

  .utilization-bar {
    flex: 1;
  }
}
</style>