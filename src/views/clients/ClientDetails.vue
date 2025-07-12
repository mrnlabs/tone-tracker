<template>
  <DashboardLayout>
    <div class="client-details-page">
      <!-- Loading State -->
      <div v-if="loading" class="loading-container">
        <ProgressSpinner />
        <p>Loading client details...</p>
      </div>

      <!-- Client Details Content -->
      <div v-else-if="client" class="client-content">
        <!-- Page Header -->
        <div class="page-header">
          <div class="header-nav">
            <Button
                @click="$router.push('/clients')"
                icon="pi pi-arrow-left"
                class="p-button-text"
                label="Back to Clients"
            />
          </div>

          <div class="header-main">
            <div class="client-avatar-section">
              <Avatar
                  :label="(client.companyName || client.brandName || '?').charAt(0)"
                  size="xlarge"
                  shape="circle"
                  :style="{ backgroundColor: client.brandColor || '#3b82f6', color: 'white' }"
              />
              <div class="client-basic-info">
                <h1 class="client-name">{{ client.companyName || client.brandName }}</h1>
                <p class="client-industry">{{ client.businessType }}</p>
                <Tag
                    :value="client.status"
                    :severity="getStatusSeverity(client.status)"
                    class="client-status"
                />
              </div>
            </div>

            <div class="header-actions">
              <Button
                  @click="editClient"
                  icon="pi pi-pencil"
                  label="Edit Client"
                  class="p-button-outlined"
              />
              <Button
                  @click="createActivation"
                  icon="pi pi-plus"
                  label="New Activation"
                  class="p-button-success"
              />
              <Button
                  @click="showActions = !showActions"
                  icon="pi pi-ellipsis-v"
                  class="p-button-text"
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
                  <div class="stat-icon activations">
                    <i class="pi pi-calendar"></i>
                  </div>
                  <div class="stat-info">
                    <h3>Total Activations</h3>
                    <p class="stat-number">{{ client.totalActivations || 0 }}</p>
                    <span class="stat-change positive">{{ client.activeActivations || 0 }} active</span>
                  </div>
                </div>
              </template>
            </Card>

            <Card class="stat-card">
              <template #content>
                <div class="stat-content">
                  <div class="stat-icon revenue">
                    <i class="pi pi-dollar"></i>
                  </div>
                  <div class="stat-info">
                    <h3>Total Revenue</h3>
                    <p class="stat-number">${{ (client.totalRevenue || 0).toLocaleString() }}</p>
                    <span class="stat-change positive">+${{ (client.revenueThisMonth || 0).toLocaleString() }} this month</span>
                  </div>
                </div>
              </template>
            </Card>

            <Card class="stat-card">
              <template #content>
                <div class="stat-content">
                  <div class="stat-icon performance">
                    <i class="pi pi-chart-line"></i>
                  </div>
                  <div class="stat-info">
                    <h3>Success Rate</h3>
                    <p class="stat-number">{{ client.successRate }}%</p>
                    <span class="stat-change neutral">{{ client.completedActivations }}/{{ client.totalActivations }} completed</span>
                  </div>
                </div>
              </template>
            </Card>

            <Card class="stat-card">
              <template #content>
                <div class="stat-content">
                  <div class="stat-icon engagement">
                    <i class="pi pi-users"></i>
                  </div>
                  <div class="stat-info">
                    <h3>Avg. Engagement</h3>
                    <p class="stat-number">{{ client.avgEngagement }}</p>
                    <span class="stat-change positive">{{ client.totalCustomersReached.toLocaleString() }} customers reached</span>
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
                  <!-- Client Information -->
                  <Card class="info-card">
                    <template #header>
                      <h3>Client Information</h3>
                    </template>
                    <template #content>
                      <div class="info-grid">
                        <div class="info-item">
                          <label>Company Name</label>
                          <span>{{ client.companyName }}</span>
                        </div>
                        <div class="info-item">
                          <label>Business Type</label>
                          <span>{{ client.businessType }}</span>
                        </div>
                        <div class="info-item">
                          <label>Registration Number</label>
                          <span>{{ client.registrationNumber || 'Not specified' }}</span>
                        </div>
                        <div class="info-item">
                          <label>Website</label>
                          <span>
                            <a v-if="client.website" :href="client.website" target="_blank" class="website-link">
                              {{ client.website }}
                              <i class="pi pi-external-link"></i>
                            </a>
                            <span v-else>Not provided</span>
                          </span>
                        </div>
                        <div class="info-item full-width" v-if="client.description">
                          <label>Description</label>
                          <span>{{ client.description }}</span>
                        </div>
                      </div>
                    </template>
                  </Card>

                  <!-- Contact Information -->
                  <Card class="info-card">
                    <template #header>
                      <h3>Primary Contact</h3>
                    </template>
                    <template #content>
                      <div class="contact-info">
                        <div class="contact-header">
                          <Avatar
                              :label="(client.primaryContactName || '?').split(' ').map(n => n.charAt(0)).join('')"
                              size="large"
                              shape="circle"
                          />
                          <div class="contact-details">
                            <h4>{{ client.primaryContactName || 'No Contact Name' }}</h4>
                            <p v-if="client.primaryContactJobTitle">{{ client.primaryContactJobTitle }}</p>
                          </div>
                        </div>

                        <div class="contact-methods">
                          <div class="contact-method">
                            <i class="pi pi-envelope"></i>
                            <span>{{ client.primaryContactEmail || 'No Email' }}</span>
                            <Button
                                v-if="client.primaryContactEmail"
                                @click="sendEmail(client.primaryContactEmail)"
                                icon="pi pi-send"
                                class="p-button-text p-button-sm"
                                v-tooltip.top="'Send Email'"
                            />
                          </div>
                          <div class="contact-method" v-if="client.primaryContactPhone">
                            <i class="pi pi-phone"></i>
                            <span>{{ client.primaryContactPhone }}</span>
                            <Button
                                @click="callContact(client.primaryContactPhone)"
                                icon="pi pi-phone"
                                class="p-button-text p-button-sm"
                                v-tooltip.top="'Call'"
                            />
                          </div>
                        </div>
                      </div>
                    </template>
                  </Card>

                  <!-- Business Information -->
                  <Card class="info-card">
                    <template #header>
                      <h3>Business Information</h3>
                    </template>
                    <template #content>
                      <div class="info-grid">
                        <div class="info-item full-width">
                          <label>Address</label>
                          <span>{{ client.streetAddress }}, {{ client.city }}, {{ client.country }}</span>
                        </div>
                        <div class="info-item" v-if="client.zipCode">
                          <label>Zip Code</label>
                          <span>{{ client.zipCode || 'Not specified' }}</span>
                        </div>
                        <div class="info-item" v-if="client.taxNumber">
                          <label>Tax Number</label>
                          <span>{{ client.taxNumber || 'Not specified' }}</span>
                        </div>
                        <div class="info-item">
                          <label>Status</label>
                          <Tag
                              :value="client.status"
                              :severity="getStatusSeverity(client.status)"
                          />
                        </div>
                        <div class="info-item full-width" v-if="client.notes">
                          <label>Notes</label>
                          <span>{{ client.notes }}</span>
                        </div>
                      </div>
                    </template>
                  </Card>
                </div>
              </div>
            </TabPanel>

            <!-- Activations Tab -->
            <TabPanel header="Activations">
              <div class="activations-content">
                <div class="activations-header">
                  <h3>Client Activations</h3>
                  <div class="activations-filters">
                    <Dropdown
                        v-model="selectedActivationStatus"
                        :options="activationStatusOptions"
                        optionLabel="label"
                        optionValue="value"
                        placeholder="All Status"
                        showClear
                        @change="filterActivations"
                    />
                    <Button
                        @click="createActivation"
                        icon="pi pi-plus"
                        label="New Activation"
                        class="p-button-success"
                    />
                  </div>
                </div>

                <DataTable
                    :value="filteredActivations"
                    :loading="activationsLoading"
                    responsiveLayout="scroll"
                    :paginator="true"
                    :rows="10"
                    dataKey="id"
                >
                  <Column field="name" header="Activation Name" sortable>
                    <template #body="{ data }">
                      <router-link
                          :to="`/activations/${data.id}`"
                          class="activation-link"
                      >
                        {{ data.name }}
                      </router-link>
                    </template>
                  </Column>

                  <Column field="location" header="Location" sortable>
                    <template #body="{ data }">
                      <div class="location-cell">
                        <i class="pi pi-map-marker"></i>
                        <span>{{ data.location }}</span>
                      </div>
                    </template>
                  </Column>

                  <Column field="startDate" header="Start Date" sortable>
                    <template #body="{ data }">
                      {{ formatDate(data.startDate) }}
                    </template>
                  </Column>

                  <Column field="endDate" header="End Date" sortable>
                    <template #body="{ data }">
                      {{ formatDate(data.endDate) }}
                    </template>
                  </Column>

                  <Column field="status" header="Status" sortable>
                    <template #body="{ data }">
                      <Tag
                          :value="data.status"
                          :severity="getActivationStatusSeverity(data.status)"
                      />
                    </template>
                  </Column>

                  <Column field="budget" header="Budget" sortable>
                    <template #body="{ data }">
                      <span class="budget-amount">${{ data.budget.toLocaleString() }}</span>
                    </template>
                  </Column>

                  <Column field="performance" header="Performance" sortable>
                    <template #body="{ data }">
                      <div class="performance-cell">
                        <ProgressBar :value="data.performance" class="performance-bar" />
                        <span class="performance-text">{{ data.performance }}%</span>
                      </div>
                    </template>
                  </Column>

                  <Column header="Actions" :exportable="false">
                    <template #body="{ data }">
                      <div class="action-buttons">
                        <Button
                            @click="viewActivation(data.id)"
                            icon="pi pi-eye"
                            class="p-button-text p-button-sm"
                            v-tooltip.top="'View Details'"
                        />
                        <Button
                            @click="editActivation(data.id)"
                            icon="pi pi-pencil"
                            class="p-button-text p-button-sm"
                            v-tooltip.top="'Edit'"
                        />
                      </div>
                    </template>
                  </Column>

                  <template #empty>
                    <div class="empty-state">
                      <i class="pi pi-calendar empty-icon"></i>
                      <h3>No activations found</h3>
                      <p>This client doesn't have any activations yet.</p>
                      <Button
                          @click="createActivation"
                          label="Create First Activation"
                          icon="pi pi-plus"
                          class="p-button-outlined"
                      />
                    </div>
                  </template>
                </DataTable>
              </div>
            </TabPanel>

            <!-- Reports Tab -->
            <TabPanel header="Reports & Analytics">
              <div class="reports-content">
                <div class="reports-grid">
                  <!-- Performance Chart -->
                  <Card class="chart-card">
                    <template #header>
                      <h3>Activation Performance Trend</h3>
                    </template>
                    <template #content>
                      <div class="chart-placeholder">
                        <i class="pi pi-chart-line chart-icon"></i>
                        <p>Performance chart will be displayed here</p>
                      </div>
                    </template>
                  </Card>

                  <!-- Revenue Chart -->
                  <Card class="chart-card">
                    <template #header>
                      <h3>Revenue by Month</h3>
                    </template>
                    <template #content>
                      <div class="chart-placeholder">
                        <i class="pi pi-chart-bar chart-icon"></i>
                        <p>Revenue chart will be displayed here</p>
                      </div>
                    </template>
                  </Card>

                  <!-- Key Metrics -->
                  <Card class="metrics-card">
                    <template #header>
                      <h3>Key Performance Metrics</h3>
                    </template>
                    <template #content>
                      <div class="metrics-list">
                        <div class="metric-item">
                          <span class="metric-label">Average Activation Duration</span>
                          <span class="metric-value">{{ client.avgActivationDuration }} days</span>
                        </div>
                        <div class="metric-item">
                          <span class="metric-label">Customer Engagement Rate</span>
                          <span class="metric-value">{{ client.engagementRate }}%</span>
                        </div>
                        <div class="metric-item">
                          <span class="metric-label">ROI</span>
                          <span class="metric-value">{{ client.roi }}%</span>
                        </div>
                        <div class="metric-item">
                          <span class="metric-label">Repeat Activation Rate</span>
                          <span class="metric-value">{{ client.repeatRate }}%</span>
                        </div>
                      </div>
                    </template>
                  </Card>

                  <!-- Export Options -->
                  <Card class="export-card">
                    <template #header>
                      <h3>Export Reports</h3>
                    </template>
                    <template #content>
                      <div class="export-options">
                        <Button
                            @click="exportClientReport('pdf')"
                            icon="pi pi-file-pdf"
                            label="Export PDF Report"
                            class="p-button-outlined export-btn"
                        />
                        <Button
                            @click="exportClientReport('excel')"
                            icon="pi pi-file-excel"
                            label="Export Excel Report"
                            class="p-button-outlined export-btn"
                        />
                        <Button
                            @click="exportClientReport('csv')"
                            icon="pi pi-file"
                            label="Export CSV Data"
                            class="p-button-outlined export-btn"
                        />
                      </div>
                    </template>
                  </Card>
                </div>
              </div>
            </TabPanel>

            <!-- Activity Log Tab -->
            <TabPanel header="Activity Log">
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
          </TabView>
        </div>
      </div>

      <!-- Client Not Found -->
      <div v-else class="not-found-container">
        <div class="not-found-content">
          <i class="pi pi-exclamation-triangle not-found-icon"></i>
          <h2>Client Not Found</h2>
          <p>The requested client could not be found or may have been removed.</p>
          <Button
              @click="$router.push('/clients')"
              label="Back to Clients"
              icon="pi pi-arrow-left"
              class="p-button-outlined"
          />
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { useClientsStore } from '@/stores/client'
import { useLoading } from '@/composables/useLoading'
import DashboardLayout from '@/components/general/DashboardLayout.vue'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const clientsStore = useClientsStore()
const { withLoading, isLoading } = useLoading()

// State
const activations = ref([])
const activityLog = ref([])
const selectedActivationStatus = ref(null)
const showActions = ref(false)

// Computed
const loading = computed(() => isLoading('fetch-client') || clientsStore.isLoading)
const client = computed(() => clientsStore.currentClient)
const clientActivations = computed(() => clientsStore.getCachedClientActivations(route.params.id))
const activationsLoading = computed(() => isLoading('fetch-client-activations'))

// Options
const activationStatusOptions = [
  { label: 'Active', value: 'Active' },
  { label: 'Completed', value: 'Completed' },
  { label: 'Planned', value: 'Planned' },
  { label: 'Cancelled', value: 'Cancelled' }
]

const filteredActivations = computed(() => {
  if (!selectedActivationStatus.value) {
    return activations.value
  }
  return activations.value.filter(activation =>
      activation.status === selectedActivationStatus.value
  )
})

// Methods
const loadClientData = async () => {
  try {
    await withLoading('fetch-client', () => clientsStore.getClient(route.params.id))
  } catch (error) {
    console.error('Failed to load client:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: clientsStore.error || 'Failed to load client details',
      life: 3000
    })
  }
}

const loadActivations = async () => {
  try {
    const response = await withLoading('fetch-client-activations', () => 
      clientsStore.getClientActivations(route.params.id)
    )
    // Update local activations if needed for additional processing
    activations.value = response.data || []
  } catch (error) {
    console.error('Failed to load activations:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: clientsStore.error || 'Failed to load client activations',
      life: 3000
    })
  }
}

const loadActivityLog = async () => {
  try {
    // Mock activity log data
    activityLog.value = [
      {
        type: 'activation',
        icon: 'pi pi-calendar-plus',
        title: 'New Activation Created',
        description: 'Summer Product Launch activation was created and scheduled',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        user: 'Sarah Johnson'
      },
      {
        type: 'contact',
        icon: 'pi pi-phone',
        title: 'Client Contact',
        description: 'Phone call with John Smith regarding upcoming activations',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
        user: 'Mike Chen'
      },
      {
        type: 'report',
        icon: 'pi pi-file',
        title: 'Report Generated',
        description: 'Monthly performance report generated and sent to client',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
        user: 'System'
      }
    ]
  } catch (error) {
    console.error('Failed to load activity log:', error)
  }
}

const getStatusSeverity = (status) => {
  const severityMap = {
    'ACTIVE': 'success',
    'INACTIVE': 'danger', 
    'PENDING': 'warning',
    'Active': 'success',
    'Inactive': 'danger',
    'Pending': 'warning'
  }
  return severityMap[status] || 'info'
}

const getActivationStatusSeverity = (status) => {
  const severityMap = {
    'Active': 'success',
    'Completed': 'info',
    'Planned': 'warning',
    'Cancelled': 'danger'
  }
  return severityMap[status] || 'info'
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

const editClient = () => {
  router.push(`/clients/${route.params.id}/edit`)
}

const createActivation = () => {
  router.push(`/activations/create?client=${route.params.id}`)
}

const viewActivation = (activationId) => {
  router.push(`/activations/${activationId}`)
}

const editActivation = (activationId) => {
  router.push(`/activations/${activationId}/edit`)
}

const filterActivations = () => {
  // Filtering is handled by computed property
}

const refreshActivity = async () => {
  await loadActivityLog()
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

const callContact = (phone) => {
  window.location.href = `tel:${phone}`
}

const exportClientReport = (format) => {
  toast.add({
    severity: 'info',
    summary: 'Export Started',
    detail: `${format.toUpperCase()} report export initiated`,
    life: 3000
  })
}

// Watch for route parameter changes
watch(() => route.params.id, (newId) => {
  if (newId) {
    loadClientData()
    loadActivations()
  }
}, { immediate: false })

// Error handling watcher
watch(() => clientsStore.error, (error) => {
  if (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error,
      life: 5000
    })
    clientsStore.clearError()
  }
})

onMounted(async () => {
  await Promise.all([
    loadClientData(),
    loadActivations(),
    loadActivityLog()
  ])
})
</script>

<style scoped>
.client-details-page {
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

.client-avatar-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.client-basic-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.client-name {
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.client-industry {
  color: #6b7280;
  margin: 0;
  font-size: 1.1rem;
}

.client-status {
  align-self: flex-start;
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

.stat-icon.activations { background: linear-gradient(135deg, #3b82f6, #1d4ed8); }
.stat-icon.revenue { background: linear-gradient(135deg, #10b981, #059669); }
.stat-icon.performance { background: linear-gradient(135deg, #8b5cf6, #7c3aed); }
.stat-icon.engagement { background: linear-gradient(135deg, #f59e0b, #d97706); }

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

.stat-change {
  font-size: 0.8rem;
  font-weight: 500;
}

.stat-change.positive { color: #10b981; }
.stat-change.negative { color: #ef4444; }
.stat-change.neutral { color: #6b7280; }

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

.website-link {
  color: #3b82f6;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.website-link:hover {
  text-decoration: underline;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.contact-header {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.contact-details h4 {
  margin: 0;
  color: #111827;
}

.contact-details p {
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

.activations-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.activations-filters {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.activation-link {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
}

.activation-link:hover {
  text-decoration: underline;
}

.location-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
}

.budget-amount {
  font-weight: 600;
  color: #10b981;
}

.performance-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.performance-bar {
  flex: 1;
  height: 0.5rem;
}

.performance-text {
  font-weight: 500;
  color: #6b7280;
  font-size: 0.875rem;
}

.action-buttons {
  display: flex;
  gap: 0.25rem;
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

.reports-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.chart-card,
.metrics-card,
.export-card {
  min-height: 250px;
}

.chart-card h3,
.metrics-card h3,
.export-card h3 {
  color: #111827;
  margin: 0;
}

.chart-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  background: #f9fafb;
  border: 2px dashed #d1d5db;
  border-radius: 0.5rem;
  color: #6b7280;
}

.chart-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.metrics-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.metric-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 0.5rem;
}

.metric-label {
  color: #6b7280;
  font-weight: 500;
}

.metric-value {
  color: #111827;
  font-weight: 600;
}

.export-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.export-btn {
  justify-content: flex-start;
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

.activity-marker.activation {
  background: #3b82f6;
}

.activity-marker.contact {
  background: #10b981;
}

.activity-marker.report {
  background: #8b5cf6;
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

@media (max-width: 768px) {
  .client-details-page {
    padding: 1rem;
  }

  .header-main {
    flex-direction: column;
    align-items: stretch;
  }

  .client-avatar-section {
    flex-direction: column;
    text-align: center;
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

  .activations-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .activations-filters {
    justify-content: center;
  }

  .reports-grid {
    grid-template-columns: 1fr;
  }

  .contact-header {
    flex-direction: column;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .client-name {
    font-size: 1.5rem;
  }

  .stat-content {
    flex-direction: column;
    text-align: center;
  }

  .stat-number {
    font-size: 1.5rem;
  }
}
</style>