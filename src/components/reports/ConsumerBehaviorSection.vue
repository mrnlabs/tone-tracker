<template>
  <div class="consumer-behavior-section">
    <!-- Top Purchased SKU Section -->
    <Card class="behavior-card">
      <template #header>
        <div class="section-header">
          <i class="pi pi-shopping-cart section-icon"></i>
          <h3>Top Purchased SKU</h3>
        </div>
      </template>
      
      <template #content>
        <div class="form-grid">
          <div class="field">
            <label for="topPurchasedSku">Top Selling Product *</label>
            <Dropdown
              id="topPurchasedSku"
              v-model="formData.topPurchasedSkuId"
              :options="availableSKUs"
              optionLabel="name"
              optionValue="id"
              placeholder="Select top selling SKU"
              filter
              showClear
              :loading="loadingSKUs"
              :class="{ 'p-invalid': errors.topPurchasedSkuId }"
              @change="onTopSKUChange"
            />
            <small class="p-error">{{ errors.topPurchasedSkuId }}</small>
          </div>
          
          <div class="field">
            <label for="topSkuUnitsSold">Units Sold</label>
            <InputNumber
              id="topSkuUnitsSold"
              v-model="formData.topSkuUnitsSold"
              :min="0"
              placeholder="Number of units sold"
              :class="{ 'p-invalid': errors.topSkuUnitsSold }"
            />
            <small class="p-error">{{ errors.topSkuUnitsSold }}</small>
          </div>
          
          <div class="field">
            <label for="topSkuRevenue">Revenue Generated</label>
            <InputNumber
              id="topSkuRevenue"
              v-model="formData.topSkuRevenue"
              mode="currency"
              currency="USD"
              locale="en-US"
              :min="0"
              placeholder="Revenue from top SKU"
              :class="{ 'p-invalid': errors.topSkuRevenue }"
            />
            <small class="p-error">{{ errors.topSkuRevenue }}</small>
          </div>

          <!-- Secondary SKUs -->
          <div class="field">
            <label for="secondTopSku">Second Best Seller</label>
            <Dropdown
              id="secondTopSku"
              v-model="formData.secondTopSkuId"
              :options="filteredSKUs"
              optionLabel="name"
              optionValue="id"
              placeholder="Optional: Second top SKU"
              filter
              showClear
              :loading="loadingSKUs"
            />
          </div>
          
          <div class="field">
            <label for="thirdTopSku">Third Best Seller</label>
            <Dropdown
              id="thirdTopSku"
              v-model="formData.thirdTopSkuId"
              :options="filteredSKUs"
              optionLabel="name"
              optionValue="id"
              placeholder="Optional: Third top SKU"
              filter
              showClear
              :loading="loadingSKUs"
            />
          </div>
        </div>
      </template>
    </Card>

    <!-- Purchase Reasons Section -->
    <Card class="behavior-card">
      <template #header>
        <div class="section-header">
          <i class="pi pi-chart-pie section-icon"></i>
          <h3>Purchase Drivers</h3>
        </div>
      </template>
      
      <template #content>
        <div class="form-grid">
          <div class="field full-width">
            <label for="primaryPurchaseReason">Primary Purchase Driver *</label>
            <div class="reason-options">
              <div 
                v-for="reason in purchaseReasons" 
                :key="reason.value"
                class="reason-option"
                :class="{ 'selected': formData.primaryPurchaseReason === reason.value }"
                @click="formData.primaryPurchaseReason = reason.value"
              >
                <i :class="reason.icon"></i>
                <span>{{ reason.label }}</span>
              </div>
            </div>
            <small class="p-error">{{ errors.primaryPurchaseReason }}</small>
          </div>
          
          <div class="field">
            <label for="priceDrivenSales">Price-driven Sales</label>
            <InputNumber
              id="priceDrivenSales"
              v-model="formData.priceDrivenSales"
              :min="0"
              placeholder="Count of price-driven sales"
              :class="{ 'p-invalid': errors.priceDrivenSales }"
            />
            <small class="p-error">{{ errors.priceDrivenSales }}</small>
          </div>
          
          <div class="field">
            <label for="promoDrivenSales">Promotion-driven Sales</label>
            <InputNumber
              id="promoDrivenSales"
              v-model="formData.promoDrivenSales"
              :min="0"
              placeholder="Count of promo-driven sales"
              :class="{ 'p-invalid': errors.promoDrivenSales }"
            />
            <small class="p-error">{{ errors.promoDrivenSales }}</small>
          </div>
          
          <div class="field">
            <label for="brandLoyaltySales">Brand Loyalty Sales</label>
            <InputNumber
              id="brandLoyaltySales"
              v-model="formData.brandLoyaltySales"
              :min="0"
              placeholder="Count of brand loyalty sales"
              :class="{ 'p-invalid': errors.brandLoyaltySales }"
            />
            <small class="p-error">{{ errors.brandLoyaltySales }}</small>
          </div>
          
          <div class="field">
            <label for="recommendationSales">Recommendation Sales</label>
            <InputNumber
              id="recommendationSales"
              v-model="formData.recommendationSales"
              :min="0"
              placeholder="Count of recommendation-based sales"
              :class="{ 'p-invalid': errors.recommendationSales }"
            />
            <small class="p-error">{{ errors.recommendationSales }}</small>
          </div>

          <!-- Purchase Breakdown Visualization -->
          <div class="field full-width" v-if="totalSales > 0">
            <label>Purchase Reason Breakdown</label>
            <div class="purchase-breakdown">
              <div 
                v-for="reason in purchaseBreakdown" 
                :key="reason.type"
                class="breakdown-item"
                v-if="reason.count > 0"
              >
                <div class="breakdown-bar">
                  <div 
                    class="breakdown-fill"
                    :style="{ width: reason.percentage + '%', backgroundColor: reason.color }"
                  ></div>
                </div>
                <div class="breakdown-info">
                  <span class="breakdown-label">{{ reason.label }}</span>
                  <span class="breakdown-value">{{ reason.count }} ({{ reason.percentage }}%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </Card>

    <!-- Customer Demographics Section -->
    <Card class="behavior-card">
      <template #header>
        <div class="section-header">
          <i class="pi pi-users section-icon"></i>
          <h3>Customer Demographics</h3>
        </div>
      </template>
      
      <template #content>
        <div class="form-grid">
          <div class="field">
            <label for="dominantCustomerType">Dominant Customer Type</label>
            <Dropdown
              id="dominantCustomerType"
              v-model="formData.dominantCustomerType"
              :options="customerTypes"
              optionLabel="label"
              optionValue="value"
              placeholder="Select dominant customer type"
              showClear
            />
          </div>
          
          <div class="field">
            <label for="dominantAgeGroup">Dominant Age Group</label>
            <Dropdown
              id="dominantAgeGroup"
              v-model="formData.dominantAgeGroup"
              :options="ageGroups"
              optionLabel="label"
              optionValue="value"
              placeholder="Select dominant age group"
              showClear
            />
          </div>
          
          <div class="field">
            <label for="dominantGender">Dominant Gender</label>
            <Dropdown
              id="dominantGender"
              v-model="formData.dominantGender"
              :options="genders"
              optionLabel="label"
              optionValue="value"
              placeholder="Select dominant gender"
              showClear
            />
          </div>
        </div>
      </template>
    </Card>

    <!-- Market Insights Section -->
    <Card class="behavior-card">
      <template #header>
        <div class="section-header">
          <i class="pi pi-lightbulb section-icon"></i>
          <h3>Market Insights & Trends</h3>
        </div>
      </template>
      
      <template #content>
        <div class="insights-grid">
          <div class="field">
            <label for="observedMarketTrends">Observed Market Trends</label>
            <Textarea
              id="observedMarketTrends"
              v-model="formData.observedMarketTrends"
              rows="3"
              placeholder="What market trends did you observe today? (e.g., customer preferences, buying patterns)"
              :maxlength="2000"
              :class="{ 'p-invalid': errors.observedMarketTrends }"
            />
            <small class="char-count">{{ (formData.observedMarketTrends || '').length }}/2000</small>
            <small class="p-error">{{ errors.observedMarketTrends }}</small>
          </div>
          
          <div class="field">
            <label for="customerBehaviorNotes">Customer Behavior Notes</label>
            <Textarea
              id="customerBehaviorNotes"
              v-model="formData.customerBehaviorNotes"
              rows="3"
              placeholder="Observations about customer behavior (e.g., peak hours, shopping patterns)"
              :maxlength="2000"
              :class="{ 'p-invalid': errors.customerBehaviorNotes }"
            />
            <small class="char-count">{{ (formData.customerBehaviorNotes || '').length }}/2000</small>
            <small class="p-error">{{ errors.customerBehaviorNotes }}</small>
          </div>
          
          <div class="field">
            <label for="competitiveActivity">Competitive Activity</label>
            <Textarea
              id="competitiveActivity"
              v-model="formData.competitiveActivity"
              rows="3"
              placeholder="Any competitive activity observed? (e.g., competitor promotions, price changes)"
              :maxlength="2000"
              :class="{ 'p-invalid': errors.competitiveActivity }"
            />
            <small class="char-count">{{ (formData.competitiveActivity || '').length }}/2000</small>
            <small class="p-error">{{ errors.competitiveActivity }}</small>
          </div>
          
          <div class="field">
            <label for="locationInsights">Location Insights</label>
            <Textarea
              id="locationInsights"
              v-model="formData.locationInsights"
              rows="3"
              placeholder="Insights about the location (e.g., foot traffic, placement effectiveness)"
              :maxlength="2000"
              :class="{ 'p-invalid': errors.locationInsights }"
            />
            <small class="char-count">{{ (formData.locationInsights || '').length }}/2000</small>
            <small class="p-error">{{ errors.locationInsights }}</small>
          </div>
          
          <div class="field">
            <label for="productFeedback">Product Feedback</label>
            <Textarea
              id="productFeedback"
              v-model="formData.productFeedback"
              rows="3"
              placeholder="Customer feedback about products (e.g., likes, dislikes, suggestions)"
              :maxlength="2000"
              :class="{ 'p-invalid': errors.productFeedback }"
            />
            <small class="char-count">{{ (formData.productFeedback || '').length }}/2000</small>
            <small class="p-error">{{ errors.productFeedback }}</small>
          </div>
          
          <div class="field">
            <label for="improvementOpportunities">Improvement Opportunities</label>
            <Textarea
              id="improvementOpportunities"
              v-model="formData.improvementOpportunities"
              rows="3"
              placeholder="What could be improved? (e.g., setup, messaging, product mix)"
              :maxlength="2000"
              :class="{ 'p-invalid': errors.improvementOpportunities }"
            />
            <small class="char-count">{{ (formData.improvementOpportunities || '').length }}/2000</small>
            <small class="p-error">{{ errors.improvementOpportunities }}</small>
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import Card from 'primevue/card'
import Dropdown from 'primevue/dropdown'
import InputNumber from 'primevue/inputnumber'
import Textarea from 'primevue/textarea'
import reportService from '@/services/reportService'

// Props
const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({})
  },
  activationId: {
    type: Number,
    required: true
  },
  errors: {
    type: Object,
    default: () => ({})
  }
})

// Emits
const emit = defineEmits(['update:modelValue'])

// Composables
const toast = useToast()

// Reactive data
const availableSKUs = ref([])
const loadingSKUs = ref(false)

const formData = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// Options
const purchaseReasons = ref([
  { value: 'PRICE', label: 'Price-driven', icon: 'pi pi-dollar' },
  { value: 'PROMO', label: 'Promotion-driven', icon: 'pi pi-percentage' },
  { value: 'BRAND_LOYALTY', label: 'Brand Loyalty', icon: 'pi pi-heart' },
  { value: 'RECOMMENDATION', label: 'Recommendation', icon: 'pi pi-thumbs-up' }
])

const customerTypes = ref([
  { value: 'SHOPPER', label: 'Shopper' },
  { value: 'RETAILER', label: 'Retailer' },
  { value: 'DISTRIBUTOR', label: 'Distributor' }
])

const ageGroups = ref([
  { value: 'AGE_18_25', label: '18-25' },
  { value: 'AGE_26_35', label: '26-35' },
  { value: 'AGE_36_45', label: '36-45' },
  { value: 'AGE_46_55', label: '46-55' },
  { value: 'AGE_56_PLUS', label: '56+' }
])

const genders = ref([
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'OTHER', label: 'Other' }
])

// Computed properties
const filteredSKUs = computed(() => {
  return availableSKUs.value.filter(sku => 
    sku.id !== formData.value.topPurchasedSkuId &&
    sku.id !== formData.value.secondTopSkuId &&
    sku.id !== formData.value.thirdTopSkuId
  )
})

const totalSales = computed(() => {
  return (formData.value.priceDrivenSales || 0) +
         (formData.value.promoDrivenSales || 0) +
         (formData.value.brandLoyaltySales || 0) +
         (formData.value.recommendationSales || 0)
})

const purchaseBreakdown = computed(() => {
  const total = totalSales.value
  if (total === 0) return []

  const breakdown = [
    {
      type: 'price',
      label: 'Price-driven',
      count: formData.value.priceDrivenSales || 0,
      color: '#10b981'
    },
    {
      type: 'promo',
      label: 'Promotion-driven',
      count: formData.value.promoDrivenSales || 0,
      color: '#3b82f6'
    },
    {
      type: 'brand',
      label: 'Brand Loyalty',
      count: formData.value.brandLoyaltySales || 0,
      color: '#8b5cf6'
    },
    {
      type: 'recommendation',
      label: 'Recommendation',
      count: formData.value.recommendationSales || 0,
      color: '#f59e0b'
    }
  ]

  return breakdown.map(item => ({
    ...item,
    percentage: Math.round((item.count / total) * 100)
  })).filter(item => item.count > 0)
})

// Methods
const loadAvailableSKUs = async () => {
  if (!props.activationId) return

  loadingSKUs.value = true
  try {
    const response = await reportService.getAvailableSKUs(props.activationId)
    availableSKUs.value = Array.isArray(response) ? response : response.data || []
  } catch (error) {
    console.error('Error loading available SKUs:', error)
    toast.add({
      severity: 'error',
      summary: 'Loading Error',
      detail: 'Failed to load available SKUs',
      life: 5000
    })
    availableSKUs.value = []
  } finally {
    loadingSKUs.value = false
  }
}

const onTopSKUChange = () => {
  // Clear secondary selections if they match the top SKU
  if (formData.value.secondTopSkuId === formData.value.topPurchasedSkuId) {
    formData.value.secondTopSkuId = null
  }
  if (formData.value.thirdTopSkuId === formData.value.topPurchasedSkuId) {
    formData.value.thirdTopSkuId = null
  }
}

// Watchers
watch(() => props.activationId, (newId) => {
  if (newId) {
    loadAvailableSKUs()
  }
}, { immediate: true })

// Lifecycle
onMounted(() => {
  if (props.activationId) {
    loadAvailableSKUs()
  }
})
</script>

<style scoped>
.consumer-behavior-section {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.behavior-card {
  border-radius: 0.75rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-bottom: 1px solid #e9ecef;
  border-radius: 0.75rem 0.75rem 0 0;
}

.section-icon {
  color: #495057;
  font-size: 1.5rem;
}

.section-header h3 {
  margin: 0;
  color: #495057;
  font-size: 1.25rem;
  font-weight: 600;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  padding: 2rem;
}

.insights-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
  padding: 2rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field.full-width {
  grid-column: 1 / -1;
}

.field label {
  font-weight: 500;
  color: #495057;
  font-size: 0.9rem;
}

.char-count {
  color: #6c757d;
  font-size: 0.75rem;
  text-align: right;
}

.p-error {
  color: #dc3545;
  font-size: 0.8rem;
}

/* Purchase Reason Options */
.reason-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 0.5rem;
}

.reason-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  border: 2px solid #e9ecef;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.reason-option:hover {
  border-color: #3b82f6;
  background: #f8faff;
}

.reason-option.selected {
  border-color: #3b82f6;
  background: #eff6ff;
  color: #1d4ed8;
}

.reason-option i {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.reason-option span {
  font-weight: 500;
  font-size: 0.9rem;
}

/* Purchase Breakdown Visualization */
.purchase-breakdown {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 0.5rem;
}

.breakdown-item {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 1rem;
  align-items: center;
}

.breakdown-bar {
  height: 20px;
  background: #e9ecef;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
}

.breakdown-fill {
  height: 100%;
  border-radius: 10px;
  transition: width 0.5s ease;
}

.breakdown-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  text-align: right;
  min-width: 120px;
}

.breakdown-label {
  font-weight: 500;
  color: #495057;
  font-size: 0.85rem;
}

.breakdown-value {
  color: #6c757d;
  font-size: 0.8rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
    padding: 1rem;
  }
  
  .insights-grid {
    grid-template-columns: 1fr;
    padding: 1rem;
  }

  .reason-options {
    grid-template-columns: 1fr;
  }

  .breakdown-item {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .breakdown-info {
    align-items: flex-start;
    text-align: left;
  }
}

/* Input styling */
:deep(.p-dropdown),
:deep(.p-inputnumber),
:deep(.p-inputtextarea) {
  width: 100%;
}

:deep(.p-inputtextarea) {
  resize: vertical;
  min-height: 80px;
}

:deep(.p-dropdown-panel) {
  max-height: 200px;
}
</style>