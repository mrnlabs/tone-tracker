<template>
  <DashboardLayout>
    <div class="roi-analysis">
      <!-- Page Header -->
      <div class="page-header">
        <div class="header-content">
          <h1 class="page-title">ROI Analysis</h1>
          <p class="page-description">Investment performance and return analysis</p>
        </div>
        <div class="header-actions">
          <Dropdown
            v-model="selectedActivation"
            :options="activationOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Select Activation"
            @change="loadROIAnalysis"
          />
          <BaseButton
            variant="secondary"
            icon="pi pi-refresh"
            :loading="loading"
            @click="refreshAnalysis"
          >
            Refresh
          </BaseButton>
        </div>
      </div>

      <!-- ROI Overview Cards -->
      <div class="roi-overview" v-if="roiData">
        <Card class="roi-card primary">
          <template #content>
            <div class="roi-content">
              <div class="roi-header">
                <h3>Overall ROI</h3>
                <div class="roi-badge" :class="roiStatus.level">
                  {{ roiStatus.label }}
                </div>
              </div>
              <div class="roi-value" :style="{ color: roiStatus.color }">
                {{ roiStatus.formatted }}
              </div>
              <div class="roi-details">
                <span>{{ formatCurrency(roiData.totalRevenue) }} revenue</span>
                <span>{{ formatCurrency(roiData.totalCosts) }} investment</span>
              </div>
            </div>
          </template>
        </Card>

        <Card class="roi-card">
          <template #content>
            <div class="roi-content">
              <div class="roi-header">
                <h3>Profit Margin</h3>
                <div class="trend-indicator" :class="profitMargin.isPositive ? 'positive' : 'negative'">
                  <i class="pi" :class="profitMargin.isPositive ? 'pi-arrow-up' : 'pi-arrow-down'"></i>
                </div>
              </div>
              <div class="roi-value" :style="{ color: profitMargin.isPositive ? '#10b981' : '#ef4444' }">
                {{ profitMargin.formatted }}
              </div>
              <div class="roi-details">
                <span>{{ formatCurrency(roiData.totalRevenue - roiData.totalCosts) }} profit</span>
              </div>
            </div>
          </template>
        </Card>

        <Card class="roi-card">
          <template #content>
            <div class="roi-content">
              <div class="roi-header">
                <h3>Cost per Lead</h3>
                <div class="efficiency-badge" :class="costPerLead.efficiency">
                  {{ costPerLead.efficiency }}
                </div>
              </div>
              <div class="roi-value">
                {{ costPerLead.formatted }}
              </div>
              <div class="roi-details">
                <span>{{ roiData.totalLeads }} leads captured</span>
              </div>
            </div>
          </template>
        </Card>

        <Card class="roi-card">
          <template #content>
            <div class="roi-content">
              <div class="roi-header">
                <h3>Cost per Sale</h3>
                <div class="efficiency-badge" :class="costPerSale.efficiency">
                  {{ costPerSale.efficiency }}
                </div>
              </div>
              <div class="roi-value">
                {{ costPerSale.formatted }}
              </div>
              <div class="roi-details">
                <span>{{ roiData.totalSales }} sales completed</span>
              </div>
            </div>
          </template>
        </Card>
      </div>

      <!-- Analysis Tabs -->
      <TabView>
        <!-- Cost Breakdown Tab -->
        <TabPanel header="Cost Breakdown">
          <div class="cost-breakdown-content">
            <div class="breakdown-grid">
              <!-- Cost Breakdown Chart -->
              <Card class="chart-card">
                <template #header>
                  <h3>Cost Distribution</h3>
                </template>
                <template #content>
                  <Chart 
                    type="doughnut" 
                    :data="costChartData" 
                    :options="chartOptions"
                    class="cost-chart"
                  />
                </template>
              </Card>

              <!-- Cost Details -->
              <Card class="details-card">
                <template #header>
                  <h3>Cost Breakdown Details</h3>
                </template>
                <template #content>
                  <div class="cost-items" v-if="costBreakdown">
                    <div class="cost-item">
                      <div class="cost-label">
                        <span class="cost-dot promoter"></span>
                        <span>Promoter Costs</span>
                      </div>
                      <span class="cost-amount">{{ formatCurrency(costBreakdown.promoterCosts) }}</span>
                      <span class="cost-percentage">{{ ((costBreakdown.promoterCosts / roiData.totalCosts) * 100).toFixed(1) }}%</span>
                    </div>
                    
                    <div class="cost-item">
                      <div class="cost-label">
                        <span class="cost-dot stock"></span>
                        <span>Stock Costs</span>
                      </div>
                      <span class="cost-amount">{{ formatCurrency(costBreakdown.stockCosts) }}</span>
                      <span class="cost-percentage">{{ ((costBreakdown.stockCosts / roiData.totalCosts) * 100).toFixed(1) }}%</span>
                    </div>
                    
                    <div class="cost-item">
                      <div class="cost-label">
                        <span class="cost-dot operational"></span>
                        <span>Operational Costs</span>
                      </div>
                      <span class="cost-amount">{{ formatCurrency(costBreakdown.operationalCosts) }}</span>
                      <span class="cost-percentage">{{ ((costBreakdown.operationalCosts / roiData.totalCosts) * 100).toFixed(1) }}%</span>
                    </div>
                    
                    <div class="cost-item">
                      <div class="cost-label">
                        <span class="cost-dot marketing"></span>
                        <span>Marketing Costs</span>
                      </div>
                      <span class="cost-amount">{{ formatCurrency(costBreakdown.marketingCosts) }}</span>
                      <span class="cost-percentage">{{ ((costBreakdown.marketingCosts / roiData.totalCosts) * 100).toFixed(1) }}%</span>
                    </div>
                  </div>
                </template>
              </Card>
            </div>

            <!-- Investment Summary -->
            <Card class="investment-summary">
              <template #header>
                <h3>Investment Summary</h3>
              </template>
              <template #content>
                <div class="summary-grid">
                  <div class="summary-item">
                    <label>Total Investment</label>
                    <span class="value">{{ formatCurrency(roiData.totalCosts) }}</span>
                  </div>
                  <div class="summary-item">
                    <label>Total Revenue</label>
                    <span class="value">{{ formatCurrency(roiData.totalRevenue) }}</span>
                  </div>
                  <div class="summary-item">
                    <label>Net Profit</label>
                    <span class="value" :style="{ color: profitMargin.isPositive ? '#10b981' : '#ef4444' }">
                      {{ formatCurrency(roiData.totalRevenue - roiData.totalCosts) }}
                    </span>
                  </div>
                  <div class="summary-item">
                    <label>ROI Multiple</label>
                    <span class="value">{{ (roiData.totalRevenue / roiData.totalCosts).toFixed(2) }}x</span>
                  </div>
                </div>
              </template>
            </Card>
          </div>
        </TabPanel>

        <!-- Performance Comparison Tab -->
        <TabPanel header="Performance Comparison">
          <div class="comparison-content">
            <div class="comparison-header">
              <h3>Investment Comparison</h3>
              <div class="comparison-controls">
                <Calendar
                  v-model="comparisonDateRange"
                  selectionMode="range"
                  dateFormat="dd/mm/yy"
                  placeholder="Select date range"
                  @date-select="loadComparison"
                />
              </div>
            </div>

            <div v-if="comparisonData" class="comparison-grid">
              <Card class="comparison-chart">
                <template #header>
                  <h3>ROI Trend Analysis</h3>
                </template>
                <template #content>
                  <Chart 
                    type="line" 
                    :data="roiTrendData" 
                    :options="trendChartOptions"
                    class="trend-chart"
                  />
                </template>
              </Card>

              <Card class="benchmark-comparison">
                <template #header>
                  <h3>Benchmark Comparison</h3>
                </template>
                <template #content>
                  <div v-if="benchmarkComparison" class="benchmark-content">
                    <div class="benchmark-header">
                      <div class="benchmark-item">
                        <label>Your ROI</label>
                        <span class="value" :style="{ color: roiStatus.color }">{{ roiStatus.formatted }}</span>
                      </div>
                      <div class="benchmark-item">
                        <label>Industry Benchmark</label>
                        <span class="value">{{ benchmarkComparison.benchmarkROI }}%</span>
                      </div>
                    </div>
                    
                    <div class="benchmark-status">
                      <div class="status-indicator" :class="benchmarkComparison.performance">
                        <i class="pi" :class="benchmarkComparison.performance === 'above' ? 'pi-arrow-up' : 'pi-arrow-down'"></i>
                        <span>{{ benchmarkComparison.status }}</span>
                      </div>
                    </div>
                  </div>
                </template>
              </Card>
            </div>
          </div>
        </TabPanel>

        <!-- Recommendations Tab -->
        <TabPanel header="Recommendations">
          <div class="recommendations-content">
            <div v-if="recommendations.length > 0" class="recommendations-list">
              <Card 
                v-for="rec in recommendations" 
                :key="rec.title"
                class="recommendation-card"
                :class="rec.type"
              >
                <template #content>
                  <div class="recommendation-content">
                    <div class="recommendation-header">
                      <div class="recommendation-icon">
                        <i class="pi" :class="getRecommendationIcon(rec.type)"></i>
                      </div>
                      <div class="recommendation-info">
                        <h4>{{ rec.title }}</h4>
                        <span class="priority" :class="rec.priority">{{ rec.priority }} priority</span>
                      </div>
                    </div>
                    <p>{{ rec.message }}</p>
                  </div>
                </template>
              </Card>
            </div>
            
            <div v-else class="no-recommendations">
              <div class="empty-state">
                <i class="pi pi-check-circle"></i>
                <h3>Great Performance!</h3>
                <p>No critical recommendations at this time. Your activation is performing well.</p>
              </div>
            </div>
          </div>
        </TabPanel>

        <!-- Export Tab -->
        <TabPanel header="Export Analysis">
          <div class="export-content">
            <Card>
              <template #header>
                <h3>Export ROI Analysis</h3>
              </template>
              <template #content>
                <div class="export-options">
                  <div class="export-form">
                    <div class="form-row">
                      <div class="form-field">
                        <label>Export Format</label>
                        <div class="format-options">
                          <RadioButton
                            v-model="exportFormat"
                            inputId="format-pdf"
                            value="PDF"
                          />
                          <label for="format-pdf">PDF Report</label>
                          
                          <RadioButton
                            v-model="exportFormat"
                            inputId="format-excel"
                            value="Excel"
                          />
                          <label for="format-excel">Excel Spreadsheet</label>
                        </div>
                      </div>
                    </div>
                    
                    <div class="export-actions">
                      <BaseButton
                        variant="primary"
                        icon="pi pi-download"
                        :loading="exporting"
                        @click="exportAnalysis"
                        :disabled="!selectedActivation"
                      >
                        Export Analysis
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
import { roiAnalysisService, activationService } from '@/services'
import { BaseButton } from '@/components'
import DashboardLayout from '@/components/general/DashboardLayout.vue'
import Card from 'primevue/card'
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'
import Dropdown from 'primevue/dropdown'
import Calendar from 'primevue/calendar'
import Chart from 'primevue/chart'
import RadioButton from 'primevue/radiobutton'

// Reactive data
const loading = ref(false)
const exporting = ref(false)
const selectedActivation = ref(null)
const roiData = ref(null)
const costBreakdown = ref(null)
const comparisonData = ref(null)
const comparisonDateRange = ref(null)
const exportFormat = ref('PDF')

const toaster = useToaster()

// Activation options loaded from API
const activationOptions = ref([])

// Computed properties
const roiStatus = computed(() => {
  if (!roiData.value) return { formatted: '0%', level: 'unknown', color: '#6b7280', label: 'Unknown' }
  return roiAnalysisService.formatROI(roiData.value.roiPercentage)
})

const profitMargin = computed(() => {
  if (!roiData.value) return { formatted: '0%', isPositive: false }
  return roiAnalysisService.calculateProfitMargin(roiData.value.totalRevenue, roiData.value.totalCosts)
})

const costPerLead = computed(() => {
  if (!roiData.value) return { formatted: '$0', efficiency: 'unknown' }
  return roiAnalysisService.calculateCostPerMetric(roiData.value.totalCosts, roiData.value.totalLeads)
})

const costPerSale = computed(() => {
  if (!roiData.value) return { formatted: '$0', efficiency: 'unknown' }
  return roiAnalysisService.calculateCostPerMetric(roiData.value.totalCosts, roiData.value.totalSales)
})

const costChartData = computed(() => {
  if (!costBreakdown.value) return null
  return roiAnalysisService.generateCostChartData(costBreakdown.value)
})

const roiTrendData = computed(() => {
  if (!comparisonData.value?.historicalData) return null
  return roiAnalysisService.generateROITrendData(comparisonData.value.historicalData)
})

const benchmarkComparison = computed(() => {
  if (!roiData.value || !comparisonData.value?.benchmarkROI) return null
  return roiAnalysisService.calculateBenchmarkComparison(
    roiData.value.roiPercentage, 
    comparisonData.value.benchmarkROI
  )
})

const recommendations = computed(() => {
  if (!roiData.value) return []
  return roiAnalysisService.generateRecommendations(roiData.value)
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom' }
  }
}

const trendChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      title: { display: true, text: 'ROI %' }
    }
  },
  plugins: {
    legend: { display: false }
  }
}

// Methods
const loadROIAnalysis = async () => {
  if (!selectedActivation.value) return
  
  loading.value = true
  try {
    const [roiResponse, costResponse] = await Promise.all([
      roiAnalysisService.getROIAnalysis(selectedActivation.value),
      roiAnalysisService.getCostBreakdown(selectedActivation.value)
    ])
    
    roiData.value = roiResponse
    costBreakdown.value = costResponse
  } catch (error) {
    toaster.error('Failed to load ROI analysis')
    console.error('Error loading ROI analysis:', error)
  } finally {
    loading.value = false
  }
}

const loadComparison = async () => {
  if (!selectedActivation.value) return
  
  try {
    const params = {}
    if (comparisonDateRange.value && comparisonDateRange.value.length === 2) {
      params.startDate = comparisonDateRange.value[0].toISOString().split('T')[0]
      params.endDate = comparisonDateRange.value[1].toISOString().split('T')[0]
    }
    
    comparisonData.value = await roiAnalysisService.getInvestmentComparison(params)
  } catch (error) {
    toaster.error('Failed to load comparison data')
    console.error('Error loading comparison:', error)
  }
}

const refreshAnalysis = async () => {
  await Promise.all([loadROIAnalysis(), loadComparison()])
}

const exportAnalysis = async () => {
  if (!selectedActivation.value) return
  
  exporting.value = true
  try {
    const blob = await roiAnalysisService.exportROIReport(selectedActivation.value, exportFormat.value)
    
    // Create download link
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `roi-analysis-${selectedActivation.value}-${new Date().toISOString().split('T')[0]}.${exportFormat.value.toLowerCase()}`
    link.click()
    window.URL.revokeObjectURL(url)
    
    toaster.success('ROI analysis exported successfully')
  } catch (error) {
    toaster.error('Failed to export analysis')
    console.error('Error exporting analysis:', error)
  } finally {
    exporting.value = false
  }
}

const formatCurrency = (amount) => {
  return roiAnalysisService.formatCurrency(amount)
}

const getRecommendationIcon = (type) => {
  const icons = {
    critical: 'pi-exclamation-triangle',
    warning: 'pi-exclamation-circle',
    success: 'pi-check-circle',
    info: 'pi-info-circle'
  }
  return icons[type] || 'pi-info'
}

const loadActivations = async () => {
  try {
    const response = await activationService.getActivations()
    activationOptions.value = response.data.map(activation => ({
      label: activation.name,
      value: activation.id
    }))
  } catch (error) {
    console.error('Error loading activations:', error)
    toaster.error('Failed to load activations')
  }
}

// Watchers
watch(selectedActivation, loadROIAnalysis)

// Lifecycle
onMounted(async () => {
  await loadActivations()
  
  // Auto-select first activation if available
  if (activationOptions.value.length > 0) {
    selectedActivation.value = activationOptions.value[0].value
  }
})
</script>

<style lang="scss" scoped>
.roi-analysis {
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
    }
  }
  
  .roi-overview {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
    margin-bottom: 1.5rem;
    
    .roi-card {
      .roi-content {
        .roi-header {
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
          
          .roi-badge,
          .efficiency-badge {
            padding: 0.25rem 0.5rem;
            border-radius: 0.25rem;
            font-size: 0.75rem;
            font-weight: 500;
            text-transform: uppercase;
            
            &.excellent {
              background: #d1fae5;
              color: #065f46;
            }
            
            &.good {
              background: #dbeafe;
              color: #1e40af;
            }
            
            &.average {
              background: #fef3c7;
              color: #92400e;
            }
            
            &.poor,
            &.loss {
              background: #fee2e2;
              color: #991b1b;
            }
          }
          
          .trend-indicator {
            display: flex;
            align-items: center;
            
            &.positive {
              color: #10b981;
            }
            
            &.negative {
              color: #ef4444;
            }
          }
        }
        
        .roi-value {
          font-size: 1.75rem;
          font-weight: 700;
          color: #111827;
          margin-bottom: 0.75rem;
        }
        
        .roi-details {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          
          span {
            font-size: 0.75rem;
            color: #6b7280;
          }
        }
      }
      
      &.primary {
        border-left: 4px solid #3b82f6;
      }
    }
  }
  
  .cost-breakdown-content {
    .breakdown-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
      margin-bottom: 1.5rem;
      
      .chart-card {
        .cost-chart {
          height: 300px;
        }
      }
      
      .details-card {
        .cost-items {
          .cost-item {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 0.75rem 0;
            border-bottom: 1px solid #f3f4f6;
            
            &:last-child {
              border-bottom: none;
            }
            
            .cost-label {
              display: flex;
              align-items: center;
              gap: 0.5rem;
              flex: 1;
              
              .cost-dot {
                width: 12px;
                height: 12px;
                border-radius: 50%;
                
                &.promoter {
                  background: #3b82f6;
                }
                
                &.stock {
                  background: #10b981;
                }
                
                &.operational {
                  background: #f59e0b;
                }
                
                &.marketing {
                  background: #8b5cf6;
                }
              }
            }
            
            .cost-amount {
              font-weight: 600;
              color: #111827;
            }
            
            .cost-percentage {
              font-size: 0.875rem;
              color: #6b7280;
              min-width: 3rem;
              text-align: right;
            }
          }
        }
      }
    }
    
    .investment-summary {
      .summary-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1.5rem;
        
        .summary-item {
          text-align: center;
          
          label {
            display: block;
            font-size: 0.875rem;
            color: #6b7280;
            margin-bottom: 0.5rem;
          }
          
          .value {
            font-size: 1.25rem;
            font-weight: 700;
            color: #111827;
          }
        }
      }
    }
  }
  
  .comparison-content {
    .comparison-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      
      h3 {
        margin: 0;
        color: #111827;
      }
    }
    
    .comparison-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 1.5rem;
      
      .comparison-chart {
        .trend-chart {
          height: 300px;
        }
      }
      
      .benchmark-comparison {
        .benchmark-content {
          .benchmark-header {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            margin-bottom: 1.5rem;
            
            .benchmark-item {
              display: flex;
              justify-content: space-between;
              align-items: center;
              
              label {
                color: #6b7280;
                font-size: 0.875rem;
              }
              
              .value {
                font-weight: 700;
                font-size: 1.125rem;
              }
            }
          }
          
          .benchmark-status {
            text-align: center;
            padding: 1rem;
            background: #f9fafb;
            border-radius: 0.5rem;
            
            .status-indicator {
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 0.5rem;
              font-weight: 500;
              
              &.above {
                color: #10b981;
              }
              
              &.below {
                color: #ef4444;
              }
            }
          }
        }
      }
    }
  }
  
  .recommendations-content {
    .recommendations-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      
      .recommendation-card {
        &.critical {
          border-left: 4px solid #ef4444;
        }
        
        &.warning {
          border-left: 4px solid #f59e0b;
        }
        
        &.success {
          border-left: 4px solid #10b981;
        }
        
        &.info {
          border-left: 4px solid #3b82f6;
        }
        
        .recommendation-content {
          .recommendation-header {
            display: flex;
            align-items: center;
            gap: 1rem;
            margin-bottom: 0.75rem;
            
            .recommendation-icon {
              width: 2rem;
              height: 2rem;
              border-radius: 0.5rem;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              
              .critical & {
                background: #ef4444;
              }
              
              .warning & {
                background: #f59e0b;
              }
              
              .success & {
                background: #10b981;
              }
              
              .info & {
                background: #3b82f6;
              }
            }
            
            .recommendation-info {
              flex: 1;
              
              h4 {
                margin: 0 0 0.25rem 0;
                color: #111827;
                font-size: 1rem;
              }
              
              .priority {
                font-size: 0.75rem;
                text-transform: uppercase;
                font-weight: 500;
                
                &.high {
                  color: #ef4444;
                }
                
                &.medium {
                  color: #f59e0b;
                }
                
                &.low {
                  color: #6b7280;
                }
              }
            }
          }
          
          p {
            margin: 0;
            color: #6b7280;
            line-height: 1.5;
          }
        }
      }
    }
    
    .no-recommendations {
      text-align: center;
      padding: 3rem;
      
      .empty-state {
        .pi {
          font-size: 3rem;
          color: #10b981;
          margin-bottom: 1rem;
        }
        
        h3 {
          margin: 0 0 0.5rem 0;
          color: #111827;
        }
        
        p {
          margin: 0;
          color: #6b7280;
        }
      }
    }
  }
  
  .export-content {
    .export-form {
      .form-row {
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
  .roi-analysis {
    padding: 1rem;
    
    .page-header {
      flex-direction: column;
      gap: 1rem;
    }
    
    .roi-overview {
      grid-template-columns: 1fr;
    }
    
    .breakdown-grid,
    .comparison-grid {
      grid-template-columns: 1fr !important;
    }
    
    .comparison-header {
      flex-direction: column;
      gap: 1rem;
      align-items: flex-start;
    }
  }
}
</style>