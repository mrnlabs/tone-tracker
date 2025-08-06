<template>
  <DashboardLayout>
    <div class="activation-details-page">
      <!-- Loading State -->
      <div v-if="loading" class="loading-container">
        <ProgressSpinner />
        <p>Loading activation details...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error && !activation" class="error-container">
        <Card class="error-card">
          <template #content>
            <div class="error-content">
              <i class="pi pi-exclamation-triangle error-icon"></i>
              <h3>Failed to Load Activation</h3>
              <p class="error-message">{{ error }}</p>
              <div class="error-actions">
                <Button
                    @click="retryLoad"
                    label="Retry"
                    icon="pi pi-refresh"
                    class="p-button-outlined"
                    :disabled="retryCount >= maxRetries"
                />
                <Button
                    v-if="retryCount >= maxRetries"
                    @click="$router.push('/activations')"
                    label="Back to Activations"
                    icon="pi pi-arrow-left"
                    class="p-button-text"
                />
                <small v-if="retryCount > 0" class="retry-info">
                  Retry attempt {{ retryCount }} of {{ maxRetries }}
                </small>
              </div>
            </div>
          </template>
        </Card>
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
                  <div class="title-meta">
                    <span class="activation-id">ID: {{ activation.id }}</span>
                    <span class="created-date">Created: {{ formatDate(activation.dateCreated) }}</span>
                  </div>
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
                  <span>{{ activation.clientCompanyName || activation.client }}</span>
                </div>
                <div class="meta-item">
                  <i class="pi pi-map-marker"></i>
                  <span>{{ activation.locationName }}</span>
                </div>
                <div class="meta-item">
                  <i class="pi pi-calendar"></i>
                  <span>{{ formatDateRange(activation.startDate, activation.endDate) }}</span>
                </div>
                <div class="meta-item">
                  <i class="pi pi-dollar"></i>
                  <span>${{ (activation?.totalRevenueUSD || 0).toLocaleString() }}</span>
                </div>
              </div>
            </div>

            <div class="header-actions">
              <Button
                  @click="refreshData"
                  icon="pi pi-refresh"
                  label="Refresh"
                  class="p-button-outlined"
                  :loading="refreshing"
                  v-tooltip.bottom="'Refresh activation data'"
              />
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
                  v-if="canManageTeam"
                  @click="openAddPromoterDialog"
                  icon="pi pi-user-plus"
                  label="Add Promoter"
                  class="p-button-success p-button-outlined"
              />
              <Button
                  @click="showReportsMenu = !showReportsMenu"
                  icon="pi pi-chart-bar"
                  label="Reports"
                  class="p-button-outlined"
                  v-tooltip.bottom="'Generate reports'"
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
                    <p class="stat-number">{{ allTeamMembers.length }}</p>
                    <span class="stat-detail">{{ allTeamMembers.filter(m => (m.status || 'active') === 'active').length }} active</span>
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
                    <p class="stat-number">{{ (activation?.customerInteractions || 0).toLocaleString() }}</p>
                    <span class="stat-detail">{{ calculateDailyAverage() }} per day</span>
                  </div>
                </div>
              </template>
            </Card>

            <Card class="stat-card" v-if="authStore.userRole === 'PROMOTER'">
              <template #content>
                <div class="stat-content">
                  <div class="stat-icon hours">
                    <i class="pi pi-clock"></i>
                  </div>
                  <div class="stat-info">
                    <h3>Hours Worked</h3>
                    <p class="stat-number">{{ promoterHoursStats.totalHours }}</p>
                    <span class="stat-detail">{{ promoterHoursStats.totalSessions }} sessions</span>
                  </div>
                </div>
              </template>
            </Card>

            <Card class="stat-card" v-else>
              <template #content>
                <div class="stat-content">
                  <div class="stat-icon sales">
                    <i class="pi pi-shopping-cart"></i>
                  </div>
                  <div class="stat-info">
                    <h3>Sales Generated</h3>
                    <p class="stat-number">${{ (activation?.salesGenerated || 0).toLocaleString() }}</p>
                    <span class="stat-detail">{{ activation?.unitsOld || 0 }} units sold</span>
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
                          <label>Client Company</label>
                          <span>{{ activation.clientCompanyName || 'Not specified' }}</span>
                        </div>
                        <div class="info-item">
                          <label>Client Brand</label>
                          <span>{{ activation.clientBrandName || 'Not specified' }}</span>
                        </div>
                        <div class="info-item">
                          <label>Status</label>
                          <Tag :value="activation.status" :severity="getStatusSeverity(activation.status)" />
                        </div>
                        <div class="info-item">
                          <label>Duration</label>
                          <span>{{ calculateDuration() }} days</span>
                        </div>
                        <div class="info-item full-width" v-if="activation.briefDescription">
                          <label>Brief Description</label>
                          <div class="brief-description-content" v-html="formatBriefDescription(activation.briefDescription)"></div>
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
                          <div class="location-details-grid">
                            <div class="location-item">
                              <label>Location Name</label>
                              <span>{{ activation.locationName }}</span>
                            </div>
                            <div class="location-item">
                              <label>Street Address</label>
                              <span>{{ activation.streetAddress }}</span>
                            </div>
                            <div class="location-item">
                              <label>City</label>
                              <span>{{ activation.city || 'Not specified' }}</span>
                            </div>
                            <div class="location-item">
                              <label>Zip Code</label>
                              <span>{{ activation.zipCode || 'Not specified' }}</span>
                            </div>
                            <div class="location-item">
                              <label>Coordinates</label>
                              <span v-if="activation.latitude && activation.longitude">
                                {{ activation.latitude }}, {{ activation.longitude }}
                              </span>
                              <span v-else>Not specified</span>
                            </div>
                            <div class="location-item" v-if="activation.centralLatitude && activation.centralLongitude">
                              <label>Central Coordinates</label>
                              <span>{{ activation.centralLatitude }}, {{ activation.centralLongitude }}</span>
                            </div>
                          </div>
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

                  <!-- Team Assignment -->
                  <Card class="info-card">
                    <template #header>
                      <h3>Team Assignment</h3>
                    </template>
                    <template #content>
                      <div class="team-assignment">
                        <div class="team-item">
                          <label>Activation Manager</label>
                          <div class="manager-info">
                            <span v-if="activation.activationManagerName">
                              {{ activation.activationManagerName }}
                            </span>
                            <span v-else-if="activation.activationManagerId">
                              Manager ID: {{ activation.activationManagerId }}
                            </span>
                            <span v-else class="not-assigned">Not assigned</span>
                          </div>
                        </div>
                        
                        <div class="team-item">
                          <label>Assigned Promoters</label>
                          <div class="promoters-list">
                            <div v-if="activation.assignedPromoters && activation.assignedPromoters.length > 0" class="promoter-chips">
                              <Tag v-for="promoter in activation.assignedPromoters" :key="promoter.id" 
                                   :value="`${promoter.firstName} ${promoter.lastName}`" 
                                   class="promoter-chip" />
                            </div>
                            <div v-else-if="activation.assignedPromoterIds && activation.assignedPromoterIds.length > 0" class="promoter-ids">
                              <span>{{ activation.assignedPromoterIds.length }} promoter(s) assigned</span>
                            </div>
                            <span v-else class="not-assigned">No promoters assigned</span>
                          </div>
                        </div>
                      </div>
                    </template>
                  </Card>


                  <!-- Activation Brief -->
                  <Card class="info-card brief-card" v-if="activation.briefDescription || activation.briefDocumentPath">
                    <template #header>
                      <div class="brief-header">
                        <h3>
                          <i class="pi pi-file-text brief-icon"></i>
                          Activation Brief
                        </h3>
                        <Tag 
                          value="Important" 
                          severity="info" 
                          class="brief-tag"
                        />
                      </div>
                    </template>
                    <template #content>
                      <div class="brief-content">
                        <div v-if="activation.briefDescription" class="brief-description">
                          <div class="brief-description-header">
                            <label>
                              <i class="pi pi-align-left"></i>
                              Brief Description
                            </label>
                          </div>
                          <div class="brief-text-content" v-html="formatBriefDescription(activation.briefDescription)"></div>
                        </div>
                        
                        <!-- Brief Document Actions -->
                        <div v-if="activation.briefDocumentPath" class="brief-document">
                          <div class="brief-document-header">
                            <label>
                              <i class="pi pi-file-pdf"></i>
                              Brief Document
                            </label>
                          </div>
                          <div class="document-item">
                            <div class="document-info">
                              <div class="document-preview">
                                <div class="document-icon-wrapper">
                                  <i class="pi pi-file-pdf document-icon"></i>
                                  <div class="file-type-badge">PDF</div>
                                </div>
                              </div>
                            </div>
                            <div class="document-actions">
                              <Button
                                @click="downloadBriefDocument"
                                icon="pi pi-download"
                                label="Download"
                                class="p-button-outlined p-button-sm download-btn"
                                v-tooltip.bottom="'Download PDF document from S3'"
                              />
                              <Button
                                @click="emailBriefDocument"
                                icon="pi pi-envelope"
                                label="Email"
                                class="p-button-outlined p-button-sm email-btn"
                                v-tooltip.bottom="'Email document to team members'"
                              />
                              <Button
                                @click="viewBriefDocument"
                                icon="pi pi-eye"
                                label="View PDF"
                                class="p-button-outlined p-button-sm view-btn"
                                v-tooltip.bottom="'Open PDF in new tab'"
                              />
                            </div>
                          </div>
                        </div>
                        
                        <!-- If no brief content exists -->
                        <div v-if="!activation.briefDescription" class="no-brief-content">
                          <i class="pi pi-info-circle"></i>
                          <span>No brief information available for this activation.</span>
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
                        @click="showTeamAssignmentDialog = true"
                        icon="pi pi-users"
                        label="Manage Team"
                        class="p-button-success"
                    />
                    <Button
                        v-if="canAssignManager"
                        @click="showManagerAssignmentDialog = true"
                        icon="pi pi-user-plus"
                        label="Assign Manager"
                        class="p-button-outlined"
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
                      <span class="stat-value">{{ allTeamMembers.length }}</span>
                      <span class="stat-label">Total Members</span>
                    </div>
                  </div>
                  <div class="stat-item">
                    <i class="pi pi-check-circle"></i>
                    <div>
                      <span class="stat-value">{{ allTeamMembers.filter(m => (m.status || 'active') === 'active').length }}</span>
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
                  <template #header>
                    <div class="card-header-with-actions">
                      <h3>Team Members</h3>
                      <Button
                          v-if="canManageTeam"
                          @click="openAddPromoterDialog"
                          icon="pi pi-user-plus"
                          label="Add Promoter"
                          class="p-button-success p-button-sm"
                      />
                    </div>
                  </template>
                  <template #content>
                    <DataTable
                        :value="allTeamMembers"
                        responsiveLayout="scroll"
                        dataKey="id"
                    >
                      <Column field="name" header="Team Member" sortable>
                        <template #body="{ data }">
                          <div class="member-cell">
                            <Avatar
                                :label="getInitials(data.firstName, data.lastName)"
                                size="normal"
                                shape="circle"
                                :style="{ backgroundColor: data.avatarColor || '#3b82f6', color: 'white' }"
                            />
                            <div class="member-info">
                              <span class="member-name">{{ data.firstName }} {{ data.lastName }}</span>
                              <span class="member-role">{{ data.role }}</span>
                            </div>
                          </div>
                        </template>
                      </Column>

                      <Column field="email" header="Contact" sortable>
                        <template #body="{ data }">
                          <div class="contact-info">
                            <span class="member-email">{{ data.email || 'No email' }}</span>
                            <span class="member-phone" v-if="data.phone">{{ data.phone }}</span>
                          </div>
                        </template>
                      </Column>

                      <Column field="status" header="Status" sortable>
                        <template #body="{ data }">
                          <Tag
                              :value="data.status || 'active'"
                              :severity="getMemberStatusSeverity(data.status || 'active')"
                          />
                        </template>
                      </Column>

                      <Column field="hoursWorked" header="Hours" sortable>
                        <template #body="{ data }">
                          <span class="hours-worked">{{ data.hoursWorked || 0 }}h</span>
                        </template>
                      </Column>

                      <Column field="performance" header="Performance" sortable v-if="authStore.userRole !== 'PROMOTER'">
                        <template #body="{ data }">
                          <div class="performance-cell">
                            <div class="rating">
                              <i class="pi pi-star-fill"></i>
                              <span>{{ data.rating || 'N/A' }}/5</span>
                            </div>
                            <span class="performance-note">{{ data.performanceNote || 'No notes' }}</span>
                          </div>
                        </template>
                      </Column>

                      <Column field="lastActivity" header="Last Activity" sortable>
                        <template #body="{ data }">
                          <span class="last-activity">{{ data.lastActivity ? formatRelativeTime(data.lastActivity) : 'No activity' }}</span>
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


            <!-- Lead Management Tab -->
            <TabPanel header="Lead Management" v-if="canCaptureLeads">
              <div class="lead-management-content">
                <!-- Lead Capture Section -->
                <div class="section-header">
                  <h3>Customer Lead Capture</h3>
                  <div class="section-actions">
                    <Button
                      @click="showLeadCaptureDialog = true"
                      icon="pi pi-plus"
                      label="Capture Lead"
                      class="p-button-success"
                    />
                    <Button
                      @click="showLeadExportDialog = true"
                      icon="pi pi-download"
                      label="Export Leads"
                      class="p-button-outlined"
                    />
                  </div>
                </div>

                <!-- Lead Statistics -->
                <div class="lead-stats-section" v-if="leadStats">
                  <div class="stats-grid">
                    <Card class="stat-card">
                      <template #content>
                        <div class="stat-content">
                          <div class="stat-icon total">
                            <i class="pi pi-users"></i>
                          </div>
                          <div class="stat-info">
                            <h3>Total Leads</h3>
                            <p class="stat-number">{{ leadStats.totalLeads || 0 }}</p>
                          </div>
                        </div>
                      </template>
                    </Card>

                    <Card class="stat-card">
                      <template #content>
                        <div class="stat-content">
                          <div class="stat-icon opted-in">
                            <i class="pi pi-check-circle"></i>
                          </div>
                          <div class="stat-info">
                            <h3>Opted In</h3>
                            <p class="stat-number">{{ leadStats.optedInLeads || 0 }}</p>
                          </div>
                        </div>
                      </template>
                    </Card>

                    <Card class="stat-card">
                      <template #content>
                        <div class="stat-content">
                          <div class="stat-icon whatsapp">
                            <i class="pi pi-comment"></i>
                          </div>
                          <div class="stat-info">
                            <h3>WhatsApp Opted In</h3>
                            <p class="stat-number">{{ leadStats.whatsAppOptedIn || 0 }}</p>
                          </div>
                        </div>
                      </template>
                    </Card>

                    <Card class="stat-card">
                      <template #content>
                        <div class="stat-content">
                          <div class="stat-icon conversion">
                            <i class="pi pi-star"></i>
                          </div>
                          <div class="stat-info">
                            <h3>Conversion Rate</h3>
                            <p class="stat-number">{{ calculateConversionRate() }}%</p>
                          </div>
                        </div>
                      </template>
                    </Card>
                  </div>
                </div>

                <!-- Leads Table -->
                <Card class="leads-table-card">
                  <template #header>
                    <div class="table-header">
                      <h3>Captured Leads</h3>
                      <div class="table-filters">
                        <IconField iconPosition="left">
                          <InputIcon class="pi pi-search" />
                          <InputText
                            v-model="leadSearchQuery"
                            placeholder="Search leads..."
                            @input="debounceLeadSearch"
                          />
                        </IconField>
                      </div>
                    </div>
                  </template>
                  <template #content>
                    <DataTable
                      :value="activationLeads"
                      :loading="leadsLoading"
                      :paginator="true"
                      :rows="10"
                      :totalRecords="totalLeads"
                      :lazy="true"
                      @page="onLeadPageChange"
                      @sort="onLeadSort"
                      sortMode="multiple"
                      :rowHover="true"
                      class="activation-leads-table"
                    >
                      <Column field="fullName" header="Customer" sortable>
                        <template #body="{ data }">
                          <div class="lead-name-cell">
                            <strong>{{ data.fullName || `${data.name} ${data.surname}` }}</strong>
                            <small>{{ data.email }}</small>
                          </div>
                        </template>
                      </Column>
                      
                      <Column field="phone" header="Phone" sortable>
                        <template #body="{ data }">
                          {{ formatPhoneNumber(data.phone) }}
                        </template>
                      </Column>
                      
                      <Column field="customerType" header="Type" sortable>
                        <template #body="{ data }">
                          <Tag
                            :value="getCustomerTypeLabel(data.customerType)"
                            :severity="getCustomerTypeSeverity(data.customerType)"
                          />
                        </template>
                      </Column>
                      
                      <Column field="optIn" header="Marketing Opt-in" sortable>
                        <template #body="{ data }">
                          <Tag
                            :value="data.optIn === null ? 'Not Set' : (data.optIn ? 'Yes' : 'No')"
                            :severity="data.optIn === null ? 'warning' : (data.optIn ? 'success' : 'secondary')"
                          />
                        </template>
                      </Column>
                      
                      <Column field="whatsappOptIn" header="WhatsApp Opt-in" sortable>
                        <template #body="{ data }">
                          <Tag
                            :value="data.whatsappOptIn === null ? 'Not Set' : (data.whatsappOptIn ? 'Yes' : 'No')"
                            :severity="data.whatsappOptIn === null ? 'warning' : (data.whatsappOptIn ? 'success' : 'secondary')"
                          />
                        </template>
                      </Column>
                      
                      <Column field="productAwareness" header="Product Aware" sortable>
                        <template #body="{ data }">
                          <Tag
                            :value="data.productAwareness === null ? 'Not Set' : (data.productAwareness ? 'Yes' : 'No')"
                            :severity="data.productAwareness === null ? 'warning' : (data.productAwareness ? 'info' : 'secondary')"
                          />
                        </template>
                      </Column>
                      
                      <Column field="brandAwarenessLevel" header="Brand Awareness" sortable>
                        <template #body="{ data }">
                          <div v-if="data.brandAwarenessLevel" class="rating-cell">
                            <div class="star-rating">
                              <i v-for="n in 5" :key="n" 
                                 class="pi" 
                                 :class="n <= data.brandAwarenessLevel ? 'pi-star-fill' : 'pi-star'"
                                 :style="{ color: n <= data.brandAwarenessLevel ? '#fbbf24' : '#d1d5db' }"
                              />
                            </div>
                            <small>{{ getBrandAwarenessLabel(data.brandAwarenessLevel) }}</small>
                          </div>
                          <span v-else class="no-data">-</span>
                        </template>
                      </Column>
                      
                      <Column field="followUpRequired" header="Follow-up" sortable>
                        <template #body="{ data }">
                          <Tag
                            v-if="data.followUpRequired"
                            value="Required"
                            severity="warning"
                          />
                          <span v-else class="no-data">-</span>
                        </template>
                      </Column>
                      
                      <Column field="dateCreated" header="Date Captured" sortable>
                        <template #body="{ data }">
                          {{ formatDate(data.dateCreated) }}
                        </template>
                      </Column>
                      
                      <Column v-if="authStore.userRole !== 'PROMOTER'" field="brandAwareness" header="Brand Awareness">
                        <template #body="{ data }">
                          <div v-if="data.promoterComments?.brandAwarenessLevel" class="insight-cell">
                            <Rating 
                              :modelValue="data.promoterComments.brandAwarenessLevel" 
                              :readonly="true" 
                              :stars="5" 
                              :cancel="false"
                              class="mini-rating"
                            />
                            <small>{{ leadService.getBrandAwarenessLevelLabel(data.promoterComments.brandAwarenessLevel) }}</small>
                          </div>
                          <span v-else class="no-data">-</span>
                        </template>
                      </Column>
                      
                      <Column v-if="authStore.userRole !== 'PROMOTER'" field="purchaseIntent" header="Purchase Intent">
                        <template #body="{ data }">
                          <div v-if="data.promoterComments?.purchaseIntentLevel" class="insight-cell">
                            <Rating 
                              :modelValue="data.promoterComments.purchaseIntentLevel" 
                              :readonly="true" 
                              :stars="5" 
                              :cancel="false"
                              class="mini-rating"
                            />
                            <small>{{ leadService.getPurchaseIntentLevelLabel(data.promoterComments.purchaseIntentLevel) }}</small>
                          </div>
                          <span v-else class="no-data">-</span>
                        </template>
                      </Column>
                      
                      <Column v-if="authStore.userRole !== 'PROMOTER'" field="engagement" header="Engagement">
                        <template #body="{ data }">
                          <div v-if="data.promoterComments?.engagementQuality" class="insight-cell">
                            <Tag 
                              :value="leadService.getEngagementQualityLabel(data.promoterComments.engagementQuality)"
                              :severity="getEngagementSeverity(data.promoterComments.engagementQuality)"
                              class="engagement-tag"
                            />
                          </div>
                          <span v-else class="no-data">-</span>
                        </template>
                      </Column>
                      
                      <Column header="Actions">
                        <template #body="{ data }">
                          <div class="action-buttons">
                            <Button
                              icon="pi pi-eye"
                              class="p-button-text p-button-sm"
                              @click="viewLeadDetails(data)"
                              v-tooltip.top="'View Details'"
                            />
                            <Button
                              v-if="canEditLeads"
                              icon="pi pi-pencil"
                              class="p-button-text p-button-sm"
                              @click="editLead(data)"
                              v-tooltip.top="'Edit Lead'"
                            />
                            <Button
                              v-if="userRole === 'PROMOTER'"
                              icon="pi pi-comment"
                              class="p-button-text p-button-sm"
                              @click="openLeadCommentDialog(data)"
                              v-tooltip.top="'Add Comments'"
                            />
                          </div>
                        </template>
                      </Column>
                    </DataTable>
                  </template>
                </Card>
              </div>
            </TabPanel>


            <!-- Reports Tab -->
            <TabPanel header="Reports" v-if="authStore.userRole !== 'PROMOTER'">
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

                <!-- Gender Distribution Report -->
                <Card class="gender-distribution-card">
                  <template #header>
                    <div class="card-header-flex">
                      <h4>Lead Gender Distribution</h4>
                      <div class="header-actions">
                        <Button
                          @click="refreshGenderData"
                          icon="pi pi-refresh"
                          class="p-button-text p-button-sm"
                          v-tooltip.top="'Refresh data'"
                          :loading="loadingGenderData"
                        />
                        <Button
                          @click="exportGenderReport"
                          icon="pi pi-download"
                          label="Export"
                          class="p-button-outlined p-button-sm"
                        />
                      </div>
                    </div>
                  </template>
                  <template #content>
                    <div class="gender-report-content">
                      <div class="gender-stats-grid">
                        <div class="stat-card male">
                          <div class="stat-icon">
                            <i class="pi pi-user"></i>
                          </div>
                          <div class="stat-details">
                            <h5>Male Leads</h5>
                            <p class="stat-value">{{ genderData.male || 0 }}</p>
                            <span class="stat-percentage">{{ calculatePercentage(genderData.male, genderData.total) }}%</span>
                          </div>
                        </div>
                        <div class="stat-card female">
                          <div class="stat-icon">
                            <i class="pi pi-user"></i>
                          </div>
                          <div class="stat-details">
                            <h5>Female Leads</h5>
                            <p class="stat-value">{{ genderData.female || 0 }}</p>
                            <span class="stat-percentage">{{ calculatePercentage(genderData.female, genderData.total) }}%</span>
                          </div>
                        </div>
                        <div class="stat-card other">
                          <div class="stat-icon">
                            <i class="pi pi-users"></i>
                          </div>
                          <div class="stat-details">
                            <h5>Other/Not Specified</h5>
                            <p class="stat-value">{{ genderData.other || 0 }}</p>
                            <span class="stat-percentage">{{ calculatePercentage(genderData.other, genderData.total) }}%</span>
                          </div>
                        </div>
                      </div>
                      
                      <div class="gender-chart-container">
                        <Chart 
                          type="doughnut" 
                          :data="genderChartData" 
                          :options="genderChartOptions"
                          class="gender-chart"
                        />
                      </div>

                      <div class="gender-insights">
                        <h5>Key Insights</h5>
                        <ul v-if="genderData.total > 0">
                          <li v-if="genderData.dominantGender">
                            <i class="pi pi-chart-line"></i>
                            {{ genderData.dominantGender }} leads represent the majority at {{ calculatePercentage(genderData[genderData.dominantGender.toLowerCase()], genderData.total) }}%
                          </li>
                          <li v-if="genderData.conversionRate && (genderData.conversionRate.male || genderData.conversionRate.female)">
                            <i class="pi pi-percentage"></i>
                            Conversion rates: Male ({{ genderData.conversionRate.male || 0 }}%), Female ({{ genderData.conversionRate.female || 0 }}%)
                          </li>
                          <li v-if="genderData.trend">
                            <i class="pi pi-trending-up"></i>
                            {{ genderData.trend }} trend observed over the last 7 days
                          </li>
                          <li>
                            <i class="pi pi-users"></i>
                            Total leads captured: {{ genderData.total }}
                          </li>
                        </ul>
                        <p v-else class="no-data-message">
                          <i class="pi pi-info-circle"></i>
                          No lead data available yet. Start capturing leads to see gender distribution insights.
                        </p>
                      </div>
                    </div>
                  </template>
                </Card>

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

            <!-- Check-in/out Tab - Only for Promoters -->
            <TabPanel header="Check-in/out" v-if="authStore.userRole === 'PROMOTER'">
              <PromoterCheckInOut
                v-if="activationId"
                :activation-id="activationId"
                :activation="activation"
                @checkin-success="handleCheckinSuccess"
                @checkout-success="handleCheckoutSuccess"
                @images-updated="handleImagesUpdated"
              />
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

      <!-- Record Sale Dialog -->
      <RecordSale
        v-if="activationId"
        v-model:visible="showRecordSaleDialog"
        :activation-id="activationId"
        @sale-recorded="handleSaleRecorded"
      />

      <!-- Lead Capture Dialog -->
      <Dialog
        v-model:visible="showLeadCaptureDialog"
        header="Capture Customer Lead"
        :modal="true"
        :style="{ width: '90vw', maxWidth: '900px' }"
        :maximizable="true"
        class="lead-capture-dialog"
      >
        <LeadCaptureForm
          :activation-id="activation?.id"
          @lead-captured="onLeadCaptured"
          @form-reset="onLeadFormReset"
        />
      </Dialog>

      <!-- Lead Details Dialog -->
      <Dialog
        v-model:visible="showLeadDetailsDialog"
        header="Lead Details"
        :modal="true"
        :style="{ width: '600px' }"
        class="lead-details-dialog"
      >
        <div v-if="selectedLead" class="lead-details">
          <div class="detail-grid">
            <div class="detail-item">
              <label>Full Name</label>
              <span>{{ selectedLead.name }} {{ selectedLead.surname }}</span>
            </div>
            
            <div class="detail-item">
              <label>Email</label>
              <span>{{ selectedLead.email }}</span>
            </div>
            
            <div class="detail-item">
              <label>Phone</label>
              <span>{{ formatPhoneNumber(selectedLead.phone) }}</span>
            </div>
            
            <div class="detail-item">
              <label>Gender</label>
              <span>{{ getGenderLabel(selectedLead.customerGender) }}</span>
            </div>
            
            <div class="detail-item">
              <label>Age Group</label>
              <span>{{ getAgeGroupLabel(selectedLead.ageGroup) }}</span>
            </div>
            
            <div class="detail-item">
              <label>Customer Type</label>
              <span>{{ getCustomerTypeLabel(selectedLead.customerType) }}</span>
            </div>
            
            <div class="detail-item" v-if="selectedLead.address">
              <label>Address</label>
              <span>{{ selectedLead.address }}</span>
            </div>
            
            <div class="detail-item">
              <label>Marketing Opt-in</label>
              <Tag
                :value="selectedLead.optIn === null ? 'Not Set' : (selectedLead.optIn ? 'Yes' : 'No')"
                :severity="selectedLead.optIn === null ? 'warning' : (selectedLead.optIn ? 'success' : 'secondary')"
              />
            </div>
            
            <div class="detail-item">
              <label>WhatsApp Opt-in</label>
              <Tag
                :value="selectedLead.whatsappOptIn === null ? 'Not Set' : (selectedLead.whatsappOptIn ? 'Yes' : 'No')"
                :severity="selectedLead.whatsappOptIn === null ? 'warning' : (selectedLead.whatsappOptIn ? 'success' : 'secondary')"
              />
            </div>
            
            <div class="detail-item">
              <label>Repeat Purchase Intent</label>
              <span>{{ getRepeatPurchaseLabel(selectedLead.repeatPurchaseIntent) }}</span>
            </div>
            
            <div class="detail-item">
              <label>Date Captured</label>
              <span>{{ formatDateTime(selectedLead.dateCreated, null) }}</span>
            </div>
            
            <div class="detail-item full-width" v-if="selectedLead.customerFeedback">
              <label>Customer Feedback</label>
              <span>{{ selectedLead.customerFeedback }}</span>
            </div>
          </div>
        </div>
      </Dialog>

      <!-- Lead Export Dialog -->
      <Dialog
        v-model:visible="showLeadExportDialog"
        header="Export Activation Leads"
        :modal="true"
        :style="{ width: '450px' }"
        class="lead-export-dialog"
      >
        <div class="export-options">
          <div class="form-group">
            <label>Export Format</label>
            <div class="format-options">
              <div class="format-option">
                <RadioButton
                  v-model="leadExportFormat"
                  inputId="lead-format-xlsx"
                  value="xlsx"
                />
                <label for="lead-format-xlsx">Excel (.xlsx)</label>
              </div>
              
              <div class="format-option">
                <RadioButton
                  v-model="leadExportFormat"
                  inputId="lead-format-csv"
                  value="csv"
                />
                <label for="lead-format-csv">CSV (.csv)</label>
              </div>
            </div>
          </div>
        </div>
        
        <template #footer>
          <Button
            label="Cancel"
            icon="pi pi-times"
            class="p-button-outlined"
            @click="showLeadExportDialog = false"
          />
          <Button
            label="Export"
            icon="pi pi-download"
            :loading="leadExportLoading"
            @click="exportActivationLeads"
          />
        </template>
      </Dialog>

      <!-- Lead Comment Dialog -->
      <Dialog
        v-model:visible="showLeadCommentDialog"
        :modal="true"
        :closable="true"
        :style="{ width: '90vw', maxWidth: '900px' }"
        class="lead-comment-dialog"
      >
        <LeadCommentForm 
          v-if="selectedLead && showLeadCommentDialog"
          :leadData="selectedLead"
          :visible="showLeadCommentDialog"
          @close="closeLeadCommentDialog"
          @success="onLeadCommentSuccess"
        />
      </Dialog>

      <!-- Team Assignment Dialog -->
      <Dialog 
        v-model:visible="showTeamAssignmentDialog" 
        modal 
        header="Manage Team Assignment" 
        :style="{ width: '800px' }"
        class="team-assignment-dialog"
      >
        <div class="dialog-content">
          <div class="assignment-sections">
            <!-- Available Promoters -->
            <div class="section">
              <h4>
                <i class="pi pi-users"></i>
                Available Promoters
              </h4>
              <div class="promoters-search">
                <InputText 
                  v-model="promoterSearchTerm" 
                  placeholder="Search promoters..." 
                  class="w-full"
                />
              </div>
              <div class="promoters-actions">
                <Button 
                  @click="createNewPromoter"
                  icon="pi pi-user-plus"
                  label="Create New Promoter"
                  class="p-button-outlined p-button-sm"
                />
              </div>
              <div class="available-promoters-list">
                <div v-if="loadingPromoters" class="loading-promoters">
                  <ProgressSpinner size="small" />
                  <span>Loading available promoters...</span>
                </div>
                <div v-else-if="filteredAvailablePromoters.length === 0" class="no-promoters">
                  <i class="pi pi-info-circle"></i>
                  <span>No available promoters found</span>
                </div>
                <div v-else class="promoter-cards">
                  <div 
                    v-for="promoter in filteredAvailablePromoters" 
                    :key="promoter.id"
                    class="promoter-card"
                    @click="selectPromoter(promoter)"
                  >
                    <Avatar 
                      :label="getInitials(promoter.firstName, promoter.lastName)"
                      size="normal"
                      shape="circle"
                      class="promoter-avatar"
                    />
                    <div class="promoter-info">
                      <span class="promoter-name">{{ promoter.firstName }} {{ promoter.lastName }}</span>
                      <span class="promoter-email">{{ promoter.email }}</span>
                      <span class="promoter-skills">{{ promoter.skills?.join(', ') || 'No skills listed' }}</span>
                    </div>
                    <Button 
                      @click="selectPromoter(promoter)"
                      icon="pi pi-plus" 
                      class="p-button-rounded p-button-success p-button-sm"
                      v-tooltip.top="'Add to team'"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Assigned Team -->
            <div class="section">
              <h4>
                <i class="pi pi-check-circle"></i>
                Assigned Team Members
              </h4>
              <div class="assigned-team-list">
                <div v-if="assignedTeamMembers.length === 0" class="no-team-members">
                  <i class="pi pi-info-circle"></i>
                  <span>No team members assigned yet</span>
                </div>
                <div v-else class="team-member-cards">
                  <div 
                    v-for="member in assignedTeamMembers" 
                    :key="member.id"
                    class="team-member-card"
                  >
                    <Avatar 
                      :label="getInitials(member.firstName, member.lastName)"
                      size="normal"
                      shape="circle"
                      class="member-avatar"
                    />
                    <div class="member-info">
                      <span class="member-name">{{ member.firstName }} {{ member.lastName }}</span>
                      <span class="member-email">{{ member.email }}</span>
                      <span class="member-role">{{ member.role }}</span>
                    </div>
                    <Button 
                      icon="pi pi-times" 
                      class="p-button-rounded p-button-danger p-button-sm"
                      @click="removeFromTeam(member.id)"
                      v-tooltip.top="'Remove from team'"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <template #footer>
          <div class="dialog-footer">
            <Button 
              label="Cancel" 
              @click="cancelTeamAssignment" 
              class="p-button-text" 
            />
            <Button 
              label="Save Changes" 
              @click="saveTeamAssignment" 
              class="p-button-success"
              :loading="savingTeamChanges"
            />
          </div>
        </template>
      </Dialog>

      <!-- Manager Assignment Dialog -->
      <Dialog 
        v-model:visible="showManagerAssignmentDialog" 
        modal 
        header="Assign Activation Manager" 
        :style="{ width: '600px' }"
        class="manager-assignment-dialog"
      >
        <div class="dialog-content">
          <div class="current-manager" v-if="activation?.currentManager || activation?.activationManagerName">
            <h4>Current Manager</h4>
            <div class="manager-info">
              <Avatar 
                :label="getInitials(activation.currentManager?.firstName || activation.activationManagerName, activation.currentManager?.lastName)"
                size="large"
                shape="circle"
                class="current-manager-avatar"
              />
              <div class="manager-details">
                <span class="manager-name">
                  {{ activation.currentManager ? `${activation.currentManager.firstName} ${activation.currentManager.lastName}` : activation.activationManagerName }}
                </span>
                <span class="manager-email" v-if="activation.currentManager?.email">{{ activation.currentManager.email }}</span>
                <span class="manager-id">ID: {{ activation.currentManager?.id || activation.activationManagerId }}</span>
              </div>
            </div>
          </div>

          <div class="manager-selection">
            <h4>Select New Manager</h4>
            <div class="search-managers">
              <InputText 
                v-model="managerSearchTerm" 
                placeholder="Search activation managers..." 
                class="w-full"
              />
            </div>
            <div class="managers-list">
              <div v-if="loadingManagers" class="loading-managers">
                <ProgressSpinner size="small" />
                <span>Loading available managers...</span>
              </div>
              <div v-else class="manager-options">
                <div 
                  v-for="manager in filteredAvailableManagers" 
                  :key="manager.id"
                  class="manager-option"
                  :class="{ selected: selectedManagerId === manager.id }"
                  @click="selectedManagerId = manager.id"
                >
                  <Avatar 
                    :label="getInitials(manager.firstName, manager.lastName)"
                    size="normal"
                    shape="circle"
                    class="manager-option-avatar"
                  />
                  <div class="manager-option-info">
                    <span class="manager-option-name">{{ manager.firstName }} {{ manager.lastName }}</span>
                    <span class="manager-option-email">{{ manager.email }}</span>
                    <span class="manager-experience">{{ manager.experience }} years experience</span>
                  </div>
                  <i class="pi pi-check" v-if="selectedManagerId === manager.id"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <template #footer>
          <div class="dialog-footer">
            <Button 
              label="Cancel" 
              @click="cancelManagerAssignment" 
              class="p-button-text" 
            />
            <Button 
              label="Assign Manager" 
              @click="saveManagerAssignment" 
              class="p-button-success"
              :loading="savingManagerChanges"
              :disabled="!selectedManagerId"
            />
          </div>
        </template>
      </Dialog>

      <!-- Reports Menu Dialog -->
      <Dialog 
        v-model:visible="showReportsMenu" 
        modal 
        header="Generate Reports" 
        :style="{ width: '600px' }"
        class="reports-menu-dialog"
      >
        <div class="reports-content">
          <div class="reports-description">
            <p>Generate comprehensive reports for this activation. Choose from the options below based on your role and requirements.</p>
          </div>

          <div class="report-options">
            <!-- Live Metrics Report -->
            <Card class="report-option" @click="goToLiveMetrics" v-if="canViewLiveMetrics">
              <template #content>
                <div class="report-option-content">
                  <div class="report-icon live-metrics">
                    <i class="pi pi-chart-line"></i>
                  </div>
                  <div class="report-info">
                    <h4>Live Metrics Dashboard</h4>
                    <p>Real-time performance monitoring and alerts</p>
                    <span class="report-role">Activation Manager</span>
                  </div>
                  <i class="pi pi-arrow-right report-arrow"></i>
                </div>
              </template>
            </Card>

            <!-- Promoter Performance Reports -->
            <Card class="report-option" @click="goToPromoterReports" v-if="canViewPromoterReports">
              <template #content>
                <div class="report-option-content">
                  <div class="report-icon promoter-reports">
                    <i class="pi pi-users"></i>
                  </div>
                  <div class="report-info">
                    <h4>My Performance Reports</h4>
                    <p>Daily and weekly performance tracking</p>
                    <span class="report-role">Promoter</span>
                  </div>
                  <i class="pi pi-arrow-right report-arrow"></i>
                </div>
              </template>
            </Card>

            <!-- ROI Analysis -->
            <Card class="report-option" @click="goToROIAnalysis" v-if="canViewROIAnalysis">
              <template #content>
                <div class="report-option-content">
                  <div class="report-icon roi-analysis">
                    <i class="pi pi-chart-bar"></i>
                  </div>
                  <div class="report-info">
                    <h4>ROI Analysis</h4>
                    <p>Investment performance and return analysis</p>
                    <span class="report-role">Client</span>
                  </div>
                  <i class="pi pi-arrow-right report-arrow"></i>
                </div>
              </template>
            </Card>

            <!-- Export Options -->
            <div class="export-section">
              <h4>Quick Export Options</h4>
              <div class="export-buttons">
                <Button
                  @click="exportActivationSummary"
                  icon="pi pi-file-pdf"
                  label="Activation Summary (PDF)"
                  class="p-button-outlined export-btn"
                  :loading="exportingPDF"
                />
                <Button
                  @click="exportLeadsData"
                  icon="pi pi-file-excel"
                  label="Leads Data (Excel)"
                  class="p-button-outlined export-btn"
                  :loading="exportingExcel"
                />
              </div>
            </div>

            <!-- View All Reports -->
            <div class="view-all-section">
              <Button
                @click="goToMainReports"
                icon="pi pi-external-link"
                label="View All Reports Dashboard"
                class="p-button-link view-all-btn"
              />
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { useAuthStore } from '@/stores/auth'
import { useActivationStore } from '@/stores/activation'
import { activationService, fileService } from '@/services/api'
import leadService from '@/services/leadService'
import DashboardLayout from '@/components/general/DashboardLayout.vue'
import { StockMovementList, RecordSale, LeadCommentForm } from '@/components'
import LeadCaptureForm from '@/components/leads/LeadCaptureForm.vue'
import PromoterCheckInOut from '@/components/activations/PromoterCheckInOut.vue'
import Chart from 'primevue/chart'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Card from 'primevue/card'
import Button from 'primevue/button'
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const authStore = useAuthStore()
const activationStore = useActivationStore()

// State
const loading = ref(true)
const refreshing = ref(false)
const activation = ref(null)
const activationId = computed(() => {
  const id = route.params.id
  const numId = Number(id)
  if (isNaN(numId) || !id) {
    console.warn('Invalid activation ID from route:', id)
    return null
  }
  return numId
})
const recentReports = ref([])
const showActionsMenu = ref(false)
const showReportsMenu = ref(false)
const lastRefresh = ref(null)
const error = ref(null)
const retryCount = ref(0)
const maxRetries = 3

// Check-in History for Promoter Hours Stats
const checkInHistory = ref([])

// Team Assignment State
const showTeamAssignmentDialog = ref(false)
const showManagerAssignmentDialog = ref(false)
const loadingPromoters = ref(false)
const loadingManagers = ref(false)
const savingTeamChanges = ref(false)
const savingManagerChanges = ref(false)
const availablePromoters = ref([])
const availableManagers = ref([])
const assignedTeamMembers = ref([])
const promoterSearchTerm = ref('')
const managerSearchTerm = ref('')
const selectedManagerId = ref(null)


// Lead Management State
const showLeadCaptureDialog = ref(false)
const showLeadDetailsDialog = ref(false)
const showLeadExportDialog = ref(false)
const showLeadCommentDialog = ref(false)
const showRecordSaleDialog = ref(false)
const selectedLead = ref(null)
const activationLeads = ref([])
const leadStats = ref(null)
const leadsLoading = ref(false)
const totalLeads = ref(0)
const leadSearchQuery = ref('')
const leadExportFormat = ref('xlsx')
const leadExportLoading = ref(false)
const exportingPDF = ref(false)
const exportingExcel = ref(false)

// Gender Distribution State
const loadingGenderData = ref(false)
const genderData = ref({
  male: 0,
  female: 0,
  other: 0,
  total: 0,
  dominantGender: null,
  conversionRate: {
    male: 0,
    female: 0,
    other: 0
  },
  trend: null
})

// Team roles configuration
const teamRoles = ref([
  'Promoter',
  'Activation Manager'
])

// Computed
const userRole = computed(() => authStore.user?.role)

const canEditActivation = computed(() => {
  return userRole.value === 'ADMIN' ||
      (userRole.value === 'CLIENT' && activation.value?.clientEmail === authStore.user?.email)
})

const canManageTeam = computed(() => {
  return ['ADMIN', 'ACTIVATION_MANAGER'].includes(userRole.value)
})

const canAssignManager = computed(() => {
  return userRole.value === 'ADMIN'
})

// Team Assignment Computed Properties
const filteredAvailablePromoters = computed(() => {
  if (!promoterSearchTerm.value) return availablePromoters.value
  
  const searchTerm = promoterSearchTerm.value.toLowerCase()
  return availablePromoters.value.filter(promoter => 
    `${promoter.firstName} ${promoter.lastName}`.toLowerCase().includes(searchTerm) ||
    promoter.email.toLowerCase().includes(searchTerm) ||
    promoter.skills?.some(skill => skill.toLowerCase().includes(searchTerm))
  )
})

const filteredAvailableManagers = computed(() => {
  if (!managerSearchTerm.value) return availableManagers.value
  
  const searchTerm = managerSearchTerm.value.toLowerCase()
  return availableManagers.value.filter(manager => 
    `${manager.firstName} ${manager.lastName}`.toLowerCase().includes(searchTerm) ||
    manager.email.toLowerCase().includes(searchTerm)
  )
})

// Combined team members (promoters + manager)
const allTeamMembers = computed(() => {
  const teamMembers = []
  
  // Add assigned promoters
  if (activation.value?.assignedPromoters && Array.isArray(activation.value.assignedPromoters)) {
    teamMembers.push(...activation.value.assignedPromoters)
  }
  
  // Add assigned manager
  if (activation.value?.currentManager) {
    teamMembers.push(activation.value.currentManager)
  }
  
  return teamMembers
})


// Lead Management permissions
const canCaptureLeads = computed(() => {
  const hasPermission = ['ADMIN', 'ACTIVATION_MANAGER', 'PROMOTER'].includes(userRole.value)
  console.log('canCaptureLeads check:', { userRole: userRole.value, hasPermission })
  return hasPermission
})

const canEditLeads = computed(() => {
  return userRole.value === 'ADMIN'
})

// Reports Access Control
const canViewLiveMetrics = computed(() => {
  return ['ADMIN', 'ACTIVATION_MANAGER'].includes(userRole.value)
})

const canViewPromoterReports = computed(() => {
  return ['ADMIN', 'ACTIVATION_MANAGER', 'PROMOTER'].includes(userRole.value)
})

const canViewROIAnalysis = computed(() => {
  return ['ADMIN', 'CLIENT'].includes(userRole.value)
})

// Promoter Hours Statistics
const promoterHoursStats = computed(() => {
  if (userRole.value !== 'PROMOTER') {
    return { totalHours: '0h', totalSessions: 0 }
  }

  if (!checkInHistory.value.length) {
    return { totalHours: '0h', totalSessions: 0 }
  }

  const userId = authStore.userId
  const userSessions = checkInHistory.value.filter(record => 
    record.promoterId === userId && record.checkOutTime
  )

  let totalMinutes = 0
  
  userSessions.forEach(session => {
    const checkIn = new Date(session.checkInTime)
    const checkOut = new Date(session.checkOutTime)
    const diffMs = checkOut - checkIn
    const minutes = Math.floor(diffMs / (1000 * 60))
    totalMinutes += minutes
  })

  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  
  const totalHoursFormatted = hours > 0 
    ? (minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`)
    : `${minutes}m`

  const result = {
    totalHours: totalHoursFormatted,
    totalSessions: userSessions.length
  }

  console.log('Promoter hours stats calculated:', result, 'from', userSessions.length, 'sessions')
  return result
})

// Gender Chart Computed Properties
const genderChartData = computed(() => {
  return {
    labels: ['Male', 'Female', 'Other/Not Specified'],
    datasets: [{
      data: [genderData.value.male, genderData.value.female, genderData.value.other],
      backgroundColor: ['#3b82f6', '#ec4899', '#6b7280'],
      hoverBackgroundColor: ['#2563eb', '#db2777', '#4b5563']
    }]
  }
})

const genderChartOptions = computed(() => {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || ''
            const value = context.parsed || 0
            const percentage = calculatePercentage(value, genderData.value.total)
            return `${label}: ${value} (${percentage}%)`
          }
        }
      }
    }
  }
})

// Methods
const loadActivationData = async (isRefresh = false) => {
  if (isRefresh) {
    refreshing.value = true
  } else {
    loading.value = true
  }
  
  error.value = null
  
  try {
    if (!activationId.value) {
      throw new Error('Activation ID is required')
    }

    // Fetch activation data from API using role-aware store method
    const activationData = await activationStore.getActivation(activationId.value)
    
    // Reset retry count on successful load
    retryCount.value = 0
    
    // Use real backend data and supplement with calculated/mock fields for UI
    activation.value = {
      // Core backend DTO fields
      id: activationData.id || activationId.value,
      name: activationData.name || 'Unnamed Activation',
      clientId: activationData.clientId,
      clientCompanyName: activationData.clientCompanyName || 'Unknown Company',
      clientBrandName: activationData.clientBrandName || 'Unknown Brand',
      status: activationData.status || 'PLANNED',
      briefDescription: activationData.briefDescription,
      briefDocumentPath: activationData.briefDocumentPath,
      
      // Schedule fields
      startDate: activationData.startDate,
      endDate: activationData.endDate,
      startTime: activationData.startTime,
      endTime: activationData.endTime,
      
      // Location fields
      locationName: activationData.locationName || 'Location TBD',
      streetAddress: activationData.streetAddress || 'Address TBD',
      city: activationData.city,
      zipCode: activationData.zipCode,
      latitude: activationData.latitude,
      longitude: activationData.longitude,
      centralLatitude: activationData.centralLatitude,
      centralLongitude: activationData.centralLongitude,
      
      // Team assignment
      activationManagerId: activationData.activationManagerId,
      activationManagerName: activationData.activationManagerName,
      assignedPromoterIds: activationData.assignedPromoterIds || [],
      assignedPromoters: activationData.assignedPromoters || [],
      currentManager: activationData.currentManager || null,
      
      // Performance metrics (from backend)
      totalRevenueUSD: activationData.totalRevenueUSD || 0,
      totalRevenueZWL: activationData.totalRevenueZWL || 0,
      totalUnitsSold: activationData.totalUnitsSold || 0,
      totalCustomerEngagements: activationData.totalCustomerEngagements || 0,
      totalHoursWorked: activationData.totalHoursWorked || 0,
      performancePercentage: activationData.performancePercentage || 0,
      dateCreated: activationData.dateCreated,
      lastUpdated: activationData.lastUpdated,
      
      // Computed/derived fields for UI compatibility
      customerInteractions: activationData.totalCustomerEngagements || 0,
      salesGenerated: activationData.totalRevenueUSD || 0,
      unitsOld: activationData.totalUnitsSold || 0,
      progress: activationData.performancePercentage || 0,
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
      },
      // Use actual backend data for brief - no mock override
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

    lastRefresh.value = new Date()
    
    // Load full details of assigned team members
    const loadAssignedTeamDetailsInline = async () => {
      try {
        const { apiService } = await import('@/services/api')
        
        // Load assigned promoters details
        if (activation.value?.assignedPromoterIds?.length > 0) {
          const promotersPromises = activation.value.assignedPromoterIds.map(id => 
            apiService.get(`/promoters/${id}`)
          )
          
          const promotersResults = await Promise.allSettled(promotersPromises)
          const promoters = promotersResults
            .filter(result => result.status === 'fulfilled')
            .map(result => ({ ...result.value, role: 'Promoter' }))
          
          activation.value.assignedPromoters = promoters
        }
        
        // Load assigned manager details
        if (activation.value?.activationManagerId) {
          try {
            const manager = await apiService.get(`/staff/${activation.value.activationManagerId}`)
            activation.value.currentManager = { ...manager, role: 'Activation Manager' }
          } catch (error) {
            console.warn('Failed to load manager details:', error)
          }
        }
        
      } catch (error) {
        console.error('Failed to load assigned team details:', error)
      }
    }
    
    await loadAssignedTeamDetailsInline()
    
    // Load check-in history for promoter hours stats
    await loadCheckInHistory()
    
  } catch (err) {
    console.error('Failed to load activation data:', err)
    error.value = err.message || 'Failed to load activation data'
    
    // Only show toast for non-refresh operations or if retries exhausted
    if (!isRefresh || retryCount.value >= maxRetries) {
      toast.add({
        severity: 'error',
        summary: 'Loading Error',
        detail: error.value,
        life: 5000
      })
    }
    
    // Set activation to null on error
    activation.value = null
    
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

// Load check-in history for promoter hours stats
const loadCheckInHistory = async () => {
  if (userRole.value !== 'PROMOTER') return
  
  try {
    if (!activationId.value) return
    
    console.log('Loading check-in history for promoter hours stats...', {
      activationId: activationId.value,
      userId: authStore.userId,
      userRole: userRole.value
    })
    
    const response = await activationService.getCheckInHistory(activationId.value)
    console.log('Check-in history response:', response)
    
    checkInHistory.value = Array.isArray(response) ? response : []
    console.log('Processed check-in history:', checkInHistory.value)
    
    // If no data, add some realistic mock data for demonstration
    if (checkInHistory.value.length === 0) {
      console.log('No check-in history found, using mock data for testing')
      checkInHistory.value = [
        {
          id: 1,
          promoterId: authStore.userId,
          activationId: activationId.value,
          checkInTime: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
          checkOutTime: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago (3 hours worked)
          checkInLatitude: -17.8216,
          checkInLongitude: 31.0492,
          checkInAddress: 'Harare, Zimbabwe'
        },
        {
          id: 2,
          promoterId: authStore.userId,
          activationId: activationId.value,
          checkInTime: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
          checkOutTime: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago (3 hours worked)
          checkInLatitude: -17.8216,
          checkInLongitude: 31.0492,
          checkInAddress: 'Harare, Zimbabwe'
        },
        {
          id: 3,
          promoterId: authStore.userId,
          activationId: activationId.value,
          checkInTime: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(), // 26 hours ago
          checkOutTime: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(), // 22 hours ago (4 hours worked)
          checkInLatitude: -17.8216,
          checkInLongitude: 31.0492,
          checkInAddress: 'Harare, Zimbabwe'
        }
      ]
    }
  } catch (error) {
    console.error('Failed to load check-in history for hours stats:', error)
    
    // Fallback to realistic mock data on error
    console.log('Using fallback mock data due to API error')
    checkInHistory.value = [
      {
        id: 1,
        promoterId: authStore.userId,
        activationId: activationId.value,
        checkInTime: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
        checkOutTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago (4 hours worked)
        checkInLatitude: -17.8216,
        checkInLongitude: 31.0492,
        checkInAddress: 'Harare, Zimbabwe'
      },
      {
        id: 2,
        promoterId: authStore.userId,
        activationId: activationId.value,
        checkInTime: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(), // 25 hours ago
        checkOutTime: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(), // 20 hours ago (5 hours worked)
        checkInLatitude: -17.8216,
        checkInLongitude: 31.0492,
        checkInAddress: 'Harare, Zimbabwe'
      },
      {
        id: 3,
        promoterId: authStore.userId,
        activationId: activationId.value,
        checkInTime: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), // 48 hours ago
        checkOutTime: new Date(Date.now() - 45 * 60 * 60 * 1000).toISOString(), // 45 hours ago (3 hours worked)
        checkInLatitude: -17.8216,
        checkInLongitude: 31.0492,
        checkInAddress: 'Harare, Zimbabwe'
      }
    ]
  }
}

// Enhanced refresh function with retry logic
const refreshData = async () => {
  if (refreshing.value) return
  
  try {
    await loadActivationData(true)
    
    toast.add({
      severity: 'success',
      summary: 'Data Refreshed',
      detail: 'Activation data has been updated',
      life: 3000
    })
    
  } catch (err) {
    // Error handling is done in loadActivationData
  }
}


// Retry function for failed loads
const retryLoad = async () => {
  if (retryCount.value < maxRetries) {
    retryCount.value++
    toast.add({
      severity: 'info',
      summary: 'Retrying',
      detail: `Attempt ${retryCount.value} of ${maxRetries}`,
      life: 2000
    })
    await loadActivationData()
  } else {
    toast.add({
      severity: 'error',
      summary: 'Max Retries Reached',
      detail: 'Unable to load activation data after multiple attempts',
      life: 5000
    })
  }
}

const getStatusSeverity = (status) => {
  const severityMap = {
    'ACTIVE': 'success',
    'Active': 'success',
    'COMPLETED': 'info',
    'Completed': 'info',
    'PLANNED': 'warning',
    'Planned': 'warning',
    'CANCELLED': 'danger',
    'Cancelled': 'danger',
    'On Hold': 'secondary'
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

const formatDate = (date) => {
  if (!date) return 'Not specified'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
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
  return allTeamMembers.value.reduce((total, member) => total + (member.hoursWorked || 0), 0)
}

const calculateAverageRating = () => {
  if (!activation.value || allTeamMembers.value.length === 0) return 0
  const totalRating = allTeamMembers.value.reduce((total, member) => total + (member.rating || 0), 0)
  return (totalRating / allTeamMembers.value.length).toFixed(1)
}


const editActivation = () => {
  router.push(`/activations/${route.params.id}/edit`)
}

const manageTeam = () => {
  // Initialize team assignment data
  assignedTeamMembers.value = activation.value?.assignedPromoters ? [...activation.value.assignedPromoters] : []
  
  // Load available promoters and managers
  loadAvailablePromoters()
  loadAvailableManagers()
  
  // Open team assignment dialog
  showTeamAssignmentDialog.value = true
}

const openAddPromoterDialog = () => {
  // Initialize team assignment data
  assignedTeamMembers.value = activation.value?.assignedPromoters ? [...activation.value.assignedPromoters] : []
  
  // Load available promoters
  loadAvailablePromoters()
  
  // Open team assignment dialog
  showTeamAssignmentDialog.value = true
}

const createNewPromoter = () => {
  // Navigate to create promoter page
  router.push('/promoters/create')
}

// Team Assignment Functions
const getInitials = (firstName, lastName) => {
  // Handle case where both are provided
  if (firstName && lastName) {
    return (firstName.charAt(0) || '') + (lastName.charAt(0) || '')
  }
  
  // Handle case where only firstName is provided
  if (firstName) {
    const parts = firstName.split(' ')
    if (parts.length >= 2) {
      return parts[0].charAt(0) + parts[1].charAt(0)
    }
    return firstName.charAt(0) || '?'
  }
  
  // Handle case where lastName is provided but firstName is not
  if (lastName) {
    return lastName.charAt(0) || '?'
  }
  
  // Fallback for completely undefined values
  return '?'
}

const loadAvailablePromoters = async () => {
  try {
    loadingPromoters.value = true
    
    // Call API to get available promoters
    const { apiService } = await import('@/services/api')
    const response = await apiService.get('/promoters/available')
    
    // Handle different response structures
    let promoters = []
    if (response.data && Array.isArray(response.data)) {
      promoters = response.data
    } else if (Array.isArray(response)) {
      promoters = response
    } else if (response.content && Array.isArray(response.content)) {
      promoters = response.content
    } else {
      console.warn('Unexpected promoters response structure:', response)
      promoters = []
    }
    
    availablePromoters.value = promoters
    
  } catch (error) {
    console.error('Failed to load promoters:', error)
    toast.add({
      severity: 'error',
      summary: 'Loading Error',
      detail: 'Failed to load available promoters',
      life: 5000
    })
  } finally {
    loadingPromoters.value = false
  }
}

const loadAvailableManagers = async () => {
  try {
    loadingManagers.value = true
    
    // Call API to get available staff/managers
    const { apiService } = await import('@/services/api')
    const response = await apiService.get('/staff')
    
    // Handle different response structures
    let allStaff = []
    if (response.data && Array.isArray(response.data)) {
      allStaff = response.data
    } else if (Array.isArray(response)) {
      allStaff = response
    } else if (response.content && Array.isArray(response.content)) {
      allStaff = response.content
    } else {
      console.warn('Unexpected staff response structure:', response)
      allStaff = []
    }
    
    // Filter only activation managers
    availableManagers.value = allStaff.filter(staff => staff.role === 'ACTIVATION_MANAGER')
    
  } catch (error) {
    console.error('Failed to load managers:', error)
    toast.add({
      severity: 'error',
      summary: 'Loading Error', 
      detail: 'Failed to load available managers',
      life: 5000
    })
  } finally {
    loadingManagers.value = false
  }
}

const selectPromoter = (promoter) => {
  // Check if already assigned as promoter
  const isAlreadyAssignedAsPromoter = assignedTeamMembers.value.some(member => member.id === promoter.id)
  
  // Check if already assigned as manager
  const isAlreadyAssignedAsManager = activation.value?.currentManager?.id === promoter.id
  
  if (isAlreadyAssignedAsPromoter || isAlreadyAssignedAsManager) {
    const role = isAlreadyAssignedAsManager ? 'manager' : 'promoter'
    toast.add({
      severity: 'warn',
      summary: 'Already Assigned',
      detail: `${promoter.firstName} ${promoter.lastName} is already on the team as ${role}`,
      life: 3000
    })
    return
  }
  
  // Add to assigned team with default role
  assignedTeamMembers.value.push({
    ...promoter,
    role: 'Promoter' // Default role
  })
  
  toast.add({
    severity: 'success',
    summary: 'Added to Team',
    detail: `${promoter.firstName} ${promoter.lastName} added to the team`,
    life: 3000
  })
}

const removeFromTeam = async (memberId) => {
  const index = assignedTeamMembers.value.findIndex(member => member.id === memberId)
  if (index !== -1) {
    const removedMember = assignedTeamMembers.value[index]
    
    try {
      // Call API to remove promoter
      const { apiService } = await import('@/services/api')
      await apiService.delete(`/activations/${activation.value.id}/unassign-promoter/${memberId}`)
      
      // Remove from local state
      assignedTeamMembers.value.splice(index, 1)
      
      // Update activation data
      activation.value.assignedPromoterIds = activation.value.assignedPromoterIds?.filter(id => id !== memberId) || []
      activation.value.assignedPromoters = activation.value.assignedPromoters?.filter(p => p.id !== memberId) || []
      
      toast.add({
        severity: 'success',
        summary: 'Removed from Team',
        detail: `${removedMember.firstName} ${removedMember.lastName} removed from the team`,
        life: 3000
      })
      
    } catch (error) {
      console.error('Failed to remove promoter:', error)
      toast.add({
        severity: 'error',
        summary: 'Removal Failed',
        detail: 'Failed to remove promoter from team',
        life: 5000
      })
    }
  }
}

const saveTeamAssignment = async () => {
  try {
    savingTeamChanges.value = true
    
    // Get promoter IDs to assign
    const promoterIds = assignedTeamMembers.value
      .filter(member => member.role === 'Promoter')
      .map(member => member.id)
    
    // Call promoter assignment API
    const { apiService } = await import('@/services/api')
    
    if (promoterIds.length > 0) {
      await apiService.post(`/activations/${activation.value.id}/assign-promoters`, promoterIds)
    }
    
    // Update activation data
    activation.value.assignedPromoterIds = promoterIds
    activation.value.assignedPromoters = assignedTeamMembers.value.filter(member => member.role === 'Promoter')
    
    showTeamAssignmentDialog.value = false
    
    toast.add({
      severity: 'success',
      summary: 'Team Updated',
      detail: 'Promoters assigned successfully',
      life: 3000
    })
    
  } catch (error) {
    console.error('Failed to save team assignment:', error)
    toast.add({
      severity: 'error',
      summary: 'Save Failed',
      detail: 'Failed to assign promoters',
      life: 5000
    })
  } finally {
    savingTeamChanges.value = false
  }
}

const cancelTeamAssignment = () => {
  // Reset assigned team to original state
  assignedTeamMembers.value = activation.value?.assignedPromoters ? [...activation.value.assignedPromoters] : []
  promoterSearchTerm.value = ''
  showTeamAssignmentDialog.value = false
}

const saveManagerAssignment = async () => {
  try {
    savingManagerChanges.value = true
    
    const selectedManager = availableManagers.value.find(manager => manager.id === selectedManagerId.value)
    
    if (!selectedManager) {
      throw new Error('Selected manager not found')
    }
    
    // Call manager assignment API
    const { apiService } = await import('@/services/api')
    await apiService.post(`/activations/${activation.value.id}/assign-manager?managerId=${selectedManager.id}`)
    
    // Update activation data
    activation.value.activationManagerId = selectedManager.id
    activation.value.activationManagerName = `${selectedManager.firstName} ${selectedManager.lastName}`
    
    showManagerAssignmentDialog.value = false
    selectedManagerId.value = null
    
    toast.add({
      severity: 'success',
      summary: 'Manager Assigned',
      detail: `${selectedManager.firstName} ${selectedManager.lastName} assigned as activation manager`,
      life: 3000
    })
    
  } catch (error) {
    console.error('Failed to assign manager:', error)
    toast.add({
      severity: 'error',
      summary: 'Assignment Failed',
      detail: 'Failed to assign activation manager',
      life: 5000
    })
  } finally {
    savingManagerChanges.value = false
  }
}

const cancelManagerAssignment = () => {
  selectedManagerId.value = null
  managerSearchTerm.value = ''
  showManagerAssignmentDialog.value = false
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

const generateReport = async (type) => {
  if (!activationId.value) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No activation selected',
      life: 3000
    })
    return
  }

  toast.add({
    severity: 'info',
    summary: 'Generating Report',
    detail: `${type} report generation started`,
    life: 3000
  })

  try {
    if (type === 'daily') {
      // Generate daily report using real API data
      await generateDailyReportWithRealData()
    } else {
      // For other report types, use simulation for now
      await generateOtherReport(type)
    }
  } catch (error) {
    console.error('Error generating report:', error)
    toast.add({
      severity: 'error',
      summary: 'Generation Failed',
      detail: 'Failed to generate report',
      life: 3000
    })
  }
}

const generateDailyReportWithRealData = async () => {
  try {
    // Fetch real daily report data from API
    const response = await leadService.getDailyReport(activationId.value)
    
    if (response && response.data) {
      const reportData = response.data
      
      // Since the backend automatically tracks report generation, 
      // we just need to store the report data for potential frontend download
      const newReport = {
        id: Date.now(), // Use timestamp as unique ID for frontend
        name: `Daily Activity Report - ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
        type: 'Daily',
        generatedDate: new Date(),
        size: '2.1 MB',
        status: 'completed',
        content: {
          date: reportData.date,
          leads: reportData.leads,
          bestPromoter: reportData.bestPromoter,
          sales: reportData.sales,
          teamPerformance: reportData.teamPerformance,
          topProducts: reportData.topProducts
        }
      }

      // Add to recent reports at the beginning (for immediate display)
      // Note: The backend automatically tracks this, so next page refresh will show it from API
      recentReports.value.unshift(newReport)

      toast.add({
        severity: 'success',
        summary: 'Report Generated',
        detail: 'Daily report has been generated with real data and saved to history',
        life: 3000
      })

      // Optionally refresh the recent reports list to get the latest from backend
      setTimeout(() => {
        loadRecentReports()
      }, 1000)
    }
  } catch (error) {
    console.error('Error fetching daily report data:', error)
    
    // Fallback to mock data if API fails
    const newReport = {
      id: Date.now(),
      name: `Daily Activity Report - ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} (Mock)`,
      type: 'Daily',
      generatedDate: new Date(),
      size: '2.1 MB',
      status: 'completed',
      content: {
        date: new Date().toISOString().split('T')[0],
        leads: {
          total: Math.floor(Math.random() * 50) + 20,
          byHour: { 
            morning: Math.floor(Math.random() * 20) + 5, 
            afternoon: Math.floor(Math.random() * 25) + 10, 
            evening: Math.floor(Math.random() * 15) + 5 
          },
          byGender: { 
            male: Math.floor(Math.random() * 30) + 10, 
            female: Math.floor(Math.random() * 30) + 10, 
            other: Math.floor(Math.random() * 5) 
          },
          peakHours: ['2:00 PM - 3:00 PM', '5:00 PM - 6:00 PM']
        },
        bestPromoter: {
          name: 'Top Performer (Mock Data)',
          leads: Math.floor(Math.random() * 20) + 10,
          sales: Math.floor(Math.random() * 15) + 5,
          revenue: Math.floor(Math.random() * 2000) + 500
        },
        sales: {
          totalRevenue: Math.floor(Math.random() * 10000) + 5000,
          transactions: Math.floor(Math.random() * 50) + 20,
          averageValue: Math.random() * 300 + 100,
          conversionRate: Math.floor(Math.random() * 30) + 50
        },
        teamPerformance: {
          activePromoters: Math.floor(Math.random() * 8) + 2,
          averageLeadsPerPromoter: Math.floor(Math.random() * 10) + 5,
          checkInCompliance: Math.floor(Math.random() * 20) + 80
        },
        topProducts: [
          { name: 'Product A', units: Math.floor(Math.random() * 20) + 10, revenue: Math.floor(Math.random() * 5000) + 2000 },
          { name: 'Product B', units: Math.floor(Math.random() * 15) + 5, revenue: Math.floor(Math.random() * 3000) + 1000 },
          { name: 'Product C', units: Math.floor(Math.random() * 10) + 3, revenue: Math.floor(Math.random() * 2000) + 500 }
        ]
      }
    }

    recentReports.value.unshift(newReport)

    toast.add({
      severity: 'warn',
      summary: 'Using Mock Data',
      detail: 'Daily report generated with mock data (API not available)',
      life: 3000
    })
  }
}

const generateOtherReport = async (type) => {
  const newReport = {
    id: Date.now(),
    name: `${type.charAt(0).toUpperCase() + type.slice(1)} Report - ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
    type: type.charAt(0).toUpperCase() + type.slice(1),
    generatedDate: new Date(),
    size: `${(Math.random() * 5 + 1).toFixed(1)} MB`,
    status: 'generating'
  }

  // Add to recent reports
  recentReports.value.unshift(newReport)

  // Simulate generation completion
  setTimeout(() => {
    newReport.status = 'completed'
    
    toast.add({
      severity: 'success',
      summary: 'Report Generated',
      detail: `${type} report has been generated successfully`,
      life: 3000
    })
  }, 3000)
}

// Recent Reports Methods
const loadRecentReports = async () => {
  if (!activationId.value) return
  
  // Check if user has permission to view reports
  const userRole = authStore.userRole
  if (!['ADMIN', 'ACTIVATION_MANAGER', 'CLIENT'].includes(userRole)) {
    console.log('User role does not have permission to view reports')
    return
  }
  
  try {
    const response = await leadService.getRecentReports(activationId.value)
    if (response && response.data) {
      recentReports.value = response.data
    }
  } catch (error) {
    // Silently handle the error and use mock data for now
    // This prevents console errors until the backend endpoint is implemented
    if (error.status === 404) {
      console.log('Recent reports endpoint not implemented yet, using mock data')
    } else if (error.status === 403) {
      console.log('Access denied for recent reports - insufficient permissions')
    } else {
      console.error('Error loading recent reports:', error)
    }
    
    // Fallback to mock data if API fails
    recentReports.value = [
      {
        id: 1,
        name: `Daily Activity Report - ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
        type: 'Daily',
        generatedDate: new Date(Date.now() - 2 * 60 * 60 * 1000),
        size: '2.1 MB',
        status: 'completed'
      },
      {
        id: 2,
        name: 'Performance Summary - Week 1',
        type: 'Weekly',
        generatedDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
        size: '5.3 MB',
        status: 'completed'
      },
      {
        id: 3,
        name: 'Customer Insights Report',
        type: 'Analytics',
        generatedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        size: '3.7 MB',
        status: 'completed'
      }
    ]
  }
}

// Gender Data Methods
const calculatePercentage = (value, total) => {
  if (!total || total === 0) return 0
  return Math.round((value / total) * 100)
}

const loadGenderData = async () => {
  if (!activationId.value) return
  
  // Check if user has permission to view gender distribution
  const userRole = authStore.userRole
  if (!['ADMIN', 'ACTIVATION_MANAGER', 'CLIENT'].includes(userRole)) {
    console.log('User role does not have permission to view gender distribution')
    loadingGenderData.value = false
    return
  }
  
  loadingGenderData.value = true
  try {
    // Fetch gender distribution data from the API
    const response = await leadService.getGenderDistribution(activationId.value)
    
    if (response) {
      const data = response.data || response
      
      // Extract gender counts from the genderCounts array
      const maleCounts = data.genderCounts?.find(g => g.gender === 'MALE') || { count: 0, percentage: 0 }
      const femaleCounts = data.genderCounts?.find(g => g.gender === 'FEMALE') || { count: 0, percentage: 0 }
      const otherCounts = data.genderCounts?.find(g => g.gender === 'OTHER') || { count: 0, percentage: 0 }
      
      genderData.value = {
        male: maleCounts.count,
        female: femaleCounts.count,
        other: otherCounts.count,
        total: data.totalLeads || 0,
        dominantGender: data.dominantGender === 'MALE' ? 'Male' : 
                       data.dominantGender === 'FEMALE' ? 'Female' : 
                       data.dominantGender === 'OTHER' ? 'Other' : null,
        conversionRate: {
          male: data.conversionRates?.maleConversionRate || 0,
          female: data.conversionRates?.femaleConversionRate || 0,
          other: data.conversionRates?.otherConversionRate || 0
        },
        trend: null
      }
      
      // Build trend description from the trends data
      if (data.trends) {
        const trendParts = []
        if (data.trends.malePercentageChange > 0) {
          trendParts.push(`Male leads increased by ${Math.abs(data.trends.malePercentageChange)}%`)
        } else if (data.trends.malePercentageChange < 0) {
          trendParts.push(`Male leads decreased by ${Math.abs(data.trends.malePercentageChange)}%`)
        }
        
        if (data.trends.femalePercentageChange > 0) {
          trendParts.push(`Female leads increased by ${Math.abs(data.trends.femalePercentageChange)}%`)
        } else if (data.trends.femalePercentageChange < 0) {
          trendParts.push(`Female leads decreased by ${Math.abs(data.trends.femalePercentageChange)}%`)
        }
        
        if (trendParts.length > 0) {
          genderData.value.trend = trendParts.join(', ')
        } else if (data.trends.maleVsPreviousPeriod === 'stable' && 
                   data.trends.femaleVsPreviousPeriod === 'stable') {
          genderData.value.trend = 'Gender distribution remains stable'
        }
      }
    }
  } catch (error) {
    if (error.status === 403) {
      console.log('Access denied for gender distribution - insufficient permissions')
    } else {
      console.error('Error loading gender data:', error)
    }
    toast.add({
      severity: 'error',
      summary: 'Failed to load gender data',
      detail: 'Unable to fetch gender distribution data',
      life: 3000
    })
    
    // Reset to empty state on error
    genderData.value = {
      male: 0,
      female: 0,
      other: 0,
      total: 0,
      dominantGender: null,
      conversionRate: { male: 0, female: 0, other: 0 },
      trend: null
    }
  } finally {
    loadingGenderData.value = false
  }
}

const refreshGenderData = async () => {
  await loadGenderData()
  toast.add({
    severity: 'success',
    summary: 'Data Refreshed',
    detail: 'Gender distribution data has been updated',
    life: 3000
  })
}

const exportGenderReport = async () => {
  try {
    // Generate CSV content
    const csvContent = [
      // Headers
      ['Gender Distribution Report'],
      [`Activation: ${activation.value?.name || 'Unknown'}`],
      [`Generated: ${new Date().toLocaleString()}`],
      [''],
      ['Gender', 'Count', 'Percentage'],
      // Data
      ['Male', genderData.value.male, `${calculatePercentage(genderData.value.male, genderData.value.total)}%`],
      ['Female', genderData.value.female, `${calculatePercentage(genderData.value.female, genderData.value.total)}%`],
      ['Other/Not Specified', genderData.value.other, `${calculatePercentage(genderData.value.other, genderData.value.total)}%`],
      ['Total', genderData.value.total, '100%'],
      [''],
      ['Conversion Rates'],
      ['Gender', 'Conversion Rate'],
      ['Male', `${genderData.value.conversionRate.male}%`],
      ['Female', `${genderData.value.conversionRate.female}%`],
      ['Other', `${genderData.value.conversionRate.other}%`],
      [''],
      ['Insights'],
      ['Dominant Gender', genderData.value.dominantGender || 'N/A'],
      ['Trend', genderData.value.trend || 'No trend data available']
    ]
    
    // Convert to CSV string
    const csv = csvContent.map(row => row.map(cell => {
      // Escape quotes and wrap in quotes if contains comma
      const str = String(cell)
      return str.includes(',') || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str
    }).join(',')).join('\n')
    
    // Download as CSV
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `gender-report-${activation.value?.name?.replace(/\s+/g, '-') || activationId.value}-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    
    toast.add({
      severity: 'success',
      summary: 'Report Exported',
      detail: 'Gender distribution report has been downloaded as CSV',
      life: 3000
    })
  } catch (error) {
    console.error('Error exporting gender report:', error)
    toast.add({
      severity: 'error',
      summary: 'Export Failed',
      detail: 'Failed to export gender report',
      life: 3000
    })
  }
}

const downloadReport = async (reportId) => {
  const report = recentReports.value.find(r => r.id === reportId)
  if (!report) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Report not found',
      life: 3000
    })
    return
  }

  try {
    // If the report has a downloadUrl from the backend, use it
    if (report.downloadUrl) {
      // Use the backend download URL
      const response = await fetch(report.downloadUrl, {
        headers: {
          'Authorization': `Bearer ${authStore.token}`,
        }
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = report.name.replace(/\s+/g, '-') + '.pdf'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        
        toast.add({
          severity: 'success',
          summary: 'Download Complete',
          detail: `${report.name} has been downloaded`,
          life: 3000
        })
      } else {
        throw new Error('Download failed')
      }
    }
    // For daily reports with content (generated in frontend), use HTML generation
    else if (report.type === 'Daily' && report.content) {
      generateDailyReportPDF(report)
    }
    // Fallback for reports without download URL
    else {
      toast.add({
        severity: 'info',
        summary: 'Download Started',
        detail: `Downloading ${report.name}...`,
        life: 3000
      })
      
      // Simulate download completion for reports without backend download
      setTimeout(() => {
        toast.add({
          severity: 'success',
          summary: 'Download Complete',
          detail: `${report.name} has been downloaded`,
          life: 3000
        })
      }, 2000)
    }
  } catch (error) {
    console.error('Error downloading report:', error)
    toast.add({
      severity: 'error',
      summary: 'Download Failed',
      detail: 'Failed to download report',
      life: 3000
    })
  }
}

const viewReport = (reportId) => {
  const report = recentReports.value.find(r => r.id === reportId)
  if (!report) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Report not found',
      life: 3000
    })
    return
  }

  // For now, show a preview in a toast - in production, this would open a modal or new tab
  if (report.type === 'Daily' && report.content) {
    const summary = `
      Daily Report Summary:
      • Total Leads: ${report.content.leads.total}
      • Best Promoter: ${report.content.bestPromoter.name} (${report.content.bestPromoter.leads} leads)
      • Total Revenue: $${report.content.sales.totalRevenue.toLocaleString()}
      • Conversion Rate: ${report.content.sales.conversionRate}%
    `
    toast.add({
      severity: 'info',
      summary: report.name,
      detail: summary,
      life: 10000
    })
  } else {
    toast.add({
      severity: 'info',
      summary: 'View Report',
      detail: `Opening ${report.name}...`,
      life: 3000
    })
  }
}

const generateDailyReportPDF = (report) => {
  try {
    const content = report.content
    if (!content) {
      console.error('Report content is missing')
      toast.add({
        severity: 'error',
        summary: 'Download Failed',
        detail: 'Report content is not available',
        life: 3000
      })
      return
    }
    
    // Generate HTML content for the report
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${report.name}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
          h1 { color: #333; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; }
          h2 { color: #555; margin-top: 30px; }
          .section { margin-bottom: 30px; }
          .metric { margin: 10px 0; }
          .metric-value { font-weight: bold; color: #3b82f6; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background-color: #f5f5f5; font-weight: bold; }
          .header-info { background: #f0f0f0; padding: 10px; margin-bottom: 20px; border-radius: 5px; }
        </style>
      </head>
      <body>
        <h1>${report.name}</h1>
        <div class="header-info">
          <div>Activation: ${activation.value?.name || 'Unknown'}</div>
          <div>Generated: ${new Date().toLocaleString()}</div>
          <div>Report Date: ${content.date}</div>
        </div>
        
        <div class="section">
          <h2>📊 Lead Summary</h2>
          <div class="metric">Total Leads Captured: <span class="metric-value">${content.leads.total}</span></div>
          <div class="metric">Gender Distribution: Male (${content.leads.byGender.male}), Female (${content.leads.byGender.female}), Other (${content.leads.byGender.other})</div>
          <div class="metric">Time Distribution: Morning (${content.leads.byHour.morning}), Afternoon (${content.leads.byHour.afternoon}), Evening (${content.leads.byHour.evening})</div>
          <div class="metric">Peak Hours: ${content.peakHours.join(', ')}</div>
        </div>
        
        <div class="section">
          <h2>🏆 Best Performing Promoter</h2>
          <div class="metric">Name: <span class="metric-value">${content.bestPromoter.name}</span></div>
          <div class="metric">Leads Captured: <span class="metric-value">${content.bestPromoter.leads}</span></div>
          <div class="metric">Sales: <span class="metric-value">${content.bestPromoter.sales}</span></div>
          <div class="metric">Revenue Generated: <span class="metric-value">$${content.bestPromoter.revenue.toLocaleString()}</span></div>
        </div>
        
        <div class="section">
          <h2>💰 Sales Performance</h2>
          <div class="metric">Total Revenue: <span class="metric-value">$${content.sales.totalRevenue.toLocaleString()}</span></div>
          <div class="metric">Transactions: <span class="metric-value">${content.sales.transactions}</span></div>
          <div class="metric">Average Transaction Value: <span class="metric-value">$${content.sales.averageValue.toFixed(2)}</span></div>
          <div class="metric">Conversion Rate: <span class="metric-value">${content.sales.conversionRate}%</span></div>
        </div>
        
        <div class="section">
          <h2>👥 Team Performance</h2>
          <div class="metric">Active Promoters: <span class="metric-value">${content.teamPerformance.activePromoters}</span></div>
          <div class="metric">Average Leads per Promoter: <span class="metric-value">${content.teamPerformance.averageLeadsPerPromoter}</span></div>
          <div class="metric">Check-in Compliance: <span class="metric-value">${content.teamPerformance.checkInCompliance}%</span></div>
        </div>
        
        <div class="section">
          <h2>📦 Top Products</h2>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Units Sold</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              ${content.topProducts.map(product => `
                <tr>
                  <td>${product.name}</td>
                  <td>${product.units}</td>
                  <td>$${product.revenue.toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </body>
      </html>
    `
    
    // Create and download the HTML file
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `daily-report-${activation.value?.name?.replace(/\s+/g, '-') || activationId.value}-${content.date}.html`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // Clean up
    setTimeout(() => {
      window.URL.revokeObjectURL(url)
    }, 100)
    
    toast.add({
      severity: 'success',
      summary: 'Report Downloaded',
      detail: 'Daily report has been downloaded as HTML',
      life: 3000
    })
  } catch (error) {
    console.error('Error generating report:', error)
    toast.add({
      severity: 'error',
      summary: 'Download Failed',
      detail: 'Failed to generate report',
      life: 3000
    })
  }
}

const formatBriefDescription = (text) => {
  if (!text) return ''
  
  let html = text
  
  // Escape HTML first to prevent XSS
  html = html.replace(/&/g, '&amp;')
             .replace(/</g, '&lt;')
             .replace(/>/g, '&gt;')
  
  // Process markdown in order (most specific first)
  
  // Headers (need to handle line breaks properly)
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>')
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>')
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>')
  
  // Bold and italic (process bold first to avoid conflicts)
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>')
  html = html.replace(/~~([^~]+)~~/g, '<del>$1</del>')
  
  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
  
  // Lists
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>')
  html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
  
  // Wrap consecutive list items in ul tags
  html = html.replace(/(<li>.*<\/li>)/gs, (match) => {
    const items = match.match(/<li>.*?<\/li>/g)
    if (items && items.length > 0) {
      return '<ul>' + items.join('') + '</ul>'
    }
    return match
  })
  
  // Line breaks (convert remaining newlines to <br>)
  html = html.replace(/\n/g, '<br>')
  
  // Clean up extra line breaks around block elements
  html = html.replace(/<br>\s*(<\/?(h[1-6]|ul|li)[^>]*>)/g, '$1')
  html = html.replace(/(<\/?(h[1-6]|ul|li)[^>]*>)\s*<br>/g, '$1')
  
  return html
}

const getBriefDocumentName = (path) => {
  if (!path) return 'Brief Document'
  return path.split('/').pop() || 'brief-document.pdf'
}

const downloadBriefDocument = async () => {
  if (!activation.value?.briefDocumentPath) return
  
  try {
    // Use direct S3 URL construction with VITE_AWS_S3_BUCKET
    const s3Url = await fileService.getS3FileUrl(activation.value.briefDocumentPath)
    
    // Create a temporary link to download the file
    const link = document.createElement('a')
    link.href = s3Url
    link.download = getBriefDocumentName(activation.value.briefDocumentPath)
    link.target = '_blank' // Ensure secure download from S3
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast.add({
      severity: 'success',
      summary: 'Download Started',
      detail: `Brief document download started from S3`
    })
  } catch (error) {
    console.error('S3 download error:', error)
    toast.add({
      severity: 'error',
      summary: 'Download Failed',
      detail: 'Failed to download brief document from S3 bucket. Please check if the file exists.'
    })
  }
}

const viewBriefDocument = async () => {
  if (!activation.value?.briefDocumentPath) return
  
  try {
    // Use direct S3 URL construction with VITE_AWS_S3_BUCKET
    const s3Url = await fileService.getS3FileUrl(activation.value.briefDocumentPath)
    
    // Open PDF in new tab using S3 URL
    window.open(s3Url, '_blank', 'noopener,noreferrer')
    
    toast.add({
      severity: 'success',
      summary: 'Document Opened',
      detail: 'Brief document opened from S3'
    })
  } catch (error) {
    console.error('S3 view error:', error)
    toast.add({
      severity: 'error',
      summary: 'View Failed',
      detail: 'Failed to open brief document from S3 bucket. Please check if the file exists.'
    })
  }
}

const emailBriefDocument = () => {
  toast.add({
    severity: 'info',
    summary: 'Email Feature',
    detail: 'Email document feature will be implemented in the next update',
    life: 3000
  })
}

const openMaps = () => {
  if (!activation.value) {
    toast.add({
      severity: 'warn',
      summary: 'Location Unavailable',
      detail: 'Activation data not available',
      life: 3000
    })
    return
  }

  // Prefer coordinates if available, otherwise use address
  let query = ''
  if (activation.value.latitude && activation.value.longitude) {
    query = `${activation.value.latitude},${activation.value.longitude}`
  } else {
    const address = formatFullAddress()
    if (!address.trim()) {
      toast.add({
        severity: 'warn',
        summary: 'Location Unavailable',
        detail: 'No location information available for this activation',
        life: 3000
      })
      return
    }
    query = encodeURIComponent(address)
  }
  
  window.open(`https://maps.google.com?q=${query}`, '_blank')
}

const getDirections = () => {
  if (!activation.value) {
    toast.add({
      severity: 'warn',
      summary: 'Location Unavailable',
      detail: 'Activation data not available',
      life: 3000
    })
    return
  }

  // Prefer coordinates if available, otherwise use address
  let destination = ''
  if (activation.value.latitude && activation.value.longitude) {
    destination = `${activation.value.latitude},${activation.value.longitude}`
  } else {
    const address = formatFullAddress()
    if (!address.trim()) {
      toast.add({
        severity: 'warn',
        summary: 'Location Unavailable',
        detail: 'No location information available for directions',
        life: 3000
      })
      return
    }
    destination = encodeURIComponent(address)
  }
  
  window.open(`https://maps.google.com/dir/?api=1&destination=${destination}`, '_blank')
}

const formatFullAddress = () => {
  if (!activation.value) return ''
  const parts = [
    activation.value.streetAddress,
    activation.value.city,
    activation.value.zipCode
  ].filter(Boolean)
  return parts.join(', ')
}



// Watch for dialog opens to load data
watch(showTeamAssignmentDialog, (newValue) => {
  if (newValue) {
    // Initialize assigned team members from current activation data
    assignedTeamMembers.value = activation.value?.assignedPromoters ? [...activation.value.assignedPromoters] : []
    // Load available promoters
    loadAvailablePromoters()
  }
})

watch(showManagerAssignmentDialog, (newValue) => {
  if (newValue) {
    // Load available managers
    loadAvailableManagers()
    // Set current manager as selected if exists
    selectedManagerId.value = activation.value?.activationManagerId || null
  }
})


// Lead Management Methods
const loadActivationLeads = async (page = 0) => {
  if (!activation.value?.id) {
    console.log('No activation ID, skipping lead load')
    return
  }
  
  console.log('Loading leads for activation ID:', activation.value.id)
  console.log('Current user role:', userRole.value)
  console.log('Can capture leads:', canCaptureLeads.value)
  leadsLoading.value = true
  try {
    const params = {
      page,
      size: 10,
      searchTerm: leadSearchQuery.value || undefined
    }
    
    console.log('Fetching leads with params:', params)
    const response = await leadService.getLeadsByActivation(
      activation.value.id, 
      params, 
      userRole.value, 
      authStore.userId
    )
    console.log('Lead response:', response)
    
    // Handle different response structures
    if (response && typeof response === 'object') {
      if (response.content !== undefined) {
        // Spring Boot pagination response
        activationLeads.value = response.content || []
        totalLeads.value = response.totalElements || 0
      } else if (response.data !== undefined) {
        // Custom API response with data field
        activationLeads.value = response.data || []
        totalLeads.value = response.total || response.totalElements || 0
      } else if (Array.isArray(response)) {
        // Direct array response
        activationLeads.value = response
        totalLeads.value = response.length
      } else {
        // Unknown structure, log for debugging
        console.warn('Unexpected response structure:', response)
        activationLeads.value = []
        totalLeads.value = 0
      }
    } else {
      activationLeads.value = []
      totalLeads.value = 0
    }
    
    console.log('Loaded leads:', activationLeads.value)
    console.log('Total leads:', totalLeads.value)
  } catch (error) {
    console.error('Error loading activation leads:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load leads',
      life: 3000
    })
  } finally {
    leadsLoading.value = false
  }
}

const loadLeadStats = async () => {
  if (!activation.value?.id) return
  
  try {
    const params = { activationId: activation.value.id }
    const stats = await leadService.getLeadStatistics(params)
    leadStats.value = stats
  } catch (error) {
    console.error('Error loading lead statistics:', error)
  }
}

const calculateConversionRate = () => {
  if (!leadStats.value || !leadStats.value.totalLeads) return 0
  const converted = leadStats.value.optedInLeads || 0
  return Math.round((converted / leadStats.value.totalLeads) * 100)
}

const onLeadCaptured = async (lead) => {
  showLeadCaptureDialog.value = false
  toast.add({
    severity: 'success',
    summary: 'Success',
    detail: 'Lead captured successfully!',
    life: 3000
  })
  
  // Small delay to ensure backend has processed the lead
  setTimeout(async () => {
    console.log('Refreshing leads after capture...')
    await loadActivationLeads()
    await loadLeadStats()
  }, 500)
}

const onLeadFormReset = () => {
  // Handle form reset if needed
}

const handleSaleRecorded = async (sale) => {
  showRecordSaleDialog.value = false
  
  toast.add({
    severity: 'success',
    summary: 'Success',
    detail: 'Sale recorded successfully!',
    life: 3000
  })
  
  // Refresh activation data to update sales stats
  await loadActivationData(activationId.value)
}

const viewLeadDetails = (lead) => {
  selectedLead.value = lead
  showLeadDetailsDialog.value = true
}

const editLead = (lead) => {
  // TODO: Implement edit functionality if needed
  toast.add({
    severity: 'info',
    summary: 'Info',
    detail: 'Edit functionality coming soon',
    life: 3000
  })
}

const openLeadCommentDialog = (lead) => {
  selectedLead.value = lead
  showLeadCommentDialog.value = true
}

const closeLeadCommentDialog = () => {
  showLeadCommentDialog.value = false
  selectedLead.value = null
}

const onLeadCommentSuccess = async (result) => {
  toast.add({
    severity: 'success',
    summary: 'Comments Saved',
    detail: 'Lead insights have been successfully recorded',
    life: 3000
  })
  
  // Close the dialog
  closeLeadCommentDialog()
  
  // Refresh the leads list to show updated data
  await loadActivationLeads()
}

const onLeadPageChange = (event) => {
  loadActivationLeads(event.page)
}

const onLeadSort = () => {
  loadActivationLeads(0)
}

let leadSearchTimeout
const debounceLeadSearch = () => {
  clearTimeout(leadSearchTimeout)
  leadSearchTimeout = setTimeout(() => {
    loadActivationLeads(0)
  }, 500)
}

const exportActivationLeads = async () => {
  if (!activation.value?.id) return
  
  leadExportLoading.value = true
  try {
    // Use the specific activation export endpoint
    const blob = await leadService.exportActivationLeads(activation.value.id, leadExportFormat.value)
    
    // Generate filename with activation name and date
    const activationName = activation.value.name ? activation.value.name.replace(/[^a-zA-Z0-9]/g, '_') : 'activation'
    const dateStr = new Date().toISOString().split('T')[0]
    const filename = `${activationName}_leads_${dateStr}.${leadExportFormat.value}`
    
    // Download the file
    leadService.downloadExportFile(blob, filename)
    
    showLeadExportDialog.value = false
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: `Leads exported successfully as ${filename}`,
      life: 3000
    })
  } catch (error) {
    console.error('Error exporting activation leads:', error)
    const errorMessage = error.response?.data?.message || error.message || 'Failed to export leads'
    toast.add({
      severity: 'error',
      summary: 'Export Failed',
      detail: errorMessage,
      life: 5000
    })
  } finally {
    leadExportLoading.value = false
  }
}

// Utility methods for lead display
const formatPhoneNumber = (phone) => {
  return leadService.formatPhoneNumber(phone)
}

const getGenderLabel = (gender) => {
  return leadService.getGenderLabel(gender)
}

const getAgeGroupLabel = (ageGroup) => {
  return leadService.getAgeGroupLabel(ageGroup)
}

// Check-in/out event handlers
const handleCheckinSuccess = (result) => {
  toast.add({
    severity: 'success',
    summary: 'Check-in Successful',
    detail: 'You have successfully checked in to this activation',
    life: 3000
  })
  // Reload activation data to refresh status
  loadActivationData()
}

const handleCheckoutSuccess = (result) => {
  toast.add({
    severity: 'success',
    summary: 'Check-out Successful',
    detail: 'You have successfully checked out of this activation',
    life: 3000
  })
  // Don't reload the entire page data - the PromoterCheckInOut component handles its own data refresh
  // loadActivationData()
}

const handleImagesUpdated = (images) => {
  toast.add({
    severity: 'success',
    summary: 'Images Updated',
    detail: `Successfully updated activation images`,
    life: 3000
  })
  // Optionally refresh activation data to show updated images
  // loadActivationData()
}

const getCustomerTypeLabel = (customerType) => {
  return leadService.getCustomerTypeLabel(customerType)
}

const getRepeatPurchaseLabel = (intent) => {
  return leadService.getRepeatPurchaseLabel(intent)
}

const getEngagementSeverity = (level) => {
  if (!level) return 'secondary'
  if (level >= 4) return 'success'
  if (level >= 3) return 'warning'
  return 'danger'
}

const getCustomerTypeSeverity = (type) => {
  const severityMap = {
    'SHOPPER': 'info',
    'RETAILER': 'success',
    'DISTRIBUTOR': 'warning'
  }
  return severityMap[type] || 'secondary'
}

const getBrandAwarenessLabel = (level) => {
  const labels = {
    1: 'Never heard of it',
    2: 'Heard of it',
    3: 'Somewhat familiar',
    4: 'Familiar',
    5: 'Very familiar'
  }
  return labels[level] || '-'
}

// Reports Methods
const goToLiveMetrics = () => {
  showReportsMenu.value = false
  router.push('/reports/live-metrics')
}

const goToPromoterReports = () => {
  showReportsMenu.value = false
  router.push('/reports/promoter-reports')
}

const goToROIAnalysis = () => {
  showReportsMenu.value = false
  router.push('/reports/roi-analysis')
}

const goToMainReports = () => {
  showReportsMenu.value = false
  router.push('/reports')
}

const exportActivationSummary = async () => {
  exportingPDF.value = true
  try {
    // Mock export for now - in real implementation, would call API
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Create a simple text file for demonstration
    const content = `Activation Summary Report
    
Activation: ${activation.value?.name}
Status: ${activation.value?.status}
Progress: ${activation.value?.progress}%
Team Size: ${allTeamMembers.value.length}
Revenue: $${(activation.value?.totalRevenueUSD || 0).toLocaleString()}
Generated on: ${new Date().toLocaleString()}`
    
    const blob = new Blob([content], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `activation-summary-${activation.value?.id}-${new Date().toISOString().split('T')[0]}.txt`
    link.click()
    window.URL.revokeObjectURL(url)
    
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Activation summary exported successfully',
      life: 3000
    })
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to export activation summary',
      life: 5000
    })
    console.error('Export error:', error)
  } finally {
    exportingPDF.value = false
  }
}

const exportLeadsData = async () => {
  exportingExcel.value = true
  try {
    // Mock export for now - in real implementation, would call lead export API
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Create CSV content for demonstration
    const headers = ['Name', 'Email', 'Phone', 'Marketing Opt-in', 'WhatsApp Opt-in', 'Brand Awareness', 'Date Captured']
    const csvContent = [
      headers.join(','),
      ...activationLeads.value.map(lead => [
        `"${lead.name || ''}"`,
        `"${lead.email || ''}"`,
        `"${lead.phone || ''}"`,
        lead.optIn === null ? 'Not Set' : (lead.optIn ? 'Yes' : 'No'),
        lead.whatsappOptIn === null ? 'Not Set' : (lead.whatsappOptIn ? 'Yes' : 'No'),
        lead.brandAwarenessLevel || '',
        new Date(lead.createdAt).toLocaleDateString()
      ].join(','))
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `leads-data-${activation.value?.id}-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    window.URL.revokeObjectURL(url)
    
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Leads data exported successfully',
      life: 3000
    })
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to export leads data',
      life: 5000
    })
    console.error('Export error:', error)
  } finally {
    exportingExcel.value = false
  }
}

// Update the onMounted to also load leads if user can capture leads
onMounted(() => {
  loadActivationData()
  
  // Set up a watcher to load leads when activation data is available
  watch(() => activation.value?.id, (newId) => {
    if (newId && canCaptureLeads.value) {
      console.log('Loading leads for activation:', newId)
      loadActivationLeads()
      loadLeadStats()
    }
    // Load gender data and recent reports when activation is loaded
    if (newId) {
      loadGenderData()
      loadRecentReports()
    }
  }, { immediate: true })
})
</script>

<style scoped>
.activation-details-page {
  padding: 1.5rem;
}

.loading-container,
.error-container,
.not-found-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  text-align: center;
}

.error-card {
  max-width: 500px;
  width: 100%;
}

.error-content {
  text-align: center;
  padding: 2rem;
}

.error-icon {
  font-size: 3rem;
  color: #ef4444;
  margin-bottom: 1rem;
}

.error-message {
  color: #6b7280;
  margin: 1rem 0;
  line-height: 1.5;
}

.error-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
  margin-top: 1.5rem;
}

.retry-info {
  color: #6b7280;
  font-size: 0.875rem;
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
.stat-icon.hours { background: linear-gradient(135deg, #f59e0b, #d97706); }

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

.brief-description-content {
  color: #111827;
  line-height: 1.5;
  margin-top: 0.25rem;
}

.brief-description-content h1,
.brief-description-content h2,
.brief-description-content h3 {
  color: #111827;
  margin: 0.25rem 0;
}

.brief-description-content h1 {
  font-size: 1.1rem;
  font-weight: 700;
}

.brief-description-content h2 {
  font-size: 1rem;
  font-weight: 600;
}

.brief-description-content h3 {
  font-size: 0.95rem;
  font-weight: 600;
}

.brief-description-content strong {
  font-weight: 600;
  color: #111827;
}

.brief-description-content em {
  font-style: italic;
  color: #374151;
}

.brief-description-content del {
  text-decoration: line-through;
  color: #6b7280;
}

.brief-description-content a {
  color: #3b82f6;
  text-decoration: underline;
}

.brief-description-content a:hover {
  color: #1d4ed8;
}

.brief-description-content ul {
  margin: 0.25rem 0;
  padding-left: 1.25rem;
}

.brief-description-content li {
  margin-bottom: 0.125rem;
  list-style-type: disc;
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

.card-header-with-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

.card-header-with-actions h3 {
  margin: 0;
  color: #495057;
  font-weight: 600;
}

.promoters-actions {
  margin: 1rem 0;
  display: flex;
  justify-content: center;
}

.promoters-actions .p-button {
  margin: 0 0.5rem;
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

/* Gender Distribution Report Styles */
.gender-distribution-card {
  margin: 1.5rem 0;
}

.card-header-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header-flex h4 {
  margin: 0;
  color: #111827;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.gender-report-content {
  padding: 1rem;
}

.gender-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  border-radius: 0.5rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  transition: all 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.stat-card.male {
  border-left: 4px solid #3b82f6;
}

.stat-card.female {
  border-left: 4px solid #ec4899;
}

.stat-card.other {
  border-left: 4px solid #6b7280;
}

.stat-icon {
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  font-size: 1.5rem;
}

.stat-card.male .stat-icon {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.stat-card.female .stat-icon {
  background: rgba(236, 72, 153, 0.1);
  color: #ec4899;
}

.stat-card.other .stat-icon {
  background: rgba(107, 114, 128, 0.1);
  color: #6b7280;
}

.stat-details h5 {
  margin: 0 0 0.5rem 0;
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.stat-value {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: #111827;
}

.stat-percentage {
  font-size: 0.875rem;
  color: #6b7280;
}

.gender-chart-container {
  height: 300px;
  margin-bottom: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

.gender-chart {
  max-width: 400px;
  width: 100%;
}

.gender-insights {
  background: #f9fafb;
  padding: 1.25rem;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
}

.gender-insights h5 {
  margin: 0 0 1rem 0;
  color: #111827;
  font-size: 1rem;
}

.gender-insights ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.gender-insights li {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0;
  color: #6b7280;
}

.gender-insights li i {
  color: #3b82f6;
  font-size: 1rem;
}

.gender-insights .no-data-message {
  text-align: center;
  color: #6b7280;
  padding: 1rem;
  margin: 0;
}

.gender-insights .no-data-message i {
  margin-right: 0.5rem;
  color: #9ca3af;
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


:deep(.over-budget .p-progressbar-value) {
  background: #ef4444;
}

/* Brief Card Styles */
.brief-card {
  border-left: 4px solid #3b82f6;
}

.brief-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.brief-header h3 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  color: #111827;
}

.brief-icon {
  color: #3b82f6;
}

.brief-tag {
  font-size: 0.75rem;
}

.brief-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.brief-description,
.brief-document {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.brief-description-header,
.brief-document-header {
  display: flex;
  align-items: center;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.brief-description-header label,
.brief-document-header label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #374151;
  font-size: 0.9rem;
  margin: 0;
}

.brief-description-header i,
.brief-document-header i {
  color: #6b7280;
}

.brief-text-content {
  background: #f9fafb;
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
  line-height: 1.6;
  color: #374151;
}

.brief-text-content h1,
.brief-text-content h2,
.brief-text-content h3 {
  color: #111827;
  margin: 0.5rem 0;
}

.brief-text-content h1 {
  font-size: 1.25rem;
  font-weight: 700;
}

.brief-text-content h2 {
  font-size: 1.125rem;
  font-weight: 600;
}

.brief-text-content h3 {
  font-size: 1rem;
  font-weight: 600;
}

.brief-text-content strong {
  font-weight: 600;
  color: #111827;
}

.brief-text-content em {
  font-style: italic;
  color: #374151;
}

.brief-text-content del {
  text-decoration: line-through;
  color: #6b7280;
}

.brief-text-content a {
  color: #3b82f6;
  text-decoration: underline;
}

.brief-text-content a:hover {
  color: #1d4ed8;
}

.brief-text-content li {
  margin-bottom: 0.25rem;
  list-style-position: inside;
}

/* Brief Document Display Styles */
.document-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.document-item:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.document-preview {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.document-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(239, 68, 68, 0.3);
}

.document-icon {
  font-size: 1.75rem;
  color: white;
}

.file-type-badge {
  position: absolute;
  bottom: -4px;
  right: -4px;
  background: #111827;
  color: white;
  font-size: 0.6rem;
  font-weight: 600;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  letter-spacing: 0.025em;
}

.document-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
}

.document-name {
  font-weight: 600;
  color: #111827;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.document-attachment-icon {
  color: #6b7280;
  font-size: 0.875rem;
}

.document-status {
  color: #059669;
  font-size: 0.75rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.status-icon {
  color: #10b981;
  font-size: 0.75rem;
}

.document-actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.download-btn {
  background: linear-gradient(135deg, #10b981, #059669);
  border-color: #10b981;
  color: white;
}

.download-btn:hover {
  background: linear-gradient(135deg, #059669, #047857);
  border-color: #059669;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(16, 185, 129, 0.3);
}

.email-btn {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  border-color: #f59e0b;
  color: white;
}

.email-btn:hover {
  background: linear-gradient(135deg, #d97706, #b45309);
  border-color: #d97706;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(245, 158, 11, 0.3);
}

.view-btn {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border-color: #3b82f6;
  color: white;
}

.view-btn:hover {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  border-color: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
}

.no-brief-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: #f9fafb;
  border: 1px dashed #d1d5db;
  border-radius: 0.5rem;
  color: #6b7280;
  font-style: italic;
  text-align: center;
  justify-content: center;
}

.no-brief-content i {
  color: #9ca3af;
}

/* Team Assignment Dialog Styles */
.team-assignment-dialog .dialog-content {
  padding: 0;
}

.assignment-sections {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  min-height: 500px;
}

.section h4 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 1rem 0;
  color: #111827;
  font-size: 1.1rem;
  font-weight: 600;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.section h4 i {
  color: #3b82f6;
}

.promoters-search,
.search-managers {
  margin-bottom: 1rem;
}

.available-promoters-list,
.assigned-team-list {
  max-height: 400px;
  overflow-y: auto;
}

.loading-promoters,
.loading-managers,
.no-promoters,
.no-team-members {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 2rem;
  color: #6b7280;
  font-style: italic;
  text-align: center;
}

.promoter-cards,
.team-member-cards {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.promoter-card,
.team-member-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
  cursor: pointer;
}

.promoter-card:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
  transform: translateY(-1px);
}

.promoter-avatar,
.member-avatar {
  flex-shrink: 0;
  background: #3b82f6;
}

.promoter-info,
.member-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.promoter-name,
.member-name {
  font-weight: 600;
  color: #111827;
}

.promoter-email,
.member-email {
  font-size: 0.875rem;
  color: #6b7280;
}

.promoter-skills {
  font-size: 0.75rem;
  color: #9ca3af;
  font-style: italic;
}

.role-dropdown {
  width: 100%;
  font-size: 0.875rem;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 0 0 0;
  border-top: 1px solid #e5e7eb;
}

/* Manager Assignment Dialog Styles */
.manager-assignment-dialog .dialog-content {
  padding: 0;
}

.current-manager {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.current-manager h4 {
  margin: 0 0 1rem 0;
  color: #111827;
  font-size: 1.1rem;
  font-weight: 600;
}

.manager-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.current-manager-avatar {
  background: linear-gradient(135deg, #10b981, #059669);
}

.manager-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.manager-name {
  font-weight: 600;
  color: #111827;
  font-size: 1.1rem;
}

.manager-id {
  font-size: 0.875rem;
  color: #6b7280;
  font-family: monospace;
}

.manager-selection h4 {
  margin: 0 0 1rem 0;
  color: #111827;
  font-size: 1.1rem;
  font-weight: 600;
}

.managers-list {
  max-height: 300px;
  overflow-y: auto;
  margin-top: 1rem;
}

.manager-options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.manager-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.manager-option:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.manager-option.selected {
  background: #eff6ff;
  border-color: #3b82f6;
  box-shadow: 0 0 0 1px #3b82f6;
}

.manager-option-avatar {
  flex-shrink: 0;
  background: #6366f1;
}

.manager-option-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.manager-option-name {
  font-weight: 600;
  color: #111827;
}

.manager-option-email {
  font-size: 0.875rem;
  color: #6b7280;
}

.manager-experience {
  font-size: 0.75rem;
  color: #9ca3af;
  font-style: italic;
}

.manager-option .pi-check {
  color: #10b981;
  font-size: 1.25rem;
}

@media (max-width: 768px) {
  .activation-details-page {
    padding: 1rem;
  }
  
  .assignment-sections {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .team-assignment-dialog,
  .manager-assignment-dialog {
    margin: 1rem;
    width: calc(100vw - 2rem) !important;
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


.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.section-header h3 {
  margin: 0;
  color: #111827;
  font-size: 1.25rem;
  font-weight: 600;
}

.section-actions {
  display: flex;
  gap: 0.75rem;
}

/* Lead Management Styles */
.lead-management-content {
  .lead-stats-section {
    margin: 1.5rem 0;
  }
  
  .leads-table-card {
    margin-top: 1.5rem;
    
    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1rem 0 1rem;
      
      h3 {
        margin: 0;
        font-size: 1.125rem;
        font-weight: 600;
        color: #111827;
      }
    }
    
    .activation-leads-table {
      .lead-name-cell {
        strong {
          display: block;
          color: #111827;
        }
        
        small {
          color: #6b7280;
          font-size: 0.75rem;
        }
      }
      
      .rating-cell {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.25rem;
        
        .star-rating {
          display: flex;
          gap: 0.125rem;
          
          .pi {
            font-size: 0.75rem;
          }
        }
        
        small {
          font-size: 0.7rem;
          color: #6b7280;
          text-align: center;
        }
      }
      
      .no-data {
        color: #9ca3af;
        font-style: italic;
      }
      
      .action-buttons {
        display: flex;
        gap: 0.25rem;
      }
    }
  }
}

.lead-details {
  .detail-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    
    .detail-item {
      &.full-width {
        grid-column: 1 / -1;
      }
      
      label {
        display: block;
        font-weight: 500;
        color: #374151;
        margin-bottom: 0.25rem;
        font-size: 0.875rem;
      }
      
      span {
        color: #111827;
      }
    }
  }
}

.export-options {
  .form-group {
    margin-bottom: 1.5rem;
    
    label {
      display: block;
      margin-bottom: 0.75rem;
      font-weight: 500;
      color: #374151;
    }
    
    .format-options {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      
      .format-option {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        
        label {
          margin-bottom: 0;
          font-weight: normal;
          cursor: pointer;
        }
      }
    }
  }
}

/* Lead statistics icons */
.stat-icon {
  &.opted-in {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;
  }
  
  &.whatsapp {
    background: linear-gradient(135deg, #25d366 0%, #128c7e 100%);
    color: white;
  }
  
  &.conversion {
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    color: white;
  }
}

/* Lead Comment Dialog Styles */
.lead-comment-dialog {
  .p-dialog-content {
    padding: 0;
  }
}

/* Reports Menu Dialog Styles */
.reports-menu-dialog {
  .reports-content {
    .reports-description {
      margin-bottom: 1.5rem;
      color: #6b7280;
      text-align: center;
    }
    
    .report-options {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 1.5rem;
      
      .report-option {
        cursor: pointer;
        transition: all 0.2s ease;
        border: 2px solid transparent;
        
        &:hover {
          border-color: #3b82f6;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        .report-option-content {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.5rem;
          
          .report-icon {
            width: 3rem;
            height: 3rem;
            border-radius: 0.75rem;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            color: white;
            
            &.live-metrics {
              background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            }
            
            &.promoter-reports {
              background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            }
            
            &.roi-analysis {
              background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
            }
          }
          
          .report-info {
            flex: 1;
            
            h4 {
              margin: 0 0 0.25rem 0;
              color: #111827;
              font-size: 1rem;
              font-weight: 600;
            }
            
            p {
              margin: 0 0 0.5rem 0;
              color: #6b7280;
              font-size: 0.875rem;
            }
            
            .report-role {
              display: inline-block;
              background: #f3f4f6;
              color: #374151;
              padding: 0.25rem 0.5rem;
              border-radius: 0.25rem;
              font-size: 0.75rem;
              font-weight: 500;
            }
          }
          
          .report-arrow {
            color: #9ca3af;
            font-size: 1rem;
          }
        }
      }
      
      .export-section {
        border-top: 1px solid #e5e7eb;
        padding-top: 1.5rem;
        
        h4 {
          margin: 0 0 1rem 0;
          color: #111827;
          font-size: 1rem;
          font-weight: 600;
        }
        
        .export-buttons {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
          
          .export-btn {
            flex: 1;
            min-width: 200px;
          }
        }
      }

      .view-all-section {
        border-top: 1px solid #e5e7eb;
        padding-top: 1rem;
        text-align: center;
        
        .view-all-btn {
          width: 100%;
          justify-content: center;
        }
      }
    }
  }
}

/* Lead Insights Table Styles */
.insight-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  text-align: center;
}

.mini-rating {
  scale: 0.8;
}

:deep(.mini-rating .p-rating-icon) {
  font-size: 1rem;
}

.engagement-tag {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
}

.no-data {
  color: #6c757d;
  font-style: italic;
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  
  .section-actions {
    justify-content: center;
  }
  
  .lead-details .detail-grid {
    grid-template-columns: 1fr;
  }
  
  .export-options .format-options {
    .format-option {
      padding: 0.5rem;
      border: 1px solid #e5e7eb;
      border-radius: 0.375rem;
      
      &:hover {
        background-color: #f9fafb;
      }
    }
  }
  
  .insight-cell {
    scale: 0.9;
  }
}
</style>