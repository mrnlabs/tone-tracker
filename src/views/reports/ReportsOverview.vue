<template>
  <DashboardLayout>
    <div class="reports-overview">
      <!-- Page Header -->
      <div class="page-header">
        <div class="header-content">
          <h1 class="page-title">Reports & Analytics</h1>
          <p class="page-description">Comprehensive performance insights and data analysis</p>
        </div>
        <div class="header-meta">
          <div class="role-indicator">
            <Tag :value="userRole" :severity="getRoleSeverity(userRole)" />
          </div>
        </div>
      </div>

      <!-- Quick Access Cards -->
      <div class="quick-access-section">
        <h2 class="section-title">Your Reports</h2>
        <div class="reports-grid">
          <!-- Live Metrics for Activation Managers -->
          <Card v-if="canViewLiveMetrics" class="report-card live-metrics" @click="goToLiveMetrics">
            <template #content>
              <div class="report-card-content">
                <div class="report-icon">
                  <i class="pi pi-chart-line"></i>
                </div>
                <div class="report-info">
                  <h3>Live Metrics Dashboard</h3>
                  <p>Real-time performance monitoring and system alerts</p>
                  <div class="report-features">
                    <span class="feature">• Real-time data</span>
                    <span class="feature">• System alerts</span>
                    <span class="feature">• Performance tracking</span>
                  </div>
                </div>
                <div class="report-action">
                  <i class="pi pi-arrow-right"></i>
                </div>
              </div>
            </template>
          </Card>

          <!-- Promoter Reports -->
          <Card v-if="canViewPromoterReports" class="report-card promoter-reports" @click="goToPromoterReports">
            <template #content>
              <div class="report-card-content">
                <div class="report-icon">
                  <i class="pi pi-users"></i>
                </div>
                <div class="report-info">
                  <h3>Performance Reports</h3>
                  <p>Daily and weekly performance tracking and insights</p>
                  <div class="report-features">
                    <span class="feature">• Daily summaries</span>
                    <span class="feature">• Weekly trends</span>
                    <span class="feature">• Export options</span>
                  </div>
                </div>
                <div class="report-action">
                  <i class="pi pi-arrow-right"></i>
                </div>
              </div>
            </template>
          </Card>

          <!-- ROI Analysis for Clients -->
          <Card v-if="canViewROIAnalysis" class="report-card roi-analysis" @click="goToROIAnalysis">
            <template #content>
              <div class="report-card-content">
                <div class="report-icon">
                  <i class="pi pi-chart-bar"></i>
                </div>
                <div class="report-info">
                  <h3>ROI Analysis</h3>
                  <p>Investment performance and return analysis</p>
                  <div class="report-features">
                    <span class="feature">• Cost breakdown</span>
                    <span class="feature">• Profit margins</span>
                    <span class="feature">• Benchmarking</span>
                  </div>
                </div>
                <div class="report-action">
                  <i class="pi pi-arrow-right"></i>
                </div>
              </div>
            </template>
          </Card>
        </div>
      </div>

      <!-- Recent Activity Section -->
      <div class="recent-activity-section" v-if="recentReports.length > 0">
        <h2 class="section-title">Recent Reports</h2>
        <Card class="recent-reports-card">
          <template #content>
            <div class="recent-reports-list">
              <div 
                v-for="report in recentReports" 
                :key="report.id"
                class="recent-report-item"
              >
                <div class="report-item-icon">
                  <i class="pi" :class="getReportIcon(report.type)"></i>
                </div>
                <div class="report-item-info">
                  <h4>{{ report.title }}</h4>
                  <p>{{ report.description }}</p>
                  <small>Generated {{ formatDate(report.createdAt) }}</small>
                </div>
                <div class="report-item-actions">
                  <Button
                    icon="pi pi-download"
                    class="p-button-text p-button-sm"
                    @click="downloadReport(report)"
                    v-tooltip="'Download report'"
                  />
                  <Button
                    icon="pi pi-eye"
                    class="p-button-text p-button-sm"
                    @click="viewReport(report)"
                    v-tooltip="'View report'"
                  />
                </div>
              </div>
            </div>
          </template>
        </Card>
      </div>

      <!-- Quick Actions Section -->
      <div class="quick-actions-section">
        <h2 class="section-title">Quick Actions</h2>
        <div class="actions-grid">
          <Card class="action-card">
            <template #content>
              <div class="action-content">
                <div class="action-icon schedule">
                  <i class="pi pi-calendar"></i>
                </div>
                <div class="action-info">
                  <h3>Schedule Report</h3>
                  <p>Set up automated report generation</p>
                </div>
                <Button
                  label="Schedule"
                  class="p-button-outlined"
                  @click="scheduleReport"
                />
              </div>
            </template>
          </Card>

          <Card class="action-card">
            <template #content>
              <div class="action-content">
                <div class="action-icon export">
                  <i class="pi pi-download"></i>
                </div>
                <div class="action-info">
                  <h3>Export Data</h3>
                  <p>Download your data in various formats</p>
                </div>
                <Button
                  label="Export"
                  class="p-button-outlined"
                  @click="showExportDialog = true"
                />
              </div>
            </template>
          </Card>

          <Card class="action-card">
            <template #content>
              <div class="action-content">
                <div class="action-icon settings">
                  <i class="pi pi-cog"></i>
                </div>
                <div class="action-info">
                  <h3>Report Settings</h3>
                  <p>Customize your reporting preferences</p>
                </div>
                <Button
                  label="Settings"
                  class="p-button-outlined"
                  @click="openSettings"
                />
              </div>
            </template>
          </Card>
        </div>
      </div>

      <!-- Export Dialog -->
      <Dialog
        v-model:visible="showExportDialog"
        modal
        header="Export Data"
        :style="{ width: '500px' }"
      >
        <div class="export-dialog-content">
          <div class="export-options">
            <div class="form-field">
              <label>Data Type</label>
              <Dropdown
                v-model="exportOptions.dataType"
                :options="dataTypeOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Select data type"
              />
            </div>
            
            <div class="form-field">
              <label>Date Range</label>
              <Calendar
                v-model="exportOptions.dateRange"
                selectionMode="range"
                dateFormat="dd/mm/yy"
                placeholder="Select date range"
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
                
                <RadioButton
                  v-model="exportOptions.format"
                  inputId="format-csv"
                  value="CSV"
                />
                <label for="format-csv">CSV</label>
              </div>
            </div>
          </div>
        </div>
        
        <template #footer>
          <div class="dialog-footer">
            <Button
              label="Cancel"
              @click="showExportDialog = false"
              class="p-button-text"
            />
            <Button
              label="Export"
              @click="executeExport"
              :loading="exporting"
              :disabled="!canExport"
            />
          </div>
        </template>
      </Dialog>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToaster } from '@/composables/useToaster'
import DashboardLayout from '@/components/general/DashboardLayout.vue'
import Card from 'primevue/card'
import Tag from 'primevue/tag'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import Dropdown from 'primevue/dropdown'
import Calendar from 'primevue/calendar'
import RadioButton from 'primevue/radiobutton'

const router = useRouter()
const authStore = useAuthStore()
const toaster = useToaster()

// Reactive data
const recentReports = ref([])
const showExportDialog = ref(false)
const exporting = ref(false)

const exportOptions = ref({
  dataType: null,
  dateRange: null,
  format: 'PDF'
})

// Computed properties
const userRole = computed(() => authStore.user?.role || 'USER')

const canViewLiveMetrics = computed(() => {
  return ['ADMIN', 'ACTIVATION_MANAGER'].includes(userRole.value)
})

const canViewPromoterReports = computed(() => {
  return ['ADMIN', 'ACTIVATION_MANAGER', 'PROMOTER'].includes(userRole.value)
})

const canViewROIAnalysis = computed(() => {
  return ['ADMIN', 'CLIENT'].includes(userRole.value)
})

const dataTypeOptions = computed(() => {
  const options = []
  
  if (canViewPromoterReports.value) {
    options.push({ label: 'Performance Data', value: 'performance' })
  }
  
  if (canViewLiveMetrics.value) {
    options.push({ label: 'Live Metrics', value: 'metrics' })
  }
  
  if (canViewROIAnalysis.value) {
    options.push({ label: 'ROI Analysis', value: 'roi' })
  }
  
  options.push({ label: 'Activation Data', value: 'activations' })
  options.push({ label: 'Lead Data', value: 'leads' })
  
  return options
})

const canExport = computed(() => {
  return exportOptions.value.dataType && exportOptions.value.format
})

// Methods
const goToLiveMetrics = () => {
  router.push('/reports/live-metrics')
}

const goToPromoterReports = () => {
  router.push('/reports/promoter-reports')
}

const goToROIAnalysis = () => {
  router.push('/reports/roi-analysis')
}

const getRoleSeverity = (role) => {
  const severityMap = {
    'ADMIN': 'danger',
    'ACTIVATION_MANAGER': 'warning',
    'CLIENT': 'info',
    'PROMOTER': 'success',
    'WAREHOUSE_MANAGER': 'secondary'
  }
  return severityMap[role] || 'secondary'
}

const getReportIcon = (type) => {
  const iconMap = {
    'performance': 'pi-chart-line',
    'metrics': 'pi-gauge',
    'roi': 'pi-chart-bar',
    'activation': 'pi-briefcase',
    'leads': 'pi-users'
  }
  return iconMap[type] || 'pi-file'
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString()
}

const downloadReport = (report) => {
  // Mock download - in real implementation, would call API
  toaster.success(`Downloading ${report.title}...`)
}

const viewReport = (report) => {
  // Mock view - in real implementation, would navigate to report details
  toaster.info(`Viewing ${report.title}...`)
}

const scheduleReport = () => {
  toaster.info('Report scheduling functionality coming soon')
}

const openSettings = () => {
  toaster.info('Report settings functionality coming soon')
}

const executeExport = async () => {
  exporting.value = true
  try {
    // Mock export - in real implementation, would call API
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const filename = `${exportOptions.value.dataType}-export-${new Date().toISOString().split('T')[0]}.${exportOptions.value.format.toLowerCase()}`
    
    toaster.success(`${exportOptions.value.dataType} data exported as ${filename}`)
    showExportDialog.value = false
    
    // Reset form
    exportOptions.value = {
      dataType: null,
      dateRange: null,
      format: 'PDF'
    }
  } catch (error) {
    toaster.error('Failed to export data')
    console.error('Export error:', error)
  } finally {
    exporting.value = false
  }
}

const loadRecentReports = async () => {
  try {
    // In a real implementation, this would fetch from a reports history API
    // For now, we'll create sample reports based on user permissions
    const reports = []
    
    if (canViewPromoterReports.value) {
      reports.push({
        id: 1,
        title: 'Weekly Performance Summary',
        description: 'Performance metrics for the past week',
        type: 'performance',
        createdAt: new Date(Date.now() - 86400000) // 1 day ago
      })
    }
    
    if (canViewROIAnalysis.value) {
      reports.push({
        id: 2,
        title: 'Monthly ROI Analysis',
        description: 'Investment return analysis for current month',
        type: 'roi',
        createdAt: new Date(Date.now() - 172800000) // 2 days ago
      })
    }
    
    if (canViewLiveMetrics.value) {
      reports.push({
        id: 3,
        title: 'Live Metrics Dashboard',
        description: 'Real-time performance monitoring',
        type: 'metrics',
        createdAt: new Date(Date.now() - 259200000) // 3 days ago
      })
    }
    
    // Add a general activation report for all users
    reports.push({
      id: 4,
      title: 'Activation Summary Report',
      description: 'Summary of all active campaigns',
      type: 'activation',
      createdAt: new Date(Date.now() - 345600000) // 4 days ago
    })
    
    recentReports.value = reports
  } catch (error) {
    console.error('Error loading recent reports:', error)
    // Fallback to empty array if there's an error
    recentReports.value = []
  }
}

// Lifecycle
onMounted(() => {
  loadRecentReports()
})
</script>

<style lang="scss" scoped>
.reports-overview {
  padding: 1.5rem;
  
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 2rem;
    
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
    
    .header-meta {
      .role-indicator {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
    }
  }
  
  .section-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #111827;
    margin: 0 0 1rem 0;
  }
  
  .quick-access-section {
    margin-bottom: 2rem;
    
    .reports-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 1.5rem;
      
      .report-card {
        cursor: pointer;
        transition: all 0.3s ease;
        border: 2px solid transparent;
        
        &:hover {
          border-color: #3b82f6;
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }
        
        .report-card-content {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          
          .report-icon {
            width: 4rem;
            height: 4rem;
            border-radius: 1rem;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2rem;
            color: white;
          }
          
          .report-info {
            flex: 1;
            
            h3 {
              margin: 0 0 0.5rem 0;
              color: #111827;
              font-size: 1.125rem;
              font-weight: 600;
            }
            
            p {
              margin: 0 0 1rem 0;
              color: #6b7280;
              font-size: 0.875rem;
            }
            
            .report-features {
              display: flex;
              flex-direction: column;
              gap: 0.25rem;
              
              .feature {
                font-size: 0.75rem;
                color: #9ca3af;
              }
            }
          }
          
          .report-action {
            color: #9ca3af;
            font-size: 1.25rem;
          }
        }
        
        &.live-metrics .report-icon {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        }
        
        &.promoter-reports .report-icon {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
        }
        
        &.roi-analysis .report-icon {
          background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
        }
      }
    }
  }
  
  .recent-activity-section {
    margin-bottom: 2rem;
    
    .recent-reports-list {
      .recent-report-item {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
        border-bottom: 1px solid #f3f4f6;
        
        &:last-child {
          border-bottom: none;
        }
        
        .report-item-icon {
          width: 2.5rem;
          height: 2.5rem;
          border-radius: 0.5rem;
          background: #f3f4f6;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6b7280;
          font-size: 1.125rem;
        }
        
        .report-item-info {
          flex: 1;
          
          h4 {
            margin: 0 0 0.25rem 0;
            color: #111827;
            font-size: 0.875rem;
            font-weight: 600;
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
        
        .report-item-actions {
          display: flex;
          gap: 0.25rem;
        }
      }
    }
  }
  
  .quick-actions-section {
    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
      
      .action-card {
        .action-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 1rem;
          
          .action-icon {
            width: 3rem;
            height: 3rem;
            border-radius: 0.75rem;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            color: white;
            
            &.schedule {
              background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            }
            
            &.export {
              background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
            }
            
            &.settings {
              background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
            }
          }
          
          .action-info {
            h3 {
              margin: 0 0 0.5rem 0;
              color: #111827;
              font-size: 1rem;
              font-weight: 600;
            }
            
            p {
              margin: 0;
              color: #6b7280;
              font-size: 0.875rem;
            }
          }
        }
      }
    }
  }
  
  .export-dialog-content {
    .export-options {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      
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
  }
  
  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
  }
}

@media (max-width: 768px) {
  .reports-overview {
    padding: 1rem;
    
    .page-header {
      flex-direction: column;
      gap: 1rem;
    }
    
    .reports-grid {
      grid-template-columns: 1fr !important;
    }
    
    .actions-grid {
      grid-template-columns: 1fr !important;
    }
    
    .recent-report-item {
      flex-direction: column !important;
      align-items: flex-start !important;
      gap: 0.75rem !important;
    }
  }
}
</style>