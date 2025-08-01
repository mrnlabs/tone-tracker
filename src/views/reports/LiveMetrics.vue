<template>
  <DashboardLayout>
    <div class="live-metrics">
      <!-- Page Header -->
      <div class="page-header">
        <div class="header-content">
          <h1 class="page-title">Live Metrics Dashboard</h1>
          <p class="page-description">Real-time activation performance monitoring</p>
        </div>
        <div class="header-actions">
          <div class="last-updated">
            <i class="pi pi-clock"></i>
            <span>Updated {{ lastUpdated }}</span>
          </div>
          <BaseButton
            variant="secondary"
            icon="pi pi-refresh"
            :loading="loading"
            @click="refreshMetrics"
          >
            Refresh
          </BaseButton>
        </div>
      </div>

      <!-- Alert Banner -->
      <div v-if="criticalAlerts.length > 0" class="alert-banner">
        <Card class="alert-card critical">
          <template #content>
            <div class="alert-content">
              <div class="alert-icon">
                <i class="pi pi-exclamation-triangle"></i>
              </div>
              <div class="alert-details">
                <h3>{{ criticalAlerts.length }} Critical Alert{{ criticalAlerts.length > 1 ? 's' : '' }}</h3>
                <p>{{ criticalAlerts[0].message }}</p>
                <small v-if="criticalAlerts.length > 1">
                  +{{ criticalAlerts.length - 1 }} more alert{{ criticalAlerts.length > 2 ? 's' : '' }}
                </small>
              </div>
              <div class="alert-actions">
                <BaseButton
                  variant="danger"
                  size="small"
                  @click="showAlertsDialog = true"
                >
                  View All
                </BaseButton>
              </div>
            </div>
          </template>
        </Card>
      </div>

      <!-- Key Metrics Grid -->
      <div class="metrics-grid" v-if="liveMetrics">
        <Card class="metric-card revenue">
          <template #content>
            <div class="metric-content">
              <div class="metric-header">
                <h3>Today's Revenue</h3>
                <div class="trend-indicator" :class="liveMetrics.revenueTrend.direction.toLowerCase()">
                  <i class="pi" :class="getTrendIcon(liveMetrics.revenueTrend.direction)"></i>
                  <span>{{ liveMetrics.revenueTrend.percentage }}%</span>
                </div>
              </div>
              <div class="metric-value">
                {{ formatRevenue(liveMetrics.totalRevenue) }}
              </div>
              <div class="metric-progress">
                <ProgressBar 
                  :value="getPerformancePercentage(liveMetrics.totalRevenue, liveMetrics.dailyRevenueTarget)" 
                  class="progress-bar"
                />
                <small>{{ formatRevenue(liveMetrics.dailyRevenueTarget) }} target</small>
              </div>
            </div>
          </template>
        </Card>

        <Card class="metric-card activations">
          <template #content>
            <div class="metric-content">
              <div class="metric-header">
                <h3>Active Activations</h3>
                <div class="status-indicator">
                  <span class="status-dot active"></span>
                  <span>{{ liveMetrics.activeActivations }} Live</span>
                </div>
              </div>
              <div class="metric-value">
                {{ liveMetrics.totalActivations }}
              </div>
              <div class="metric-details">
                <small>{{ liveMetrics.promotersOnDuty }} promoters on duty</small>
              </div>
            </div>
          </template>
        </Card>

        <Card class="metric-card leads">
          <template #content>
            <div class="metric-content">
              <div class="metric-header">
                <h3>Leads Captured</h3>
                <div class="trend-indicator" :class="liveMetrics.leadsTrend.direction.toLowerCase()">
                  <i class="pi" :class="getTrendIcon(liveMetrics.leadsTrend.direction)"></i>
                  <span>{{ liveMetrics.leadsTrend.percentage }}%</span>
                </div>
              </div>
              <div class="metric-value">
                {{ liveMetrics.totalLeads }}
              </div>
              <div class="metric-details">
                <small>{{ liveMetrics.optInRate.toFixed(1) }}% opt-in rate</small>
              </div>
            </div>
          </template>
        </Card>

        <Card class="metric-card performance">
          <template #content>
            <div class="metric-content">
              <div class="metric-header">
                <h3>Average Performance</h3>
                <Rating 
                  :modelValue="liveMetrics.averagePerformanceScore / 20" 
                  :readonly="true" 
                  :cancel="false"
                />
              </div>
              <div class="metric-value" :style="{ color: getPerformanceColor(liveMetrics.averagePerformanceScore) }">
                {{ liveMetrics.averagePerformanceScore.toFixed(1) }}
              </div>
              <div class="metric-details">
                <small>{{ getPerformanceGrade(liveMetrics.averagePerformanceScore) }} grade</small>
              </div>
            </div>
          </template>
        </Card>
      </div>

      <!-- Content Tabs -->
      <TabView>
        <!-- Real-time Overview Tab -->
        <TabPanel header="Real-time Overview">
          <div class="overview-content">
            <div class="content-grid">
              <!-- Live Chart -->
              <Card class="chart-card">
                <template #header>
                  <h3>Revenue Trend (Last 24 Hours)</h3>
                </template>
                <template #content>
                  <Chart 
                    type="line" 
                    :data="revenueChartData" 
                    :options="chartOptions"
                    class="revenue-chart"
                  />
                </template>
              </Card>

              <!-- Top Performing Activations -->
              <Card class="performance-card">
                <template #header>
                  <h3>Top Performing Activations</h3>
                </template>
                <template #content>
                  <div class="activation-list">
                    <div 
                      v-for="activation in topActivations" 
                      :key="activation.id"
                      class="activation-item"
                      @click="viewActivationDetails(activation.id)"
                    >
                      <div class="activation-info">
                        <h4>{{ activation.name }}</h4>
                        <p>{{ activation.location }}</p>
                      </div>
                      <div class="activation-stats">
                        <span class="revenue">{{ formatRevenue(activation.revenue) }}</span>
                        <span class="leads">{{ activation.leads }} leads</span>
                      </div>
                      <div class="activation-score" :style="{ color: getPerformanceColor(activation.score) }">
                        {{ activation.score.toFixed(1) }}
                      </div>
                    </div>
                  </div>
                </template>
              </Card>
            </div>

            <!-- Promoter Performance Grid -->
            <Card class="promoter-grid-card">
              <template #header>
                <h3>Promoter Performance Overview</h3>
              </template>
              <template #content>
                <div class="promoter-grid">
                  <div 
                    v-for="promoter in liveMetrics?.promoterPerformance || []" 
                    :key="promoter.id"
                    class="promoter-card"
                    :class="getPromoterStatusClass(promoter)"
                  >
                    <div class="promoter-header">
                      <div class="promoter-info">
                        <h4>{{ promoter.name }}</h4>
                        <p>{{ promoter.activationName }}</p>
                      </div>
                      <div class="promoter-status">
                        <span class="status-dot" :class="promoter.status.toLowerCase()"></span>
                        <span>{{ promoter.status }}</span>
                      </div>
                    </div>
                    <div class="promoter-metrics">
                      <div class="metric">
                        <label>Revenue</label>
                        <span>{{ formatRevenue(promoter.revenue) }}</span>
                      </div>
                      <div class="metric">
                        <label>Leads</label>
                        <span>{{ promoter.leads }}</span>
                      </div>
                      <div class="metric">
                        <label>Score</label>
                        <span :style="{ color: getPerformanceColor(promoter.score) }">
                          {{ promoter.score.toFixed(1) }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </template>
            </Card>
          </div>
        </TabPanel>

        <!-- Alerts & Notifications Tab -->
        <TabPanel header="Alerts & Notifications">
          <div class="alerts-content">
            <div class="alerts-header">
              <div class="alerts-summary">
                <div class="summary-item critical">
                  <span class="count">{{ alertSummary.critical }}</span>
                  <span class="label">Critical</span>
                </div>
                <div class="summary-item high">
                  <span class="count">{{ alertSummary.high }}</span>
                  <span class="label">High</span>
                </div>
                <div class="summary-item medium">
                  <span class="count">{{ alertSummary.medium }}</span>
                  <span class="label">Medium</span>
                </div>
                <div class="summary-item low">
                  <span class="count">{{ alertSummary.low }}</span>
                  <span class="label">Low</span>
                </div>
              </div>
              <div class="alerts-actions">
                <BaseButton
                  variant="outlined"
                  size="small"
                  @click="acknowledgeAllAlerts"
                  :disabled="unacknowledgedAlerts.length === 0"
                >
                  Acknowledge All
                </BaseButton>
              </div>
            </div>

            <div class="alerts-list">
              <div 
                v-for="alert in sortedAlerts" 
                :key="alert.id"
                class="alert-item"
                :class="[alert.severity.toLowerCase(), { acknowledged: alert.isAcknowledged }]"
              >
                <div class="alert-icon">
                  <i class="pi" :class="alert.displayIcon"></i>
                </div>
                <div class="alert-content">
                  <div class="alert-header">
                    <h4>{{ alert.title }}</h4>
                    <span class="alert-time">{{ alert.timeAgo }}</span>
                  </div>
                  <p>{{ alert.message }}</p>
                  <div v-if="alert.activationName" class="alert-context">
                    <small>Activation: {{ alert.activationName }}</small>
                  </div>
                </div>
                <div class="alert-actions">
                  <BaseButton
                    v-if="!alert.isAcknowledged"
                    variant="outlined"
                    size="small"
                    @click="acknowledgeAlert(alert.id)"
                  >
                    Acknowledge
                  </BaseButton>
                  <span v-else class="acknowledged-label">
                    <i class="pi pi-check"></i>
                    Acknowledged
                  </span>
                </div>
              </div>
            </div>
          </div>
        </TabPanel>

        <!-- System Health Tab -->
        <TabPanel header="System Health">
          <div class="health-content">
            <div class="health-grid">
              <Card class="health-card">
                <template #header>
                  <h3>System Status</h3>
                </template>
                <template #content>
                  <div class="health-indicators">
                    <div class="health-item">
                      <div class="health-label">
                        <span class="status-dot" :class="liveMetrics?.systemHealth?.api || 'unknown'"></span>
                        <span>API Health</span>
                      </div>
                      <span class="health-status">{{ (liveMetrics?.systemHealth?.api || 'unknown').toUpperCase() }}</span>
                    </div>
                    <div class="health-item">
                      <div class="health-label">
                        <span class="status-dot" :class="liveMetrics?.systemHealth?.database || 'unknown'"></span>
                        <span>Database</span>
                      </div>
                      <span class="health-status">{{ (liveMetrics?.systemHealth?.database || 'unknown').toUpperCase() }}</span>
                    </div>
                    <div class="health-item">
                      <div class="health-label">
                        <span class="status-dot" :class="liveMetrics?.systemHealth?.monitoring || 'unknown'"></span>
                        <span>Monitoring</span>
                      </div>
                      <span class="health-status">{{ (liveMetrics?.systemHealth?.monitoring || 'unknown').toUpperCase() }}</span>
                    </div>
                  </div>
                </template>
              </Card>

              <Card class="metrics-card">
                <template #header>
                  <h3>Performance Metrics</h3>
                </template>
                <template #content>
                  <div class="performance-metrics">
                    <div class="metric-item">
                      <label>Response Time</label>
                      <span>{{ liveMetrics?.systemHealth?.responseTime || 0 }}ms</span>
                    </div>
                    <div class="metric-item">
                      <label>Active Connections</label>
                      <span>{{ liveMetrics?.systemHealth?.activeConnections || 0 }}</span>
                    </div>
                    <div class="metric-item">
                      <label>Memory Usage</label>
                      <span>{{ liveMetrics?.systemHealth?.memoryUsage || 0 }}%</span>
                    </div>
                    <div class="metric-item">
                      <label>CPU Usage</label>
                      <span>{{ liveMetrics?.systemHealth?.cpuUsage || 0 }}%</span>
                    </div>
                  </div>
                </template>
              </Card>
            </div>
          </div>
        </TabPanel>
      </TabView>

      <!-- Alerts Dialog -->
      <Dialog
        v-model:visible="showAlertsDialog"
        modal
        header="All Alerts"
        :style="{ width: '80vw', maxWidth: '800px' }"
      >
        <div class="dialog-alerts-list">
          <div 
            v-for="alert in sortedAlerts" 
            :key="alert.id"
            class="dialog-alert-item"
            :class="[alert.severity.toLowerCase(), { acknowledged: alert.isAcknowledged }]"
          >
            <div class="alert-icon">
              <i class="pi" :class="alert.displayIcon"></i>
            </div>
            <div class="alert-content">
              <h4>{{ alert.title }}</h4>
              <p>{{ alert.message }}</p>
              <small>{{ alert.timeAgo }}</small>
            </div>
            <div class="alert-actions">
              <BaseButton
                v-if="!alert.isAcknowledged"
                variant="outlined"
                size="small"
                @click="acknowledgeAlert(alert.id)"
              >
                Acknowledge
              </BaseButton>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToaster } from '@/composables/useToaster'
import { liveMetricsService } from '@/services'
import { BaseButton } from '@/components'
import DashboardLayout from '@/components/general/DashboardLayout.vue'
import Card from 'primevue/card'
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'
import ProgressBar from 'primevue/progressbar'
import Rating from 'primevue/rating'
import Chart from 'primevue/chart'
import Dialog from 'primevue/dialog'

// Reactive data
const loading = ref(false)
const liveMetrics = ref(null)
const alerts = ref([])
const showAlertsDialog = ref(false)
const lastUpdated = ref('')
let pollingControl = null

const router = useRouter()
const toaster = useToaster()

// Computed properties
const criticalAlerts = computed(() => {
  if (!alerts.value || !Array.isArray(alerts.value)) return []
  return alerts.value.filter(alert => alert.severity === 'CRITICAL' && !alert.isAcknowledged)
})

const unacknowledgedAlerts = computed(() => {
  if (!alerts.value || !Array.isArray(alerts.value)) return []
  return alerts.value.filter(alert => !alert.isAcknowledged)
})

const sortedAlerts = computed(() => {
  if (!alerts.value || !Array.isArray(alerts.value)) return []
  return liveMetricsService.sortAlerts(alerts.value)
})

const alertSummary = computed(() => {
  const summary = { critical: 0, high: 0, medium: 0, low: 0 }
  if (alerts.value && Array.isArray(alerts.value)) {
    alerts.value.forEach(alert => {
      if (!alert.isAcknowledged && alert.severity) {
        const severityKey = alert.severity.toLowerCase()
        if (severityKey in summary) {
          summary[severityKey]++
        }
      }
    })
  }
  return summary
})

const topActivations = computed(() => {
  if (!liveMetrics.value?.topPerformingActivations) return []
  return liveMetrics.value.topPerformingActivations.slice(0, 5)
})

const revenueChartData = computed(() => {
  if (!liveMetrics.value?.revenueHistory) return null
  
  const history = liveMetrics.value.revenueHistory
  return {
    labels: history.map(item => new Date(item.timestamp).toLocaleTimeString()),
    datasets: [{
      label: 'Revenue',
      data: history.map(item => item.amount),
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4,
      fill: true
    }]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: true,
      title: { display: true, text: 'Revenue ($)' }
    }
  },
  plugins: {
    legend: { display: false }
  }
}

// Methods
const loadLiveMetrics = async () => {
  try {
    liveMetrics.value = await liveMetricsService.getLiveMetrics()
    updateLastUpdated()
  } catch (error) {
    console.error('Error loading live metrics:', error)
    toaster.error('Failed to load live metrics')
  }
}

const loadAlerts = async () => {
  try {
    const result = await liveMetricsService.getAlerts()
    alerts.value = result || []
  } catch (error) {
    console.error('Error loading alerts:', error)
    alerts.value = []
  }
}

const refreshMetrics = async () => {
  loading.value = true
  try {
    await Promise.all([loadLiveMetrics(), loadAlerts()])
  } finally {
    loading.value = false
  }
}

const acknowledgeAlert = async (alertId) => {
  try {
    await liveMetricsService.acknowledgeAlert(alertId)
    
    // Update local alert status
    if (alerts.value) {
      const alert = alerts.value.find(a => a.id === alertId)
      if (alert) {
        alert.isAcknowledged = true
      }
    }
    
    toaster.success('Alert acknowledged')
  } catch (error) {
    toaster.error('Failed to acknowledge alert')
    console.error('Error acknowledging alert:', error)
  }
}

const acknowledgeAllAlerts = async () => {
  try {
    const promises = unacknowledgedAlerts.value.map(alert => 
      liveMetricsService.acknowledgeAlert(alert.id)
    )
    await Promise.all(promises)
    
    // Update all alerts as acknowledged
    if (alerts.value) {
      alerts.value.forEach(alert => {
        alert.isAcknowledged = true
      })
    }
    
    toaster.success('All alerts acknowledged')
  } catch (error) {
    toaster.error('Failed to acknowledge alerts')
    console.error('Error acknowledging all alerts:', error)
  }
}

const viewActivationDetails = (activationId) => {
  router.push(`/activations/${activationId}`)
}

const updateLastUpdated = () => {
  lastUpdated.value = new Date().toLocaleTimeString()
}

const getTrendIcon = (direction) => {
  const config = liveMetricsService.getTrendConfig(direction)
  return config.icon
}

const formatRevenue = (amount) => {
  return liveMetricsService.formatRevenue(amount)
}

const getPerformancePercentage = (current, target) => {
  if (!target || target === 0) return 0
  return Math.min((current / target) * 100, 100)
}

const getPerformanceColor = (score) => {
  if (score >= 90) return '#10b981'
  if (score >= 80) return '#3b82f6'
  if (score >= 70) return '#f59e0b'
  if (score >= 60) return '#f97316'
  return '#ef4444'
}

const getPerformanceGrade = (score) => {
  if (score >= 90) return 'A'
  if (score >= 80) return 'B'
  if (score >= 70) return 'C'
  if (score >= 60) return 'D'
  return 'F'
}

const getPromoterStatusClass = (promoter) => {
  return promoter.status.toLowerCase().replace(/\s+/g, '-')
}

// Lifecycle
onMounted(async () => {
  await refreshMetrics()
  
  // Start polling for live updates
  pollingControl = liveMetricsService.startPolling(async (metrics) => {
    liveMetrics.value = metrics
    updateLastUpdated()
    // Also refresh alerts
    await loadAlerts()
  }, 30000) // Update every 30 seconds
})

onUnmounted(() => {
  if (pollingControl) {
    pollingControl.stop()
  }
})
</script>

<style lang="scss" scoped>
.live-metrics {
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
      gap: 1rem;
      align-items: center;
      
      .last-updated {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: #6b7280;
        font-size: 0.875rem;
        
        .pi {
          font-size: 0.75rem;
        }
      }
    }
  }
  
  .alert-banner {
    margin-bottom: 1.5rem;
    
    .alert-card {
      border-left: 4px solid #ef4444;
      
      .alert-content {
        display: flex;
        align-items: center;
        gap: 1rem;
        
        .alert-icon {
          width: 2.5rem;
          height: 2.5rem;
          background: #fef2f2;
          border-radius: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ef4444;
          font-size: 1.25rem;
        }
        
        .alert-details {
          flex: 1;
          
          h3 {
            margin: 0 0 0.25rem 0;
            color: #111827;
            font-size: 1rem;
          }
          
          p {
            margin: 0 0 0.25rem 0;
            color: #6b7280;
          }
          
          small {
            color: #9ca3af;
          }
        }
      }
    }
  }
  
  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
    margin-bottom: 1.5rem;
    
    .metric-card {
      .metric-content {
        .metric-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          
          h3 {
            font-size: 0.875rem;
            font-weight: 500;
            color: #6b7280;
            margin: 0;
          }
          
          .trend-indicator {
            display: flex;
            align-items: center;
            gap: 0.25rem;
            font-size: 0.75rem;
            font-weight: 500;
            
            &.up {
              color: #10b981;
            }
            
            &.down {
              color: #ef4444;
            }
            
            &.stable {
              color: #6b7280;
            }
          }
          
          .status-indicator {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.75rem;
            color: #6b7280;
          }
        }
        
        .metric-value {
          font-size: 1.75rem;
          font-weight: 700;
          color: #111827;
          margin-bottom: 0.75rem;
        }
        
        .metric-progress {
          .progress-bar {
            margin-bottom: 0.5rem;
          }
          
          small {
            color: #6b7280;
            font-size: 0.75rem;
          }
        }
        
        .metric-details {
          small {
            color: #6b7280;
          }
        }
      }
    }
  }
  
  .overview-content {
    .content-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 1.5rem;
      margin-bottom: 1.5rem;
      
      .chart-card {
        .revenue-chart {
          height: 300px;
        }
      }
      
      .performance-card {
        .activation-list {
          .activation-item {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 0.75rem;
            border-radius: 0.5rem;
            margin-bottom: 0.5rem;
            cursor: pointer;
            transition: background-color 0.2s;
            
            &:hover {
              background: #f9fafb;
            }
            
            .activation-info {
              flex: 1;
              
              h4 {
                margin: 0 0 0.25rem 0;
                font-size: 0.875rem;
                color: #111827;
              }
              
              p {
                margin: 0;
                font-size: 0.75rem;
                color: #6b7280;
              }
            }
            
            .activation-stats {
              display: flex;
              flex-direction: column;
              align-items: flex-end;
              gap: 0.25rem;
              
              .revenue {
                font-weight: 600;
                color: #111827;
                font-size: 0.875rem;
              }
              
              .leads {
                font-size: 0.75rem;
                color: #6b7280;
              }
            }
            
            .activation-score {
              font-weight: 700;
              font-size: 1rem;
            }
          }
        }
      }
    }
    
    .promoter-grid-card {
      .promoter-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 1rem;
        
        .promoter-card {
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          padding: 1rem;
          
          &.active {
            border-color: #10b981;
          }
          
          &.break,
          &.offline {
            opacity: 0.7;
          }
          
          .promoter-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 1rem;
            
            .promoter-info {
              h4 {
                margin: 0 0 0.25rem 0;
                color: #111827;
                font-size: 0.875rem;
              }
              
              p {
                margin: 0;
                font-size: 0.75rem;
                color: #6b7280;
              }
            }
            
            .promoter-status {
              display: flex;
              align-items: center;
              gap: 0.5rem;
              font-size: 0.75rem;
              color: #6b7280;
            }
          }
          
          .promoter-metrics {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 0.75rem;
            
            .metric {
              text-align: center;
              
              label {
                display: block;
                font-size: 0.75rem;
                color: #6b7280;
                margin-bottom: 0.25rem;
              }
              
              span {
                font-weight: 600;
                font-size: 0.875rem;
                color: #111827;
              }
            }
          }
        }
      }
    }
  }
  
  .alerts-content {
    .alerts-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      
      .alerts-summary {
        display: flex;
        gap: 1.5rem;
        
        .summary-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
          
          .count {
            font-size: 1.5rem;
            font-weight: 700;
          }
          
          .label {
            font-size: 0.75rem;
            text-transform: uppercase;
            font-weight: 500;
          }
          
          &.critical {
            color: #ef4444;
          }
          
          &.high {
            color: #f97316;
          }
          
          &.medium {
            color: #f59e0b;
          }
          
          &.low {
            color: #3b82f6;
          }
        }
      }
    }
    
    .alerts-list {
      .alert-item {
        display: flex;
        align-items: flex-start;
        gap: 1rem;
        padding: 1rem;
        border: 1px solid #e5e7eb;
        border-radius: 0.5rem;
        margin-bottom: 0.75rem;
        
        &.acknowledged {
          opacity: 0.6;
          background: #f9fafb;
        }
        
        .alert-icon {
          width: 2rem;
          height: 2rem;
          border-radius: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          
          &.critical {
            background: #ef4444;
          }
          
          &.high {
            background: #f97316;
          }
          
          &.medium {
            background: #f59e0b;
          }
          
          &.low {
            background: #3b82f6;
          }
        }
        
        .alert-content {
          flex: 1;
          
          .alert-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.5rem;
            
            h4 {
              margin: 0;
              font-size: 0.875rem;
              color: #111827;
            }
            
            .alert-time {
              font-size: 0.75rem;
              color: #6b7280;
            }
          }
          
          p {
            margin: 0 0 0.5rem 0;
            color: #6b7280;
            font-size: 0.875rem;
          }
          
          .alert-context {
            small {
              color: #9ca3af;
            }
          }
        }
        
        .alert-actions {
          .acknowledged-label {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: #10b981;
            font-size: 0.75rem;
          }
        }
      }
    }
  }
  
  .health-content {
    .health-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
      
      .health-card,
      .metrics-card {
        .health-indicators,
        .performance-metrics {
          .health-item,
          .metric-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.75rem 0;
            border-bottom: 1px solid #f3f4f6;
            
            &:last-child {
              border-bottom: none;
            }
            
            .health-label {
              display: flex;
              align-items: center;
              gap: 0.5rem;
            }
            
            .health-status {
              font-weight: 500;
              font-size: 0.875rem;
            }
            
            label {
              color: #6b7280;
              font-size: 0.875rem;
            }
            
            span {
              font-weight: 600;
              color: #111827;
            }
          }
        }
      }
    }
  }
  
  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    display: inline-block;
    
    &.active,
    &.healthy {
      background: #10b981;
    }
    
    &.warning {
      background: #f59e0b;
    }
    
    &.error,
    &.critical {
      background: #ef4444;
    }
    
    &.offline,
    &.unknown {
      background: #6b7280;
    }
  }
}

.dialog-alerts-list {
  max-height: 400px;
  overflow-y: auto;
  
  .dialog-alert-item {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1rem;
    border-bottom: 1px solid #f3f4f6;
    
    &:last-child {
      border-bottom: none;
    }
    
    &.acknowledged {
      opacity: 0.6;
    }
    
    .alert-icon {
      width: 1.5rem;
      height: 1.5rem;
      border-radius: 0.25rem;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 0.75rem;
      
      &.critical {
        background: #ef4444;
      }
      
      &.high {
        background: #f97316;
      }
      
      &.medium {
        background: #f59e0b;
      }
      
      &.low {
        background: #3b82f6;
      }
    }
    
    .alert-content {
      flex: 1;
      
      h4 {
        margin: 0 0 0.25rem 0;
        font-size: 0.875rem;
        color: #111827;
      }
      
      p {
        margin: 0 0 0.25rem 0;
        color: #6b7280;
        font-size: 0.75rem;
      }
      
      small {
        color: #9ca3af;
        font-size: 0.75rem;
      }
    }
  }
}

@media (max-width: 768px) {
  .live-metrics {
    padding: 1rem;
    
    .page-header {
      flex-direction: column;
      gap: 1rem;
    }
    
    .metrics-grid {
      grid-template-columns: 1fr;
    }
    
    .content-grid {
      grid-template-columns: 1fr !important;
    }
    
    .promoter-grid {
      grid-template-columns: 1fr !important;
    }
    
    .alerts-header {
      flex-direction: column;
      gap: 1rem;
      align-items: flex-start;
    }
    
    .alerts-summary {
      justify-content: space-around;
      width: 100%;
    }
  }
}
</style>