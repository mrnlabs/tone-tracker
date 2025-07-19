<template>
  <DashboardLayout>
    <div class="warehouse-details-page">
      <!-- Loading State -->
      <div v-if="loading" class="loading-container">
        <ProgressSpinner />
        <p>Loading warehouse details...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-container">
        <EmptyState
          type="error"
          title="Error Loading Warehouse"
          :message="error"
          :actions="[{ label: 'Back to Warehouses', action: 'back', icon: 'pi pi-arrow-left' }]"
          @action="handleEmptyStateAction"
        />
      </div>

      <!-- Not Found State -->
      <div v-else-if="!warehouse" class="not-found-container">
        <EmptyState
          type="error"
          title="Warehouse Not Found"
          message="The warehouse you're looking for could not be found."
          :actions="[{ label: 'Back to Warehouses', action: 'back', icon: 'pi pi-arrow-left' }]"
          @action="handleEmptyStateAction"
        />
      </div>

      <!-- Warehouse Details Content -->
      <div v-else class="warehouse-content">
        <!-- Page Header -->
        <PageHeader 
          :title="warehouse.name"
          :description="`${warehouse.streetAddress}${warehouse.city ? ', ' + warehouse.city : ''}`"
          :actions="headerActions"
          :loading="loading"
        >
          <template #subtitle>
            <div class="warehouse-meta">
              <div class="meta-items">
                <div class="meta-item">
                  <i class="pi pi-user"></i>
                  <span>{{ warehouse.warehouseManagerName || 'No manager assigned' }}</span>
                </div>
                <div class="meta-item">
                  <i class="pi pi-calendar"></i>
                  <span>Created {{ formatDate(warehouse.dateCreated) }}</span>
                </div>
                <div class="meta-item" v-if="warehouse.lastUpdated">
                  <i class="pi pi-clock"></i>
                  <span>Updated {{ formatDate(warehouse.lastUpdated) }}</span>
                </div>
              </div>
            </div>
          </template>
        </PageHeader>

        <!-- Main Content with Tabs -->
        <div class="content-main">
          <TabView>
            <!-- Warehouse Overview Tab -->
            <TabPanel header="Warehouse Overview">
              <div class="warehouse-overview">
                <!-- Warehouse Information Section -->
                <div class="warehouse-section">
                  <h3 class="section-title">
                    <i class="pi pi-building"></i>
                    Warehouse Information
                  </h3>
                  
                  <div class="info-cards-grid">
                    <!-- Basic Information Card -->
                    <Card class="info-card">
                      <template #content>
                        <div class="info-grid">
                          <div class="info-item">
                            <label>Warehouse Name:</label>
                            <span>{{ warehouse.name }}</span>
                          </div>
                          <div class="info-item">
                            <label>Street Address:</label>
                            <span>{{ warehouse.streetAddress }}</span>
                          </div>
                          <div class="info-item" v-if="warehouse.city">
                            <label>City:</label>
                            <span>{{ warehouse.city }}</span>
                          </div>
                          <div class="info-item">
                            <label>Date Created:</label>
                            <span>{{ formatDate(warehouse.dateCreated) }}</span>
                          </div>
                        </div>
                      </template>
                    </Card>

                    <!-- Manager Information Card -->
                    <Card class="info-card">
                      <template #title>
                        <div class="card-header">
                          <i class="pi pi-user"></i>
                          <span>Warehouse Manager</span>
                        </div>
                      </template>
                      <template #content>
                        <div v-if="warehouse.warehouseManagerId" class="manager-summary">
                          <div class="manager-avatar-small">
                            <i class="pi pi-user"></i>
                          </div>
                          <div class="manager-info-summary">
                            <h5>{{ warehouse.warehouseManagerName }}</h5>
                            <p class="manager-id-info">Manager ID: {{ warehouse.warehouseManagerId }}</p>
                          </div>
                        </div>
                        <div v-else class="no-manager-summary">
                          <i class="pi pi-user-plus"></i>
                          <p>No manager assigned</p>
                        </div>
                      </template>
                    </Card>
                  </div>
                </div>

                <!-- Stock Inventory Section -->
                <div class="warehouse-section">
                  <div class="section-header">
                    <h3 class="section-title">
                      <i class="pi pi-box"></i>
                      {{ warehouse.name }} - Stock Inventory
                    </h3>
                    <div class="section-actions">
                      <div class="stock-stats">
                        <span class="stat-badge">
                          <i class="pi pi-box"></i>
                          {{ stockCount }} Items
                        </span>
                      </div>
                      <Button
                        label="Add Stock"
                        icon="pi pi-plus"
                        class="p-button-success"
                        @click="showAddStockDialog"
                        :disabled="!canManageWarehouse"
                      />
                    </div>
                  </div>

                  <!-- Stock Inventory Table -->
                  <Card class="inventory-card">
                    <template #content>
                      <DataTable
                        :value="warehouseStocks"
                        :loading="loadingInventory"
                        responsiveLayout="scroll"
                        :paginator="true"
                        :rows="10"
                        :totalRecords="warehouseStocks.length"
                        class="warehouse-stock-table"
                      >
                        <template #header>
                          <div class="table-header-content">
                            <div class="table-title">
                              <h4>Stock Items in {{ warehouse.name }}</h4>
                              <p class="table-subtitle">Manage inventory for this warehouse location</p>
                            </div>
                            <div class="table-actions">
                              <Button
                                label="Refresh"
                                icon="pi pi-refresh"
                                class="p-button-outlined p-button-sm"
                                @click="loadInventory"
                                :loading="loadingInventory"
                              />
                            </div>
                          </div>
                        </template>

                        <template #empty>
                          <div class="empty-stock-state">
                            <i class="pi pi-box empty-icon"></i>
                            <h4>No Stock Items</h4>
                            <p>{{ warehouse.name }} doesn't have any stock items yet.</p>
                            <Button
                              v-if="canManageWarehouse"
                              label="Add First Stock Item"
                              icon="pi pi-plus"
                              class="p-button-primary"
                              @click="showAddStockDialog"
                            />
                          </div>
                        </template>

                        <Column field="id" header="Stock ID" sortable style="width: 100px;"></Column>
                        
                        <Column field="productName" header="Product" sortable>
                          <template #body="{ data }">
                            <div class="product-cell">
                              <span class="product-name">{{ data.productName || 'Unknown Product' }}</span>
                              <span class="product-sku">SKU: {{ data.sku || data.id }}</span>
                            </div>
                          </template>
                        </Column>

                        <Column field="type" header="Type" sortable>
                          <template #body="{ data }">
                            <Tag :value="data.type" class="type-tag" />
                          </template>
                        </Column>

                        <Column field="quantityInWarehouse" header="Quantity" sortable>
                          <template #body="{ data }">
                            <div class="quantity-cell">
                              <span class="quantity-number">{{ data.quantityInWarehouse || 0 }}</span>
                              <span class="quantity-label">units</span>
                            </div>
                          </template>
                        </Column>

                        <Column field="unitPriceUSD" header="Unit Price" sortable>
                          <template #body="{ data }">
                            <div class="price-cell">
                              <span class="price-usd">${{ data.unitPriceUSD ? Number(data.unitPriceUSD).toFixed(2) : '0.00' }}</span>
                              <span class="price-zwl">ZWL ${{ data.unitPriceZWL ? Number(data.unitPriceZWL).toFixed(2) : '0.00' }}</span>
                            </div>
                          </template>
                        </Column>

                        <Column field="dateCreated" header="Added" sortable>
                          <template #body="{ data }">
                            <span class="date-added">{{ formatDate(data.dateCreated) }}</span>
                          </template>
                        </Column>

                        <Column header="Actions" :exportable="false" style="width: 120px;">
                          <template #body="{ data }">
                            <div class="stock-actions-compact">
                              <Button
                                icon="pi pi-pencil"
                                class="p-button-text p-button-sm p-button-rounded"
                                v-tooltip.top="'Edit Stock'"
                                @click="editStock(data)"
                              />
                              <Button
                                icon="pi pi-times"
                                class="p-button-text p-button-sm p-button-rounded p-button-warning"
                                v-tooltip.top="'Deactivate Stock'"
                                @click="deactivateStock(data)"
                              />
                            </div>
                          </template>
                        </Column>
                      </DataTable>
                    </template>
                  </Card>
                </div>
              </div>
            </TabPanel>

            <!-- Manager Management Tab -->
            <TabPanel header="Manager Management">
              <div class="manager-content">
                <!-- Current Manager Card -->
                <Card class="manager-card">
                  <template #title>
                    <div class="card-header">
                      <i class="pi pi-user"></i>
                      <span>Warehouse Manager</span>
                    </div>
                  </template>
                  <template #content>
                    <div v-if="warehouse.warehouseManagerId" class="manager-info">
                      <div class="manager-details">
                        <div class="manager-avatar">
                          <i class="pi pi-user"></i>
                        </div>
                        <div class="manager-data">
                          <h4>{{ warehouse.warehouseManagerName }}</h4>
                          <p class="manager-id-info">
                            <i class="pi pi-id-card"></i>
                            Manager ID: {{ warehouse.warehouseManagerId }}
                          </p>
                          <p class="info-note">
                            <i class="pi pi-info-circle"></i>
                            To see full manager details, view the user profile.
                          </p>
                        </div>
                      </div>
                      <div class="manager-actions">
                        <Button
                          label="Change Manager"
                          icon="pi pi-user-edit"
                          class="p-button-outlined"
                          @click="showAssignManagerDialog"
                          :disabled="!canManageWarehouse"
                        />
                        <Button
                          label="Remove Manager"
                          icon="pi pi-user-minus"
                          class="p-button-outlined p-button-danger"
                          @click="removeManager"
                          :disabled="!canManageWarehouse"
                        />
                      </div>
                    </div>
                    <div v-else class="no-manager">
                      <div class="no-manager-content">
                        <i class="pi pi-user-plus empty-icon"></i>
                        <h4>No Manager Assigned</h4>
                        <p>This warehouse doesn't have a manager assigned yet.</p>
                        <Button
                          label="Assign Manager"
                          icon="pi pi-user-plus"
                          class="p-button-primary"
                          @click="showAssignManagerDialog"
                          :disabled="!canManageWarehouse"
                        />
                      </div>
                    </div>
                  </template>
                </Card>
              </div>
            </TabPanel>

            <!-- Inventory Management Tab -->
            <TabPanel header="Inventory Management">
              <div class="inventory-content">
                <!-- Inventory Stats -->
                <div class="inventory-stats-grid">
                  <Card class="stat-card">
                    <template #content>
                      <div class="stat-content">
                        <div class="stat-icon total-items">
                          <i class="pi pi-box"></i>
                        </div>
                        <div class="stat-info">
                          <h3>Total Items</h3>
                          <p class="stat-number">{{ stockCount }}</p>
                          <span class="stat-detail">in {{ warehouse.name }}</span>
                        </div>
                      </div>
                    </template>
                  </Card>

                  <Card class="stat-card">
                    <template #content>
                      <div class="stat-content">
                        <div class="stat-icon total-value">
                          <i class="pi pi-dollar"></i>
                        </div>
                        <div class="stat-info">
                          <h3>Total Value</h3>
                          <p class="stat-number">${{ totalStockValue.toLocaleString() }}</p>
                          <span class="stat-detail">current value</span>
                        </div>
                      </div>
                    </template>
                  </Card>

                  <Card class="stat-card">
                    <template #content>
                      <div class="stat-content">
                        <div class="stat-icon low-stock">
                          <i class="pi pi-exclamation-triangle"></i>
                        </div>
                        <div class="stat-info">
                          <h3>Low Stock</h3>
                          <p class="stat-number">{{ lowStockCount }}</p>
                          <span class="stat-detail">need attention</span>
                        </div>
                      </div>
                    </template>
                  </Card>
                </div>

                <!-- Inventory Actions -->
                <Card class="inventory-actions-card">
                  <template #content>
                    <div class="inventory-actions">
                      <Button
                        label="Add New Stock"
                        icon="pi pi-plus"
                        class="p-button-primary"
                        @click="showAddStockDialog"
                        :disabled="!canManageWarehouse"
                      />
                      <Button
                        label="Stock Adjustment"
                        icon="pi pi-pencil"
                        class="p-button-outlined"
                        @click="showStockAdjustment"
                        :disabled="!canManageWarehouse"
                      />
                      <Button
                        label="Generate Report"
                        icon="pi pi-file-pdf"
                        class="p-button-outlined"
                        @click="generateInventoryReport"
                      />
                      <Button
                        label="Export Data"
                        icon="pi pi-download"
                        class="p-button-outlined"
                        @click="exportInventoryData"
                      />
                    </div>
                  </template>
                </Card>

                <!-- Inventory Filters -->
                <Card class="inventory-filters-card">
                  <template #content>
                    <div class="inventory-filters">
                      <div class="search-field">
                        <span class="p-input-icon-left">
                          <i class="pi pi-search" />
                          <InputText
                            v-model="inventorySearchQuery"
                            placeholder="Search by product name or SKU..."
                            @input="filterInventory"
                          />
                        </span>
                      </div>

                      <div class="filter-field">
                        <Dropdown
                          v-model="selectedStockType"
                          :options="stockTypeOptions"
                          optionLabel="label"
                          optionValue="value"
                          placeholder="All Types"
                          showClear
                          @change="filterInventory"
                        />
                      </div>

                      <div class="filter-field">
                        <Dropdown
                          v-model="selectedStockStatus"
                          :options="stockStatusOptions"
                          optionLabel="label"
                          optionValue="value"
                          placeholder="Stock Status"
                          showClear
                          @change="filterInventory"
                        />
                      </div>

                      <Button
                        @click="resetInventoryFilters"
                        icon="pi pi-filter-slash"
                        label="Reset"
                        class="p-button-outlined"
                      />
                    </div>
                  </template>
                </Card>

                <!-- Enhanced Inventory Table -->
                <Card class="enhanced-inventory-card">
                  <template #content>
                    <DataTable
                      :value="filteredWarehouseStocks"
                      :loading="loadingInventory"
                      responsiveLayout="scroll"
                      :paginator="true"
                      :rows="15"
                      :rowsPerPageOptions="[15, 25, 50]"
                      currentPageReportTemplate="Showing {first} to {last} of {totalRecords} items"
                      paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                      dataKey="id"
                      v-model:selection="selectedInventoryItems"
                      selectionMode="multiple"
                      :metaKeySelection="false"
                      class="enhanced-inventory-table"
                    >
                      <template #header>
                        <div class="enhanced-table-header">
                          <div class="table-title">
                            <h4>{{ warehouse.name }} - Complete Inventory</h4>
                            <p class="table-subtitle">Detailed stock management and control</p>
                          </div>
                          <div class="table-actions">
                            <Button
                              v-if="selectedInventoryItems.length > 0"
                              @click="bulkInventoryAction"
                              icon="pi pi-cog"
                              :label="`Actions (${selectedInventoryItems.length})`"
                              class="p-button-outlined"
                            />
                            <Button
                              label="Refresh"
                              icon="pi pi-refresh"
                              class="p-button-outlined p-button-sm"
                              @click="loadInventory"
                              :loading="loadingInventory"
                            />
                          </div>
                        </div>
                      </template>

                      <template #empty>
                        <div class="empty-inventory-state">
                          <i class="pi pi-box empty-icon"></i>
                          <h4>No Inventory Items</h4>
                          <p>{{ warehouse.name }} doesn't have any inventory items yet.</p>
                          <Button
                            v-if="canManageWarehouse"
                            label="Add First Item"
                            icon="pi pi-plus"
                            class="p-button-primary"
                            @click="showAddStockDialog"
                          />
                        </div>
                      </template>

                      <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
                      
                      <Column field="id" header="ID" sortable style="width: 80px;"></Column>
                      
                      <Column field="productName" header="Product" sortable>
                        <template #body="{ data }">
                          <div class="enhanced-product-cell">
                            <div class="product-main">
                              <span class="product-name">{{ data.productName || 'Unknown Product' }}</span>
                              <span class="product-sku">{{ data.sku || data.id }}</span>
                            </div>
                            <div class="product-meta" v-if="data.description">
                              <span class="product-description">{{ data.description }}</span>
                            </div>
                          </div>
                        </template>
                      </Column>

                      <Column field="type" header="Type" sortable>
                        <template #body="{ data }">
                          <Tag :value="data.type" :class="['type-tag', `type-${data.type?.toLowerCase()}`]" />
                        </template>
                      </Column>

                      <Column field="quantityInWarehouse" header="Stock Level" sortable>
                        <template #body="{ data }">
                          <div class="stock-level-cell">
                            <div class="quantity-main">
                              <span class="quantity-number">{{ data.quantityInWarehouse || 0 }}</span>
                              <span class="quantity-label">units</span>
                            </div>
                            <div class="stock-status">
                              <span :class="['status-indicator', getStockStatus(data)]">
                                {{ getStockStatusLabel(data) }}
                              </span>
                            </div>
                          </div>
                        </template>
                      </Column>

                      <Column field="reorderLevel" header="Reorder Level" sortable>
                        <template #body="{ data }">
                          <span class="reorder-level">{{ data.reorderLevel || 0 }}</span>
                        </template>
                      </Column>

                      <Column field="unitPriceUSD" header="Unit Price" sortable>
                        <template #body="{ data }">
                          <div class="enhanced-price-cell">
                            <span class="price-usd">${{ data.unitPriceUSD ? Number(data.unitPriceUSD).toFixed(2) : '0.00' }}</span>
                            <span class="price-zwl">ZWL ${{ data.unitPriceZWL ? Number(data.unitPriceZWL).toFixed(2) : '0.00' }}</span>
                          </div>
                        </template>
                      </Column>

                      <Column field="dateCreated" header="Date Added" sortable>
                        <template #body="{ data }">
                          <span class="date-created">{{ formatDate(data.dateCreated) }}</span>
                        </template>
                      </Column>

                      <Column header="Actions" :exportable="false" style="width: 140px;">
                        <template #body="{ data }">
                          <div class="enhanced-stock-actions">
                            <Button
                              icon="pi pi-eye"
                              class="p-button-text p-button-sm p-button-rounded"
                              v-tooltip.top="'View Details'"
                              @click="viewStockDetails(data)"
                            />
                            <Button
                              icon="pi pi-pencil"
                              class="p-button-text p-button-sm p-button-rounded"
                              v-tooltip.top="'Edit Stock'"
                              @click="editStock(data)"
                              :disabled="!canManageWarehouse"
                            />
                            <Button
                              icon="pi pi-plus-circle"
                              class="p-button-text p-button-sm p-button-rounded p-button-success"
                              v-tooltip.top="'Adjust Stock'"
                              @click="adjustStock(data)"
                              :disabled="!canManageWarehouse"
                            />
                            <Button
                              icon="pi pi-times"
                              class="p-button-text p-button-sm p-button-rounded p-button-warning"
                              v-tooltip.top="'Deactivate'"
                              @click="deactivateStock(data)"
                              :disabled="!canManageWarehouse"
                            />
                          </div>
                        </template>
                      </Column>
                    </DataTable>
                  </template>
                </Card>
              </div>
            </TabPanel>

            <!-- Warehouse Reports Tab -->
            <TabPanel header="Warehouse Reports">
              <div class="warehouse-reports-content">
                <!-- Report Dashboard Stats -->
                <div class="report-stats-section">
                  <h3 class="section-title">
                    <i class="pi pi-chart-bar"></i>
                    {{ warehouse.name }} - Performance Dashboard
                  </h3>
                  
                  <div class="report-stats-grid">
                    <!-- Inventory Overview -->
                    <Card class="report-stat-card">
                      <template #content>
                        <div class="report-stat-content">
                          <div class="stat-icon inventory-stat">
                            <i class="pi pi-box"></i>
                          </div>
                          <div class="stat-details">
                            <h4>Inventory Overview</h4>
                            <div class="stat-metrics">
                              <div class="metric-item">
                                <span class="metric-label">Total SKUs:</span>
                                <span class="metric-value">{{ stockCount }}</span>
                              </div>
                              <div class="metric-item">
                                <span class="metric-label">Total Units:</span>
                                <span class="metric-value">{{ warehouse.numberOfItems?.toLocaleString() || 0 }}</span>
                              </div>
                              <div class="metric-item">
                                <span class="metric-label">Total Value:</span>
                                <span class="metric-value">${{ totalStockValue.toLocaleString() }}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </template>
                    </Card>

                    <!-- Stock Health -->
                    <Card class="report-stat-card">
                      <template #content>
                        <div class="report-stat-content">
                          <div class="stat-icon health-stat">
                            <i class="pi pi-heart"></i>
                          </div>
                          <div class="stat-details">
                            <h4>Stock Health</h4>
                            <div class="stat-metrics">
                              <div class="metric-item">
                                <span class="metric-label">In Stock:</span>
                                <span class="metric-value success">{{ inStockItemsCount }}</span>
                              </div>
                              <div class="metric-item">
                                <span class="metric-label">Low Stock:</span>
                                <span class="metric-value warning">{{ lowStockCount }}</span>
                              </div>
                              <div class="metric-item">
                                <span class="metric-label">Out of Stock:</span>
                                <span class="metric-value danger">{{ outOfStockCount }}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </template>
                    </Card>

                    <!-- Warehouse Utilization -->
                    <Card class="report-stat-card">
                      <template #content>
                        <div class="report-stat-content">
                          <div class="stat-icon utilization-stat">
                            <i class="pi pi-percentage"></i>
                          </div>
                          <div class="stat-details">
                            <h4>Warehouse Utilization</h4>
                            <div class="stat-metrics">
                              <div class="metric-item">
                                <span class="metric-label">Stock Health:</span>
                                <span class="metric-value">{{ stockHealthPercentage }}%</span>
                              </div>
                              <div class="metric-item">
                                <span class="metric-label">Active Products:</span>
                                <span class="metric-value">{{ activeProductsPercentage }}%</span>
                              </div>
                              <div class="metric-item">
                                <span class="metric-label">Efficiency Score:</span>
                                <span class="metric-value">{{ warehouseEfficiencyScore }}%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </template>
                    </Card>
                  </div>
                </div>

                <!-- Report Generation Section -->
                <div class="report-generation-section">
                  <h3 class="section-title">
                    <i class="pi pi-file-pdf"></i>
                    Generate Reports
                  </h3>
                  
                  <div class="report-types-grid">
                    <!-- Inventory Report -->
                    <Card class="report-type-card">
                      <template #content>
                        <div class="report-type-content">
                          <div class="report-icon inventory-report">
                            <i class="pi pi-list"></i>
                          </div>
                          <div class="report-info">
                            <h4>Inventory Report</h4>
                            <p>Complete list of all stock items with current levels and values</p>
                            <Button
                              label="Generate"
                              icon="pi pi-download"
                              class="p-button-primary"
                              @click="generateInventoryReport"
                            />
                          </div>
                        </div>
                      </template>
                    </Card>

                    <!-- Stock Movement Report -->
                    <Card class="report-type-card">
                      <template #content>
                        <div class="report-type-content">
                          <div class="report-icon movement-report">
                            <i class="pi pi-arrow-right-arrow-left"></i>
                          </div>
                          <div class="report-info">
                            <h4>Stock Movement Report</h4>
                            <p>Track all stock movements, transfers, and adjustments</p>
                            <Button
                              label="Generate"
                              icon="pi pi-download"
                              class="p-button-primary"
                              @click="generateMovementReport"
                            />
                          </div>
                        </div>
                      </template>
                    </Card>

                    <!-- Low Stock Alert Report -->
                    <Card class="report-type-card">
                      <template #content>
                        <div class="report-type-content">
                          <div class="report-icon alert-report">
                            <i class="pi pi-exclamation-triangle"></i>
                          </div>
                          <div class="report-info">
                            <h4>Low Stock Alert Report</h4>
                            <p>Items requiring immediate attention and reordering</p>
                            <Button
                              label="Generate"
                              icon="pi pi-download"
                              class="p-button-warning"
                              @click="generateLowStockReport"
                            />
                          </div>
                        </div>
                      </template>
                    </Card>

                    <!-- Performance Report -->
                    <Card class="report-type-card">
                      <template #content>
                        <div class="report-type-content">
                          <div class="report-icon performance-report">
                            <i class="pi pi-chart-line"></i>
                          </div>
                          <div class="report-info">
                            <h4>Performance Report</h4>
                            <p>Warehouse efficiency, turnover rates, and key metrics</p>
                            <Button
                              label="Generate"
                              icon="pi pi-download"
                              class="p-button-primary"
                              @click="generatePerformanceReport"
                            />
                          </div>
                        </div>
                      </template>
                    </Card>

                    <!-- Custom Report -->
                    <Card class="report-type-card">
                      <template #content>
                        <div class="report-type-content">
                          <div class="report-icon custom-report">
                            <i class="pi pi-cog"></i>
                          </div>
                          <div class="report-info">
                            <h4>Custom Report</h4>
                            <p>Create customized reports with specific filters and metrics</p>
                            <Button
                              label="Configure"
                              icon="pi pi-cog"
                              class="p-button-outlined"
                              @click="showCustomReportDialog"
                            />
                          </div>
                        </div>
                      </template>
                    </Card>

                    <!-- Historical Analysis -->
                    <Card class="report-type-card">
                      <template #content>
                        <div class="report-type-content">
                          <div class="report-icon historical-report">
                            <i class="pi pi-calendar"></i>
                          </div>
                          <div class="report-info">
                            <h4>Historical Analysis</h4>
                            <p>Trends, patterns, and historical data analysis</p>
                            <Button
                              label="Generate"
                              icon="pi pi-download"
                              class="p-button-primary"
                              @click="generateHistoricalReport"
                            />
                          </div>
                        </div>
                      </template>
                    </Card>
                  </div>
                </div>

                <!-- Quick Actions -->
                <div class="report-actions-section">
                  <h3 class="section-title">
                    <i class="pi pi-bolt"></i>
                    Quick Actions
                  </h3>
                  
                  <Card class="quick-actions-card">
                    <template #content>
                      <div class="quick-actions-content">
                        <Button
                          label="Export All Data"
                          icon="pi pi-database"
                          class="p-button-success"
                          @click="exportAllData"
                        />
                        <Button
                          label="Schedule Reports"
                          icon="pi pi-clock"
                          class="p-button-outlined"
                          @click="scheduleReports"
                        />
                        <Button
                          label="Email Reports"
                          icon="pi pi-send"
                          class="p-button-outlined"
                          @click="emailReports"
                        />
                        <Button
                          label="Print Summary"
                          icon="pi pi-print"
                          class="p-button-outlined"
                          @click="printSummary"
                        />
                      </div>
                    </template>
                  </Card>
                </div>
              </div>
            </TabPanel>
          </TabView>
        </div>
      </div>
    </div>

    <!-- Add Stock Dialog -->
    <Dialog
      v-model:visible="showDialog"
      modal
      header="Add Stock Item"
      :style="{ width: '500px' }"
      class="p-fluid"
    >
      <div class="stock-form">
        <!-- Product Name -->
        <div class="field">
          <label for="productName" class="form-label">Product Name *</label>
          <InputText
            id="productName"
            v-model="stockForm.productName"
            placeholder="Enter product name"
            :class="{ 'p-invalid': formErrors.productName }"
          />
          <small v-if="formErrors.productName" class="p-error">{{ formErrors.productName }}</small>
        </div>

        <!-- SKU -->
        <div class="field">
          <label for="sku" class="form-label">SKU *</label>
          <InputText
            id="sku"
            v-model="stockForm.sku"
            placeholder="Enter SKU"
            :class="{ 'p-invalid': formErrors.sku }"
          />
          <small v-if="formErrors.sku" class="p-error">{{ formErrors.sku }}</small>
        </div>

        <!-- Stock Type -->
        <div class="field">
          <label for="type" class="form-label">Stock Type *</label>
          <Dropdown
            id="type"
            v-model="stockForm.type"
            :options="stockTypeOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Select stock type"
            :class="{ 'p-invalid': formErrors.type }"
          />
          <small v-if="formErrors.type" class="p-error">{{ formErrors.type }}</small>
        </div>

        <!-- Description -->
        <div class="field">
          <label for="description" class="form-label">Description</label>
          <Textarea
            id="description"
            v-model="stockForm.description"
            placeholder="Optional description"
            :rows="2"
          />
        </div>

        <!-- Quantity -->
        <div class="field">
          <label for="quantityInWarehouse" class="form-label">Quantity in Warehouse *</label>
          <InputNumber
            id="quantityInWarehouse"
            v-model="stockForm.quantityInWarehouse"
            placeholder="Enter quantity"
            :min="0"
            :class="{ 'p-invalid': formErrors.quantityInWarehouse }"
          />
          <small v-if="formErrors.quantityInWarehouse" class="p-error">{{ formErrors.quantityInWarehouse }}</small>
        </div>

        <!-- Pricing -->
        <div class="field-group">
          <div class="field">
            <label for="unitPriceUSD" class="form-label">Unit Price USD *</label>
            <InputNumber
              id="unitPriceUSD"
              v-model="stockForm.unitPriceUSD"
              placeholder="0.00"
              :min="0"
              :maxFractionDigits="2"
              :class="{ 'p-invalid': formErrors.unitPriceUSD }"
            />
            <small v-if="formErrors.unitPriceUSD" class="p-error">{{ formErrors.unitPriceUSD }}</small>
          </div>
          
          <div class="field">
            <label for="unitPriceZWL" class="form-label">Unit Price ZWL *</label>
            <InputNumber
              id="unitPriceZWL"
              v-model="stockForm.unitPriceZWL"
              placeholder="0.00"
              :min="0"
              :maxFractionDigits="2"
              :class="{ 'p-invalid': formErrors.unitPriceZWL }"
            />
            <small v-if="formErrors.unitPriceZWL" class="p-error">{{ formErrors.unitPriceZWL }}</small>
          </div>
        </div>

        <!-- Reorder Level -->
        <div class="field">
          <label for="reorderLevel" class="form-label">Reorder Level *</label>
          <InputNumber
            id="reorderLevel"
            v-model="stockForm.reorderLevel"
            placeholder="Enter reorder level"
            :min="0"
            :class="{ 'p-invalid': formErrors.reorderLevel }"
          />
          <small v-if="formErrors.reorderLevel" class="p-error">{{ formErrors.reorderLevel }}</small>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <Button
            label="Cancel"
            icon="pi pi-times"
            class="p-button-outlined"
            @click="cancelAddStock"
            :disabled="isCreatingStock"
          />
          <Button
            label="Add Stock"
            icon="pi pi-check"
            @click="saveStock"
            :loading="isCreatingStock"
          />
        </div>
      </template>
    </Dialog>

    <!-- Assign Manager Dialog -->
    <Dialog
      v-model:visible="showManagerDialog"
      modal
      header="Assign Warehouse Manager"
      :style="{ width: '500px' }"
      class="p-fluid"
    >
      <div class="manager-form">
        <div class="field">
          <label for="managerSelect" class="form-label">Select Manager *</label>
          <div class="manager-selection">
            <Dropdown
              id="managerSelect"
              v-model="selectedManagerId"
              :options="availableManagers"
              optionLabel="label"
              optionValue="value"
              placeholder="Choose a warehouse manager"
              filter
              :loading="isLoadingManagers"
              :class="{ 'p-invalid': managerErrors.manager }"
              filterPlaceholder="Search managers..."
              emptyMessage="No available warehouse managers found"
            >
              <template #option="{ option }">
                <div class="manager-option">
                  <div class="manager-option-avatar">
                    <i class="pi pi-user"></i>
                  </div>
                  <div class="manager-option-info">
                    <div class="manager-option-name">{{ option.firstName }} {{ option.lastName }}</div>
                    <div class="manager-option-email">{{ option.email }}</div>
                    <div class="manager-option-phone" v-if="option.phoneNumber">{{ option.phoneNumber }}</div>
                  </div>
                </div>
              </template>
            </Dropdown>
            <small v-if="availableManagers.length === 0 && !isLoadingManagers" class="p-info">
              No available warehouse managers found. Please create warehouse manager users first.
            </small>
          </div>
          <small v-if="managerErrors.manager" class="p-error">{{ managerErrors.manager }}</small>
        </div>
        
        <div class="field">
          <label class="form-label">Manager Details</label>
          <div v-if="selectedManager" class="selected-manager-preview">
            <div class="manager-preview-content">
              <div class="preview-avatar">
                <i class="pi pi-user"></i>
              </div>
              <div class="preview-info">
                <h5>{{ selectedManager.firstName }} {{ selectedManager.lastName }}</h5>
                <p v-if="selectedManager.email">{{ selectedManager.email }}</p>
                <p v-if="selectedManager.phoneNumber">{{ selectedManager.phoneNumber }}</p>
              </div>
            </div>
          </div>
          <div v-else class="no-manager-selected">
            <p>Select a manager to see their details</p>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <Button
            label="Cancel"
            icon="pi pi-times"
            class="p-button-outlined"
            @click="cancelAssignManager"
            :disabled="isAssigningManager"
          />
          <Button
            label="Assign Manager"
            icon="pi pi-check"
            @click="assignManager"
            :loading="isAssigningManager"
          />
        </div>
      </template>
    </Dialog>

    <!-- Edit Stock Dialog -->
    <Dialog
      v-model:visible="showEditStockDialog"
      modal
      header="Edit Stock Item"
      :style="{ width: '600px' }"
      class="p-fluid"
    >
      <div class="edit-stock-form">
        <div class="field-group">
          <div class="field">
            <label for="editProductName" class="form-label">Product Name *</label>
            <InputText
              id="editProductName"
              v-model="editStockForm.productName"
              placeholder="Enter product name"
              :class="{ 'p-invalid': editStockErrors.productName }"
            />
            <small v-if="editStockErrors.productName" class="p-error">{{ editStockErrors.productName }}</small>
          </div>
          
          <div class="field">
            <label for="editSku" class="form-label">SKU *</label>
            <InputText
              id="editSku"
              v-model="editStockForm.sku"
              placeholder="Enter SKU"
              :class="{ 'p-invalid': editStockErrors.sku }"
            />
            <small v-if="editStockErrors.sku" class="p-error">{{ editStockErrors.sku }}</small>
          </div>
        </div>

        <div class="field-group">
          <div class="field">
            <label for="editType" class="form-label">Stock Type *</label>
            <Dropdown
              id="editType"
              v-model="editStockForm.type"
              :options="stockTypeOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Select stock type"
              :class="{ 'p-invalid': editStockErrors.type }"
            />
            <small v-if="editStockErrors.type" class="p-error">{{ editStockErrors.type }}</small>
          </div>
          
          <div class="field">
            <label for="editQuantity" class="form-label">Quantity *</label>
            <InputNumber
              id="editQuantity"
              v-model="editStockForm.quantityInWarehouse"
              placeholder="Enter quantity"
              :min="0"
              :class="{ 'p-invalid': editStockErrors.quantityInWarehouse }"
            />
            <small v-if="editStockErrors.quantityInWarehouse" class="p-error">{{ editStockErrors.quantityInWarehouse }}</small>
          </div>
        </div>

        <div class="field-group">
          <div class="field">
            <label for="editPriceUSD" class="form-label">Unit Price USD *</label>
            <InputNumber
              id="editPriceUSD"
              v-model="editStockForm.unitPriceUSD"
              placeholder="0.00"
              :min="0"
              :maxFractionDigits="2"
              :class="{ 'p-invalid': editStockErrors.unitPriceUSD }"
            />
            <small v-if="editStockErrors.unitPriceUSD" class="p-error">{{ editStockErrors.unitPriceUSD }}</small>
          </div>
          
          <div class="field">
            <label for="editPriceZWL" class="form-label">Unit Price ZWL *</label>
            <InputNumber
              id="editPriceZWL"
              v-model="editStockForm.unitPriceZWL"
              placeholder="0.00"
              :min="0"
              :maxFractionDigits="2"
              :class="{ 'p-invalid': editStockErrors.unitPriceZWL }"
            />
            <small v-if="editStockErrors.unitPriceZWL" class="p-error">{{ editStockErrors.unitPriceZWL }}</small>
          </div>
        </div>

        <div class="field">
          <label for="editReorderLevel" class="form-label">Reorder Level *</label>
          <InputNumber
            id="editReorderLevel"
            v-model="editStockForm.reorderLevel"
            placeholder="Enter reorder level"
            :min="0"
            :class="{ 'p-invalid': editStockErrors.reorderLevel }"
          />
          <small v-if="editStockErrors.reorderLevel" class="p-error">{{ editStockErrors.reorderLevel }}</small>
        </div>

        <div class="field">
          <label for="editDescription" class="form-label">Description</label>
          <Textarea
            id="editDescription"
            v-model="editStockForm.description"
            placeholder="Optional description"
            :rows="2"
          />
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <Button
            label="Cancel"
            icon="pi pi-times"
            class="p-button-outlined"
            @click="cancelEditStock"
            :disabled="isUpdatingStock"
          />
          <Button
            label="Save Changes"
            icon="pi pi-check"
            @click="saveStockChanges"
            :loading="isUpdatingStock"
          />
        </div>
      </template>
    </Dialog>

    <!-- Deactivate Stock Confirmation Dialog -->
    <Dialog
      v-model:visible="showDeactivateStockDialog"
      modal
      header="Confirm Deactivation"
      :style="{ width: '450px' }"
    >
      <div class="confirmation-content">
        <i class="pi pi-exclamation-triangle warning-icon"></i>
        <div class="confirmation-text">
          <h4>Deactivate Stock Item</h4>
          <p>Are you sure you want to deactivate the stock item <strong>{{ stockToDeactivate?.productName || stockToDeactivate?.sku }}</strong>?</p>
          <p class="info-text">This will hide the item from active inventory but preserve its data for reporting purposes.</p>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <Button
            label="Cancel"
            icon="pi pi-times"
            class="p-button-outlined"
            @click="cancelDeactivateStock"
            :disabled="isDeactivatingStock"
          />
          <Button
            label="Deactivate"
            icon="pi pi-times"
            class="p-button-warning"
            @click="confirmDeactivateStock"
            :loading="isDeactivatingStock"
          />
        </div>
      </template>
    </Dialog>

    <!-- Stock Adjustment Dialog -->
    <Dialog
      v-model:visible="showStockAdjustmentDialog"
      modal
      header="Stock Adjustment"
      :style="{ width: '500px' }"
      :breakpoints="{ '960px': '75vw', '640px': '90vw' }"
    >
      <div class="stock-adjustment-form">
        <div class="field">
          <label for="adjustmentStock" class="form-label">Select Stock Item *</label>
          <Dropdown
            id="adjustmentStock"
            v-model="stockAdjustmentForm.stockId"
            :options="stockDropdownOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Choose a stock item"
            filter
            showClear
            :class="{ 'p-invalid': stockAdjustmentErrors.stockId }"
          />
          <small v-if="stockAdjustmentErrors.stockId" class="p-error">{{ stockAdjustmentErrors.stockId }}</small>
        </div>

        <div v-if="selectedStockForAdjustment" class="stock-info-card">
          <div class="stock-info-item">
            <span class="info-label">Current Quantity:</span>
            <span class="info-value">{{ selectedStockForAdjustment.quantityInWarehouse || 0 }}</span>
          </div>
          <div class="stock-info-item">
            <span class="info-label">SKU:</span>
            <span class="info-value">{{ selectedStockForAdjustment.sku }}</span>
          </div>
        </div>

        <div class="field">
          <label for="adjustmentType" class="form-label">Adjustment Type *</label>
          <Dropdown
            id="adjustmentType"
            v-model="stockAdjustmentForm.type"
            :options="adjustmentTypeOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Select adjustment type"
            :class="{ 'p-invalid': stockAdjustmentErrors.type }"
          />
          <small v-if="stockAdjustmentErrors.type" class="p-error">{{ stockAdjustmentErrors.type }}</small>
        </div>

        <div class="field">
          <label for="adjustmentQuantity" class="form-label">Quantity *</label>
          <InputNumber
            id="adjustmentQuantity"
            v-model="stockAdjustmentForm.quantity"
            placeholder="Enter adjustment quantity"
            :min="1"
            :class="{ 'p-invalid': stockAdjustmentErrors.quantity }"
          />
          <small v-if="stockAdjustmentErrors.quantity" class="p-error">{{ stockAdjustmentErrors.quantity }}</small>
          <small v-if="stockAdjustmentForm.type && selectedStockForAdjustment" class="help-text">
            New quantity will be: {{ calculateNewQuantity() }}
          </small>
        </div>

        <div class="field">
          <label for="adjustmentReason" class="form-label">Reason *</label>
          <Dropdown
            id="adjustmentReason"
            v-model="stockAdjustmentForm.reason"
            :options="adjustmentReasonOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Select reason"
            :class="{ 'p-invalid': stockAdjustmentErrors.reason }"
          />
          <small v-if="stockAdjustmentErrors.reason" class="p-error">{{ stockAdjustmentErrors.reason }}</small>
        </div>

        <div class="field">
          <label for="adjustmentNotes" class="form-label">Notes</label>
          <Textarea
            id="adjustmentNotes"
            v-model="stockAdjustmentForm.notes"
            placeholder="Additional notes (optional)"
            :rows="3"
          />
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <Button
            label="Cancel"
            icon="pi pi-times"
            class="p-button-outlined"
            @click="cancelStockAdjustment"
            :disabled="isAdjustingStock"
          />
          <Button
            label="Confirm Adjustment"
            icon="pi pi-check"
            @click="confirmStockAdjustment"
            :loading="isAdjustingStock"
          />
        </div>
      </template>
    </Dialog>
  </DashboardLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { useAuthStore } from '@/stores/auth'
import { useWarehouseStore } from '@/stores/warehouse'
import { useUsersStore } from '@/stores/user'
import { warehouseService } from '@/services/api'
import DashboardLayout from '@/components/general/DashboardLayout.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import EmptyState from '@/components/ui/EmptyState.vue'

// PrimeVue Components
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'
import Card from 'primevue/card'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import InputNumber from 'primevue/inputnumber'
import Textarea from 'primevue/textarea'
import Tag from 'primevue/tag'
import Dialog from 'primevue/dialog'
import ProgressSpinner from 'primevue/progressspinner'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const authStore = useAuthStore()
const warehouseStore = useWarehouseStore()
const userStore = useUsersStore()

// State
const loading = ref(true)
const loadingInventory = ref(false)
const error = ref(null)
const warehouse = ref(null)
const warehouseStocks = ref([])

// Computed
const userRole = computed(() => authStore.user?.role)

const canManageWarehouse = computed(() => {
  return ['ADMIN', 'WAREHOUSE_MANAGER'].includes(userRole.value)
})

const stockCount = computed(() => {
  // This would come from warehouse.stocks.length when we have stock data
  return warehouseStocks.value?.length || warehouse.value?.stocks?.length || 0
})

const selectedManager = computed(() => {
  if (!selectedManagerId.value) return null
  return availableManagers.value.find(manager => manager.value === selectedManagerId.value)
})

const totalStockValue = computed(() => {
  if (!warehouseStocks.value) return 0
  return warehouseStocks.value.reduce((total, stock) => {
    const quantity = stock.quantityInWarehouse || 0
    const price = stock.unitPriceUSD || 0
    return total + (quantity * price)
  }, 0)
})

const lowStockCount = computed(() => {
  if (!warehouseStocks.value) return 0
  return warehouseStocks.value.filter(stock => {
    const quantity = stock.quantityInWarehouse || 0
    const reorderLevel = stock.reorderLevel || 0
    return quantity <= reorderLevel && quantity > 0
  }).length
})

const stockStatusOptions = computed(() => [
  { label: 'All Stock', value: null },
  { label: 'In Stock', value: 'in_stock' },
  { label: 'Low Stock', value: 'low_stock' },
  { label: 'Out of Stock', value: 'out_of_stock' }
])

// Report computed properties
const inStockItemsCount = computed(() => {
  if (!warehouseStocks.value) return 0
  return warehouseStocks.value.filter(stock => {
    const quantity = stock.quantityInWarehouse || 0
    const reorderLevel = stock.reorderLevel || 0
    return quantity > reorderLevel
  }).length
})

const outOfStockCount = computed(() => {
  if (!warehouseStocks.value) return 0
  return warehouseStocks.value.filter(stock => {
    const quantity = stock.quantityInWarehouse || 0
    return quantity === 0
  }).length
})

const stockHealthPercentage = computed(() => {
  if (!warehouseStocks.value || warehouseStocks.value.length === 0) return 0
  return Math.round((inStockItemsCount.value / warehouseStocks.value.length) * 100)
})

const activeProductsPercentage = computed(() => {
  if (!warehouseStocks.value || warehouseStocks.value.length === 0) return 0
  const activeProducts = warehouseStocks.value.filter(stock => (stock.quantityInWarehouse || 0) > 0).length
  return Math.round((activeProducts / warehouseStocks.value.length) * 100)
})

const warehouseEfficiencyScore = computed(() => {
  // Simple efficiency calculation based on stock health and utilization
  const healthScore = stockHealthPercentage.value
  const utilizationScore = activeProductsPercentage.value
  return Math.round((healthScore + utilizationScore) / 2)
})

const headerActions = computed(() => {
  const actions = [
    {
      label: 'Back to Warehouses',
      icon: 'pi pi-arrow-left',
      handler: () => router.push('/warehouses'),
      variant: 'outlined'
    }
  ]
  
  if (canManageWarehouse.value) {
    actions.push(
      {
        label: 'Edit Warehouse',
        icon: 'pi pi-pencil',
        handler: editWarehouse,
        variant: 'primary'
      },
      {
        label: 'Delete Warehouse',
        icon: 'pi pi-trash',
        handler: deleteWarehouse,
        variant: 'danger'
      }
    )
  }
  
  return actions
})

// Methods
const loadWarehouseData = async () => {
  try {
    loading.value = true
    error.value = null
    const warehouseId = route.params.id

    console.log('Loading warehouse with ID:', warehouseId)

    // Load warehouse from API
    warehouse.value = await warehouseStore.getWarehouse(warehouseId)
    
    console.log('Warehouse loaded successfully:', warehouse.value)
    console.log('=== WAREHOUSE MANAGER DATA CHECK ===')
    console.log('Warehouse ID:', warehouse.value?.id)
    console.log('Warehouse Name:', warehouse.value?.name)
    console.log('Has warehouseManager?', !!warehouse.value?.warehouseManager)
    if (warehouse.value?.warehouseManager) {
      console.log('Manager Data:', {
        id: warehouse.value.warehouseManager.id,
        firstName: warehouse.value.warehouseManager.firstName,
        lastName: warehouse.value.warehouseManager.lastName,
        email: warehouse.value.warehouseManager.email,
        role: warehouse.value.warehouseManager.role,
        fullManagerObject: warehouse.value.warehouseManager
      })
    } else {
      console.log('No warehouse manager assigned to this warehouse')
    }
    console.log('Full warehouse object:', JSON.stringify(warehouse.value, null, 2))
    console.log('=== END WAREHOUSE MANAGER CHECK ===')

    // Also load the inventory for this warehouse
    await loadInventory()
    
  } catch (err) {
    error.value = err.message || 'Failed to load warehouse data'
    console.error('Error loading warehouse:', err)
    console.error('Error details:', {
      message: err.message,
      status: err.status,
      response: err.response
    })
  } finally {
    loading.value = false
  }
}

const loadInventory = async () => {
  try {
    loadingInventory.value = true
    const warehouseId = route.params.id

    console.log('Loading inventory for warehouse:', warehouseId)

    // Load warehouse stocks from API using your backend endpoint
    warehouseStocks.value = await warehouseService.getWarehouseStocks(warehouseId)
    
    console.log('Warehouse stocks loaded:', warehouseStocks.value)
    
  } catch (err) {
    console.error('Error loading warehouse inventory:', err)
    // Set empty array if loading fails
    warehouseStocks.value = []
  } finally {
    loadingInventory.value = false
  }
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const editWarehouse = () => {
  router.push(`/warehouses/${route.params.id}/edit`)
}

const deleteWarehouse = () => {
  // Show confirmation dialog
  if (confirm(`Are you sure you want to delete warehouse "${warehouse.value.name}"? This action cannot be undone.`)) {
    performDelete()
  }
}

const performDelete = async () => {
  try {
    await warehouseStore.deleteWarehouse(warehouse.value.id)
    
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Warehouse deleted successfully',
      life: 3000
    })

    // Navigate back to warehouse list
    router.push('/warehouses')
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'Failed to delete warehouse',
      life: 3000
    })
  }
}

const editStock = (stock) => {
  console.log('Edit stock clicked for:', stock)
  editStockForm.value = {
    id: stock.id,
    productName: stock.productName || '',
    sku: stock.sku || stock.id.toString(),
    description: stock.description || '',
    type: stock.type || 'SELLABLE',
    quantityInWarehouse: stock.quantityInWarehouse || 0,
    unitPriceUSD: stock.unitPriceUSD || 0,
    unitPriceZWL: stock.unitPriceZWL || 0,
    reorderLevel: stock.reorderLevel || 10
  }
  editStockErrors.value = {}
  showEditStockDialog.value = true
}

const deactivateStock = (stock) => {
  console.log('Deactivate stock clicked for:', stock)
  stockToDeactivate.value = stock
  showDeactivateStockDialog.value = true
}

// Add Stock Dialog
const showDialog = ref(false)
const stockForm = ref({
  productName: '',
  sku: '',
  description: '',
  type: 'SELLABLE',
  quantityInWarehouse: 0,
  unitPriceUSD: 0,
  unitPriceZWL: 0,
  reorderLevel: 10
})
const formErrors = ref({})
const isCreatingStock = ref(false)

// Manager Assignment Dialog
const showManagerDialog = ref(false)
const selectedManagerId = ref(null)
const availableManagers = ref([])
const managerErrors = ref({})
const isAssigningManager = ref(false)
const isLoadingManagers = ref(false)

// Edit Stock Dialog
const showEditStockDialog = ref(false)
const editStockForm = ref({
  id: null,
  productName: '',
  sku: '',
  description: '',
  type: 'SELLABLE',
  quantityInWarehouse: 0,
  unitPriceUSD: 0,
  unitPriceZWL: 0,
  reorderLevel: 10
})
const editStockErrors = ref({})
const isUpdatingStock = ref(false)

// Deactivate Stock Dialog
const showDeactivateStockDialog = ref(false)
const stockToDeactivate = ref(null)
const isDeactivatingStock = ref(false)

// Stock Adjustment Dialog
const showStockAdjustmentDialog = ref(false)
const stockAdjustmentForm = ref({
  stockId: null,
  type: null,
  quantity: null,
  reason: null,
  notes: ''
})
const stockAdjustmentErrors = ref({})
const isAdjustingStock = ref(false)

// Inventory Management
const inventorySearchQuery = ref('')
const selectedStockType = ref(null)
const selectedStockStatus = ref(null)
const selectedInventoryItems = ref([])
const filteredWarehouseStocks = ref([])

// Stock Adjustment Computed Properties
const stockDropdownOptions = computed(() => {
  return warehouseStocks.value.map(stock => ({
    label: `${stock.productName} (SKU: ${stock.sku}) - Qty: ${stock.quantityInWarehouse}`,
    value: stock.stockId || stock.id
  }))
})

const selectedStockForAdjustment = computed(() => {
  if (!stockAdjustmentForm.value.stockId) return null
  return warehouseStocks.value.find(stock => 
    (stock.stockId || stock.id) === stockAdjustmentForm.value.stockId
  )
})

const calculateNewQuantity = () => {
  if (!selectedStockForAdjustment.value || !stockAdjustmentForm.value.quantity) return 0
  
  const currentQty = selectedStockForAdjustment.value.quantityInWarehouse || 0
  const adjustQty = Number(stockAdjustmentForm.value.quantity) || 0
  
  switch (stockAdjustmentForm.value.type) {
    case 'add':
      return currentQty + adjustQty
    case 'remove':
      return Math.max(0, currentQty - adjustQty)
    case 'set':
      return adjustQty
    default:
      return currentQty
  }
}

// Stock Adjustment Options
const adjustmentTypeOptions = [
  { label: 'Add Stock', value: 'add' },
  { label: 'Remove Stock', value: 'remove' },
  { label: 'Set Quantity', value: 'set' }
]

const adjustmentReasonOptions = [
  { label: 'Physical Count Correction', value: 'physical_count' },
  { label: 'Damage/Loss', value: 'damage' },
  { label: 'Quality Issue', value: 'quality' },
  { label: 'System Error Correction', value: 'system_error' },
  { label: 'Return from Customer', value: 'return' },
  { label: 'Sample/Testing', value: 'sample' },
  { label: 'Other', value: 'other' }
]

// Stock type options
const stockTypeOptions = [
  { label: 'Sellable', value: 'SELLABLE' },
  { label: 'Sample', value: 'SAMPLE' },
  { label: 'Promotional', value: 'PROMOTIONAL' },
  { label: 'Material', value: 'MATERIAL' }
]

const showAddStockDialog = () => {
  // Reset form
  stockForm.value = {
    productName: '',
    sku: '',
    description: '',
    type: 'SELLABLE',
    quantityInWarehouse: 0,
    unitPriceUSD: 0,
    unitPriceZWL: 0,
    reorderLevel: 10
  }
  formErrors.value = {}
  showDialog.value = true
}

const validateStockForm = () => {
  const errors = {}
  
  if (!stockForm.value.productName?.trim()) {
    errors.productName = 'Product name is required'
  }
  
  if (!stockForm.value.sku?.trim()) {
    errors.sku = 'SKU is required'
  }
  
  if (!stockForm.value.type) {
    errors.type = 'Stock type is required'
  }
  
  if (stockForm.value.quantityInWarehouse === null || stockForm.value.quantityInWarehouse < 0) {
    errors.quantityInWarehouse = 'Quantity cannot be negative'
  }
  
  if (stockForm.value.unitPriceUSD === null || stockForm.value.unitPriceUSD < 0) {
    errors.unitPriceUSD = 'Unit price USD cannot be negative'
  }
  
  if (stockForm.value.unitPriceZWL === null || stockForm.value.unitPriceZWL < 0) {
    errors.unitPriceZWL = 'Unit price ZWL cannot be negative'
  }
  
  if (stockForm.value.reorderLevel === null || stockForm.value.reorderLevel < 0) {
    errors.reorderLevel = 'Reorder level cannot be negative'
  }
  
  formErrors.value = errors
  return Object.keys(errors).length === 0
}

const saveStock = async () => {
  if (!validateStockForm()) {
    return
  }
  
  try {
    isCreatingStock.value = true
    
    const stockData = {
      productName: stockForm.value.productName.trim(),
      sku: stockForm.value.sku.trim(),
      description: stockForm.value.description?.trim() || null,
      type: stockForm.value.type,
      warehouseId: Number(route.params.id),
      quantityInWarehouse: Number(stockForm.value.quantityInWarehouse),
      unitPriceUSD: Number(stockForm.value.unitPriceUSD),
      unitPriceZWL: Number(stockForm.value.unitPriceZWL),
      reorderLevel: Number(stockForm.value.reorderLevel)
    }
    
    // Create the stock item
    await warehouseService.createWarehouseStock(route.params.id, stockData)
    
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Stock item added successfully',
      life: 3000
    })
    
    showDialog.value = false
    
    // Refresh inventory
    await loadInventory()
    
  } catch (error) {
    console.error('Error adding stock:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'Failed to add stock item',
      life: 3000
    })
  } finally {
    isCreatingStock.value = false
  }
}

const cancelAddStock = () => {
  showDialog.value = false
  stockForm.value = {
    productName: '',
    sku: '',
    description: '',
    type: 'SELLABLE',
    quantityInWarehouse: 0,
    unitPriceUSD: 0,
    unitPriceZWL: 0,
    reorderLevel: 10
  }
  formErrors.value = {}
}

// Manager Management Functions
const loadAvailableManagers = async () => {
  try {
    isLoadingManagers.value = true
    console.log('Loading available managers...')
    
    // Load users with warehouse manager role
    await userStore.fetchUsers({ role: 'WAREHOUSE_MANAGER' })
    const users = userStore.users || []
    console.log('All users from store:', users)
    
    // Filter for warehouse managers who are active
    const warehouseManagers = users.filter(user => {
      console.log(`Checking user ${user.firstName} ${user.lastName}:`, {
        role: user.role,
        isActive: user.isActive,
        id: user.id
      })
      
      // Must be warehouse manager
      if (user.role !== 'WAREHOUSE_MANAGER') return false
      
      // Must be active (or if isActive is undefined, assume active)
      if (user.isActive === false) return false
      
      return true
    })
    
    console.log('Filtered warehouse managers:', warehouseManagers)
    
    // Map to dropdown format
    availableManagers.value = warehouseManagers
      .map(user => ({
        label: `${user.firstName} ${user.lastName} - ${user.email}`,
        value: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber
      }))
      .sort((a, b) => a.label.localeCompare(b.label))
      
    console.log('Available managers for dropdown:', availableManagers.value)
    
    // Debug each manager option
    availableManagers.value.forEach((manager, index) => {
      console.log(`Manager ${index + 1}:`, {
        label: manager.label,
        value: manager.value,
        valueType: typeof manager.value,
        firstName: manager.firstName,
        lastName: manager.lastName,
        email: manager.email
      })
    })
    
    if (availableManagers.value.length === 0) {
      console.warn('No warehouse managers found. Check if users have WAREHOUSE_MANAGER role and are active.')
    }
  } catch (error) {
    console.error('Error loading available managers:', error)
    availableManagers.value = []
    
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load available managers. Please try again.',
      life: 3000
    })
  } finally {
    isLoadingManagers.value = false
  }
}

const showAssignManagerDialog = async () => {
  showManagerDialog.value = true
  selectedManagerId.value = warehouse.value.warehouseManagerId || null
  managerErrors.value = {}
  await loadAvailableManagers()
}

const assignManager = async () => {
  if (!selectedManagerId.value) {
    managerErrors.value = { manager: 'Please select a manager' }
    return
  }
  
  try {
    isAssigningManager.value = true
    
    // Get the selected manager details for validation
    const selectedManager = availableManagers.value.find(m => m.value === selectedManagerId.value)
    console.log('Assigning manager:', selectedManager)
    console.log('Manager ID:', selectedManagerId.value)
    console.log('Warehouse ID:', warehouse.value.id)
    
    // Validate manager exists in our list
    if (!selectedManager) {
      throw new Error('Selected manager not found in available managers list')
    }
    
    // Use the dedicated assign manager endpoint
    console.log('=== MANAGER ASSIGNMENT DEBUG ===')
    console.log('Warehouse ID:', warehouse.value.id, 'Type:', typeof warehouse.value.id)
    console.log('Selected Manager ID:', selectedManagerId.value, 'Type:', typeof selectedManagerId.value)
    console.log('Selected Manager Object:', selectedManager)
    console.log('All Available Managers:', availableManagers.value)
    console.log('Endpoint URL:', `/api/warehouses/${warehouse.value.id}/assign-manager/${selectedManagerId.value}`)
    console.log('=== END DEBUG ===')
    
    await warehouseService.assignWarehouseManager(warehouse.value.id, selectedManagerId.value)
    
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: `${selectedManager.firstName} ${selectedManager.lastName} assigned as warehouse manager`,
      life: 3000
    })
    
    showManagerDialog.value = false
    
    // Reload warehouse data to get updated manager info
    await loadWarehouseData()
    
  } catch (error) {
    console.error('Error assigning manager:', error)
    console.error('Error response:', error.response?.data)
    
    let errorMessage = 'Failed to assign warehouse manager'
    
    if (error.response?.status === 404) {
      errorMessage = 'The selected manager was not found in the system. The user may have been deleted or their role may have changed. Please refresh the manager list and try again.'
    } else if (error.response?.status === 400) {
      errorMessage = error.response.data?.message || 'Invalid manager selection. Please try again.'
    } else if (error.message) {
      errorMessage = error.message
    }
    
    toast.add({
      severity: 'error',
      summary: 'Manager Assignment Failed',
      detail: errorMessage,
      life: 7000
    })
    
    // Reload managers in case the list is stale
    await loadAvailableManagers()
  } finally {
    isAssigningManager.value = false
  }
}

const removeManager = async () => {
  if (!confirm('Are you sure you want to remove the warehouse manager? This action will unassign the current manager from this warehouse.')) {
    return
  }
  
  try {
    console.log('=== REMOVE MANAGER CLICKED ===')
    console.log('Warehouse ID:', warehouse.value.id)
    console.log('Calling warehouseStore.removeWarehouseManager...')
    
    // Use the dedicated remove manager endpoint
    await warehouseStore.removeWarehouseManager(warehouse.value.id)
    
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Warehouse manager removed successfully',
      life: 3000
    })
    
    // Reload warehouse data
    await loadWarehouseData()
    
  } catch (error) {
    console.error('Error removing manager:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'Failed to remove warehouse manager',
      life: 3000
    })
  }
}

const cancelAssignManager = () => {
  showManagerDialog.value = false
  selectedManagerId.value = null
  managerErrors.value = {}
}

// Edit Stock Functions
const validateEditStockForm = () => {
  const errors = {}
  
  if (!editStockForm.value.productName?.trim()) {
    errors.productName = 'Product name is required'
  }
  
  if (!editStockForm.value.sku?.trim()) {
    errors.sku = 'SKU is required'
  }
  
  if (!editStockForm.value.type) {
    errors.type = 'Stock type is required'
  }
  
  if (editStockForm.value.quantityInWarehouse === null || editStockForm.value.quantityInWarehouse < 0) {
    errors.quantityInWarehouse = 'Quantity cannot be negative'
  }
  
  if (editStockForm.value.unitPriceUSD === null || editStockForm.value.unitPriceUSD < 0) {
    errors.unitPriceUSD = 'Unit price USD cannot be negative'
  }
  
  if (editStockForm.value.unitPriceZWL === null || editStockForm.value.unitPriceZWL < 0) {
    errors.unitPriceZWL = 'Unit price ZWL cannot be negative'
  }
  
  if (editStockForm.value.reorderLevel === null || editStockForm.value.reorderLevel < 0) {
    errors.reorderLevel = 'Reorder level cannot be negative'
  }
  
  editStockErrors.value = errors
  return Object.keys(errors).length === 0
}

const saveStockChanges = async () => {
  if (!validateEditStockForm()) {
    return
  }
  
  try {
    isUpdatingStock.value = true
    
    const stockData = {
      productName: editStockForm.value.productName.trim(),
      sku: editStockForm.value.sku.trim(),
      description: editStockForm.value.description?.trim() || null,
      type: editStockForm.value.type,
      warehouseId: Number(route.params.id),
      quantityInWarehouse: Number(editStockForm.value.quantityInWarehouse),
      unitPriceUSD: Number(editStockForm.value.unitPriceUSD),
      unitPriceZWL: Number(editStockForm.value.unitPriceZWL),
      reorderLevel: Number(editStockForm.value.reorderLevel)
    }
    
    // Update the stock item
    await warehouseService.updateWarehouseStock(route.params.id, editStockForm.value.id, stockData)
    
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Stock item updated successfully',
      life: 3000
    })
    
    showEditStockDialog.value = false
    
    // Refresh inventory
    await loadInventory()
    
  } catch (error) {
    console.error('Error updating stock:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'Failed to update stock item',
      life: 3000
    })
  } finally {
    isUpdatingStock.value = false
  }
}

const cancelEditStock = () => {
  showEditStockDialog.value = false
  editStockForm.value = {
    id: null,
    productName: '',
    sku: '',
    description: '',
    type: 'SELLABLE',
    quantityInWarehouse: 0,
    unitPriceUSD: 0,
    unitPriceZWL: 0,
    reorderLevel: 10
  }
  editStockErrors.value = {}
}

// Deactivate Stock Functions
const confirmDeactivateStock = async () => {
  try {
    isDeactivatingStock.value = true
    
    // Deactivate the stock item
    await warehouseService.deactivateStock(stockToDeactivate.value.id)
    
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: `Stock item ${stockToDeactivate.value.productName || stockToDeactivate.value.sku} deactivated successfully`,
      life: 3000
    })
    
    showDeactivateStockDialog.value = false
    stockToDeactivate.value = null
    
    // Refresh inventory
    await loadInventory()
    
  } catch (error) {
    console.error('Error deactivating stock:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'Failed to deactivate stock item',
      life: 3000
    })
  } finally {
    isDeactivatingStock.value = false
  }
}

const cancelDeactivateStock = () => {
  showDeactivateStockDialog.value = false
  stockToDeactivate.value = null
}

const generateWarehouseReport = () => {
  toast.add({
    severity: 'info',
    summary: 'Report Generation',
    detail: `Generating performance report for ${warehouse.value.name}`,
    life: 3000
  })
}

const handleEmptyStateAction = (action) => {
  if (action === 'back') {
    router.push('/warehouses')
  }
}

// Inventory Management Methods
const filterInventory = () => {
  let filtered = [...warehouseStocks.value]
  
  // Apply search filter
  if (inventorySearchQuery.value.trim()) {
    const query = inventorySearchQuery.value.toLowerCase().trim()
    filtered = filtered.filter(stock => 
      stock.productName?.toLowerCase().includes(query) ||
      stock.sku?.toLowerCase().includes(query) ||
      stock.description?.toLowerCase().includes(query)
    )
  }
  
  // Apply stock type filter
  if (selectedStockType.value) {
    filtered = filtered.filter(stock => stock.type === selectedStockType.value)
  }
  
  // Apply stock status filter
  if (selectedStockStatus.value) {
    filtered = filtered.filter(stock => {
      const quantity = stock.quantityInWarehouse || 0
      const reorderLevel = stock.reorderLevel || 0
      
      switch (selectedStockStatus.value) {
        case 'in_stock':
          return quantity > reorderLevel
        case 'low_stock':
          return quantity <= reorderLevel && quantity > 0
        case 'out_of_stock':
          return quantity === 0
        default:
          return true
      }
    })
  }
  
  filteredWarehouseStocks.value = filtered
}

const resetInventoryFilters = () => {
  inventorySearchQuery.value = ''
  selectedStockType.value = null
  selectedStockStatus.value = null
  filteredWarehouseStocks.value = [...warehouseStocks.value]
}

const getStockStatus = (stock) => {
  const quantity = stock.quantityInWarehouse || 0
  const reorderLevel = stock.reorderLevel || 0
  
  if (quantity === 0) return 'out-of-stock'
  if (quantity <= reorderLevel) return 'low-stock'
  return 'in-stock'
}

const getStockStatusLabel = (stock) => {
  const status = getStockStatus(stock)
  switch (status) {
    case 'out-of-stock': return 'Out of Stock'
    case 'low-stock': return 'Low Stock'
    case 'in-stock': return 'In Stock'
    default: return 'Unknown'
  }
}

const viewStockDetails = (stock) => {
  console.log('View stock details:', stock)
  // TODO: Implement stock details modal/page
}

const adjustStock = (stock) => {
  // Reset form with pre-selected stock
  stockAdjustmentForm.value = {
    stockId: stock.stockId || stock.id,
    type: null,
    quantity: null,
    reason: null,
    notes: ''
  }
  stockAdjustmentErrors.value = {}
  showStockAdjustmentDialog.value = true
}

const showStockAdjustment = () => {
  // Reset form for general adjustment
  stockAdjustmentForm.value = {
    stockId: null,
    type: null,
    quantity: null,
    reason: null,
    notes: ''
  }
  stockAdjustmentErrors.value = {}
  showStockAdjustmentDialog.value = true
}

const validateStockAdjustment = () => {
  const errors = {}
  
  if (!stockAdjustmentForm.value.stockId) {
    errors.stockId = 'Please select a stock item'
  }
  
  if (!stockAdjustmentForm.value.type) {
    errors.type = 'Please select adjustment type'
  }
  
  if (!stockAdjustmentForm.value.quantity || stockAdjustmentForm.value.quantity <= 0) {
    errors.quantity = 'Quantity must be greater than 0'
  }
  
  if (!stockAdjustmentForm.value.reason) {
    errors.reason = 'Please select a reason'
  }
  
  // Additional validation for remove type
  if (stockAdjustmentForm.value.type === 'remove' && selectedStockForAdjustment.value) {
    const currentQty = selectedStockForAdjustment.value.quantityInWarehouse || 0
    if (stockAdjustmentForm.value.quantity > currentQty) {
      errors.quantity = `Cannot remove more than current quantity (${currentQty})`
    }
  }
  
  stockAdjustmentErrors.value = errors
  return Object.keys(errors).length === 0
}

const confirmStockAdjustment = async () => {
  if (!validateStockAdjustment()) {
    return
  }
  
  try {
    isAdjustingStock.value = true
    
    const stock = selectedStockForAdjustment.value
    if (!stock) {
      throw new Error('Stock item not found')
    }
    
    // Calculate the adjustment quantity based on type
    let adjustmentQty = Number(stockAdjustmentForm.value.quantity)
    if (stockAdjustmentForm.value.type === 'remove') {
      adjustmentQty = -adjustmentQty
    } else if (stockAdjustmentForm.value.type === 'set') {
      // For set type, calculate the difference
      adjustmentQty = adjustmentQty - (stock.quantityInWarehouse || 0)
    }
    
    // Prepare notes with reason
    const notes = `Adjustment Type: ${stockAdjustmentForm.value.type}, Reason: ${stockAdjustmentForm.value.reason}${stockAdjustmentForm.value.notes ? ', Notes: ' + stockAdjustmentForm.value.notes : ''}`
    
    // Call the updateStock method from warehouse store
    await warehouseStore.updateStock(
      stock.stockId || stock.id,
      adjustmentQty,
      'adjustment',
      notes
    )
    
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Stock adjustment completed successfully',
      life: 3000
    })
    
    // Close dialog and refresh
    showStockAdjustmentDialog.value = false
    await loadInventory()
    
  } catch (error) {
    console.error('Error adjusting stock:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'Failed to adjust stock',
      life: 3000
    })
  } finally {
    isAdjustingStock.value = false
  }
}

const cancelStockAdjustment = () => {
  showStockAdjustmentDialog.value = false
  stockAdjustmentForm.value = {
    stockId: null,
    type: null,
    quantity: null,
    reason: null,
    notes: ''
  }
  stockAdjustmentErrors.value = {}
}

const generateInventoryReport = () => {
  toast.add({
    severity: 'info',
    summary: 'Report Generation',
    detail: `Generating inventory report for ${warehouse.value.name}`,
    life: 3000
  })
}

const exportInventoryData = () => {
  toast.add({
    severity: 'info',
    summary: 'Export Started',
    detail: `Exporting inventory data for ${warehouse.value.name}`,
    life: 3000
  })
}

const bulkInventoryAction = () => {
  console.log('Bulk inventory action for:', selectedInventoryItems.value)
  // TODO: Implement bulk actions
}

// Report generation methods
const generateMovementReport = () => {
  toast.add({
    severity: 'info',
    summary: 'Report Generation',
    detail: `Generating stock movement report for ${warehouse.value.name}`,
    life: 3000
  })
}

const generateLowStockReport = () => {
  toast.add({
    severity: 'info',
    summary: 'Report Generation',
    detail: `Generating low stock alert report for ${warehouse.value.name}`,
    life: 3000
  })
}

const generatePerformanceReport = () => {
  toast.add({
    severity: 'info',
    summary: 'Report Generation',
    detail: `Generating performance report for ${warehouse.value.name}`,
    life: 3000
  })
}

const generateHistoricalReport = () => {
  toast.add({
    severity: 'info',
    summary: 'Report Generation',
    detail: `Generating historical analysis for ${warehouse.value.name}`,
    life: 3000
  })
}

const showCustomReportDialog = () => {
  toast.add({
    severity: 'info',
    summary: 'Custom Report',
    detail: 'Opening custom report configuration dialog',
    life: 3000
  })
}

const exportAllData = () => {
  toast.add({
    severity: 'info',
    summary: 'Data Export',
    detail: `Exporting all warehouse data for ${warehouse.value.name}`,
    life: 3000
  })
}

const scheduleReports = () => {
  toast.add({
    severity: 'info',
    summary: 'Schedule Reports',
    detail: 'Opening report scheduling configuration',
    life: 3000
  })
}

const emailReports = () => {
  toast.add({
    severity: 'info',
    summary: 'Email Reports',
    detail: 'Opening email report configuration',
    life: 3000
  })
}

const printSummary = () => {
  toast.add({
    severity: 'info',
    summary: 'Print Summary',
    detail: `Preparing warehouse summary for printing`,
    life: 3000
  })
}

// Watch for changes in warehouse stocks and update filtered list
watch(warehouseStocks, () => {
  filterInventory()
}, { immediate: true })

onMounted(() => {
  loadWarehouseData()
})
</script>

<style scoped>
.warehouse-details-page {
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

.warehouse-meta {
  margin-top: 0.5rem;
}

.meta-items {
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

.content-main {
  margin-top: 1rem;
}

/* Warehouse Overview Styles */
.warehouse-overview {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.warehouse-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0;
  color: #111827;
  font-size: 1.25rem;
  font-weight: 600;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #e5e7eb;
}

.section-title i {
  color: #3b82f6;
  font-size: 1.1rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  flex-wrap: wrap;
}

.section-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.stock-stats {
  display: flex;
  gap: 0.5rem;
}

.stat-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #f3f4f6;
  color: #374151;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.stat-badge i {
  color: #6b7280;
}

.info-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #111827;
}

.card-header i {
  color: #3b82f6;
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

.info-item label {
  font-weight: 600;
  color: #6b7280;
  font-size: 0.875rem;
}

.info-item span {
  color: #111827;
}

.stock-overview {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
  text-align: center;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
}

.stat-label {
  color: #6b7280;
  font-size: 0.875rem;
}

.stock-actions {
  margin-top: 0.5rem;
}

/* Inventory Card Styles */
.inventory-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.warehouse-stock-table {
  border-radius: 0.5rem;
  overflow: hidden;
}

.table-header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.table-title h4 {
  margin: 0 0 0.25rem 0;
  color: #111827;
  font-size: 1.1rem;
}

.table-subtitle {
  margin: 0;
  color: #6b7280;
  font-size: 0.875rem;
}

.table-actions {
  display: flex;
  gap: 0.5rem;
}

.empty-stock-state {
  text-align: center;
  padding: 3rem 1rem;
}

.empty-stock-state .empty-icon {
  font-size: 3rem;
  color: #d1d5db;
  margin-bottom: 1rem;
}

.empty-stock-state h4 {
  margin: 0 0 0.5rem 0;
  color: #111827;
}

.empty-stock-state p {
  margin: 0 0 1.5rem 0;
  color: #6b7280;
}

/* Enhanced Product Cell */
.product-cell {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.product-name {
  font-weight: 600;
  color: #111827;
  font-size: 0.9rem;
}

.product-sku {
  font-family: monospace;
  font-size: 0.8rem;
  color: #6b7280;
  background: #f3f4f6;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  display: inline-block;
}

/* Enhanced Quantity Cell */
.quantity-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.125rem;
}

.quantity-number {
  font-weight: 600;
  color: #111827;
  font-size: 1rem;
}

.quantity-label {
  font-size: 0.75rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Enhanced Price Cell */
.price-cell {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.price-usd {
  font-weight: 600;
  color: #059669;
  font-size: 0.9rem;
}

.price-zwl {
  font-size: 0.8rem;
  color: #6b7280;
}

/* Type Tag */
.type-tag {
  font-size: 0.8rem;
  text-transform: capitalize;
}

/* Date Added */
.date-added {
  color: #6b7280;
  font-size: 0.875rem;
}

/* Compact Stock Actions */
.stock-actions-compact {
  display: flex;
  gap: 0.25rem;
  justify-content: center;
}

/* Manager Summary in Info Card */
.manager-summary {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.manager-avatar-small {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.manager-info-summary h5 {
  margin: 0 0 0.25rem 0;
  color: #111827;
  font-size: 0.9rem;
}

.manager-info-summary p {
  margin: 0;
  color: #6b7280;
  font-size: 0.8rem;
}

.manager-id-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  font-size: 0.875rem;
}

.info-note {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #3b82f6;
  font-size: 0.8rem;
  font-style: italic;
}

.no-manager-summary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  font-style: italic;
}

.no-manager-summary i {
  color: #d1d5db;
}

/* Reports & Analytics Styles */
.reports-content {
  padding: 1rem 0;
}

.reports-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.reports-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.report-card {
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.analytics-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.metric {
  text-align: center;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
}

.metric-value {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.25rem;
}

.metric-label {
  display: block;
  font-size: 0.875rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.activity-summary {
  text-align: center;
  padding: 1.5rem;
}

.activity-summary p {
  margin: 0 0 1.5rem 0;
  color: #6b7280;
}

.product-cell {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.product-name {
  font-weight: 600;
  color: #111827;
}

.product-sku {
  font-family: monospace;
  font-size: 0.875rem;
  color: #6b7280;
}

.quantity {
  font-weight: 600;
  color: #111827;
}

.unit {
  color: #6b7280;
  font-size: 0.875rem;
}

.date {
  color: #6b7280;
  font-size: 0.875rem;
}

.stock-actions {
  display: flex;
  gap: 0.25rem;
}

@media (max-width: 768px) {
  .warehouse-details-page {
    padding: 1rem;
  }

  .meta-items {
    flex-direction: column;
    gap: 0.5rem;
  }

  .info-cards-grid {
    grid-template-columns: 1fr;
  }
  
  .section-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .table-header-content {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .section-actions {
    justify-content: center;
  }
  
  .stock-stats {
    justify-content: center;
  }
  
  .reports-grid {
    grid-template-columns: 1fr;
  }
}

/* Add Stock Dialog Styles */
.stock-form {
  padding: 0.5rem 0;
}

.form-label {
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
  display: block;
}

.field {
  margin-bottom: 1.25rem;
}

.field-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding-top: 1rem;
}

/* Stock Adjustment Dialog Styles */
.stock-adjustment-form {
  padding: 0.5rem 0;
}

.stock-info-card {
  background: #f3f4f6;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.stock-info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-label {
  font-weight: 500;
  color: #6b7280;
}

.info-value {
  font-weight: 600;
  color: #111827;
}

.help-text {
  display: block;
  margin-top: 0.25rem;
  color: #6b7280;
  font-size: 0.875rem;
}

.type {
  color: #6b7280;
  font-size: 0.875rem;
  text-transform: capitalize;
}

.price {
  font-weight: 600;
  color: #059669;
}

@media (max-width: 500px) {
  .field-group {
    grid-template-columns: 1fr;
  }
}

/* Manager Tab Styles */
.manager-content {
  padding: 1rem 0;
}

.manager-card {
  max-width: 600px;
}

.manager-info {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.manager-details {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.manager-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.manager-data h4 {
  margin: 0 0 0.5rem 0;
  color: #111827;
  font-size: 1.1rem;
}

.manager-email,
.manager-phone {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0.25rem 0;
  color: #6b7280;
  font-size: 0.875rem;
}

.manager-email i,
.manager-phone i {
  color: #9ca3af;
  width: 16px;
}

.manager-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.no-manager {
  text-align: center;
  padding: 2rem;
}

.no-manager-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.no-manager-content .empty-icon {
  font-size: 3rem;
  color: #d1d5db;
}

.no-manager-content h4 {
  margin: 0;
  color: #111827;
}

.no-manager-content p {
  margin: 0;
  color: #6b7280;
}

/* Manager Dialog Styles */
.manager-form {
  padding: 0.5rem 0;
}

.selected-manager-preview {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
  background: #f9fafb;
}

.manager-preview-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.preview-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.preview-info h5 {
  margin: 0 0 0.25rem 0;
  color: #111827;
}

.preview-info p {
  margin: 0.125rem 0;
  color: #6b7280;
  font-size: 0.875rem;
}

.no-manager-selected {
  padding: 1rem;
  text-align: center;
  color: #6b7280;
  font-style: italic;
}

/* Edit Stock Dialog Styles */
.edit-stock-form {
  padding: 0.5rem 0;
}

/* Delete Confirmation Styles */
.confirmation-content {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem 0;
}

.warning-icon {
  font-size: 2rem;
  color: #f56565;
  flex-shrink: 0;
}

.confirmation-text h4 {
  margin: 0 0 0.5rem 0;
  color: #111827;
}

.confirmation-text p {
  margin: 0.5rem 0;
  color: #6b7280;
}

.warning-text {
  color: #f56565;
  font-weight: 500;
}

.info-text {
  color: #3b82f6;
  font-weight: 500;
}

/* Responsive Design for Manager Tab */
@media (max-width: 768px) {
  .manager-details {
    flex-direction: column;
    text-align: center;
    align-items: center;
  }
  
  .manager-actions {
    justify-content: center;
  }
  
  .manager-preview-content {
    flex-direction: column;
    text-align: center;
    align-items: center;
  }
  
  .confirmation-content {
    flex-direction: column;
    text-align: center;
    align-items: center;
  }
}

/* Enhanced Manager Selection Dropdown */
.manager-selection {
  position: relative;
}

.manager-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0;
}

.manager-option-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.875rem;
  flex-shrink: 0;
}

.manager-option-info {
  flex: 1;
  min-width: 0;
}

.manager-option-name {
  font-weight: 600;
  color: #111827;
  font-size: 0.9rem;
  margin-bottom: 0.125rem;
}

.manager-option-email {
  color: #6b7280;
  font-size: 0.8rem;
  margin-bottom: 0.125rem;
}

.manager-option-phone {
  color: #6b7280;
  font-size: 0.75rem;
}

.p-info {
  color: #3b82f6;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  display: block;
}

/* Inventory Management Styles */
.inventory-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1rem 0;
}

.inventory-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  flex-shrink: 0;
}

.stat-icon.total-items {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
}

.stat-icon.total-value {
  background: linear-gradient(135deg, #059669, #047857);
}

.stat-icon.low-stock {
  background: linear-gradient(135deg, #dc2626, #b91c1c);
}

.stat-info h3 {
  margin: 0 0 0.5rem 0;
  color: #111827;
  font-size: 1rem;
  font-weight: 600;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.stat-detail {
  color: #6b7280;
  font-size: 0.875rem;
}

.inventory-actions-card,
.inventory-filters-card {
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.inventory-actions,
.inventory-filters {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: center;
  padding: 1rem;
}

.search-field,
.filter-field {
  min-width: 200px;
  flex: 1;
}

.enhanced-inventory-card {
  border: 1px solid #e5e7eb;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.enhanced-inventory-table {
  border-radius: 0.5rem;
  overflow: hidden;
}

.enhanced-table-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.enhanced-table-header .table-title h4 {
  margin: 0 0 0.25rem 0;
  color: #111827;
  font-size: 1.1rem;
}

.enhanced-table-header .table-subtitle {
  margin: 0;
  color: #6b7280;
  font-size: 0.875rem;
}

.enhanced-table-header .table-actions {
  display: flex;
  gap: 0.5rem;
}

.empty-inventory-state {
  text-align: center;
  padding: 3rem 1rem;
}

.empty-inventory-state .empty-icon {
  font-size: 3rem;
  color: #d1d5db;
  margin-bottom: 1rem;
}

.empty-inventory-state h4 {
  margin: 0 0 0.5rem 0;
  color: #111827;
}

.empty-inventory-state p {
  margin: 0 0 1.5rem 0;
  color: #6b7280;
}

.enhanced-product-cell {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.product-main {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.product-name {
  font-weight: 600;
  color: #111827;
  font-size: 0.9rem;
}

.product-sku {
  font-family: monospace;
  font-size: 0.8rem;
  color: #6b7280;
  background: #f3f4f6;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  display: inline-block;
  max-width: fit-content;
}

.product-description {
  font-size: 0.75rem;
  color: #9ca3af;
  font-style: italic;
}

.stock-level-cell {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.quantity-main {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
}

.quantity-number {
  font-weight: 600;
  color: #111827;
  font-size: 1rem;
}

.quantity-label {
  font-size: 0.75rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-indicator {
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-indicator.in-stock {
  background: #dcfce7;
  color: #166534;
}

.status-indicator.low-stock {
  background: #fef3c7;
  color: #92400e;
}

.status-indicator.out-of-stock {
  background: #fee2e2;
  color: #991b1b;
}

.reorder-level {
  font-weight: 500;
  color: #6b7280;
}

.enhanced-price-cell {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.price-usd {
  font-weight: 600;
  color: #059669;
  font-size: 0.9rem;
}

.price-zwl {
  font-size: 0.8rem;
  color: #6b7280;
}

.date-created {
  color: #6b7280;
  font-size: 0.875rem;
}

.enhanced-stock-actions {
  display: flex;
  gap: 0.125rem;
  justify-content: center;
}

.type-tag {
  font-size: 0.8rem;
  text-transform: capitalize;
}

.type-sellable {
  background: #dbeafe;
  color: #1e40af;
}

.type-sample {
  background: #e0e7ff;
  color: #5b21b6;
}

.type-promotional {
  background: #fed7d7;
  color: #c53030;
}

.type-material {
  background: #f0fff4;
  color: #2f855a;
}

@media (max-width: 768px) {
  .inventory-stats-grid {
    grid-template-columns: 1fr;
  }
  
  .inventory-actions,
  .inventory-filters {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-field,
  .filter-field {
    min-width: unset;
  }
  
  .enhanced-table-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  
  .enhanced-stock-actions {
    flex-wrap: wrap;
  }
}

/* Warehouse Reports Styles */
.warehouse-reports-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 1rem 0;
}

.report-stats-section,
.report-generation-section,
.report-actions-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.report-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.report-stat-card {
  border: 1px solid #e5e7eb;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.report-stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.report-stat-content {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.5rem;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  flex-shrink: 0;
}

.stat-icon.inventory-stat {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
}

.stat-icon.health-stat {
  background: linear-gradient(135deg, #10b981, #047857);
}

.stat-icon.utilization-stat {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
}

.stat-details h4 {
  margin: 0 0 1rem 0;
  color: #111827;
  font-size: 1.1rem;
  font-weight: 600;
}

.stat-metrics {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.metric-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.metric-label {
  color: #6b7280;
  font-size: 0.875rem;
}

.metric-value {
  font-weight: 600;
  color: #111827;
  font-size: 0.9rem;
}

.metric-value.success {
  color: #059669;
}

.metric-value.warning {
  color: #d97706;
}

.metric-value.danger {
  color: #dc2626;
}

.report-types-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.report-type-card {
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.report-type-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.report-type-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  text-align: center;
}

.report-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  color: white;
  margin: 0 auto;
  flex-shrink: 0;
}

.report-icon.inventory-report {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
}

.report-icon.movement-report {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.report-icon.alert-report {
  background: linear-gradient(135deg, #ef4444, #dc2626);
}

.report-icon.performance-report {
  background: linear-gradient(135deg, #10b981, #047857);
}

.report-icon.custom-report {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
}

.report-icon.historical-report {
  background: linear-gradient(135deg, #6b7280, #4b5563);
}

.report-info h4 {
  margin: 0 0 0.5rem 0;
  color: #111827;
  font-size: 1rem;
  font-weight: 600;
}

.report-info p {
  margin: 0 0 1rem 0;
  color: #6b7280;
  font-size: 0.875rem;
  line-height: 1.5;
}

.quick-actions-card {
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.quick-actions-content {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
  padding: 1.5rem;
}

@media (max-width: 768px) {
  .report-stats-grid {
    grid-template-columns: 1fr;
  }
  
  .report-types-grid {
    grid-template-columns: 1fr;
  }
  
  .quick-actions-content {
    flex-direction: column;
    align-items: stretch;
  }
  
  .report-stat-content {
    flex-direction: column;
    text-align: center;
    align-items: center;
  }
  
  .stat-metrics {
    width: 100%;
  }
}
</style>
