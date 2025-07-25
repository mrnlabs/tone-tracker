<template>
  <div class="lead-analytics">
    <!-- Header Section -->
    <Card class="analytics-header">
      <template #header>
        <div class="header-section">
          <div class="header-info">
            <i class="pi pi-chart-bar header-icon"></i>
            <div>
              <h2>Lead Intelligence Dashboard</h2>
              <p>Comprehensive insights from promoter interactions</p>
            </div>
          </div>
          <div class="header-actions">
            <Button
              icon="pi pi-refresh"
              @click="refreshAnalytics"
              :loading="loading"
              class="p-button-outlined"
              v-tooltip.top="'Refresh Data'"
            />
            <Button
              icon="pi pi-download"
              @click="exportAnalytics"
              class="p-button-outlined"
              v-tooltip.top="'Export Report'"
            />
          </div>
        </div>
      </template>
    </Card>

    <!-- Summary Cards -->
    <div class="summary-grid">
      <Card class="summary-card high-intent">
        <template #content>
          <div class="summary-content">
            <div class="summary-icon">
              <i class="pi pi-shopping-cart"></i>
            </div>
            <div class="summary-details">
              <h3>{{ highIntentLeads.length }}</h3>
              <p>High Purchase Intent</p>
              <small>Intent Level 4-5</small>
            </div>
            <Button
              label="View"
              icon="pi pi-eye"
              @click="showHighIntentLeads"
              class="p-button-sm p-button-outlined view-btn"
            />
          </div>
        </template>
      </Card>

      <Card class="summary-card low-awareness">
        <template #content>
          <div class="summary-content">
            <div class="summary-icon">
              <i class="pi pi-eye-slash"></i>
            </div>
            <div class="summary-details">
              <h3>{{ lowAwarenessLeads.length }}</h3>
              <p>Low Brand Awareness</p>
              <small>Awareness Level 1-2</small>
            </div>
            <Button
              label="View"
              icon="pi pi-eye"
              @click="showLowAwarenessLeads"
              class="p-button-sm p-button-outlined view-btn"
            />
          </div>
        </template>
      </Card>

      <Card class="summary-card competitor-mentions">
        <template #content>
          <div class="summary-content">
            <div class="summary-icon">
              <i class="pi pi-flag"></i>
            </div>
            <div class="summary-details">
              <h3>{{ competitorLeads.length }}</h3>
              <p>Competitor Mentions</p>
              <small>Intelligence Available</small>
            </div>
            <Button
              label="View"
              icon="pi pi-eye"
              @click="showCompetitorLeads"
              class="p-button-sm p-button-outlined view-btn"
            />
          </div>
        </template>
      </Card>

      <Card class="summary-card high-engagement">
        <template #content>
          <div class="summary-content">
            <div class="summary-icon">
              <i class="pi pi-heart"></i>
            </div>
            <div class="summary-details">
              <h3>{{ highEngagementLeads.length }}</h3>
              <p>High Engagement</p>
              <small>Quality Level 4-5</small>
            </div>
            <Button
              label="View"
              icon="pi pi-eye"
              @click="showHighEngagementLeads"
              class="p-button-sm p-button-outlined view-btn"
            />
          </div>
        </template>
      </Card>
    </div>

    <!-- Analytics Tabs -->
    <TabView class="analytics-tabs">
      <!-- Intent Analysis -->
      <TabPanel header="Purchase Intent Analysis">
        <div class="tab-content">
          <div class="analysis-grid">
            <Card class="chart-card">
              <template #header>
                <h3>Purchase Intent Distribution</h3>
              </template>
              <template #content>
                <div class="intent-distribution">
                  <div 
                    v-for="level in intentLevels" 
                    :key="level.value"
                    class="intent-level"
                  >
                    <div class="level-header">
                      <span class="level-label">{{ level.label }}</span>
                      <span class="level-count">{{ level.count }}</span>
                    </div>
                    <ProgressBar 
                      :value="level.percentage" 
                      :showValue="false"
                      :class="'level-' + level.value"
                    />
                    <small>{{ level.percentage }}% of leads</small>
                  </div>
                </div>
              </template>
            </Card>

            <Card class="insights-card">
              <template #header>
                <h3>High Intent Leads</h3>
              </template>
              <template #content>
                <div class="lead-list">
                  <div 
                    v-for="lead in highIntentLeads.slice(0, 5)" 
                    :key="lead.id"
                    class="lead-item"
                  >
                    <Avatar 
                      :label="getInitials(lead.name, lead.surname)"
                      size="normal"
                      shape="circle"
                      class="lead-avatar"
                    />
                    <div class="lead-info">
                      <strong>{{ lead.name }} {{ lead.surname }}</strong>
                      <p>{{ lead.promoterComments?.purchaseIntentComments || 'No comments' }}</p>
                    </div>
                    <Rating 
                      :modelValue="lead.promoterComments?.purchaseIntentLevel" 
                      :readonly="true" 
                      :stars="5" 
                      :cancel="false"
                      class="mini-rating"
                    />
                  </div>
                </div>
                <Button
                  v-if="highIntentLeads.length > 5"
                  label="View All"
                  icon="pi pi-arrow-right"
                  @click="showHighIntentLeads"
                  class="p-button-text view-all-btn"
                />
              </template>
            </Card>
          </div>
        </div>
      </TabPanel>

      <!-- Brand Awareness -->
      <TabPanel header="Brand Awareness">
        <div class="tab-content">
          <div class="analysis-grid">
            <Card class="chart-card">
              <template #header>
                <h3>Brand Awareness Levels</h3>
              </template>
              <template #content>
                <div class="awareness-distribution">
                  <div 
                    v-for="level in awarenessLevels" 
                    :key="level.value"
                    class="awareness-level"
                  >
                    <div class="level-header">
                      <span class="level-label">{{ level.label }}</span>
                      <span class="level-count">{{ level.count }}</span>
                    </div>
                    <ProgressBar 
                      :value="level.percentage" 
                      :showValue="false"
                      :class="'awareness-' + level.value"
                    />
                    <small>{{ level.percentage }}% of leads</small>
                  </div>
                </div>
              </template>
            </Card>

            <Card class="insights-card">
              <template #header>
                <h3>Education Opportunities</h3>
              </template>
              <template #content>
                <div class="lead-list">
                  <div 
                    v-for="lead in lowAwarenessLeads.slice(0, 5)" 
                    :key="lead.id"
                    class="lead-item"
                  >
                    <Avatar 
                      :label="getInitials(lead.name, lead.surname)"
                      size="normal"
                      shape="circle"
                      class="lead-avatar low-awareness-avatar"
                    />
                    <div class="lead-info">
                      <strong>{{ lead.name }} {{ lead.surname }}</strong>
                      <p>{{ lead.promoterComments?.brandAwarenessComments || 'No comments' }}</p>
                    </div>
                    <Tag
                      :value="'Level ' + lead.promoterComments?.brandAwarenessLevel"
                      severity="warning"
                      class="awareness-tag"
                    />
                  </div>
                </div>
                <Button
                  v-if="lowAwarenessLeads.length > 5"
                  label="View All"
                  icon="pi pi-arrow-right"
                  @click="showLowAwarenessLeads"
                  class="p-button-text view-all-btn"
                />
              </template>
            </Card>
          </div>
        </div>
      </TabPanel>

      <!-- Competitive Intelligence -->
      <TabPanel header="Competitive Intelligence">
        <div class="tab-content">
          <div class="analysis-grid">
            <Card class="chart-card">
              <template #header>
                <h3>Competitor Landscape</h3>
              </template>
              <template #content>
                <div class="competitor-analysis">
                  <div 
                    v-for="competitor in competitorAnalysis" 
                    :key="competitor.name"
                    class="competitor-item"
                  >
                    <div class="competitor-header">
                      <span class="competitor-name">{{ competitor.name }}</span>
                      <span class="mention-count">{{ competitor.mentions }} mentions</span>
                    </div>
                    <div class="competitor-insights">
                      <div 
                        v-for="insight in competitor.insights.slice(0, 2)" 
                        :key="insight"
                        class="insight-item"
                      >
                        {{ insight }}
                      </div>
                    </div>
                  </div>
                </div>
              </template>
            </Card>

            <Card class="insights-card">
              <template #header>
                <h3>Recent Mentions</h3>
              </template>
              <template #content>
                <div class="lead-list">
                  <div 
                    v-for="lead in competitorLeads.slice(0, 5)" 
                    :key="lead.id"
                    class="lead-item"
                  >
                    <Avatar 
                      :label="getInitials(lead.name, lead.surname)"
                      size="normal"
                      shape="circle"
                      class="lead-avatar competitor-avatar"
                    />
                    <div class="lead-info">
                      <strong>{{ lead.name }} {{ lead.surname }}</strong>
                      <p>{{ lead.promoterComments?.competitorMentions }}</p>
                    </div>
                    <Tag
                      value="Competitive"
                      severity="danger"
                      class="competitor-tag"
                    />
                  </div>
                </div>
                <Button
                  v-if="competitorLeads.length > 5"
                  label="View All"
                  icon="pi pi-arrow-right"
                  @click="showCompetitorLeads"
                  class="p-button-text view-all-btn"
                />
              </template>
            </Card>
          </div>
        </div>
      </TabPanel>

      <!-- Follow-up Management -->
      <TabPanel header="Follow-up Management">
        <div class="tab-content">
          <div class="followup-overview">
            <Card class="followup-summary">
              <template #header>
                <h3>Follow-up Status</h3>
              </template>
              <template #content>
                <div class="followup-stats">
                  <div class="stat-item">
                    <span class="stat-number">{{ followUpRequired.length }}</span>
                    <span class="stat-label">Requires Follow-up</span>
                  </div>
                  <div class="stat-item urgent">
                    <span class="stat-number">{{ urgentFollowUps.length }}</span>
                    <span class="stat-label">Urgent</span>
                  </div>
                </div>
                <Button
                  label="Manage Follow-ups"
                  icon="pi pi-calendar"
                  @click="$router.push('/follow-ups')"
                  class="p-button-outlined manage-btn"
                />
              </template>
            </Card>
          </div>
        </div>
      </TabPanel>
    </TabView>

    <!-- Detailed View Dialog -->
    <Dialog
      v-model:visible="showDetailDialog"
      :header="detailDialogTitle"
      :modal="true"
      :style="{ width: '90vw', maxWidth: '1200px' }"
      class="detail-dialog"
    >
      <DataTable
        :value="detailLeads"
        :paginator="true"
        :rows="10"
        :loading="detailLoading"
        class="detail-table"
      >
        <Column field="name" header="Name">
          <template #body="{ data }">
            <div class="lead-name-cell">
              <strong>{{ data.name }} {{ data.surname }}</strong>
              <small>{{ data.email }}</small>
            </div>
          </template>
        </Column>
        
        <Column v-if="detailType === 'intent'" field="purchaseIntent" header="Purchase Intent">
          <template #body="{ data }">
            <div class="intent-cell">
              <Rating 
                :modelValue="data.promoterComments?.purchaseIntentLevel" 
                :readonly="true" 
                :stars="5" 
                :cancel="false"
                class="mini-rating"
              />
              <p>{{ data.promoterComments?.purchaseIntentComments }}</p>
            </div>
          </template>
        </Column>
        
        <Column v-if="detailType === 'awareness'" field="brandAwareness" header="Brand Awareness">
          <template #body="{ data }">
            <div class="awareness-cell">
              <Tag
                :value="'Level ' + data.promoterComments?.brandAwarenessLevel"
                :severity="data.promoterComments?.brandAwarenessLevel <= 2 ? 'warning' : 'success'"
              />
              <p>{{ data.promoterComments?.brandAwarenessComments }}</p>
            </div>
          </template>
        </Column>
        
        <Column v-if="detailType === 'competitor'" field="competitors" header="Competitor Mentions">
          <template #body="{ data }">
            <p>{{ data.promoterComments?.competitorMentions }}</p>
          </template>
        </Column>
        
        <Column v-if="detailType === 'engagement'" field="engagement" header="Engagement Quality">
          <template #body="{ data }">
            <div class="engagement-cell">
              <Tag 
                :value="leadService.getEngagementQualityLabel(data.promoterComments?.engagementQuality)"
                :severity="getEngagementSeverity(data.promoterComments?.engagementQuality)"
              />
              <p>{{ data.promoterComments?.promoterObservations }}</p>
            </div>
          </template>
        </Column>
        
        <Column field="activation" header="Activation">
          <template #body="{ data }">
            {{ data.activation?.name || 'N/A' }}
          </template>
        </Column>
      </DataTable>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import Card from 'primevue/card'
import Button from 'primevue/button'
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'
import ProgressBar from 'primevue/progressbar'
import Avatar from 'primevue/avatar'
import Rating from 'primevue/rating'
import Tag from 'primevue/tag'
import Dialog from 'primevue/dialog'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import leadService from '@/services/leadService'

// Composables
const router = useRouter()
const toast = useToast()

// Reactive data
const loading = ref(false)
const highIntentLeads = ref([])
const lowAwarenessLeads = ref([])
const competitorLeads = ref([])
const highEngagementLeads = ref([])
const followUpRequired = ref([])

const showDetailDialog = ref(false)
const detailDialogTitle = ref('')
const detailLeads = ref([])
const detailLoading = ref(false)
const detailType = ref('')

// Computed properties
const intentLevels = computed(() => {
  const allLeads = [...highIntentLeads.value, ...lowAwarenessLeads.value, ...competitorLeads.value, ...highEngagementLeads.value]
  const totalWithIntent = allLeads.filter(lead => lead.promoterComments?.purchaseIntentLevel).length
  
  const levels = []
  for (let i = 1; i <= 5; i++) {
    const count = allLeads.filter(lead => lead.promoterComments?.purchaseIntentLevel === i).length
    levels.push({
      value: i,
      label: leadService.getPurchaseIntentLevelLabel(i),
      count,
      percentage: totalWithIntent > 0 ? Math.round((count / totalWithIntent) * 100) : 0
    })
  }
  
  return levels
})

const awarenessLevels = computed(() => {
  const allLeads = [...highIntentLeads.value, ...lowAwarenessLeads.value, ...competitorLeads.value, ...highEngagementLeads.value]
  const totalWithAwareness = allLeads.filter(lead => lead.promoterComments?.brandAwarenessLevel).length
  
  const levels = []
  for (let i = 1; i <= 5; i++) {
    const count = allLeads.filter(lead => lead.promoterComments?.brandAwarenessLevel === i).length
    levels.push({
      value: i,
      label: leadService.getBrandAwarenessLevelLabel(i),
      count,
      percentage: totalWithAwareness > 0 ? Math.round((count / totalWithAwareness) * 100) : 0
    })
  }
  
  return levels
})

const competitorAnalysis = computed(() => {
  const competitors = {}
  
  competitorLeads.value.forEach(lead => {
    const mentions = lead.promoterComments?.competitorMentions
    if (mentions) {
      // Simple competitor extraction (can be enhanced)
      const competitorNames = mentions.split(/[,\s]+/).filter(name => name.length > 2)
      competitorNames.forEach(name => {
        const cleanName = name.replace(/[^a-zA-Z\s]/g, '').trim()
        if (cleanName) {
          if (!competitors[cleanName]) {
            competitors[cleanName] = {
              name: cleanName,
              mentions: 0,
              insights: []
            }
          }
          competitors[cleanName].mentions++
          if (mentions.length > 20) {
            competitors[cleanName].insights.push(mentions.substring(0, 100) + '...')
          }
        }
      })
    }
  })
  
  return Object.values(competitors).sort((a, b) => b.mentions - a.mentions).slice(0, 5)
})

const urgentFollowUps = computed(() => {
  return followUpRequired.value.filter(lead => {
    const comments = lead.promoterComments
    return comments && (
      (comments.purchaseIntentLevel >= 4 && comments.engagementQuality >= 4) ||
      comments.competitorMentions
    )
  })
})

// Methods
const loadAnalyticsData = async () => {
  loading.value = true
  try {
    // Load all analytics data in parallel
    const [highIntent, lowAwareness, competitors, highEngagement, followUps] = await Promise.all([
      leadService.getHighPurchaseIntentLeads(4),
      leadService.getLowBrandAwarenessLeads(2),
      leadService.getCompetitorMentionLeads(),
      leadService.getHighEngagementLeads(4),
      leadService.getFollowUpRequiredLeads()
    ])
    
    highIntentLeads.value = Array.isArray(highIntent) ? highIntent : highIntent.content || []
    lowAwarenessLeads.value = Array.isArray(lowAwareness) ? lowAwareness : lowAwareness.content || []
    competitorLeads.value = Array.isArray(competitors) ? competitors : competitors.content || []
    highEngagementLeads.value = Array.isArray(highEngagement) ? highEngagement : highEngagement.content || []
    followUpRequired.value = Array.isArray(followUps) ? followUps : followUps.content || []
    
  } catch (error) {
    console.error('Error loading analytics data:', error)
    toast.add({
      severity: 'error',
      summary: 'Loading Error',
      detail: 'Failed to load analytics data',
      life: 5000
    })
  } finally {
    loading.value = false
  }
}

const refreshAnalytics = () => {
  loadAnalyticsData()
}

const exportAnalytics = () => {
  toast.add({
    severity: 'info',
    summary: 'Export',
    detail: 'Analytics export functionality coming soon',
    life: 3000
  })
}

const showHighIntentLeads = () => {
  detailDialogTitle.value = 'High Purchase Intent Leads'
  detailLeads.value = highIntentLeads.value
  detailType.value = 'intent'
  showDetailDialog.value = true
}

const showLowAwarenessLeads = () => {
  detailDialogTitle.value = 'Low Brand Awareness Leads'
  detailLeads.value = lowAwarenessLeads.value
  detailType.value = 'awareness'
  showDetailDialog.value = true
}

const showCompetitorLeads = () => {
  detailDialogTitle.value = 'Leads with Competitor Mentions'
  detailLeads.value = competitorLeads.value
  detailType.value = 'competitor'
  showDetailDialog.value = true
}

const showHighEngagementLeads = () => {
  detailDialogTitle.value = 'High Engagement Quality Leads'
  detailLeads.value = highEngagementLeads.value
  detailType.value = 'engagement'
  showDetailDialog.value = true
}

const getInitials = (firstName, lastName) => {
  return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`
}

const getEngagementSeverity = (level) => {
  if (!level) return 'secondary'
  if (level >= 4) return 'success'
  if (level >= 3) return 'warning'
  return 'danger'
}

// Lifecycle
onMounted(() => {
  loadAnalyticsData()
})
</script>

<style scoped>
.lead-analytics {
  padding: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
}

.analytics-header {
  margin-bottom: 2rem;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 0.5rem;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-icon {
  font-size: 2.5rem;
  opacity: 0.9;
}

.header-info h2 {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 600;
}

.header-info p {
  margin: 0;
  opacity: 0.9;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.summary-card {
  border-radius: 0.75rem;
  transition: all 0.3s ease;
}

.summary-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.summary-card.high-intent {
  border-left: 4px solid #10b981;
}

.summary-card.low-awareness {
  border-left: 4px solid #f59e0b;
}

.summary-card.competitor-mentions {
  border-left: 4px solid #ef4444;
}

.summary-card.high-engagement {
  border-left: 4px solid #8b5cf6;
}

.summary-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
}

.summary-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
}

.high-intent .summary-icon {
  background: linear-gradient(135deg, #10b981, #059669);
}

.low-awareness .summary-icon {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.competitor-mentions .summary-icon {
  background: linear-gradient(135deg, #ef4444, #dc2626);
}

.high-engagement .summary-icon {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
}

.summary-details {
  flex: 1;
}

.summary-details h3 {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
}

.summary-details p {
  margin: 0;
  font-weight: 600;
  color: #374151;
}

.summary-details small {
  color: #6b7280;
}

.view-btn {
  align-self: flex-start;
}

.analytics-tabs {
  margin-top: 2rem;
}

.tab-content {
  padding: 1.5rem 0;
}

.analysis-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.chart-card,
.insights-card {
  height: fit-content;
}

.intent-distribution,
.awareness-distribution {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.intent-level,
.awareness-level {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.level-header {
  display: flex;
  justify-content: between;
  align-items: center;
}

.level-label {
  font-weight: 500;
  color: #374151;
}

.level-count {
  font-weight: 600;
  color: #111827;
}

:deep(.level-5 .p-progressbar-value) {
  background: #10b981;
}

:deep(.level-4 .p-progressbar-value) {
  background: #3b82f6;
}

:deep(.level-3 .p-progressbar-value) {
  background: #f59e0b;
}

:deep(.level-2 .p-progressbar-value) {
  background: #ef4444;
}

:deep(.level-1 .p-progressbar-value) {
  background: #6b7280;
}

:deep(.awareness-5 .p-progressbar-value) {
  background: #10b981;
}

:deep(.awareness-4 .p-progressbar-value) {
  background: #3b82f6;
}

:deep(.awareness-3 .p-progressbar-value) {
  background: #f59e0b;
}

:deep(.awareness-2 .p-progressbar-value) {
  background: #ef4444;
}

:deep(.awareness-1 .p-progressbar-value) {
  background: #6b7280;
}

.lead-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.lead-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 0.5rem;
}

.lead-avatar {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  flex-shrink: 0;
}

.low-awareness-avatar {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.competitor-avatar {
  background: linear-gradient(135deg, #ef4444, #dc2626);
}

.lead-info {
  flex: 1;
}

.lead-info strong {
  display: block;
  color: #111827;
  margin-bottom: 0.25rem;
}

.lead-info p {
  margin: 0;
  color: #6b7280;
  font-size: 0.875rem;
  line-height: 1.4;
}

.mini-rating {
  scale: 0.8;
}

.view-all-btn {
  align-self: flex-start;
  margin-top: 1rem;
}

.competitor-analysis {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.competitor-item {
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 0.5rem;
  border-left: 4px solid #ef4444;
}

.competitor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.competitor-name {
  font-weight: 600;
  color: #111827;
}

.mention-count {
  font-size: 0.875rem;
  color: #6b7280;
  background: white;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
}

.competitor-insights {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.insight-item {
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.4;
}

.followup-overview {
  display: flex;
  justify-content: center;
}

.followup-summary {
  max-width: 400px;
  width: 100%;
}

.followup-stats {
  display: flex;
  gap: 2rem;
  justify-content: center;
  margin-bottom: 2rem;
}

.stat-item {
  text-align: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 0.5rem;
  min-width: 100px;
}

.stat-item.urgent {
  background: #fef2f2;
  border: 1px solid #fecaca;
}

.stat-number {
  display: block;
  font-size: 2rem;
  font-weight: 700;
  line-height: 1;
  color: #111827;
}

.stat-label {
  display: block;
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.manage-btn {
  width: 100%;
}

.detail-dialog :deep(.p-dialog-content) {
  padding: 1rem;
}

.detail-table {
  margin-top: 1rem;
}

.lead-name-cell strong {
  display: block;
  color: #111827;
}

.lead-name-cell small {
  color: #6b7280;
  font-size: 0.75rem;
}

.intent-cell,
.awareness-cell,
.engagement-cell {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.intent-cell p,
.awareness-cell p,
.engagement-cell p {
  margin: 0;
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.4;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .analysis-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .lead-analytics {
    padding: 1rem;
  }
  
  .header-section {
    flex-direction: column;
    align-items: stretch;
    gap: 1.5rem;
    text-align: center;
  }
  
  .summary-grid {
    grid-template-columns: 1fr;
  }
  
  .summary-content {
    flex-direction: column;
    text-align: center;
  }
  
  .followup-stats {
    flex-direction: column;
    gap: 1rem;
  }
  
  .lead-item {
    flex-direction: column;
    text-align: center;
  }
}
</style>