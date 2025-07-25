// src/stores/warehouse.js
// Warehouse and inventory management store for the Activation Tracking System

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { inventoryService, warehouseService } from '@/services/api'
import { STOCK_STATUS } from '@/utils/constants'

export const useWarehouseStore = defineStore('warehouse', () => {
    // === STATE ===
    // Warehouse management
    const warehouses = ref([])
    const currentWarehouse = ref(null)
    const warehouseStats = ref({})
    
    // Inventory management
    const inventory = ref([])
    const currentItem = ref(null)
    const stockMovements = ref([])
    const lowStockAlerts = ref([])
    
    // Loading states
    const isLoading = ref(false)
    const isCreating = ref(false)
    const isUpdating = ref(false)
    const isDeleting = ref(false)
    const error = ref(null)
    const pagination = ref({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
    })
    const filters = ref({
        status: null,
        category: null,
        supplier: null,
        location: null,
        client: null,
        search: '',
        lowStock: false,
        outOfStock: false
    })
    const sortBy = ref('name')
    const sortOrder = ref('asc')

    // Allocation tracking
    const allocations = ref([])
    const pendingAllocations = ref([])

    // === GETTERS (COMPUTED) ===
    const filteredInventory = computed(() => {
        let result = inventory.value

        // Apply filters
        if (filters.value.status) {
            result = result.filter(item => item.status === filters.value.status)
        }

        if (filters.value.category) {
            result = result.filter(item => item.category === filters.value.category)
        }

        if (filters.value.supplier) {
            result = result.filter(item => item.supplier === filters.value.supplier)
        }

        if (filters.value.location) {
            result = result.filter(item => item.location === filters.value.location)
        }

        if (filters.value.lowStock) {
            result = result.filter(item => item.quantity <= item.reorderLevel)
        }

        if (filters.value.outOfStock) {
            result = result.filter(item => item.quantity === 0)
        }

        if (filters.value.search) {
            const searchTerm = filters.value.search.toLowerCase()
            result = result.filter(item =>
                item.name.toLowerCase().includes(searchTerm) ||
                item.sku.toLowerCase().includes(searchTerm) ||
                item.description?.toLowerCase().includes(searchTerm) ||
                item.category?.toLowerCase().includes(searchTerm)
            )
        }

        return result
    })

    const inventoryByStatus = computed(() => {
        return Object.values(STOCK_STATUS).reduce((acc, status) => {
            acc[status] = inventory.value.filter(item => item.status === status)
            return acc
        }, {})
    })

    const inventoryByCategory = computed(() => {
        const categories = [...new Set(inventory.value.map(item => item.category))]
        return categories.reduce((acc, category) => {
            acc[category] = inventory.value.filter(item => item.category === category)
            return acc
        }, {})
    })

    const lowStockItems = computed(() =>
        inventory.value.filter(item =>
            item.quantity > 0 && item.quantity <= item.reorderLevel
        )
    )

    const outOfStockItems = computed(() =>
        inventory.value.filter(item => item.quantity === 0)
    )

    const inStockItems = computed(() =>
        inventory.value.filter(item => item.quantity > item.reorderLevel)
    )

    const criticalItems = computed(() =>
        inventory.value.filter(item =>
            item.quantity === 0 ||
            (item.quantity <= item.reorderLevel && item.reorderLevel > 0)
        )
    )

    const inventoryStats = computed(() => {
        const total = inventory.value.length
        const inStock = inStockItems.value.length
        const lowStock = lowStockItems.value.length
        const outOfStock = outOfStockItems.value.length
        const totalValue = inventory.value.reduce((sum, item) =>
            sum + (item.quantity * item.unitPrice || 0), 0
        )
        const allocatedValue = allocations.value.reduce((sum, allocation) =>
            sum + (allocation.quantity * allocation.unitPrice || 0), 0
        )

        return {
            total,
            inStock,
            lowStock,
            outOfStock,
            critical: criticalItems.value.length,
            totalValue,
            allocatedValue,
            availableValue: totalValue - allocatedValue,
            stockHealthRate: total > 0 ? Math.round((inStock / total) * 100) : 0,
            criticalRate: total > 0 ? Math.round((criticalItems.value.length / total) * 100) : 0
        }
    })

    const inventoryOptions = computed(() =>
        inStockItems.value.map(item => ({
            label: `${item.name} (${item.sku})`,
            value: item.id,
            sku: item.sku,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            category: item.category
        }))
    )

    const recentMovements = computed(() =>
        stockMovements.value.slice(0, 10).sort((a, b) =>
            new Date(b.createdAt) - new Date(a.createdAt)
        )
    )

    // === ACTIONS ===

    // === WAREHOUSE MANAGEMENT ===
    
    /**
     * Fetch warehouses with pagination and filters
     */
    const fetchWarehouses = async (params = {}) => {
        try {
            isLoading.value = true
            error.value = null

            // Try to fetch from API first
            try {
                // Convert our pagination to Spring Boot format
                const springBootParams = {
                    ...params,
                    page: Math.max(0, (pagination.value.page || 1) - 1), // Convert 1-based to 0-based
                    size: pagination.value.limit || 10,
                    sort: params.sort || 'name,asc'
                }
                
                const response = await warehouseService.getWarehouses(springBootParams)
                warehouses.value = response.data
                
                // Convert Spring Boot response back to our format
                pagination.value = {
                    total: response.meta.total,
                    page: (response.meta.page || 0) + 1, // Convert 0-based back to 1-based
                    limit: response.meta.size || response.meta.limit || 10,
                    totalPages: Math.ceil(response.meta.total / (response.meta.size || response.meta.limit || 10))
                }

                return response
            } catch (apiError) {
                console.error('Failed to fetch warehouses from API:', apiError)
                throw apiError
            }
        } catch (err) {
            error.value = err.message || 'Failed to fetch warehouses'
            throw err
        } finally {
            isLoading.value = false
        }
    }

    /**
     * Get warehouse by ID
     */
    const getWarehouse = async (id) => {
        try {
            isLoading.value = true
            error.value = null

            try {
                const warehouse = await warehouseService.getWarehouse(id)
                console.log('=== WAREHOUSE STORE: API RESPONSE ===')
                console.log('Raw warehouse data from API:', warehouse)
                console.log('Warehouse manager field:', warehouse?.warehouseManager)
                console.log('Manager ID:', warehouse?.warehouseManager?.id)
                console.log('Manager name:', warehouse?.warehouseManager ? `${warehouse.warehouseManager.firstName} ${warehouse.warehouseManager.lastName}` : 'No manager')
                console.log('=== END WAREHOUSE STORE DEBUG ===')
                currentWarehouse.value = warehouse
                return warehouse
            } catch (apiError) {
                console.error('Failed to fetch warehouse from API:', apiError)
                throw apiError
            }
        } catch (err) {
            error.value = err.message || 'Failed to fetch warehouse'
            throw err
        } finally {
            isLoading.value = false
        }
    }

    /**
     * Create new warehouse
     */
    const createWarehouse = async (warehouseData) => {
        try {
            isCreating.value = true
            error.value = null

            try {
                const newWarehouse = await warehouseService.createWarehouse(warehouseData)

                // Add to the beginning of the list
                warehouses.value.unshift(newWarehouse)

                // Update pagination total
                pagination.value.total += 1

                return newWarehouse
            } catch (apiError) {
                console.error('Failed to create warehouse:', apiError)
                throw apiError
            }
        } catch (err) {
            error.value = err.message || 'Failed to create warehouse'
            throw err
        } finally {
            isCreating.value = false
        }
    }

    /**
     * Update warehouse
     */
    const updateWarehouse = async (id, warehouseData) => {
        try {
            isUpdating.value = true
            error.value = null

            // Update warehouse - backend returns just the ID
            await warehouseService.updateWarehouse(id, warehouseData)

            // Fetch the updated warehouse to get the complete data
            const updatedWarehouse = await warehouseService.getWarehouse(id)

            // Update in the list
            const index = warehouses.value.findIndex(warehouse => warehouse.id === id)
            if (index !== -1) {
                warehouses.value[index] = updatedWarehouse
            }

            // Update current warehouse if it's the same
            if (currentWarehouse.value?.id === id) {
                currentWarehouse.value = updatedWarehouse
            }

            return updatedWarehouse
        } catch (err) {
            error.value = err.message || 'Failed to update warehouse'
            throw err
        } finally {
            isUpdating.value = false
        }
    }

    /**
     * Delete warehouse
     */
    const deleteWarehouse = async (id) => {
        try {
            isDeleting.value = true
            error.value = null

            await warehouseService.deleteWarehouse(id)

            // Remove from list
            const index = warehouses.value.findIndex(warehouse => warehouse.id === id)
            if (index !== -1) {
                warehouses.value.splice(index, 1)
            }

            // Clear current warehouse if it's the same
            if (currentWarehouse.value?.id === id) {
                currentWarehouse.value = null
            }

            // Update pagination total
            pagination.value.total = Math.max(0, pagination.value.total - 1)

            return true
        } catch (err) {
            error.value = err.message || 'Failed to delete warehouse'
            throw err
        } finally {
            isDeleting.value = false
        }
    }

    /**
     * Get warehouse statistics
     */
    const getWarehouseStats = async (warehouseId) => {
        try {
            error.value = null

            const stats = await warehouseService.getWarehouseStats(warehouseId)
            warehouseStats.value = stats

            return stats
        } catch (err) {
            error.value = err.message || 'Failed to fetch warehouse statistics'
            throw err
        }
    }

    /**
     * Get warehouse inventory with fallback
     */
    const getWarehouseInventory = async (warehouseId, params = {}) => {
        try {
            error.value = null

            try {
                return await warehouseService.getWarehouseInventory(warehouseId, params)
            } catch (apiError) {
                if (apiError.response?.status === 404 || apiError.response?.status === 403) {
                    console.warn('Warehouse inventory API not available, returning empty inventory')
                    return {
                        data: [],
                        meta: { total: 0, page: 1, limit: 10, totalPages: 0 }
                    }
                } else {
                    throw apiError
                }
            }
        } catch (err) {
            error.value = err.message || 'Failed to fetch warehouse inventory'
            throw err
        }
    }

    /**
     * Get warehouse stocks
     */
    const getWarehouseStocks = async (warehouseId) => {
        try {
            error.value = null
            return await warehouseService.getWarehouseStocks(warehouseId)
        } catch (err) {
            error.value = err.message || 'Failed to fetch warehouse stocks'
            throw err
        }
    }

    /**
     * Create warehouse stock
     */
    const createWarehouseStock = async (warehouseId, stockData) => {
        try {
            loading.value = true
            error.value = null
            const result = await warehouseService.createWarehouseStock(warehouseId, stockData)
            
            // Refresh warehouse stocks after creation
            await getWarehouseStocks(warehouseId)
            
            return result
        } catch (err) {
            error.value = err.message || 'Failed to create warehouse stock'
            throw err
        } finally {
            loading.value = false
        }
    }

    // === INVENTORY MANAGEMENT ===

    /**
     * Fetch all stocks from all warehouses
     */
    const fetchAllStocks = async () => {
        try {
            isLoading.value = true
            error.value = null

            // Get all warehouses with their stocks
            const warehousesWithStocks = await warehouseService.getWarehousesWithStocks()
            
            // Flatten all stocks from all warehouses into inventory array
            inventory.value = warehousesWithStocks.reduce((allStocks, warehouse) => {
                if (warehouse.stocks && warehouse.stocks.length > 0) {
                    const warehouseStocks = warehouse.stocks.map(stock => ({
                        ...stock,
                        warehouseName: warehouse.name,
                        warehouseId: warehouse.id
                    }))
                    return [...allStocks, ...warehouseStocks]
                }
                return allStocks
            }, [])

            pagination.value = {
                total: inventory.value.length,
                page: 1,
                limit: inventory.value.length,
                totalPages: 1
            }

            return { data: inventory.value, meta: pagination.value }
        } catch (err) {
            error.value = err.message || 'Failed to fetch stocks'
            throw err
        } finally {
            isLoading.value = false
        }
    }

    /**
     * Get inventory item by ID
     */
    const getInventoryItem = async (id) => {
        try {
            isLoading.value = true
            error.value = null

            const item = await inventoryService.getInventoryItem(id)
            currentItem.value = item

            return item
        } catch (err) {
            error.value = err.message || 'Failed to fetch inventory item'
            throw err
        } finally {
            isLoading.value = false
        }
    }

    /**
     * Create new inventory item
     */
    const createInventoryItem = async (itemData) => {
        try {
            isCreating.value = true
            error.value = null

            const newItem = await inventoryService.createInventoryItem(itemData)

            // Add to the beginning of the list
            inventory.value.unshift(newItem)

            // Update pagination total
            pagination.value.total += 1

            return newItem
        } catch (err) {
            error.value = err.message || 'Failed to create inventory item'
            throw err
        } finally {
            isCreating.value = false
        }
    }

    /**
     * Update inventory item
     */
    const updateInventoryItem = async (id, itemData) => {
        try {
            isUpdating.value = true
            error.value = null

            const updatedItem = await inventoryService.updateInventoryItem(id, itemData)

            // Update in the list
            const index = inventory.value.findIndex(item => item.id === id)
            if (index !== -1) {
                inventory.value[index] = updatedItem
            }

            // Update current item if it's the same
            if (currentItem.value?.id === id) {
                currentItem.value = updatedItem
            }

            return updatedItem
        } catch (err) {
            error.value = err.message || 'Failed to update inventory item'
            throw err
        } finally {
            isUpdating.value = false
        }
    }

    /**
     * Delete inventory item
     */
    const deleteInventoryItem = async (id) => {
        try {
            error.value = null

            await inventoryService.deleteInventoryItem(id)

            // Remove from list
            const index = inventory.value.findIndex(item => item.id === id)
            if (index !== -1) {
                inventory.value.splice(index, 1)
            }

            // Clear current item if it's the same
            if (currentItem.value?.id === id) {
                currentItem.value = null
            }

            // Update pagination total
            pagination.value.total = Math.max(0, pagination.value.total - 1)

            return true
        } catch (err) {
            error.value = err.message || 'Failed to delete inventory item'
            throw err
        }
    }

    /**
     * Update stock quantity
     */
    const updateStock = async (itemId, quantity, type = 'adjustment', notes = '', openingStock = null, closingStock = null, activationId = null) => {
        try {
            error.value = null

            const movement = await inventoryService.updateStock(itemId, quantity, type, notes, openingStock, closingStock, activationId)

            // Update inventory item quantity
            const index = inventory.value.findIndex(item => item.id === itemId)
            if (index !== -1) {
                inventory.value[index].quantity += quantity
            }

            if (currentItem.value?.id === itemId) {
                currentItem.value.quantity += quantity
            }

            // Add to movements
            stockMovements.value.unshift(movement)

            return movement
        } catch (err) {
            error.value = err.message || 'Failed to update stock'
            throw err
        }
    }

    /**
     * Allocate stock to activation
     */
    const allocateStock = async (allocationData) => {
        try {
            error.value = null

            const allocation = await inventoryService.allocateStock(allocationData)

            // Update inventory quantities
            allocationData.items.forEach(item => {
                const inventoryIndex = inventory.value.findIndex(inv => inv.id === item.inventoryId)
                if (inventoryIndex !== -1) {
                    inventory.value[inventoryIndex].allocated =
                        (inventory.value[inventoryIndex].allocated || 0) + item.quantity
                }
            })

            // Add to allocations
            allocations.value.unshift(allocation)

            return allocation
        } catch (err) {
            error.value = err.message || 'Failed to allocate stock'
            throw err
        }
    }

    /**
     * Get stock movements
     */
    const fetchStockMovements = async (params = {}) => {
        try {
            error.value = null

            const response = await inventoryService.getStockMovements(params)
            stockMovements.value = response.data

            return response
        } catch (err) {
            error.value = err.message || 'Failed to fetch stock movements'
            throw err
        }
    }

    /**
     * Get low stock alerts
     */
    const fetchLowStockAlerts = async () => {
        try {
            error.value = null

            const alerts = await inventoryService.getLowStockAlerts()
            lowStockAlerts.value = alerts

            return alerts
        } catch (err) {
            error.value = err.message || 'Failed to fetch low stock alerts'
            throw err
        }
    }

    /**
     * Bulk stock update
     */
    const bulkUpdateStock = async (updates) => {
        try {
            error.value = null

            const results = []
            for (const update of updates) {
                try {
                    const result = await updateStock(
                        update.itemId,
                        update.quantity,
                        update.type,
                        update.notes
                    )
                    results.push({ success: true, itemId: update.itemId, result })
                } catch (err) {
                    results.push({ success: false, itemId: update.itemId, error: err.message })
                }
            }

            return results
        } catch (err) {
            error.value = err.message || 'Failed to bulk update stock'
            throw err
        }
    }

    /**
     * Generate reorder report
     */
    const generateReorderReport = () => {
        return inventory.value
            .filter(item => item.quantity <= item.reorderLevel)
            .map(item => ({
                ...item,
                suggestedOrderQuantity: Math.max(
                    item.reorderLevel * 2 - item.quantity,
                    item.minOrderQuantity || 1
                ),
                daysOutOfStock: item.quantity === 0 ?
                    Math.ceil((Date.now() - new Date(item.lastRestocked)) / (1000 * 60 * 60 * 24)) : 0
            }))
            .sort((a, b) => a.quantity - b.quantity)
    }

    /**
     * Set filters
     */
    const setFilters = (newFilters) => {
        filters.value = { ...filters.value, ...newFilters }
        pagination.value.page = 1
    }

    /**
     * Clear filters
     */
    const clearFilters = () => {
        filters.value = {
            status: null,
            category: null,
            supplier: null,
            location: null,
            search: '',
            lowStock: false,
            outOfStock: false
        }
        pagination.value.page = 1
    }

    /**
     * Set pagination
     */
    const setPagination = (newPagination) => {
        pagination.value = { ...pagination.value, ...newPagination }
    }

    /**
     * Set sorting
     */
    const setSorting = (field, order = 'asc') => {
        sortBy.value = field
        sortOrder.value = order
        pagination.value.page = 1
    }

    /**
     * Refresh inventory
     */
    const refreshInventory = async () => {
        await fetchAllStocks()
    }

    /**
     * Clear error
     */
    const clearError = () => {
        error.value = null
    }

    /**
     * Get item by SKU
     */
    const getItemBySku = (sku) => {
        return inventory.value.find(item => item.sku === sku)
    }

    /**
     * Search inventory
     */
    const searchInventory = async (searchTerm) => {
        setFilters({ search: searchTerm })
        await fetchAllStocks()
    }

    /**
     * Calculate stock value
     */
    const calculateStockValue = (items = inventory.value) => {
        return items.reduce((total, item) => {
            return total + (item.quantity * (item.unitPrice || 0))
        }, 0)
    }

    /**
     * Get expiring items (if applicable)
     */
    const getExpiringItems = (daysAhead = 30) => {
        const cutoffDate = new Date()
        cutoffDate.setDate(cutoffDate.getDate() + daysAhead)

        return inventory.value.filter(item =>
            item.expiryDate && new Date(item.expiryDate) <= cutoffDate
        )
    }

    /**
     * Get items by location
     */
    const getItemsByLocation = (location) => {
        return inventory.value.filter(item => item.location === location)
    }

    /**
     * Get available quantity for allocation
     */
    const getAvailableQuantity = (itemId) => {
        const item = inventory.value.find(i => i.id === itemId)
        if (!item) return 0

        const allocated = allocations.value
            .filter(allocation => allocation.status === 'active')
            .reduce((total, allocation) => {
                const allocatedItem = allocation.items.find(i => i.inventoryId === itemId)
                return total + (allocatedItem?.quantity || 0)
            }, 0)

        return Math.max(0, item.quantity - allocated)
    }

    /**
     * Reserve stock for allocation
     */
    const reserveStock = async (reservationData) => {
        try {
            error.value = null

            // Add to pending allocations
            const reservation = {
                id: Date.now().toString(),
                ...reservationData,
                status: 'pending',
                createdAt: new Date().toISOString()
            }

            pendingAllocations.value.push(reservation)

            return reservation
        } catch (err) {
            error.value = err.message || 'Failed to reserve stock'
            throw err
        }
    }

    /**
     * Confirm stock reservation
     */
    const confirmReservation = async (reservationId) => {
        try {
            error.value = null

            const reservation = pendingAllocations.value.find(r => r.id === reservationId)
            if (!reservation) {
                throw new Error('Reservation not found')
            }

            // Convert to actual allocation
            const allocation = await allocateStock(reservation)

            // Remove from pending
            const index = pendingAllocations.value.findIndex(r => r.id === reservationId)
            if (index !== -1) {
                pendingAllocations.value.splice(index, 1)
            }

            return allocation
        } catch (err) {
            error.value = err.message || 'Failed to confirm reservation'
            throw err
        }
    }

    /**
     * Cancel stock reservation
     */
    const cancelReservation = (reservationId) => {
        const index = pendingAllocations.value.findIndex(r => r.id === reservationId)
        if (index !== -1) {
            pendingAllocations.value.splice(index, 1)
        }
    }

    /**
     * Get stock forecast
     */
    const getStockForecast = (itemId, daysAhead = 30) => {
        const item = inventory.value.find(i => i.id === itemId)
        if (!item) return null

        // Simple forecast based on recent movements
        const recentMovements = stockMovements.value
            .filter(m => m.inventoryId === itemId && m.type === 'sale')
            .slice(0, 10)

        if (recentMovements.length === 0) return null

        const avgDailyConsumption = recentMovements.reduce((sum, m) => sum + Math.abs(m.quantity), 0) / recentMovements.length
        const forecastedConsumption = avgDailyConsumption * daysAhead
        const projectedQuantity = item.quantity - forecastedConsumption

        return {
            currentQuantity: item.quantity,
            avgDailyConsumption,
            forecastedConsumption,
            projectedQuantity,
            daysUntilStockout: avgDailyConsumption > 0 ? Math.floor(item.quantity / avgDailyConsumption) : null,
            recommendedReorder: projectedQuantity <= item.reorderLevel
        }
    }

    // Return store interface
    return {
        // Warehouse State
        warehouses,
        currentWarehouse,
        warehouseStats,
        
        // Inventory State
        inventory,
        currentItem,
        stockMovements,
        lowStockAlerts,
        allocations,
        pendingAllocations,
        
        // Loading States
        isLoading,
        isCreating,
        isUpdating,
        isDeleting,
        error,
        pagination,
        filters,
        sortBy,
        sortOrder,

        // Getters
        filteredInventory,
        inventoryByStatus,
        inventoryByCategory,
        lowStockItems,
        outOfStockItems,
        inStockItems,
        criticalItems,
        inventoryStats,
        inventoryOptions,
        recentMovements,

        // Warehouse Actions
        fetchWarehouses,
        getWarehouse,
        createWarehouse,
        updateWarehouse,
        deleteWarehouse,
        getWarehouseStats,
        getWarehouseStocks,
        createWarehouseStock,
        
        // Inventory Actions
        fetchAllStocks,
        getInventoryItem,
        createInventoryItem,
        updateInventoryItem,
        deleteInventoryItem,
        updateStock,
        allocateStock,
        fetchStockMovements,
        fetchLowStockAlerts,
        bulkUpdateStock,
        generateReorderReport,
        setFilters,
        clearFilters,
        setPagination,
        setSorting,
        refreshInventory,
        clearError,
        getItemBySku,
        searchInventory,
        calculateStockValue,
        getExpiringItems,
        getItemsByLocation,
        getAvailableQuantity,
        reserveStock,
        confirmReservation,
        cancelReservation,
        getStockForecast,
        
        // Manager Actions
        removeWarehouseManager: async (warehouseId) => {
            try {
                console.log('=== WAREHOUSE STORE: removeWarehouseManager ===')
                console.log('Called with warehouseId:', warehouseId)
                console.log('Current warehouse:', currentWarehouse.value)
                
                isUpdating.value = true
                error.value = null
                
                // Call API to remove manager
                console.log('Calling warehouseService.removeWarehouseManager...')
                await warehouseService.removeWarehouseManager(warehouseId)
                console.log('API call successful')
                
                // Update the current warehouse if it's the same
                if (currentWarehouse.value?.id === warehouseId) {
                    console.log('Updating current warehouse manager to null')
                    currentWarehouse.value.warehouseManager = null
                }
                
                // Update in the warehouses list
                const index = warehouses.value.findIndex(w => w.id === warehouseId)
                if (index !== -1) {
                    console.log('Updating warehouse in list at index:', index)
                    warehouses.value[index].warehouseManager = null
                }
                
                console.log('=== END WAREHOUSE STORE DEBUG ===')
                return true
            } catch (err) {
                console.error('Error in removeWarehouseManager:', err)
                error.value = err.message || 'Failed to remove warehouse manager'
                throw err
            } finally {
                isUpdating.value = false
            }
        }
    }
})

export default useWarehouseStore