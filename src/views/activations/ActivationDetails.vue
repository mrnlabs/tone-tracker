<template>
  <DashboardLayout>
    <div class="activation-details-page">
      <!-- Loading State -->
      <div v-if="loading" class="loading-container">
        <ProgressSpinner />
        <p>Loading activation details...</p>
      </div>

      <!-- Activation Details Content -->
      <div v-else-if="activation" class="activation-content">
        <!-- Page Header -->
        <div class="page-header">
          <div class="header-nav">
            <Button
                @click="$router.push('/activations')"
                icon="pi pi-arrow-left"
                class="p-button-text"
                label="Back to Activations"
            />
          </div>

          <div class="header-main">
            <div class="activation-info-section">
              <div class="activation-header">
                <div class="activation-title">
                  <h1 class="activation-name">{{ activation.name }}</h1>
                  <span class="activation-code">{{ activation.code }}</span>
                </div>
                <Tag
                    :value="activation.status"
                    :severity="getStatusSeverity(activation.status)"
                    class="activation-status-tag"
                />
              </div>

              <div class="activation-meta">
                <div class="meta-item">
                  <i class="pi pi-building"></i>
                  <span>{{ activation.client }}</span>
                </div>
                <div class="meta-item">
                  <i class="pi pi-map-marker"></i>
                  <span>{{ activation.location }}</span>
                </div>
                <div class="meta-item">
                  <i class="pi pi-calendar"></i>
                  <span>{{ formatDateRange(activation.startDate, activation.endDate) }}</span>
                </div>
                <div class="meta-item">
                  <i class="pi pi-dollar"></i>
                  <span>${{ activation.budget.toLocaleString() }}</span>
                </div>
              </div>
            </div>

            <div class="header-actions">
              <Button
                  v-if="canEditActivation"
                  @click="editActivation"
                  icon="pi pi-pencil"
                  label="Edit"
                  class="p-button-outlined"
              />
              <Button
                  v-if="canManageTeam"
                  @click="manageTeam"
                  icon="pi pi-users"
                  label="Manage Team"
                  class="p-button-outlined"
              />
              <Button
                  @click="showActionsMenu = !showActionsMenu"
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
                  <div class="stat-icon progress">
                    <i class="pi pi-chart-line"></i>
                  </div>
                  <div class="stat-info">
                    <h3>Progress</h3>
                    <p class="stat-number">{{ activation.progress }}%</p>
                    <ProgressBar :value="activation.progress" class="progress-mini" />
                  </div>
                </div>
              </template>
            </Card>

            <Card class="stat-card">
              <template #content>
                <div class="stat-content">
                  <div class="stat-icon team">
                    <i class="pi pi-users"></i>
                  </div>
                  <div class="stat-info">
                    <h3>Team Size</h3>
                    <p class="stat-number">{{ activation.teamMembers.length }}</p>
                    <span class="stat-detail">{{ activation.teamMembers.filter(m => m.status === 'active').length }} active</span>
                  </div>
                </div>
              </template>
            </Card>

            <Card class="stat-card">
              <template #content>
                <div class="stat-content">
                  <div class="stat-icon engagement">
                    <i class="pi pi-heart"></i>
                  </div>
                  <div class="stat-info">
                    <h3>Customer Interactions</h3>
                    <p class="stat-number">{{ activation.customerInteractions.toLocaleString() }}</p>
                    <span class="stat-detail">{{ calculateDailyAverage() }} per day</span>
                  </div>
                </div>
              </template>
            </Card>

            <Card class="stat-card">
              <template #content>
                <div class="stat-content">
                  <div class="stat-icon sales">
                    <i class="pi pi-shopping-cart"></i>
                  </div>
                  <div class="stat-info">
                    <h3>Sales Generated</h3>
                    <p class="stat-number">${{ activation.salesGenerated.toLocaleString() }}</p>
                    <span class="stat-detail">{{ activation.unitsOld }} units sold</span>
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
                  <!-- Activation Information -->
                  <Card class="info-card">
                    <template #header>
                      <h3>Activation Details</h3>
                    </template>
                    <template #content>
                      <div class="info-grid">
                        <div class="info-item">
                          <label>Type</label>
                          <span>{{ activation.type }}</span>
                        </div>
                        <div class="info-item">
                          <label>Category</label>
                          <span>{{ activation.category }}</span>
                        </div>
                        <div class="info-item">
                          <label>Priority</label>
                          <Tag :value="activation.priority" :severity="getPrioritySeverity(activation.priority)" />
                        </div>
                        <div class="info-item">
                          <label>Duration</label>
                          <span>{{ calculateDuration() }} days</span>
                        </div>
                        <div class="info-item full-width">
                          <label>Description</label>
                          <span>{{ activation.description }}</span>
                        </div>
                        <div class="info-item full-width" v-if="activation.objectives">
                          <label>Key Objectives</label>
                          <span>{{ activation.objectives }}</span>
                        </div>
                      </div>
                    </template>
                  </Card>

                  <!-- Schedule Information -->
                  <Card class="info-card">
                    <template #header>
                      <h3>Schedule & Location</h3>
                    </template>
                    <template #content>
                      <div class="schedule-info">
                        <div class="schedule-timeline">
                          <div class="timeline-item">
                            <div class="timeline-marker start">
                              <i class="pi pi-play"></i>
                            </div>
                            <div class="timeline-content">
                              <h4>Start Date</h4>
                              <p>{{ formatDateTime(activation.startDate, activation.startTime) }}</p>
                            </div>
                          </div>
                          <div class="timeline-item">
                            <div class="timeline-marker end">
                              <i class="pi pi-stop"></i>
                            </div>
                            <div class="timeline-content">
                              <h4>End Date</h4>
                              <p>{{ formatDateTime(activation.endDate, activation.endTime) }}</p>
                            </div>
                          </div>
                        </div>

                        <div class="location-details">
                          <div class="location-header">
                            <i class="pi pi-map-marker"></i>
                            <h4>Venue</h4>
                          </div>
                          <p class="venue-name">{{ activation.venue }}</p>
                          <p class="venue-address">{{ activation.address }}</p>
                          <div class="location-actions">
                            <Button
                                @click="openMaps"
                                icon="pi pi-map"
                                label="View on Map"
                                class="p-button-outlined p-button-sm"
                            />
                            <Button
                                @click="getDirections"
                                icon="pi pi-compass"
                                label="Get Directions"
                                class="p-button-outlined p-button-sm"
                            />
                          </div>
                        </div>
                      </div>
                    </template>
                  </Card>

                  <!-- Budget Overview -->
                  <Card class="info-card">
                    <template #header>
                      <h3>Budget Overview</h3>
                    </template>
                    <template #content>
                      <div class="budget-overview">
                        <div class="budget-summary">
                          <div class="budget-total">
                            <span class="budget-label">Total Budget</span>
                            <span class="budget-amount">${{ activation.budget.toLocaleString() }}</span>
                          </div>
                          <div class="budget-spent">
                            <span class="budget-label">Spent</span>
                            <span class="budget-amount">${{ activation.budgetSpent.toLocaleString() }}</span>
                          </div>
                          <div class="budget-remaining">
                            <span class="budget-label">Remaining</span>
                            <span class="budget-amount">${{ (activation.budget - activation.budgetSpent).toLocaleString() }}</span>
                          </div>
                        </div>

                        <div class="budget-progress">
                          <div class="progress-header">
                            <span>Budget Utilization</span>
                            <span>{{ Math.round((activation.budgetSpent / activation.budget) * 100) }}%</span>
                          </div>
                          <ProgressBar
                              :value="(activation.budgetSpent / activation.budget) * 100"
                              :class="{ 'over-budget': activation.budgetSpent > activation.budget }"
                          />
                        </div>

                        <div class="budget-breakdown">
                          <h5>Budget Breakdown</h5>
                          <div class="breakdown-items">
                            <div class="breakdown-item" v-for="item in activation.budgetBreakdown" :key="item.category">
                              <div class="item-info">
                                <span class="item-label">{{ item.category }}</span>
                                <span class="item-amount">${{ item.allocated.toLocaleString() }}</span>
                              </div>
                              <div class="item-progress">
                                <ProgressBar :value="(item.spent / item.allocated) * 100" class="mini-progress" />
                                <span class="spent-amount">${{ item.spent.toLocaleString() }} spent</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </template>
                  </Card>
                </div>
              </div>
            </TabPanel>

            <!-- Team Tab -->
            <TabPanel header="Team">
              <div class="team-content">
                <div class="team-header">
                  <h3>Team Management</h3>
                  <div class="team-actions">
                    <Button
                        v-if="canManageTeam"
                        @click="addTeamMember"
                        icon="pi pi-plus"
                        label="Add Member"
                        class="p-button-success"
                    />
                    <Button
                        @click="exportTeamData"
                        icon="pi pi-download"
                        label="Export"
                        class="p-button-outlined"
                    />
                  </div>
                </div>

                <!-- Team Stats -->
                <div class="team-stats">
                  <div class="stat-item">
                    <i class="pi pi-users"></i>
                    <div>
                      <span class="stat-value">{{ activation.teamMembers.length }}</span>
                      <span class="stat-label">Total Members</span>
                    </div>
                  </div>
                  <div class="stat-item">
                    <i class="pi pi-check-circle"></i>
                    <div>
                      <span class="stat-value">{{ activation.teamMembers.filter(m => m.status === 'active').length }}</span>
                      <span class="stat-label">Active</span>
                    </div>
                  </div>
                  <div class="stat-item">
                    <i class="pi pi-clock"></i>
                    <div>
                      <span class="stat-value">{{ calculateTotalHours() }}</span>
                      <span class="stat-label">Total Hours</span>
                    </div>
                  </div>
                  <div class="stat-item">
                    <i class="pi pi-star"></i>
                    <div>
                      <span class="stat-value">{{ calculateAverageRating() }}</span>
                      <span class="stat-label">Avg Rating</span>
                    </div>
                  </div>
                </div>

                <!-- Team Members List -->
                <Card class="team-members-card">
                  <template #content>
                    <DataTable
                        :value="activation.teamMembers"
                        responsiveLayout="scroll"
                        dataKey="id"
                    >
                      <Column field="name" header="Team Member" sortable>
                        <template #body="{ data }">
                          <div class="member-cell">
                            <Avatar
                                :label="data.name.split(' ').map(n => n.charAt(0)).join('')"
                                size="normal"
                                shape="circle"
                                :style="{ backgroundColor: data.avatarColor || '#3b82f6', color: 'white' }"
                            />
                            <div class="member-info">
                              <span class="member-name">{{ data.name }}</span>
                              <span class="member-role">{{ data.role }}</span>
                            </div>
                          </div>
                        </template>
                      </Column>

                      <Column field="email" header="Contact" sortable>
                        <template #body="{ data }">
                          <div class="contact-info">
                            <span class="member-email">{{ data.email }}</span>
                            <span class="member-phone">{{ data.phone }}</span>
                          </div>
                        </template>
                      </Column>

                      <Column field="status" header="Status" sortable>
                        <template #body="{ data }">
                          <Tag
                              :value="data.status"
                              :severity="getMemberStatusSeverity(data.status)"
                          />
                        </template>
                      </Column>

                      <Column field="hoursWorked" header="Hours" sortable>
                        <template #body="{ data }">
                          <span class="hours-worked">{{ data.hoursWorked }}h</span>
                        </template>
                      </Column>

                      <Column field="performance" header="Performance" sortable>
                        <template #body="{ data }">
                          <div class="performance-cell">
                            <div class="rating">
                              <i class="pi pi-star-fill"></i>
                              <span>{{ data.rating }}/5</span>
                            </div>
                            <span class="performance-note">{{ data.performanceNote }}</span>
                          </div>
                        </template>
                      </Column>

                      <Column field="lastActivity" header="Last Activity" sortable>
                        <template #body="{ data }">
                          <span class="last-activity">{{ formatRelativeTime(data.lastActivity) }}</span>
                        </template>
                      </Column>

                      <Column header="Actions" :exportable="false">
                        <template #body="{ data }">
                          <div class="member-actions">
                            <Button
                                @click="viewMemberDetails(data.id)"
                                icon="pi pi-eye"
                                class="p-button-text p-button-sm"
                                v-tooltip.top="'View Details'"
                            />
                            <Button
                                @click="contactMember(data)"
                                icon="pi pi-phone"
                                class="p-button-text p-button-sm"
                                v-tooltip.top="'Contact'"
                            />
                            <Button
                                v-if="canManageTeam"
                                @click="removeMember(data)"
                                icon="pi pi-trash"
                                class="p-button-text p-button-sm p-button-danger"
                                v-tooltip.top="'Remove'"
                            />
                          </div>
                        </template>
                      </Column>
                    </DataTable>
                  </template>
                </Card>
              </div>
            </TabPanel>

            <!-- Performance Tab -->
            <TabPanel header="Performance">
              <div class="performance-content">
                <div class="performance-grid">
                  <!-- KPI Cards -->
                  <Card class="kpi-card">
                    <template #header>
                      <h3>Key Performance Indicators</h3>
                    </template>
                    <template #content>
                      <div class="kpi-list">
                        <div class="kpi-item" v-for="kpi in activation.kpis" :key="kpi.name">
                          <div class="kpi-header">
                            <span class="kpi-name">{{ kpi.name }}</span>
                            <span class="kpi-value">{{ formatKpiValue(kpi.current, kpi.unit) }}</span>
                          </div>
                          <div class="kpi-progress">
                            <ProgressBar
                                :value="(kpi.current / kpi.target) * 100"
                                :class="getKpiProgressClass(kpi.current, kpi.target)"
                            />
                            <span class="kpi-target">Target: {{ formatKpiValue(kpi.target, kpi.unit) }}</span>
                          </div>
                          <div class="kpi-status">
                            <Tag
                                :value="getKpiStatus(kpi.current, kpi.target)"
                                :severity="getKpiStatusSeverity(kpi.current, kpi.target)"
                            />
                          </div>
                        </div>
                      </div>
                    </template>
                  </Card>

                  <!-- Daily Performance Chart -->
                  <Card class="chart-card">
                    <template #header>
                      <h3>Daily Performance Trend</h3>
                    </template>
                    <template #content>
                      <div class="chart-placeholder">
                        <i class="pi pi-chart-line chart-icon"></i>
                        <p>Performance chart will be displayed here</p>
                        <small>Shows daily customer interactions, sales, and engagement metrics</small>
                      </div>
                    </template>
                  </Card>

                  <!-- Customer Feedback -->
                  <Card class="feedback-card">
                    <template #header>
                      <h3>Customer Feedback</h3>
                    </template>
                    <template #content>
                      <div class="feedback-summary">
                        <div class="feedback-stats">
                          <div class="feedback-stat">
                            <span class="stat-number">{{ activation.customerFeedback.totalResponses }}</span>
                            <span class="stat-label">Total Responses</span>
                          </div>
                          <div class="feedback-stat">
                            <span class="stat-number">{{ activation.customerFeedback.averageRating }}</span>
                            <span class="stat-label">Average Rating</span>
                          </div>
                          <div class="feedback-stat">
                            <span class="stat-number">{{ activation.customerFeedback.npsScore }}</span>
                            <span class="stat-label">NPS Score</span>
                          </div>
                        </div>

                        <div class="feedback-breakdown">
                          <h5>Rating Distribution</h5>
                          <div class="rating-bars">
                            <div v-for="(count, rating) in activation.customerFeedback.ratingDistribution" :key="rating" class="rating-bar">
                              <span class="rating-label">{{ rating }} stars</span>
                              <div class="bar-container">
                                <div class="bar" :style="{ width: (count / activation.customerFeedback.totalResponses) * 100 + '%' }"></div>
                              </div>
                              <span class="rating-count">{{ count }}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </template>
                  </Card>
                </div>
              </div>
            </TabPanel>

            <!-- Reports Tab -->
            <TabPanel header="Reports">
              <div class="reports-content">
                <div class="reports-header">
                  <h3>Activation Reports</h3>
                  <div class="reports-actions">
                    <Button
                        @click="generateReport('daily')"
                        icon="pi pi-file"
                        label="Daily Report"
                        class="p-button-outlined"
                    />
                    <Button
                        @click="generateReport('summary')"
                        icon="pi pi-file-pdf"
                        label="Summary Report"
                        class="p-button-outlined"
                    />
                    <Button
                        @click="generateReport('detailed')"
                        icon="pi pi-file-excel"
                        label="Detailed Report"
                        class="p-button-outlined"
                    />
                  </div>
                </div>

                <div class="reports-grid">
                  <!-- Report Templates -->
                  <Card class="report-template">
                    <template #header>
                      <h4>Daily Activity Report</h4>
                    </template>
                    <template #content>
                      <p>Daily summary of activities, interactions, and sales performance.</p>
                      <div class="template-info">
                        <span class="info-item">
                          <i class="pi pi-calendar"></i>
                          Updated daily at 11:59 PM
                        </span>
                        <span class="info-item">
                          <i class="pi pi-file-pdf"></i>
                          PDF format
                        </span>
                      </div>
                      <Button
                          @click="generateReport('daily')"
                          label="Generate Report"
                          class="p-button-sm"
                      />
                    </template>
                  </Card>

                  <Card class="report-template">
                    <template #header>
                      <h4>Performance Summary</h4>
                    </template>
                    <template #content>
                      <p>Comprehensive overview of KPIs, budget utilization, and team performance.</p>
                      <div class="template-info">
                        <span class="info-item">
                          <i class="pi pi-refresh"></i>
                          Real-time data
                        </span>
                        <span class="info-item">
                          <i class="pi pi-file-excel"></i>
                          Excel format
                        </span>
                      </div>
                      <Button
                          @click="generateReport('summary')"
                          label="Generate Report"
                          class="p-button-sm"
                      />
                    </template>
                  </Card>

                  <Card class="report-template">
                    <template #header>
                      <h4>Customer Insights</h4>
                    </template>
                    <template #content>
                      <p>Detailed analysis of customer interactions, feedback, and engagement patterns.</p>
                      <div class="template-info">
                        <span class="info-item">
                          <i class="pi pi-users"></i>
                          Customer data
                        </span>
                        <span class="info-item">
                          <i class="pi pi-chart-bar"></i>
                          Analytics included
                        </span>
                      </div>
                      <Button
                          @click="generateReport('insights')"
                          label="Generate Report"
                          class="p-button-sm"
                      />
                    </template>
                  </Card>
                </div>

                <!-- Recent Reports -->
                <Card class="recent-reports">
                  <template #header>
                    <h4>Recent Reports</h4>
                  </template>
                  <template #content>
                    <DataTable
                        :value="recentReports"
                        responsiveLayout="scroll"
                        :rows="5"
                    >
                      <Column field="name" header="Report Name" sortable></Column>
                      <Column field="type" header="Type" sortable></Column>
                      <Column field="generatedDate" header="Generated" sortable>
                        <template #body="{ data }">
                          {{ formatRelativeTime(data.generatedDate) }}
                        </template>
                      </Column>
                      <Column field="size" header="Size" sortable></Column>
                      <Column header="Actions" :exportable="false">
                        <template #body="{ data }">
                          <div class="report-actions">
                            <Button
                                @click="downloadReport(data.id)"
                                icon="pi pi-download"
                                class="p-button-text p-button-sm"
                                v-tooltip.top="'Download'"
                            />
                            <Button
                                @click="viewReport(data.id)"
                                icon="pi pi-eye"
                                class="p-button-text p-button-sm"
                                v-tooltip.top="'View'"
                            />
                          </div>
                        </template>
                      </Column>
                    </DataTable>
                  </template>
                </Card>
              </div>
            </TabPanel>
          </TabView>
        </div>
      </div>

      <!-- Activation Not Found -->
      <div v-else class="not-found-container">
        <div class="not-found-content">
          <i class="pi pi-exclamation-triangle not-found-icon"></i>
          <h2>Activation Not Found</h2>
          <p>The requested activation could not be found or may have been removed.</p>
          <Button
              @click="$router.push('/activations')"
              label="Back to Activations"
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
const activation = ref(null)
const recentReports = ref([])
const showActionsMenu = ref(false)

// Computed
const userRole = computed(() => authStore.user?.role)

const canEditActivation = computed(() => {
  return ['ADMIN', 'ACTIVATION_MANAGER'].includes(userRole.value) ||
      (userRole.value === 'CLIENT' && activation.value?.clientEmail === authStore.user?.email)
})

const canManageTeam = computed(() => {
  return ['ADMIN', 'ACTIVATION_MANAGER'].includes(userRole.value)
})

// Methods
const loadActivationData = async () => {
  loading.value = true
  try {
    const activationId = route.params.id

    // Mock API call - replace with actual API
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Mock activation data
    activation.value = {
      id: activationId,
      name: 'Summer Product Launch',
      code: 'SPL-2024-001',
      client: 'TechCorp Solutions',
      clientEmail: 'john.smith@techcorp.com',
      location: 'Central Mall, New York',
      venue: 'Central Mall - Main Atrium',
      address: '123 Shopping Center Blvd, New York, NY 10001',
      startDate: '2024-07-15',
      endDate: '2024-07-18',
      startTime: '09:00',
      endTime: '18:00',
      type: 'Product Launch',
      category: 'Technology',
      priority: 'High',
      status: 'Active',
      progress: 65,
      description: 'Launch event for the new TechCorp smartphone featuring interactive demos, product sampling, and customer engagement activities.',
      objectives: 'Increase brand awareness, generate 500+ leads, achieve 200 unit sales, collect customer feedback',
      budget: 75000,
      budgetSpent: 48000,
      customerInteractions: 1247,
      salesGenerated: 145000,
      unitsOld: 387,
      budgetBreakdown: [
        { category: 'Staff Costs', allocated: 25000, spent: 18500 },
        { category: 'Materials', allocated: 20000, spent: 15000 },
        { category: 'Venue', allocated: 15000, spent: 15000 },
        { category: 'Transport', allocated: 10000, spent: 7500 },
        { category: 'Other', allocated: 5000, spent: 2000 }
      ],
      teamMembers: [
        {
          id: 1,
          name: 'Sarah Johnson',
          role: 'Activation Manager',
          email: 'sarah@company.com',
          phone: '+1 555-0101',
          status: 'active',
          hoursWorked: 32,
          rating: 4.6,
          performanceNote: 'Great customer engagement',
          lastActivity: new Date(Date.now() - 1000 * 60 * 60),
          avatarColor: '#10b981'
        },
        {
          id: 3,
          name: 'Jane Smith',
          role: 'Promoter',
          email: 'jane@company.com',
          phone: '+1 555-0103',
          status: 'active',
          hoursWorked: 24,
          rating: 4.4,
          performanceNote: 'Reliable and punctual',
          lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 2),
          avatarColor: '#f59e0b'
        }
      ],
      kpis: [
        { name: 'Customer Interactions', current: 1247, target: 1500, unit: 'count' },
        { name: 'Sales Revenue', current: 145000, target: 200000, unit: 'currency' },
        { name: 'Units Sold', current: 387, target: 500, unit: 'count' },
        { name: 'Lead Generation', current: 234, target: 300, unit: 'count' },
        { name: 'Customer Satisfaction', current: 4.2, target: 4.5, unit: 'rating' }
      ],
      customerFeedback: {
        totalResponses: 186,
        averageRating: 4.2,
        npsScore: 67,
        ratingDistribution: {
          5: 89,
          4: 52,
          3: 28,
          2: 12,
          1: 5
        }
      }
    }

    // Load recent reports
    recentReports.value = [
      {
        id: 1,
        name: 'Daily Activity Report - July 15',
        type: 'Daily',
        generatedDate: new Date(Date.now() - 1000 * 60 * 60 * 2),
        size: '2.1 MB'
      },
      {
        id: 2,
        name: 'Performance Summary - Week 1',
        type: 'Weekly',
        generatedDate: new Date(Date.now() - 1000 * 60 * 60 * 24),
        size: '5.3 MB'
      },
      {
        id: 3,
        name: 'Customer Insights Report',
        type: 'Analytics',
        generatedDate: new Date(Date.now() - 1000 * 60 * 60 * 48),
        size: '3.7 MB'
      }
    ]

  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load activation data',
      life: 3000
    })
  } finally {
    loading.value = false
  }
}

const getStatusSeverity = (status) => {
  const severityMap = {
    'Active': 'success',
    'Completed': 'info',
    'Planned': 'warning',
    'On Hold': 'secondary',
    'Cancelled': 'danger'
  }
  return severityMap[status] || 'info'
}

const getPrioritySeverity = (priority) => {
  const severityMap = {
    'Low': 'secondary',
    'Medium': 'info',
    'High': 'warning',
    'Critical': 'danger'
  }
  return severityMap[priority] || 'info'
}

const getMemberStatusSeverity = (status) => {
  const severityMap = {
    'active': 'success',
    'inactive': 'secondary',
    'break': 'warning'
  }
  return severityMap[status] || 'info'
}

const formatDateRange = (startDate, endDate) => {
  const start = new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const end = new Date(endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  return `${start} - ${end}`
}

const formatDateTime = (date, time) => {
  const dateObj = new Date(date)
  const dateStr = dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  if (time) {
    const timeStr = new Date(`1970-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
    return `${dateStr} at ${timeStr}`
  }

  return dateStr
}

const formatRelativeTime = (timestamp) => {
  const now = new Date()
  const diff = now - timestamp
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 60) {
    return `${minutes} minutes ago`
  } else if (hours < 24) {
    return `${hours} hours ago`
  } else {
    return `${days} days ago`
  }
}

const calculateDuration = () => {
  if (!activation.value) return 0
  const start = new Date(activation.value.startDate)
  const end = new Date(activation.value.endDate)
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1
}

const calculateDailyAverage = () => {
  if (!activation.value) return 0
  const duration = calculateDuration()
  const daysElapsed = Math.min(duration, Math.ceil((new Date() - new Date(activation.value.startDate)) / (1000 * 60 * 60 * 24)))
  return Math.round(activation.value.customerInteractions / Math.max(daysElapsed, 1))
}

const calculateTotalHours = () => {
  if (!activation.value) return 0
  return activation.value.teamMembers.reduce((total, member) => total + member.hoursWorked, 0)
}

const calculateAverageRating = () => {
  if (!activation.value || activation.value.teamMembers.length === 0) return 0
  const totalRating = activation.value.teamMembers.reduce((total, member) => total + member.rating, 0)
  return (totalRating / activation.value.teamMembers.length).toFixed(1)
}

const formatKpiValue = (value, unit) => {
  switch (unit) {
    case 'currency':
      return `${value.toLocaleString()}`
    case 'rating':
      return `${value}/5`
    case 'percentage':
      return `${value}%`
    default:
      return value.toLocaleString()
  }
}

const getKpiProgressClass = (current, target) => {
  const percentage = (current / target) * 100
  if (percentage >= 100) return 'progress-excellent'
  if (percentage >= 80) return 'progress-good'
  if (percentage >= 60) return 'progress-warning'
  return 'progress-danger'
}

const getKpiStatus = (current, target) => {
  const percentage = (current / target) * 100
  if (percentage >= 100) return 'Achieved'
  if (percentage >= 80) return 'On Track'
  if (percentage >= 60) return 'Behind'
  return 'Critical'
}

const getKpiStatusSeverity = (current, target) => {
  const percentage = (current / target) * 100
  if (percentage >= 100) return 'success'
  if (percentage >= 80) return 'info'
  if (percentage >= 60) return 'warning'
  return 'danger'
}

const editActivation = () => {
  router.push(`/activations/${route.params.id}/edit`)
}

const manageTeam = () => {
  toast.add({
    severity: 'info',
    summary: 'Team Management',
    detail: 'Team management interface will be implemented',
    life: 3000
  })
}

const addTeamMember = () => {
  toast.add({
    severity: 'info',
    summary: 'Add Team Member',
    detail: 'Add team member functionality will be implemented',
    life: 3000
  })
}

const exportTeamData = () => {
  toast.add({
    severity: 'info',
    summary: 'Export',
    detail: 'Team data export started',
    life: 3000
  })
}

const viewMemberDetails = (memberId) => {
  router.push(`/team-members/${memberId}`)
}

const contactMember = (member) => {
  window.location.href = `mailto:${member.email}`
}

const removeMember = (member) => {
  toast.add({
    severity: 'info',
    summary: 'Remove Member',
    detail: `Remove ${member.name} functionality will be implemented`,
    life: 3000
  })
}

const generateReport = (type) => {
  toast.add({
    severity: 'info',
    summary: 'Generating Report',
    detail: `${type} report generation started`,
    life: 3000
  })
}

const downloadReport = (reportId) => {
  toast.add({
    severity: 'info',
    summary: 'Download',
    detail: 'Report download started',
    life: 3000
  })
}

const viewReport = (reportId) => {
  toast.add({
    severity: 'info',
    summary: 'View Report',
    detail: 'Report viewer will be implemented',
    life: 3000
  })
}

const openMaps = () => {
  const address = encodeURIComponent(activation.value.address)
  window.open(`https://maps.google.com?q=${address}`, '_blank')
}

const getDirections = () => {
  const address = encodeURIComponent(activation.value.address)
  window.open(`https://maps.google.com/dir/?api=1&destination=${address}`, '_blank')
}

onMounted(() => {
  loadActivationData()
})
</script>

<style scoped>
.activation-details-page {
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

.activation-info-section {
  flex: 1;
}

.activation-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.activation-title {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.activation-name {
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.activation-code {
  font-family: monospace;
  font-size: 0.9rem;
  color: #6b7280;
  background: #f3f4f6;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
}

.activation-status-tag {
  align-self: flex-start;
}

.activation-meta {
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

.stat-icon.progress { background: linear-gradient(135deg, #3b82f6, #1d4ed8); }
.stat-icon.team { background: linear-gradient(135deg, #8b5cf6, #7c3aed); }
.stat-icon.engagement { background: linear-gradient(135deg, #ec4899, #be185d); }
.stat-icon.sales { background: linear-gradient(135deg, #10b981, #059669); }

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

.progress-mini {
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

.schedule-info {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.schedule-timeline {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.timeline-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.timeline-marker {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.timeline-marker.start {
  background: #10b981;
}

.timeline-marker.end {
  background: #ef4444;
}

.timeline-content h4 {
  margin: 0;
  color: #111827;
  font-size: 1rem;
}

.timeline-content p {
  margin: 0;
  color: #6b7280;
  font-size: 0.875rem;
}

.location-details {
  background: #f9fafb;
  padding: 1rem;
  border-radius: 0.5rem;
}

.location-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.location-header i {
  color: #ef4444;
}

.location-header h4 {
  margin: 0;
  color: #111827;
}

.venue-name {
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.25rem 0;
}

.venue-address {
  color: #6b7280;
  margin: 0 0 1rem 0;
  font-size: 0.875rem;
}

.location-actions {
  display: flex;
  gap: 0.5rem;
}

.budget-overview {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.budget-summary {
  display: flex;
  justify-content: space-between;
  background: #f9fafb;
  padding: 1rem;
  border-radius: 0.5rem;
}

.budget-total,
.budget-spent,
.budget-remaining {
  display: flex;
  flex-direction: column;
  text-align: center;
  gap: 0.25rem;
}

.budget-label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.budget-amount {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
}

.budget-progress {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
  color: #6b7280;
}

.budget-breakdown h5 {
  color: #111827;
  margin: 0 0 1rem 0;
}

.breakdown-items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.breakdown-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.item-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-label {
  color: #6b7280;
  font-size: 0.875rem;
}

.item-amount {
  color: #111827;
  font-weight: 600;
}

.item-progress {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.mini-progress {
  flex: 1;
  height: 0.25rem;
}

.spent-amount {
  font-size: 0.75rem;
  color: #6b7280;
}

.team-content {
  max-width: 1200px;
}

.team-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.team-header h3 {
  margin: 0;
  color: #111827;
}

.team-actions {
  display: flex;
  gap: 0.75rem;
}

.team-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 0.5rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.stat-item i {
  color: #3b82f6;
  font-size: 1.25rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  line-height: 1;
}

.stat-label {
  font-size: 0.75rem;
  color: #6b7280;
}

.team-members-card {
  margin-top: 1rem;
}

.member-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.member-info {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.member-name {
  font-weight: 600;
  color: #111827;
}

.member-role {
  font-size: 0.875rem;
  color: #6b7280;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.member-email,
.member-phone {
  font-size: 0.875rem;
  color: #6b7280;
}

.hours-worked {
  font-weight: 600;
  color: #111827;
}

.performance-cell {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.rating {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #f59e0b;
}

.performance-note {
  font-size: 0.8rem;
  color: #6b7280;
}

.last-activity {
  font-size: 0.875rem;
  color: #6b7280;
}

.member-actions {
  display: flex;
  gap: 0.25rem;
}

.performance-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
}

.kpi-card h3 {
  color: #111827;
  margin: 0;
}

.kpi-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.kpi-item {
  padding: 1rem;
  background: #f9fafb;
  border-radius: 0.5rem;
}

.kpi-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.kpi-name {
  font-weight: 600;
  color: #111827;
}

.kpi-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
}

.kpi-progress {
  margin-bottom: 0.5rem;
}

.kpi-target {
  font-size: 0.8rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.kpi-status {
  display: flex;
  justify-content: flex-end;
}

.chart-card h3 {
  color: #111827;
  margin: 0;
}

.chart-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 250px;
  background: #f9fafb;
  border: 2px dashed #d1d5db;
  border-radius: 0.5rem;
  color: #6b7280;
  text-align: center;
}

.chart-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feedback-card h3 {
  color: #111827;
  margin: 0;
}

.feedback-summary {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.feedback-stats {
  display: flex;
  justify-content: space-around;
  background: #f9fafb;
  padding: 1rem;
  border-radius: 0.5rem;
}

.feedback-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.feedback-breakdown h5 {
  color: #111827;
  margin: 0 0 1rem 0;
}

.rating-bars {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.rating-bar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.rating-label {
  font-size: 0.875rem;
  color: #6b7280;
  min-width: 60px;
}

.bar-container {
  flex: 1;
  height: 1rem;
  background: #e5e7eb;
  border-radius: 0.25rem;
  overflow: hidden;
}

.bar {
  height: 100%;
  background: #3b82f6;
  transition: width 0.3s ease;
}

.rating-count {
  font-size: 0.875rem;
  color: #111827;
  font-weight: 600;
  min-width: 30px;
  text-align: right;
}

.reports-content {
  max-width: 1200px;
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

.reports-actions {
  display: flex;
  gap: 0.75rem;
}

.reports-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.report-template h4 {
  color: #111827;
  margin: 0;
}

.report-template p {
  color: #6b7280;
  margin: 0 0 1rem 0;
  line-height: 1.5;
}

.template-info {
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

.recent-reports h4 {
  color: #111827;
  margin: 0;
}

.report-actions {
  display: flex;
  gap: 0.25rem;
}

/* Progress bar variants */
:deep(.progress-excellent .p-progressbar-value) {
  background: #10b981;
}

:deep(.progress-good .p-progressbar-value) {
  background: #3b82f6;
}

:deep(.progress-warning .p-progressbar-value) {
  background: #f59e0b;
}

:deep(.progress-danger .p-progressbar-value) {
  background: #ef4444;
}

:deep(.over-budget .p-progressbar-value) {
  background: #ef4444;
}

@media (max-width: 768px) {
  .activation-details-page {
    padding: 1rem;
  }

  .header-main {
    flex-direction: column;
    align-items: stretch;
  }

  .activation-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .activation-meta {
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

  .budget-summary {
    flex-direction: column;
    gap: 1rem;
  }

  .team-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .feedback-stats {
    flex-direction: column;
    gap: 1rem;
  }

  .reports-grid {
    grid-template-columns: 1fr;
  }

  .reports-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .reports-actions {
    justify-content: center;
    flex-wrap: wrap;
  }
}
</style>