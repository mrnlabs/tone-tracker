<template>
  <div class="consumer-behavior-display">
    <!-- Header -->
    <div class="display-header">
      <div class="header-info">
        <i class="pi pi-chart-bar header-icon"></i>
        <div>
          <h3>Consumer Behavior Insights</h3>
          <p>{{ formatDate(reportData.reportDate) }} - {{ reportData.activation?.name || 'Daily Report' }}</p>
        </div>
      </div>
      <div class="header-actions" v-if="showActions">
        <Button
          icon="pi pi-download"
          @click="exportData"
          class="p-button-outlined"
          v-tooltip.top="'Export Data'"
        />
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="summary-cards">
      <!-- Top SKU Card -->
      <Card class="summary-card top-sku-card" v-if="reportData.topPurchasedSku">
        <template #content>
          <div class="card-content">
            <div class="card-icon">
              <i class="pi pi-shopping-cart"></i>
            </div>
            <div class="card-details">
              <h4>Top Selling Product</h4>
              <p class="product-name">{{ reportData.topPurchasedSku?.name || 'Product' }}</p>
              <div class="metrics">
                <span class="metric">
                  <strong>{{ reportData.topSkuUnitsSold || 0 }}</strong> units sold
                </span>
                <span class="metric" v-if="reportData.topSkuRevenue">
                  <strong>${{ reportData.topSkuRevenue.toFixed(2) }}</strong> revenue
                </span>
              </div>
            </div>
          </div>
        </template>
      </Card>

      <!-- Purchase Driver Card -->
      <Card class="summary-card purchase-driver-card" v-if="reportData.primaryPurchaseReason">
        <template #content>
          <div class="card-content">
            <div class="card-icon">
              <i :class="getPurchaseReasonIcon(reportData.primaryPurchaseReason)"></i>
            </div>
            <div class="card-details">
              <h4>Primary Purchase Driver</h4>
              <p class="driver-name">{{ reportService.getPurchaseReasonLabel(reportData.primaryPurchaseReason) }}</p>
              <div class="driver-breakdown" v-if="totalPurchaseReasons > 0">
                <small>{{ getPrimaryReasonPercentage() }}% of sales</small>
              </div>
            </div>
          </div>
        </template>
      </Card>

      <!-- Demographics Card -->
      <Card class="summary-card demographics-card" v-if="hasDemographicData">
        <template #content>
          <div class="card-content">
            <div class="card-icon">
              <i class="pi pi-users"></i>
            </div>
            <div class="card-details">
              <h4>Customer Profile</h4>
              <div class="demographic-info">
                <span v-if="reportData.dominantAgeGroup" class="demo-item">
                  <i class="pi pi-calendar"></i>
                  {{ reportService.getAgeGroupLabel(reportData.dominantAgeGroup) }}
                </span>
                <span v-if="reportData.dominantGender" class="demo-item">
                  <i class="pi pi-user"></i>
                  {{ reportService.getGenderLabel(reportData.dominantGender) }}
                </span>
                <span v-if="reportData.dominantCustomerType" class="demo-item">
                  <i class="pi pi-briefcase"></i>
                  {{ reportService.getCustomerTypeLabel(reportData.dominantCustomerType) }}
                </span>
              </div>
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- Detailed Analysis Sections -->
    <div class="analysis-sections">
      <!-- Purchase Reasons Analysis -->
      <Card class="analysis-card purchase-analysis" v-if="totalPurchaseReasons > 0">
        <template #header>
          <div class="analysis-header">
            <i class="pi pi-chart-pie"></i>
            <h4>Purchase Reason Breakdown</h4>
          </div>
        </template>
        
        <template #content>
          <div class="purchase-breakdown">
            <div class="breakdown-chart">
              <div 
                v-for="reason in purchaseReasonBreakdown" 
                :key="reason.type"
                class="breakdown-bar"
                v-if="reason.count > 0"
              >
                <div class="bar-header">
                  <span class="bar-label">
                    <i :class="reason.icon"></i>
                    {{ reason.label }}
                  </span>
                  <span class="bar-value">{{ reason.count }} ({{ reason.percentage }}%)</span>
                </div>
                <div class="bar-track">
                  <div 
                    class="bar-fill"
                    :style="{ width: reason.percentage + '%', backgroundColor: reason.color }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </Card>

      <!-- Market Insights -->
      <Card class="analysis-card insights-analysis" v-if="hasMarketInsights">
        <template #header>
          <div class="analysis-header">
            <i class="pi pi-lightbulb"></i>
            <h4>Market Insights & Observations</h4>
          </div>
        </template>
        
        <template #content>
          <div class="insights-grid">
            <div class="insight-item" v-if="reportData.observedMarketTrends">
              <div class="insight-header">
                <i class="pi pi-trending-up insight-icon"></i>
                <h5>Market Trends</h5>
              </div>
              <p>{{ reportData.observedMarketTrends }}</p>
            </div>
            
            <div class="insight-item" v-if="reportData.customerBehaviorNotes">
              <div class="insight-header">
                <i class="pi pi-users insight-icon"></i>
                <h5>Customer Behavior</h5>
              </div>
              <p>{{ reportData.customerBehaviorNotes }}</p>
            </div>
            
            <div class="insight-item competitive" v-if="reportData.competitiveActivity">
              <div class="insight-header">
                <i class="pi pi-flag insight-icon"></i>
                <h5>Competitive Activity</h5>
              </div>
              <p>{{ reportData.competitiveActivity }}</p>
            </div>
            
            <div class="insight-item" v-if="reportData.locationInsights">
              <div class="insight-header">
                <i class="pi pi-map-marker insight-icon"></i>
                <h5>Location Insights</h5>
              </div>
              <p>{{ reportData.locationInsights }}</p>
            </div>
            
            <div class="insight-item" v-if="reportData.productFeedback">
              <div class="insight-header">
                <i class="pi pi-comment insight-icon"></i>
                <h5>Product Feedback</h5>
              </div>
              <p>{{ reportData.productFeedback }}</p>
            </div>
            
            <div class="insight-item improvement" v-if="reportData.improvementOpportunities">
              <div class="insight-header">
                <i class="pi pi-arrow-up insight-icon"></i>
                <h5>Improvement Opportunities</h5>
              </div>
              <p>{{ reportData.improvementOpportunities }}</p>
            </div>
          </div>
        </template>
      </Card>

      <!-- Secondary Products -->
      <Card class="analysis-card secondary-products" v-if="hasSecondaryProducts">
        <template #header>
          <div class="analysis-header">
            <i class="pi pi-list"></i>
            <h4>Other Performing Products</h4>
          </div>
        </template>
        
        <template #content>
          <div class="secondary-products-list">
            <div class="product-item" v-if="reportData.secondTopSku">
              <div class="product-rank">2</div>
              <div class="product-info">
                <h5>{{ reportData.secondTopSku.name }}</h5>
                <small>Second best seller</small>
              </div>
            </div>
            
            <div class="product-item" v-if="reportData.thirdTopSku">
              <div class="product-rank">3</div>
              <div class="product-info">
                <h5>{{ reportData.thirdTopSku.name }}</h5>
                <small>Third best seller</small>
              </div>
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- No Data State -->
    <Card v-if="!hasAnyData" class="no-data-card">
      <template #content>
        <div class="no-data-content">
          <i class="pi pi-info-circle no-data-icon"></i>
          <h4>No Consumer Behavior Data</h4>
          <p>Consumer behavior insights have not been captured for this report yet.</p>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useToast } from 'primevue/usetoast'
import Card from 'primevue/card'
import Button from 'primevue/button'
import reportService from '@/services/reportService'

// Props
const props = defineProps({
  reportData: {
    type: Object,
    required: true
  },
  showActions: {
    type: Boolean,
    default: true
  }
})

// Composables
const toast = useToast()

// Computed properties
const totalPurchaseReasons = computed(() => {
  return (props.reportData.priceDrivenSales || 0) +
         (props.reportData.promoDrivenSales || 0) +
         (props.reportData.brandLoyaltySales || 0) +
         (props.reportData.recommendationSales || 0)
})

const hasDemographicData = computed(() => {
  return props.reportData.dominantAgeGroup ||
         props.reportData.dominantGender ||
         props.reportData.dominantCustomerType
})

const hasMarketInsights = computed(() => {
  return props.reportData.observedMarketTrends ||
         props.reportData.customerBehaviorNotes ||
         props.reportData.competitiveActivity ||
         props.reportData.locationInsights ||
         props.reportData.productFeedback ||
         props.reportData.improvementOpportunities
})

const hasSecondaryProducts = computed(() => {
  return props.reportData.secondTopSku || props.reportData.thirdTopSku
})

const hasAnyData = computed(() => {
  return props.reportData.topPurchasedSku ||
         props.reportData.primaryPurchaseReason ||
         hasDemographicData.value ||
         hasMarketInsights.value ||
         hasSecondaryProducts.value
})

const purchaseReasonBreakdown = computed(() => {
  const total = totalPurchaseReasons.value
  if (total === 0) return []

  const breakdown = [
    {
      type: 'price',
      label: 'Price-driven',
      count: props.reportData.priceDrivenSales || 0,
      color: '#10b981',
      icon: 'pi pi-dollar'
    },
    {
      type: 'promo',
      label: 'Promotion-driven',
      count: props.reportData.promoDrivenSales || 0,
      color: '#3b82f6',
      icon: 'pi pi-percentage'
    },
    {
      type: 'brand',
      label: 'Brand Loyalty',
      count: props.reportData.brandLoyaltySales || 0,
      color: '#8b5cf6',
      icon: 'pi pi-heart'
    },
    {
      type: 'recommendation',
      label: 'Recommendation',
      count: props.reportData.recommendationSales || 0,
      color: '#f59e0b',
      icon: 'pi pi-thumbs-up'
    }
  ]

  return breakdown
    .map(item => ({
      ...item,
      percentage: Math.round((item.count / total) * 100)
    }))
    .filter(item => item.count > 0)
    .sort((a, b) => b.count - a.count)
})

// Methods
const formatDate = (dateString) => {
  return dateString ? new Date(dateString).toLocaleDateString() : ''
}

const getPurchaseReasonIcon = (reason) => {
  const icons = {
    'PRICE': 'pi pi-dollar',
    'PROMO': 'pi pi-percentage',
    'BRAND_LOYALTY': 'pi pi-heart',
    'RECOMMENDATION': 'pi pi-thumbs-up'
  }
  return icons[reason] || 'pi pi-circle'
}

const getPrimaryReasonPercentage = () => {
  const total = totalPurchaseReasons.value
  if (total === 0) return 0
  
  const primaryCount = getPrimaryReasonCount()
  return Math.round((primaryCount / total) * 100)
}

const getPrimaryReasonCount = () => {
  const reason = props.reportData.primaryPurchaseReason
  switch (reason) {
    case 'PRICE': return props.reportData.priceDrivenSales || 0
    case 'PROMO': return props.reportData.promoDrivenSales || 0
    case 'BRAND_LOYALTY': return props.reportData.brandLoyaltySales || 0
    case 'RECOMMENDATION': return props.reportData.recommendationSales || 0
    default: return 0
  }
}

const exportData = () => {
  toast.add({
    severity: 'info',
    summary: 'Export',
    detail: 'Consumer behavior data export functionality coming soon',
    life: 3000
  })
}
</script>

<style scoped>
.consumer-behavior-display {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.display-header {
  display: flex;
  justify-content: space-between;  
  align-items: center;
  padding: 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 0.75rem;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-icon {
  font-size: 2rem;
  opacity: 0.9;
}

.header-info h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.header-info p {
  margin: 0;
  opacity: 0.9;
  font-size: 0.9rem;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.summary-card {
  border-radius: 0.75rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);  
  transition: transform 0.2s ease;
}

.summary-card:hover {
  transform: translateY(-2px);
}

.top-sku-card {
  border-left: 4px solid #10b981;
}

.purchase-driver-card {
  border-left: 4px solid #3b82f6;
}

.demographics-card {
  border-left: 4px solid #8b5cf6;
}

.card-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
}

.card-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  flex-shrink: 0;
}

.top-sku-card .card-icon {
  background: linear-gradient(135deg, #10b981, #059669);
}

.purchase-driver-card .card-icon {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
}

.demographics-card .card-icon {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
}

.card-details {
  flex: 1;
}

.card-details h4 {
  margin: 0 0 0.5rem 0;
  color: #374151;
  font-size: 1rem;
  font-weight: 600;
}

.product-name,
.driver-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.5rem 0;
}

.metrics {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.metric {
  font-size: 0.875rem;
  color: #6b7280;
}

.metric strong {
  color: #111827;
}

.driver-breakdown {
  margin-top: 0.25rem;
}

.driver-breakdown small {
  color: #6b7280;
  font-style: italic;
}

.demographic-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.demo-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.demo-item i {
  color: #9ca3af;
  width: 12px;
}

.analysis-sections {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.analysis-card {
  border-radius: 0.75rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.analysis-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-bottom: 1px solid #e9ecef;
  border-radius: 0.75rem 0.75rem 0 0;
}

.analysis-header i {
  color: #495057;
  font-size: 1.25rem;
}

.analysis-header h4 {
  margin: 0;
  color: #495057;
  font-size: 1.1rem;
  font-weight: 600;
}

.purchase-breakdown {
  padding: 1.5rem;
}

.breakdown-chart {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.breakdown-bar {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.bar-header {
  display: flex;  
  justify-content: space-between;
  align-items: center;
}

.bar-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  color: #374151;
}

.bar-value {
  font-weight: 600;
  color: #111827;
  font-size: 0.9rem;
}

.bar-track {
  height: 20px;
  background: #f3f4f6;
  border-radius: 10px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 10px;
  transition: width 0.5s ease;
}

.insights-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
  padding: 1.5rem;
}

.insight-item {
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 0.5rem;
  border-left: 4px solid #3b82f6;
}

.insight-item.competitive {
  border-left-color: #ef4444;
}

.insight-item.improvement {
  border-left-color: #10b981;
}

.insight-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.insight-icon {
  color: #6b7280;
  font-size: 1.1rem;
}

.insight-header h5 {
  margin: 0;
  color: #374151;
  font-size: 1rem;
  font-weight: 600;
}

.insight-item p {
  margin: 0;
  color: #6b7280;
  line-height: 1.5;
}

.secondary-products-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
}

.product-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 0.5rem;
}

.product-rank {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6b7280, #4b5563);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.product-info h5 {
  margin: 0;
  color: #111827;
  font-size: 1rem;
  font-weight: 600;
}

.product-info small {
  color: #6b7280;
}

.no-data-card {
  text-align: center;
  border: 2px dashed #d1d5db;
}

.no-data-content {
  padding: 3rem;
}

.no-data-icon {
  font-size: 3rem;
  color: #9ca3af;
  margin-bottom: 1rem;
}

.no-data-content h4 {
  margin: 0 0 0.5rem 0;
  color: #6b7280;
}

.no-data-content p {
  margin: 0;
  color: #9ca3af;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .insights-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .display-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
    text-align: center;
  }
  
  .summary-cards {
    grid-template-columns: 1fr;
  }
  
  .card-content {
    flex-direction: column;
    text-align: center;
  }
  
  .demographic-info {
    align-items: center;
  }
  
  .bar-header {
    flex-direction: column;
    align-items: stretch;
    gap: 0.25rem;
  }
  
  .insights-grid {
    padding: 1rem;
  }
}
</style>