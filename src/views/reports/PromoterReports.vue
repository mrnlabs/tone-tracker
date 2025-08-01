<template>
  <DashboardLayout>
    <div class="promoter-reports">
      <!-- Page Header -->
      <div class="page-header">
        <div class="header-content">
          <h1 class="page-title">My Performance Reports</h1>
          <p class="page-description">Track your daily and weekly performance metrics</p>
        </div>
        <div class="header-actions">
          <Calendar
            v-model="selectedDate"
            dateFormat="dd/mm/yy"
            showIcon
            @date-select="loadDailyReport"
            placeholder="Select date"
          />
          <BaseButton
            variant="secondary"
            icon="pi pi-refresh"
            :loading="loading"
            @click="refreshReports"
          >
            Refresh
          </BaseButton>
        </div>
      </div>

      <!-- Quick Stats Cards -->
      <div class="stats-grid" v-if="todayReport">
        <Card class="stat-card">
          <template #content>
            <div class="stat-content">
              <div class="stat-icon revenue">
                <i class="pi pi-dollar"></i>
              </div>
              <div class="stat-details">
                <h3>Today's Revenue</h3>
                <p class="stat-value">${{ formatNumber(todayReport.revenueGenerated) }}</p>
                <small class="stat-meta">{{ todayReport.transactionCount }} transactions</small>
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
              <div class="stat-details">
                <h3>Units Sold</h3>
                <p class="stat-value">{{ formatNumber(todayReport.unitsSold) }}</p>
                <small class="stat-meta">${{ formatNumber(todayReport.averageTransactionValue) }} avg</small>
              </div>
            </div>
          </template>
        </Card>

        <Card class="stat-card">
          <template #content>
            <div class="stat-content">
              <div class="stat-icon leads">
                <i class="pi pi-users"></i>
              </div>
              <div class="stat-details">
                <h3>Leads Captured</h3>
                <p class="stat-value">{{ todayReport.leadsCaputed }}</p>
                <small class="stat-meta">{{ todayReport.optInRate.toFixed(1) }}% opt-in rate</small>
              </div>
            </div>
          </template>
        </Card>

        <Card class="stat-card">
          <template #content>
            <div class="stat-content">
              <div class="stat-icon performance">
                <i class="pi pi-star"></i>
              </div>
              <div class="stat-details">
                <h3>Performance Score</h3>
                <p class="stat-value" :style="{ color: performanceColor }">
                  {{ todayReport.performanceScore.toFixed(1) }}
                </p>
                <small class="stat-meta">Grade {{ todayReport.performanceGrade }}</small>
              </div>
            </div>
          </template>
        </Card>
      </div>

      <!-- Reports Tabs -->
      <TabView>
        <!-- Daily Report Tab -->
        <TabPanel header="Daily Reports">
          <div class="daily-reports-content">
            <div v-if="loading" class="loading-container">
              <ProgressSpinner />
              <p>Loading daily report...</p>
            </div>

            <div v-else-if="dailyReport" class="daily-report">
              <!-- Performance Overview -->
              <Card class="performance-overview">
                <template #header>
                  <h3>Performance Overview - {{ formatDate(selectedDate) }}</h3>
                </template>
                <template #content>
                  <div class="performance-grid">
                    <div class="performance-metric">
                      <label>Sales Performance</label>
                      <div class="metric-value">
                        <span class="value">${{ formatNumber(dailyReport.revenueGenerated) }}</span>
                        <span class="units">{{ dailyReport.unitsSold }} units</span>
                      </div>
                    </div>
                    
                    <div class="performance-metric">
                      <label>Customer Engagement</label>
                      <div class="metric-value">
                        <span class="value">{{ dailyReport.totalInteractions }}</span>
                        <span class="units">interactions</span>
                      </div>
                      <div class="engagement-rating">
                        <Rating 
                          :modelValue="dailyReport.averageEngagementQuality" 
                          :readonly="true" 
                          :cancel="false"
                        />
                      </div>
                    </div>
                    
                    <div class="performance-metric">
                      <label>Lead Generation</label>
                      <div class="metric-value">
                        <span class="value">{{ dailyReport.leadsCaputed }}</span>
                        <span class="units">leads captured</span>
                      </div>
                      <div class="opt-in-breakdown">
                        <small>{{ dailyReport.leadsWithOptIn }} marketing, {{ dailyReport.whatsappOptIns }} WhatsApp</small>
                      </div>
                    </div>
                    
                    <div class="performance-metric">
                      <label>Time & Productivity</label>
                      <div class="metric-value">
                        <span class="value">{{ (dailyReport.workingMinutes / 60).toFixed(1) }}h</span>
                        <span class="units">worked</span>
                      </div>
                      <div class="time-breakdown">
                        <small>{{ dailyReport.checkInTime }} - {{ dailyReport.checkOutTime }}</small>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Performance Score -->
                  <div class="performance-score-section">
                    <div class="score-display">
                      <div class="score-circle" :style="{ '--score-color': performanceColor }">
                        <span class="score-value">{{ dailyReport.performanceScore.toFixed(0) }}</span>
                        <span class="score-label">Grade {{ dailyReport.performanceGrade }}</span>
                      </div>
                    </div>
                    <div class="score-breakdown">
                      <h4>Performance Breakdown</h4>
                      <div class="breakdown-item">
                        <span>Sales Achievement</span>
                        <ProgressBar :value="calculateSalesScore(dailyReport)" />
                      </div>
                      <div class="breakdown-item">
                        <span>Lead Quality</span>
                        <ProgressBar :value="dailyReport.optInRate" />
                      </div>
                      <div class="breakdown-item">
                        <span>Customer Engagement</span>
                        <ProgressBar :value="(dailyReport.averageEngagementQuality / 5) * 100" />
                      </div>
                    </div>
                  </div>
                </template>
              </Card>
            </div>
          </div>
        </TabPanel>

        <!-- Weekly Report Tab -->
        <TabPanel header="Weekly Reports">
          <div class="weekly-reports-content">
            <div v-if="loadingWeekly" class="loading-container">
              <ProgressSpinner />
              <p>Loading weekly report...</p>
            </div>

            <div v-else-if="weeklyReport" class="weekly-report">
              <!-- Weekly Summary -->
              <Card class="weekly-summary">
                <template #header>
                  <h3>Week of {{ formatDate(weeklyReport.weekStartDate) }}</h3>
                </template>
                <template #content>
                  <div class="weekly-stats">
                    <div class="weekly-stat">
                      <h4>Total Revenue</h4>
                      <p class="stat-value">${{ formatNumber(weeklyReport.totalRevenue) }}</p>
                      <div class="growth-indicator" v-if="weeklyReport.revenueGrowth">
                        <i class="pi" :class="weeklyReport.revenueGrowth >= 0 ? 'pi-arrow-up' : 'pi-arrow-down'"></i>
                        <span>{{ Math.abs(weeklyReport.revenueGrowth).toFixed(1) }}%</span>
                      </div>
                    </div>
                    
                    <div class="weekly-stat">
                      <h4>Units Sold</h4>
                      <p class="stat-value">{{ formatNumber(weeklyReport.totalUnitsSold) }}</p>
                    </div>
                    
                    <div class="weekly-stat">
                      <h4>Leads Captured</h4>
                      <p class="stat-value">{{ weeklyReport.totalLeadsCaptured }}</p>
                      <small>{{ weeklyReport.leadConversionRate.toFixed(1) }}% conversion</small>
                    </div>
                    
                    <div class="weekly-stat">
                      <h4>Working Hours</h4>
                      <p class="stat-value">{{ weeklyReport.totalWorkingHours.toFixed(1) }}h</p>
                    </div>
                  </div>

                  <!-- Daily Trend Chart -->
                  <div class="daily-trend">
                    <h4>Daily Performance Trend</h4>
                    <Chart 
                      type="line" 
                      :data="weeklyChartData" 
                      :options="chartOptions"
                      class="trend-chart"
                    />
                  </div>
                </template>
              </Card>
            </div>
          </div>
        </TabPanel>

        <!-- Export Tab -->
        <TabPanel header="Export Reports">
          <div class="export-content">
            <Card>
              <template #header>
                <h3>Export Performance Reports</h3>
              </template>
              <template #content>
                <div class="export-options">
                  <div class="export-form">
                    <div class="form-row">
                      <div class="form-field">
                        <label>Report Type</label>
                        <Dropdown
                          v-model="exportOptions.type"
                          :options="reportTypeOptions"
                          optionLabel="label"
                          optionValue="value"
                          placeholder="Select report type"
                        />
                      </div>
                      
                      <div class="form-field">
                        <label>Date Range</label>
                        <Calendar
                          v-model="exportOptions.dateRange"
                          selectionMode="range"
                          dateFormat="dd/mm/yy"
                          placeholder="Select date range"
                          showIcon
                        />
                      </div>
                      
                      <div class="form-field">
                        <label>Format</label>
                        <div class="format-options">
                          <RadioButton
                            v-model="exportOptions.format"
                            inputId="format-pdf"
                            value="PDF"
                          />
                          <label for="format-pdf">PDF</label>
                          
                          <RadioButton
                            v-model="exportOptions.format"
                            inputId="format-excel"
                            value="Excel"
                          />
                          <label for="format-excel">Excel</label>
                        </div>
                      </div>
                    </div>
                    
                    <div class="export-actions">
                      <BaseButton
                        variant="primary"
                        icon="pi pi-download"
                        :loading="exporting"
                        @click="exportReport"
                        :disabled="!canExport"
                      >
                        Export Report
                      </BaseButton>
                    </div>
                  </div>
                </div>
              </template>
            </Card>
          </div>
        </TabPanel>
      </TabView>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useToaster } from '@/composables/useToaster'
import { promoterReportsService } from '@/services'
import { BaseButton } from '@/components'
import DashboardLayout from '@/components/general/DashboardLayout.vue'
import Card from 'primevue/card'
import Calendar from 'primevue/calendar'
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'
import ProgressSpinner from 'primevue/progressspinner'
import Rating from 'primevue/rating'
import ProgressBar from 'primevue/progressbar'
import Chart from 'primevue/chart'
import Dropdown from 'primevue/dropdown'
import RadioButton from 'primevue/radiobutton'

// Reactive data
const loading = ref(false)
const loadingWeekly = ref(false)
const exporting = ref(false)
const selectedDate = ref(new Date())
const todayReport = ref(null)
const dailyReport = ref(null)
const weeklyReport = ref(null)

// Export options
const exportOptions = ref({
  type: 'daily',
  dateRange: null,
  format: 'PDF'
})

const toaster = useToaster()

// Computed properties
const performanceColor = computed(() => {
  if (!todayReport.value) return '#6b7280'
  const score = todayReport.value.performanceScore
  return promoterReportsService.formatPerformanceScore(score).color
})

const weeklyChartData = computed(() => {
  if (!weeklyReport.value?.dailyReports) return null
  
  return {
    labels: weeklyReport.value.dailyReports.map(report => 
      new Date(report.reportDate).toLocaleDateString('en-US', { weekday: 'short' })
    ),
    datasets: [
      {
        label: 'Revenue',
        data: weeklyReport.value.dailyReports.map(report => report.revenueGenerated),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true
      },
      {
        label: 'Leads',
        data: weeklyReport.value.dailyReports.map(report => report.leadsCaputed),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: false,
        yAxisID: 'y1'
      }
    ]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      type: 'linear',
      display: true,
      position: 'left',
      title: { display: true, text: 'Revenue ($)' }
    },
    y1: {
      type: 'linear',
      display: true,
      position: 'right',
      title: { display: true, text: 'Leads' },
      grid: { drawOnChartArea: false }
    }
  },
  plugins: {
    legend: { position: 'top' }
  }
}

const reportTypeOptions = [
  { label: 'Daily Report', value: 'daily' },
  { label: 'Weekly Report', value: 'weekly' },
  { label: 'Performance Summary', value: 'summary' }
]

const canExport = computed(() => {
  return exportOptions.value.type && exportOptions.value.format
})

// Methods
const loadDailyReport = async (date = selectedDate.value) => {
  loading.value = true
  try {
    const dateStr = date.toISOString().split('T')[0]
    dailyReport.value = await promoterReportsService.getDailyReport(dateStr)
  } catch (error) {
    toaster.error('Failed to load daily report')
    console.error('Error loading daily report:', error)
  } finally {
    loading.value = false
  }
}

const loadTodayReport = async () => {
  try {
    todayReport.value = await promoterReportsService.getTodayReport()
  } catch (error) {
    console.error('Error loading today report:', error)
  }
}

const loadWeeklyReport = async () => {
  loadingWeekly.value = true
  try {
    weeklyReport.value = await promoterReportsService.getCurrentWeekReport()
  } catch (error) {
    toaster.error('Failed to load weekly report')
    console.error('Error loading weekly report:', error)
  } finally {
    loadingWeekly.value = false
  }
}

const refreshReports = async () => {
  await Promise.all([
    loadTodayReport(),
    loadDailyReport(),
    loadWeeklyReport()
  ])
}

const exportReport = async () => {
  exporting.value = true
  try {
    const params = {
      type: exportOptions.value.type,
      format: exportOptions.value.format
    }
    
    if (exportOptions.value.dateRange && exportOptions.value.dateRange.length === 2) {
      params.startDate = exportOptions.value.dateRange[0].toISOString().split('T')[0]
      params.endDate = exportOptions.value.dateRange[1].toISOString().split('T')[0]
    }
    
    const blob = await promoterReportsService.exportReports(params)
    
    // Create download link
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `promoter-report-${new Date().toISOString().split('T')[0]}.${exportOptions.value.format.toLowerCase()}`
    link.click()
    window.URL.revokeObjectURL(url)
    
    toaster.success('Report exported successfully')
  } catch (error) {
    toaster.error('Failed to export report')
    console.error('Error exporting report:', error)
  } finally {
    exporting.value = false
  }
}

const calculateSalesScore = (report) => {
  // Simple calculation based on revenue vs target (assuming $1000 daily target)
  const target = 1000
  return Math.min((report.revenueGenerated / target) * 100, 100)
}

const formatNumber = (num) => {
  return new Intl.NumberFormat().format(num || 0)
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString()
}

// Watchers
watch(selectedDate, loadDailyReport)

// Lifecycle
onMounted(() => {
  refreshReports()
})
</script>

<style lang="scss" scoped>
.promoter-reports {
  padding: 1.5rem;
  
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1.5rem;
    
    .header-content {
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
    }
    
    .header-actions {
      display: flex;
      gap: 0.75rem;
      align-items: center;
    }
  }
  
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
    margin-bottom: 1.5rem;
    
    .stat-card {
      .stat-content {
        display: flex;
        align-items: center;
        gap: 1rem;
        
        .stat-icon {
          width: 3rem;
          height: 3rem;
          border-radius: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          color: white;
          
          &.revenue { background: linear-gradient(135deg, #10b981 0%, #059669 100%); }
          &.sales { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); }
          &.leads { background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); }
          &.performance { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); }
        }
        
        .stat-details {
          flex: 1;
          
          h3 {
            font-size: 0.875rem;
            font-weight: 500;
            color: #6b7280;
            margin: 0 0 0.25rem 0;
          }
          
          .stat-value {
            font-size: 1.5rem;
            font-weight: 700;
            color: #111827;
            margin: 0 0 0.25rem 0;
          }
          
          .stat-meta {
            font-size: 0.75rem;
            color: #9ca3af;
          }
        }
      }
    }
  }
  
  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem;
    color: #6b7280;
  }
  
  .performance-overview {
    .performance-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
      
      .performance-metric {
        label {
          display: block;
          font-weight: 500;
          color: #374151;
          margin-bottom: 0.5rem;
        }
        
        .metric-value {
          .value {
            font-size: 1.25rem;
            font-weight: 700;
            color: #111827;
            display: block;
          }
          
          .units {
            font-size: 0.875rem;
            color: #6b7280;
          }
        }
        
        .engagement-rating {
          margin-top: 0.5rem;
        }
        
        .opt-in-breakdown,
        .time-breakdown {
          margin-top: 0.25rem;
          
          small {
            color: #6b7280;
          }
        }
      }
    }
    
    .performance-score-section {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 2rem;
      align-items: center;
      padding-top: 1.5rem;
      border-top: 1px solid #e5e7eb;
      
      .score-display {
        .score-circle {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: conic-gradient(var(--score-color) 0deg, var(--score-color) calc(var(--score, 0) * 3.6deg), #e5e7eb calc(var(--score, 0) * 3.6deg));
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          
          &::before {
            content: '';
            position: absolute;
            width: 100px;
            height: 100px;
            background: white;
            border-radius: 50%;
          }
          
          .score-value {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--score-color);
            z-index: 1;
          }
          
          .score-label {
            font-size: 0.75rem;
            color: #6b7280;
            z-index: 1;
          }
        }
      }
      
      .score-breakdown {
        h4 {
          margin: 0 0 1rem 0;
          color: #374151;
        }
        
        .breakdown-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
          
          span {
            font-size: 0.875rem;
            color: #6b7280;
          }
          
          .p-progressbar {
            width: 200px;
          }
        }
      }
    }
  }
  
  .weekly-summary {
    .weekly-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
      
      .weekly-stat {
        text-align: center;
        
        h4 {
          font-size: 0.875rem;
          font-weight: 500;
          color: #6b7280;
          margin: 0 0 0.5rem 0;
        }
        
        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #111827;
          margin: 0 0 0.25rem 0;
        }
        
        .growth-indicator {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.25rem;
          font-size: 0.875rem;
          color: #10b981;
          
          .pi-arrow-down {
            color: #ef4444;
          }
        }
        
        small {
          color: #6b7280;
        }
      }
    }
    
    .daily-trend {
      h4 {
        margin: 0 0 1rem 0;
        color: #374151;
      }
      
      .trend-chart {
        height: 300px;
      }
    }
  }
  
  .export-content {
    .export-form {
      .form-row {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1rem;
        margin-bottom: 1.5rem;
        
        .form-field {
          label {
            display: block;
            font-weight: 500;
            color: #374151;
            margin-bottom: 0.5rem;
          }
          
          .format-options {
            display: flex;
            gap: 1rem;
            align-items: center;
            
            label {
              margin-bottom: 0;
              margin-left: 0.5rem;
              font-weight: normal;
            }
          }
        }
      }
      
      .export-actions {
        display: flex;
        justify-content: flex-end;
      }
    }
  }
}

@media (max-width: 768px) {
  .promoter-reports {
    padding: 1rem;
    
    .page-header {
      flex-direction: column;
      gap: 1rem;
    }
    
    .stats-grid {
      grid-template-columns: 1fr;
    }
    
    .performance-score-section {
      grid-template-columns: 1fr;
      text-align: center;
    }
  }
}
</style>