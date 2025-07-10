<template>
  <DashboardLayout>
    <div class="warehouse-details-page">
      <!-- Loading State -->
      <div v-if="loading" class="loading-container">
        <ProgressSpinner />
        <p>Loading warehouse details...</p>
      </div>

      <!-- Warehouse Details Content -->
      <div v-else-if="warehouse" class="warehouse-content">
        <!-- Page Header -->
        <div class="page-header">
          <div class="header-nav">
            <Button
                @click="$router.push('/warehouses')"
                icon="pi pi-arrow-left"
                class="p-button-text"
                label="Back to Warehouses"
            />
          </div>

          <div class="header-main">
            <div class="warehouse-info-section">
              <div class="warehouse-header">
                <div class="warehouse-title">
                  <h1 class="warehouse-name">{{ warehouse.name }}</h1>
                  <span class="warehouse-code">{{ warehouse.code }}</span>
                </div>
                <Tag
                    :value="warehouse.status"
                    :severity="getStatusSeverity(warehouse.status)"
                    class="warehouse-status-tag"
                />
              </div>

              <div class="warehouse-meta">
                <div class="meta-item">
                  <i class="pi pi-map-marker"></i>
                  <span>{{ warehouse.location }}</span>
                </div>
                <div class="meta-item">
                  <i class="pi pi-user"></i>
                  <span>{{ warehouse.manager.name }}</span>
                </div>
                <div class="meta-item">
                  <i class="pi pi-building"></i>
                  <span>{{ warehouse.capacity.toLocaleString() }} sq ft</span>
                </div>
                <div class="meta-item">
                  <i class="pi pi-box"></i>
                  <span>{{ warehouse.skuCount }} SKUs</span>
                </div>
              </div>
            </div>

            <div class="header-actions">
              <Button
                  v-if="canManageWarehouse"
                  @click="editWarehouse"
                  icon="pi pi-pencil"
                  label="Edit Warehouse"
                  class="p-button-outlined"
              />
              <Button
                  @click="viewInventory"
                  icon="pi pi-list"
                  label="View Inventory"
                  class="p-button-outlined"
              />
              <Button
                  @click="generateReport"
                  icon="pi pi-file-pdf"
                  label="Generate Report"
                  class="p-button-outlined"
              />
            </div>
          </div>
        </div>

        <!-- Quick Stats -->
        <div class="stats-section">
          <div class="stats-grid">
            <Card class="stat-card">
              <template #content>
                <div class="stat-content">
                  <div class="stat-icon utilization">
                    <i class="pi pi-chart-pie"></i>
                  </div>
                  <div class="stat-info">
                    <h3>Utilization</h3>
                    <p class="stat-number">{{ warehouse.utilization }}%</p>
                    <ProgressBar :value="warehouse.utilization" class="utilization-bar" />
                  </div>
                </div>
              </template>
            </Card>

            <Card class="stat-card">
              <template #content>
                <div class="stat-content">
                  <div class="stat-icon inventory">
                    <i class="pi pi-box"></i>
                  </div>
                  <div class="stat-info">
                    <h3>Total Inventory</h3>
                    <p class="stat-number">{{ warehouse.totalUnits.toLocaleString() }}</p>
                    <span class="stat-detail">units in stock</span>
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
                    <p class="stat-number">${{ warehouse.inventoryValue.toLocaleString() }}</p>
                    <span class="stat-detail">total value</span>
                  </div>
                </div>
              </template>
            </Card>

            <Card class="stat-card">
              <template #content>
                <div class="stat-content">
                  <div class="stat-icon movements">
                    <i class="pi pi-arrow-right-arrow-left"></i>
                  </div>
                  <div class="stat-info">
                    <h3>Monthly Movements</h3>
                    <p class="stat-number">{{ warehouse.monthlyMovements }}</p>
                    <span class="stat-detail">this month</span>
                  </div>
                </div>
              </template>
            </Card>
          </div>
        </div>

        <!-- Main Content Tabs -->
        <div class="content-tabs">
          <TabView>
            <!-- Overview Tab -->
            <TabPanel header="Overview">
              <div class="overview-content">
                <div class="overview-grid">
                  <!-- Warehouse Information -->
                  <Card class="info-card">
                    <template #header>
                      <h3>Warehouse Information</h3>
                    </template>
                    <template #content>
                      <div class="info-grid">
                        <div class="info-item">
                          <label>Name</label>
                          <span>{{ warehouse.name }}</span>
                        </div>
                        <div class="info-item">
                          <label>Code</label>
                          <span>{{ warehouse.code }}</span>
                        </div>
                        <div class="info-item">
                          <label>Type</label>
                          <span>{{ warehouse.type || 'Distribution Center' }}</span>
                        </div>
                        <div class="info-item">
                          <label>Status</label>
                          <Tag :value="warehouse.status" :severity="getStatusSeverity(warehouse.status)" />
                        </div>
                        <div class="info-item">
                          <label>Capacity</label>
                          <span>{{ warehouse.capacity.toLocaleString() }} sq ft</span>
                        </div>
                        <div class="info-item">
                          <label>Operating Hours</label>
                          <span>{{ warehouse.operatingHours || '8:00 AM - 6:00 PM' }}</span>
                        </div>
                        <div class="info-item full-width">
                          <label>Address</label>
                          <span>{{ warehouse.address }}</span>
                        </div>
                      </div>
                    </template>
                  </Card>

                  <!-- Manager Information -->
                  <Card class="info-card">
                    <template #header>
                      <h3>Warehouse Manager</h3>
                    </template>
                    <template #content>
                      <div class="manager-info">
                        <div class="manager-header">
                          <Avatar
                              :label="warehouse.manager.name.split(' ').map(n => n.charAt(0)).join('')"
                              size="xlarge"
                              shape="circle"
                          />
                          <div class="manager-details">
                            <h4>{{ warehouse.manager.name }}</h4>
                            <p>{{ warehouse.manager.title || 'Warehouse Manager' }}</p>
                            <p>{{ warehouse.manager.department || 'Operations' }}</p>
                          </div>
                        </div>

                        <div class="contact-methods">
                          <div class="contact-method">
                            <i class="pi pi-envelope"></i>
                            <span>{{ warehouse.manager.email }}</span>
                            <Button
                                @click="sendEmail(warehouse.manager.email)"
                                icon="pi pi-send"
                                class="p-button-text p-button-sm"
                                v-tooltip.top="'Send Email'"
                            />
                          </div>
                          <div class="contact-method">
                            <i class="pi pi-phone"></i>
                            <span>{{ warehouse.manager.phone }}</span>
                            <Button
                                @click="callManager(warehouse.manager.phone)"
                                icon="pi pi-phone"
                                class="p-button-text p-button-sm"
                                v-tooltip.top="'Call'"
                            />
                          </div>
                        </div>
                      </div>
                    </template>
                  </Card>

                  <!-- Capacity Overview -->
                  <Card class="info-card">
                    <template #header>
                      <h3>Capacity Overview</h3>
                    </template>
                    <template #content>
                      <div class="capacity-overview">
                        <div class="capacity-chart">
                          <div class="capacity-visual">
                            <div class="capacity-bar">
                              <div
                                  class="capacity-fill"
                                  :style="{ width: warehouse.utilization + '%' }"
                              ></div>
                            </div>
                            <div class="capacity-labels">
                              <span class="capacity-used">{{ warehouse.utilization }}% Used</span>
                              <span class="capacity-available">{{ 100 - warehouse.utilization }}% Available</span>
                            </div>
                          </div>
                        </div>

                        <div class="capacity-breakdown">
                          <div class="breakdown-item">
                            <span class="breakdown-label">Total Capacity</span>
                            <span class="breakdown-value">{{ warehouse.capacity.toLocaleString() }} sq ft</span>
                          </div>
                          <div class="breakdown-item">
                            <span class="breakdown-label">Used Space</span>
                            <span class="breakdown-value">{{ Math.round(warehouse.capacity * warehouse.utilization / 100).toLocaleString() }} sq ft</span>
                          </div>
                          <div class="breakdown-item">
                            <span class="breakdown-label">Available Space</span>
                            <span class="breakdown-value">{{ Math.round(warehouse.capacity * (100 - warehouse.utilization) / 100).toLocaleString() }} sq ft</span>
                          </div>
                        </div>
                      </div>
                    </template>
                  </Card>
                </div>
              </div>
            </TabPanel>

            <!-- Inventory Tab -->
            <TabPanel header="Inventory">
              <div class="inventory-content">
                <div class="inventory-header">
                  <h3>Warehouse Inventory</h3>
                  <div class="inventory-actions">
                    <Button
                        @click="adjustStock"
                        icon="pi pi-pencil"
                        label="Adjust Stock"
                        class="p-button-outlined"
                    />
                    <Button
                        @click="viewFullInventory"
                        icon="pi pi-external-link"
                        label="View Full Inventory"
                        class="p-button-outlined"
                    />
                  </div>
                </div>

                <!-- Inventory Summary -->
                <div class="inventory-summary">
                  <div class="summary-item">
                    <i class="pi pi-box"></i>
                    <div>
                      <span class="summary-value">{{ warehouse.skuCount }}</span>
                      <span class="summary-label">Total SKUs</span>
                    </div>
                  </div>
                  <div class="summary-item">
                    <i class="pi pi-check-circle"></i>
                    <div>
                      <span class="summary-value">{{ warehouse.inStockSKUs }}</span>
                      <span class="summary-label">In Stock</span>
                    </div>
                  </div>
                  <div class="summary-item">
                    <i class="pi pi-exclamation-triangle"></i>
                    <div>
                      <span class="summary-value">{{ warehouse.lowStockSKUs }}</span>
                      <span class="summary-label">Low Stock</span>
                    </div>
                  </div>
                  <div class="summary-item">
                    <i class="pi pi-times-circle"></i>
                    <div>
                      <span class="summary-value">{{ warehouse.outOfStockSKUs }}</span>
                      <span class="summary-label">Out of Stock</span>
                    </div>
                  </div>
                </div>

                <!-- Recent Inventory Items -->
                <Card class="inventory-items-card">
                  <template #header>
                    <h4>Recent Inventory Activity</h4>
                  </template>
                  <template #content>
                    <DataTable
                        :value="warehouseInventory"
                        responsiveLayout="scroll"
                        :rows="10"
                    >
                      <Column field="sku" header="SKU">
                        <template #body="{ data }">
                          <div class="sku-cell">
                            <span class="sku-code">{{ data.sku }}</span>
                            <span class="product-name">{{ data.productName }}</span>
                          </div>
                        </template>
                      </Column>

                      <Column field="currentStock" header="Current Stock">
                        <template #body="{ data }">
                          <span class="stock-amount">{{ data.currentStock.toLocaleString() }}</span>
                        </template>
                      </Column>

                      <Column field="minThreshold" header="Min Threshold">
                        <template #body="{ data }">
                          <span class="threshold">{{ data.minThreshold.toLocaleString() }}</span>
                        </template>
                      </Column>

                      <Column field="status" header="Status">
                        <template #body="{ data }">
                          <Tag
                              :value="getInventoryStatus(data)"
                              :severity="getInventoryStatusSeverity(data)"
                          />
                        </template>
                      </Column>

                      <Column field="lastMovement" header="Last Movement">
                        <template #body="{ data }">
                          <span class="last-movement">{{ formatDate(data.lastMovement) }}</span>
                        </template>
                      </Column>

                      <Column header="Actions">
                        <template #body="{ data }">
                          <div class="item-actions">
                            <Button
                                @click="viewItemDetails(data)"
                                icon="pi pi-eye"
                                class="p-button-text p-button-sm"
                                v-tooltip.top="'View Details'"
                            />
                            <Button
                                @click="adjustItemStock(data)"
                                icon="pi pi-pencil"
                                class="p-button-text p-button-sm"
                                v-tooltip.top="'Adjust Stock'"
                            />
                          </div>
                        </template>
                      </Column>
                    </DataTable>
                  </template>
                </Card>
              </div>
            </TabPanel>

            <!-- Activity Tab -->
            <TabPanel header="Activity">
              <div class="activity-content">
                <div class="activity-header">
                  <h3>Recent Activity</h3>
                  <Button
                      @click="refreshActivity"
                      icon="pi pi-refresh"
                      class="p-button-text"
                      v-tooltip.top="'Refresh'"
                  />
                </div>

                <Timeline :value="activityLog" align="left" class="activity-timeline">
                  <template #marker="{ item }">
                    <div :class="['activity-marker', item.type]">
                      <i :class="item.icon"></i>
                    </div>
                  </template>

                  <template #content="{ item }">
                    <Card class="activity-card">
                      <template #content>
                        <div class="activity-item">
                          <div class="activity-header">
                            <h4>{{ item.title }}</h4>
                            <span class="activity-time">{{ formatDateTime(item.timestamp) }}</span>
                          </div>
                          <p class="activity-description">{{ item.description }}</p>
                          <div class="activity-meta" v-if="item.user">
                            <span class="activity-user">by {{ item.user }}</span>
                          </div>
                        </div>
                      </template>
                    </Card>
                  </template>
                </Timeline>
              </div>
            </TabPanel>

            <!-- Reports Tab -->
            <TabPanel header="Reports">
              <div class="reports-content">
                <div class="reports-header">
                  <h3>Warehouse Reports</h3>
                  <Button
                      @click="generateDetailedReport"
                      icon="pi pi-file-pdf"
                      label="Generate Report"
                      class="p-button-outlined"
                  />
                </div>

                <div class="reports-grid">
                  <!-- Inventory Report -->
                  <Card class="report-card">
                    <template #header>
                      <h4>Inventory Report</h4>
                    </template>
                    <template #content>
                      <p>Current stock levels, low stock alerts, and inventory valuation.</p>
                      <div class="report-info">
                        <span class="info-item">
                          <i class="pi pi-calendar"></i>
                          Updated daily
                        </span>
                        <span class="info-item">
                          <i class="pi pi-file-pdf"></i>
                          PDF format
                        </span>
                      </div>
                      <Button
                          @click="generateReport('inventory')"
                          label="Generate Report"
                          class="p-button-sm"
                      />
                    </template>
                  </Card>

                  <!-- Movement Report -->
                  <Card class="report-card">
                    <template #header>
                      <h4>Movement Report</h4>
                    </template>
                    <template #content>
                      <p>Stock movements, transfers, and allocation history.</p>
                      <div class="report-info">
                        <span class="info-item">
                          <i class="pi pi-clock"></i>
                          Real-time data
                        </span>
                        <span class="info-item">
                          <i class="pi pi-file-excel"></i>
                          Excel format
                        </span>
                      </div>
                      <Button
                          @click="generateReport('movements')"
                          label="Generate Report"
                          class="p-button-sm"
                      />
                    </template>
                  </Card>

                  <!-- Performance Report -->
                  <Card class="report-card">
                    <template #header>
                      <h4>Performance Report</h4>
                    </template>
                    <template #content>
                      <p>Warehouse utilization, efficiency metrics, and KPI analysis.</p>
                      <div class="report-info">
                        <span class="info-item">
                          <i class="pi pi-chart-bar"></i>
                          Analytics included
                        </span>
                        <span class="info-item">
                          <i class="pi pi-refresh"></i>
                          Monthly updates
                        </span>
                      </div>
                      <Button
                          @click="generateReport('performance')"
                          label="Generate Report"
                          class="p-button-sm"
                      />
                    </template>
                  </Card>
                </div>
              </div>
            </TabPanel>
          </TabView>
        </div>
      </div>

      <!-- Warehouse Not Found -->
      <div v-else class="not-found-container">
        <div class="not-found-content">
          <i class="pi pi-exclamation-triangle not-found-icon"></i>
          <h2>Warehouse Not Found</h2>
          <p>The requested warehouse could not be found or may have been removed.</p>
          <Button
              @click="$router.push('/warehouses')"
              label="Back to Warehouses"
              icon="pi pi-arrow-left"
              class="p-button-outlined"
          />
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { useAuthStore } from '@/stores/auth'
import DashboardLayout from '@/components/general/DashboardLayout.vue'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const authStore = useAuthStore()

// State
const loading = ref(true)
const warehouse = ref(null)
const warehouseInventory = ref([])
const activityLog = ref([])

// Computed
const userRole = computed(() => authStore.user?.role)

const canManageWarehouse = computed(() => {
  return ['ADMIN', 'WAREHOUSE_MANAGER'].includes(userRole.value)
})

// Methods
const loadWarehouseData = async () => {
  loading.value = true
  try {
    const warehouseId = route.params.id

    // Mock API call - replace with actual API
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Mock warehouse data
    warehouse.value = {
      id: warehouseId,
      name: 'Main Distribution Center',
      code: 'MDC-001',
      location: 'New York, NY',
      address: '123 Industrial Blvd, New York, NY 10001',
      status: 'Active',
      type: 'Distribution Center',
      capacity: 50000,
      utilization: 78,
      skuCount: 245,
      totalUnits: 12450,
      inventoryValue: 485000,
      monthlyMovements: 156,
      inStockSKUs: 230,
      lowStockSKUs: 12,
      outOfStockSKUs: 3,
      operatingHours: '6:00 AM - 10:00 PM',
      manager: {
        id: 1,
        name: 'John Smith',
        title: 'Warehouse Manager',
        department: 'Operations',
        email: 'john.smith@company.com',
        phone: '+1 (555) 123-4567'
      }
    }

    // Load warehouse inventory
    warehouseInventory.value = [
      {
        id: 1,
        sku: 'SKU-001',
        productName: 'Premium Shampoo 500ml',
        currentStock: 650,
        minThreshold: 200,
        lastMovement: '2024-07-08'
      },
      {
        id: 2,
        sku: 'SKU-002',
        productName: 'Organic Face Cream 100ml',
        currentStock: 350,
        minThreshold: 150,
        lastMovement: '2024-07-07'
      },
      {
        id: 3,
        sku: 'SKU-003',
        productName: 'Vitamin C Serum 30ml',
        currentStock: 25,
        minThreshold: 100,
        lastMovement: '2024-07-06'
      },
      {
        id: 4,
        sku: 'SKU-004',
        productName: 'Moisturizing Lotion 250ml',
        currentStock: 0,
        minThreshold: 75,
        lastMovement: '2024-07-05'
      }
    ]

    // Load activity log
    activityLog.value = [
      {
        type: 'stock-in',
        icon: 'pi pi-arrow-down',
        title: 'Stock Received',
        description: 'Received 500 units of Premium Shampoo from Beauty Supplies Inc',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        user: 'John Smith'
      },
      {
        type: 'transfer',
        icon: 'pi pi-arrow-right-arrow-left',
        title: 'Stock Transfer',
        description: 'Transferred 200 units of Organic Face Cream to West Coast Depot',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
        user: 'Sarah Johnson'
      },
      {
        type: 'allocation',
        icon: 'pi pi-send',
        title: 'Stock Allocated',
        description: 'Allocated 150 units for Summer Campaign activation',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
        user: 'Mike Chen'
      },
      {
        type: 'adjustment',
        icon: 'pi pi-pencil',
        title: 'Stock Adjustment',
        description: 'Adjusted Vitamin C Serum stock due to damage (5 units removed)',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6),
        user: 'John Smith'
      }
    ]

  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load warehouse data',
      life: 3000
    })
  } finally {
    loading.value = false
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

const getInventoryStatus = (item) => {
  if (item.currentStock === 0) return 'Out of Stock'
  if (item.currentStock <= item.minThreshold) return 'Low Stock'
  return 'In Stock'
}

const getInventoryStatusSeverity = (item) => {
  if (item.currentStock === 0) return 'danger'
  if (item.currentStock <= item.minThreshold) return 'warning'
  return 'success'
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const formatDateTime = (timestamp) => {
  return new Date(timestamp).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const editWarehouse = () => {
  router.push(`/warehouses/${route.params.id}/edit`)
}

const viewInventory = () => {
  router.push(`/warehouses/${route.params.id}/inventory`)
}

const viewFullInventory = () => {
  router.push('/warehouses/inventory')
}

const adjustStock = () => {
  toast.add({
    severity: 'info',
    summary: 'Stock Adjustment',
    detail: 'Stock adjustment functionality will be implemented',
    life: 3000
  })
}

const adjustItemStock = (item) => {
  toast.add({
    severity: 'info',
    summary: 'Item Adjustment',
    detail: `Adjust stock for ${item.sku}`,
    life: 3000
  })
}

const viewItemDetails = (item) => {
  router.push(`/warehouses/inventory/${item.sku}`)
}

const generateReport = (type) => {
  toast.add({
    severity: 'info',
    summary: 'Report Generation',
    detail: `${type} report generation started`,
    life: 3000
  })
}

const generateDetailedReport = () => {
  toast.add({
    severity: 'info',
    summary: 'Report Generation',
    detail: 'Detailed warehouse report generation started',
    life: 3000
  })
}

const refreshActivity = async () => {
  // Reload activity log
  await loadWarehouseData()
  toast.add({
    severity: 'success',
    summary: 'Refreshed',
    detail: 'Activity log updated',
    life: 2000
  })
}

const sendEmail = (email) => {
  window.location.href = `mailto:${email}`
}

const callManager = (phone) => {
  window.location.href = `tel:${phone}`
}

onMounted(() => {
  loadWarehouseData()
})
</script>

<style scoped>
.warehouse-details-page {
  padding: 1.5rem;
}

.loading-container,
.not-found-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  text-align: center;
}

.not-found-content {
  max-width: 400px;
}

.not-found-icon {
  font-size: 4rem;
  color: #f59e0b;
  margin-bottom: 1rem;
}

.page-header {
  margin-bottom: 2rem;
}

.header-nav {
  margin-bottom: 1rem;
}

.header-main {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.warehouse-info-section {
  flex: 1;
}

.warehouse-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.warehouse-title {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.warehouse-name {
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.warehouse-code {
  font-family: monospace;
  font-size: 0.9rem;
  color: #6b7280;
  background: #f3f4f6;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
}

.warehouse-status-tag {
  align-self: flex-start;
}

.warehouse-meta {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  font-size: 0.875rem;
}

.meta-item i {
  color: #9ca3af;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.stats-section {
  margin-bottom: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
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

.stat-icon.utilization { background: linear-gradient(135deg, #3b82f6, #1d4ed8); }
.stat-icon.inventory { background: linear-gradient(135deg, #8b5cf6, #7c3aed); }
.stat-icon.value { background: linear-gradient(135deg, #10b981, #059669); }
.stat-icon.movements { background: linear-gradient(135deg, #f59e0b, #d97706); }

.stat-info h3 {
  margin: 0;
  font-size: 0.9rem;
  color: #6b7280;
  font-weight: 500;
}

.stat-number {
  margin: 0.25rem 0 0 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: #111827;
}

.stat-detail {
  font-size: 0.8rem;
  color: #6b7280;
}

.utilization-bar {
  height: 0.25rem;
  margin-top: 0.5rem;
}

.content-tabs {
  margin-top: 1rem;
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
}

.info-card h3 {
  color: #111827;
  margin: 0;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-item.full-width {
  grid-column: 1 / -1;
}

.info-item label {
  font-weight: 600;
  color: #6b7280;
  font-size: 0.875rem;
}

.info-item span {
  color: #111827;
}

.manager-info {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.manager-header {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.manager-details h4 {
  margin: 0;
  color: #111827;
}

.manager-details p {
  margin: 0;
  color: #6b7280;
  font-size: 0.875rem;
}

.contact-methods {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.contact-method {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 0.5rem;
}

.contact-method i {
  color: #6b7280;
}

.contact-method span {
  flex: 1;
  color: #111827;
}

.capacity-overview {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.capacity-visual {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.capacity-bar {
  height: 1.5rem;
  background: #e5e7eb;
  border-radius: 0.75rem;
  overflow: hidden;
  position: relative;
}

.capacity-fill {
  height: 100%;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  border-radius: 0.75rem;
  transition: width 0.3s ease;
}

.capacity-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
}

.capacity-used {
  color: #3b82f6;
  font-weight: 600;
}

.capacity-available {
  color: #6b7280;
}

.capacity-breakdown {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.breakdown-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f3f4f6;
}

.breakdown-item:last-child {
  border-bottom: none;
}

.breakdown-label {
  color: #6b7280;
  font-size: 0.875rem;
}

.breakdown-value {
  color: #111827;
  font-weight: 600;
}

.inventory-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.inventory-header h3 {
  margin: 0;
  color: #111827;
}

.inventory-actions {
  display: flex;
  gap: 0.75rem;
}

.inventory-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 0.5rem;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.summary-item i {
  color: #3b82f6;
  font-size: 1.25rem;
}

.summary-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  line-height: 1;
}

.summary-label {
  font-size: 0.75rem;
  color: #6b7280;
}

.inventory-items-card h4 {
  color: #111827;
  margin: 0;
}

.sku-cell {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.sku-code {
  font-family: monospace;
  font-weight: 600;
  color: #111827;
}

.product-name {
  font-size: 0.875rem;
  color: #6b7280;
}

.stock-amount {
  font-weight: 600;
  color: #111827;
}

.threshold {
  font-weight: 500;
  color: #6b7280;
}

.last-movement {
  font-size: 0.875rem;
  color: #6b7280;
}

.item-actions {
  display: flex;
  gap: 0.25rem;
}

.activity-content {
  max-width: 800px;
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.activity-header h3 {
  color: #111827;
  margin: 0;
}

.activity-timeline {
  margin-top: 1rem;
}

.activity-marker {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.activity-marker.stock-in {
  background: #10b981;
}

.activity-marker.transfer {
  background: #3b82f6;
}

.activity-marker.allocation {
  background: #8b5cf6;
}

.activity-marker.adjustment {
  background: #f59e0b;
}

.activity-card {
  margin-left: 1rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.activity-item {
  padding: 0;
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}

.activity-header h4 {
  color: #111827;
  margin: 0;
  font-size: 1rem;
}

.activity-time {
  color: #6b7280;
  font-size: 0.875rem;
}

.activity-description {
  color: #6b7280;
  margin: 0 0 0.5rem 0;
  line-height: 1.5;
}

.activity-meta {
  margin: 0;
}

.activity-user {
  color: #6b7280;
  font-size: 0.875rem;
  font-style: italic;
}

.reports-content {
  max-width: 1000px;
}

.reports-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.reports-header h3 {
  margin: 0;
  color: #111827;
}

.reports-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.report-card h4 {
  color: #111827;
  margin: 0;
}

.report-card p {
  color: #6b7280;
  margin: 0 0 1rem 0;
  line-height: 1.5;
}

.report-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
}

@media (max-width: 768px) {
  .warehouse-details-page {
    padding: 1rem;
  }

  .header-main {
    flex-direction: column;
    align-items: stretch;
  }

  .warehouse-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .warehouse-meta {
    flex-direction: column;
    gap: 0.5rem;
  }

  .header-actions {
    justify-content: center;
    flex-wrap: wrap;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .overview-grid {
    grid-template-columns: 1fr;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .inventory-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .inventory-actions {
    justify-content: center;
  }

  .inventory-summary {
    grid-template-columns: repeat(2, 1fr);
  }

  .reports-grid {
    grid-template-columns: 1fr;
  }

  .reports-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .manager-header {
    flex-direction: column;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .warehouse-name {
    font-size: 1.5rem;
  }

  .stat-content {
    flex-direction: column;
    text-align: center;
  }

  .stat-number {
    font-size: 1.5rem;
  }

  .inventory-summary {
    grid-template-columns: 1fr;
  }

  .capacity-labels {
    flex-direction: column;
    gap: 0.25rem;
  }
}
</style>