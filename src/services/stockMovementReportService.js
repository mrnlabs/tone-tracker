import api from './api'
import { STOCK_MOVEMENT_TYPE } from '@/utils/constants'

class StockMovementReportService {
    /**
     * Get comprehensive stock movement report with filters
     * @param {Object} params - Query parameters
     * @returns {Promise} Stock movement report data
     */
    async getStockMovementReport(params = {}) {
        try {
            // Get all stock items using the real API endpoint
            const stocksResponse = await this.getInventory()
            
            // Handle different response structures
            let stockItems = []
            if (stocksResponse.data) {
                // If response has data property
                stockItems = stocksResponse.data.content || stocksResponse.data || []
            } else if (stocksResponse.content) {
                // If response has content directly
                stockItems = stocksResponse.content
            } else if (Array.isArray(stocksResponse)) {
                // If response is an array directly
                stockItems = stocksResponse
            }
            
            // Check if we have any stock items
            if (!Array.isArray(stockItems) || stockItems.length === 0) {
                console.warn('No stock items found')
                return {
                    content: [],
                    totalElements: 0,
                    totalPages: 0,
                    number: 0
                }
            }
            
            // Collect detailed movements from multiple stock items
            const allMovements = []
            const movementPromises = []
            
            // Use detailed movement endpoint if date range is provided
            const useDetailedEndpoint = params.startDate && params.endDate
            
            // Limit to first 10 items to avoid overwhelming the server
            const itemsToFetch = stockItems.slice(0, 10)
            
            for (const item of itemsToFetch) {
                if (useDetailedEndpoint) {
                    // Use detailed report endpoint with date range
                    movementPromises.push(
                        this.getDetailedStockMovements(item.id, params.startDate, params.endDate)
                            .then(movements => {
                                return movements.map(m => ({
                                    ...m,
                                    productName: m.stockProductName || item.productName,
                                    sku: m.stockSku || item.sku,
                                    warehouseId: item.warehouseId,
                                    warehouseName: item.warehouseName || 'Unknown',
                                    recordedBy: m.recordedByName,
                                    activationName: m.activationName
                                }))
                            })
                            .catch(error => {
                                console.warn(`Failed to fetch detailed movements for stock ${item.id}:`, error)
                                return []
                            })
                    )
                } else {
                    // Use simple movements endpoint
                    movementPromises.push(
                        this.getStockMovements(item.id)
                            .then(movements => {
                                return movements.map(m => ({
                                    ...m,
                                    productName: m.stockProductName || item.productName,
                                    sku: m.stockSku || item.sku,
                                    warehouseId: item.warehouseId,
                                    warehouseName: item.warehouseName || 'Unknown',
                                    recordedBy: m.recordedByName || m.recordedBy,
                                    activationName: m.activationName
                                }))
                            })
                            .catch(error => {
                                console.warn(`Failed to fetch movements for stock ${item.id}:`, error)
                                return []
                            })
                    )
                }
            }
            
            const movementResults = await Promise.all(movementPromises)
            movementResults.forEach(movements => {
                allMovements.push(...movements)
            })
            
            // Apply filters
            let filteredMovements = this.applyFilters(allMovements, params)
            
            // Sort by date
            filteredMovements.sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated))
            
            // Paginate
            const page = params.page || 0
            const size = params.size || 20
            const start = page * size
            const end = start + size
            const paginatedMovements = filteredMovements.slice(start, end)
            
            return {
                content: paginatedMovements,
                totalElements: filteredMovements.length,
                totalPages: Math.ceil(filteredMovements.length / size),
                number: page
            }
        } catch (error) {
            console.error('Error fetching stock movement report:', error)
            throw error
        }
    }

    /**
     * Get stock movement summary for a specific period
     * @param {Object} params - Query parameters (startDate, endDate, warehouseId, etc.)
     * @returns {Promise} Movement summary data
     */
    async getMovementSummary(params = {}) {
        try {
            // Get all movements first
            const movementData = await this.getStockMovementReport(params)
            const movements = movementData.content || []
            
            // Calculate summary statistics
            let totalIn = 0
            let totalOut = 0
            let totalSales = 0
            
            movements.forEach(movement => {
                const quantity = Math.abs(movement.quantity)
                
                if (movement.quantity > 0) {
                    totalIn += quantity
                } else {
                    totalOut += quantity
                }
                
                if (movement.movementType === 'SALE') {
                    totalSales += quantity
                }
            })
            
            return {
                totalMovements: movements.length,
                totalIn,
                totalOut,
                totalSales,
                inGrowth: this.calculateGrowth(totalIn),
                outGrowth: this.calculateGrowth(totalOut),
                salesGrowth: this.calculateGrowth(totalSales)
            }
        } catch (error) {
            console.error('Error fetching movement summary:', error)
            throw error
        }
    }

    /**
     * Get movements by type breakdown
     * @param {Object} params - Query parameters
     * @returns {Promise} Movement type breakdown data
     */
    async getMovementsByType(params = {}) {
        try {
            // Get all movements first
            const movementData = await this.getStockMovementReport(params)
            const movements = movementData.content || []
            
            // Count by type
            const typeCount = {}
            
            movements.forEach(movement => {
                const type = movement.movementType
                if (!typeCount[type]) {
                    typeCount[type] = 0
                }
                typeCount[type]++
            })
            
            // Convert to arrays for chart
            const types = Object.keys(typeCount).map(type => {
                // Format the type name for display
                return type.charAt(0) + type.slice(1).toLowerCase().replace(/_/g, ' ')
            })
            const counts = Object.values(typeCount)
            
            return { types, counts }
        } catch (error) {
            console.error('Error fetching movements by type:', error)
            throw error
        }
    }

    /**
     * Get movement trends over time
     * @param {Object} params - Query parameters (period: daily, weekly, monthly)
     * @returns {Promise} Movement trends data
     */
    async getMovementTrends(params = {}) {
        try {
            // Get all movements first
            const movementData = await this.getStockMovementReport(params)
            const movements = movementData.content || []
            
            const period = params.period || 'daily'
            const labels = this.generateTrendLabels(period)
            
            // Group movements by period
            const trendData = this.groupMovementsByPeriod(movements, period, labels)
            
            return {
                labels,
                stockIn: trendData.stockIn,
                stockOut: trendData.stockOut,
                sales: trendData.sales
            }
        } catch (error) {
            console.error('Error fetching movement trends:', error)
            throw error
        }
    }

    /**
     * Get top performing products by movement
     * @param {Object} params - Query parameters
     * @returns {Promise} Top products data
     */
    async getTopProductsByMovement(params = {}) {
        try {
            // Get all movements first
            const movementData = await this.getStockMovementReport(params)
            const movements = movementData.content || []
            
            // Aggregate by product
            const productVolumes = {}
            
            movements.forEach(movement => {
                const product = movement.productName || 'Unknown'
                if (!productVolumes[product]) {
                    productVolumes[product] = 0
                }
                productVolumes[product] += Math.abs(movement.quantity)
            })
            
            // Sort and take top 10
            const sorted = Object.entries(productVolumes)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10)
            
            return {
                products: sorted.map(([name]) => name),
                volumes: sorted.map(([, volume]) => volume)
            }
        } catch (error) {
            console.error('Error fetching top products by movement:', error)
            throw error
        }
    }

    /**
     * Get movements by warehouse
     * @param {Object} params - Query parameters
     * @returns {Promise} Warehouse movement data
     */
    async getMovementsByWarehouse(params = {}) {
        try {
            // Get all movements first
            const movementData = await this.getStockMovementReport(params)
            const movements = movementData.content || []
            
            // Aggregate by warehouse
            const warehouseData = {}
            
            movements.forEach(movement => {
                const warehouse = movement.warehouseName || 'Unknown'
                if (!warehouseData[warehouse]) {
                    warehouseData[warehouse] = { inbound: 0, outbound: 0 }
                }
                
                if (movement.quantity > 0) {
                    warehouseData[warehouse].inbound += Math.abs(movement.quantity)
                } else {
                    warehouseData[warehouse].outbound += Math.abs(movement.quantity)
                }
            })
            
            const warehouses = Object.keys(warehouseData)
            const inbound = warehouses.map(w => warehouseData[w].inbound)
            const outbound = warehouses.map(w => warehouseData[w].outbound)
            
            return { warehouses, inbound, outbound }
        } catch (error) {
            console.error('Error fetching movements by warehouse:', error)
            throw error
        }
    }

    /**
     * Get movements by activation campaign
     * @param {Object} params - Query parameters
     * @returns {Promise} Activation movement data
     */
    async getMovementsByActivation(params = {}) {
        try {
            const response = await api.get('/reports/stock-movements/by-activation', { params })
            return response.data
        } catch (error) {
            console.error('Error fetching movements by activation:', error)
            throw error
        }
    }

    /**
     * Export stock movement report to Excel/CSV
     * @param {Object} params - Export parameters
     * @param {string} format - Export format (xlsx, csv)
     * @returns {Promise} File blob
     */
    async exportMovementReport(params = {}, format = 'xlsx') {
        try {
            // Generate CSV from real movement data
            if (format === 'csv') {
                return this.generateCSVExport(params)
            }
            
            // For Excel format, use the performance report endpoint if available
            const exportFormat = 'EXCEL'
            const response = await api.get('/analytics/export/performance-report', {
                params: { 
                    startDate: params.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    endDate: params.endDate || new Date().toISOString().split('T')[0],
                    format: exportFormat
                },
                responseType: 'blob'
            })
            return response.data
        } catch (error) {
            console.error('Error exporting movement report:', error)
            throw error
        }
    }

    /**
     * Get variance report (expected vs actual stock levels)
     * @param {Object} params - Query parameters
     * @returns {Promise} Variance report data
     */
    async getVarianceReport(params = {}) {
        try {
            const response = await api.get('/reports/stock-movements/variance', { params })
            return response.data
        } catch (error) {
            console.error('Error fetching variance report:', error)
            throw error
        }
    }

    /**
     * Get movement velocity report (frequency of movements)
     * @param {Object} params - Query parameters
     * @returns {Promise} Movement velocity data
     */
    async getMovementVelocity(params = {}) {
        try {
            const response = await api.get('/reports/stock-movements/velocity', { params })
            return response.data
        } catch (error) {
            console.error('Error fetching movement velocity:', error)
            throw error
        }
    }

    /**
     * Generate custom report with specific metrics
     * @param {Object} config - Report configuration
     * @returns {Promise} Custom report data
     */
    async generateCustomReport(config) {
        try {
            const response = await api.post('/reports/stock-movements/custom', config)
            return response.data
        } catch (error) {
            console.error('Error generating custom report:', error)
            throw error
        }
    }

    /**
     * Get predefined report templates
     * @returns {Promise} Available report templates
     */
    async getReportTemplates() {
        try {
            const response = await api.get('/reports/stock-movements/templates')
            return response.data
        } catch (error) {
            console.error('Error fetching report templates:', error)
            throw error
        }
    }

    /**
     * Get all stocks (inventory) using the real API endpoint
     * @param {number} page - Page number (default: 0)
     * @param {number} size - Page size (default: 100)
     * @returns {Promise} Inventory data
     */
    async getInventory(page = 0, size = 100) {
        try {
            const response = await api.get('/stocks', { 
                params: { page, size } 
            })
            return response
        } catch (error) {
            console.error('Error fetching inventory:', error)
            throw error
        }
    }

    /**
     * Get stock movements for a specific stock item using the real API endpoint
     * @param {number} stockId - The stock item ID
     * @returns {Promise} Stock movements data
     */
    async getStockMovements(stockId) {
        try {
            const response = await api.get(`/stocks/${stockId}/movements`)
            return response.data || response || []
        } catch (error) {
            console.error(`Error fetching movements for stock ${stockId}:`, error)
            return []
        }
    }

    /**
     * Get detailed stock movements for a specific period
     * @param {number} stockId - The stock item ID
     * @param {string} startDate - Start date in ISO format
     * @param {string} endDate - End date in ISO format
     * @returns {Promise} Detailed stock movements with period data
     */
    async getDetailedStockMovements(stockId, startDate, endDate) {
        try {
            const response = await api.get(`/stocks/${stockId}/report`, {
                params: { startDate, endDate }
            })
            // Extract movements from the detailed report
            return response.data?.stockMovements || response.stockMovements || []
        } catch (error) {
            console.error(`Error fetching detailed movements for stock ${stockId}:`, error)
            return []
        }
    }

    /**
     * Create a new stock movement using the real API endpoint
     * @param {number} stockId - The stock item ID
     * @param {Object} data - Stock movement data
     * @returns {Promise} Created movement data
     */
    async createMovement(stockId, data) {
        try {
            const response = await api.post(`/stocks/${stockId}/movements`, data)
            return response.data
        } catch (error) {
            console.error(`Error creating movement for stock ${stockId}:`, error)
            throw error
        }
    }

    /**
     * Get low stock items using the real API endpoint
     * @returns {Promise} Low stock items
     */
    async getLowStockItems() {
        try {
            const response = await api.get('/stocks/low-stock')
            return response.data || []
        } catch (error) {
            console.error('Error fetching low stock items:', error)
            throw error
        }
    }

    /**
     * Get stock report for a specific item using the real API endpoint
     * @param {number} stockId - The stock item ID
     * @param {string} startDate - Start date in ISO format
     * @param {string} endDate - End date in ISO format
     * @returns {Promise} Stock report data
     */
    async getStockReport(stockId, startDate, endDate) {
        try {
            const response = await api.get(`/stocks/${stockId}/report`, {
                params: { startDate, endDate }
            })
            return response.data
        } catch (error) {
            console.error(`Error fetching stock report for ${stockId}:`, error)
            throw error
        }
    }

    /**
     * Apply filters to movements
     * @param {Array} movements - Array of movements
     * @param {Object} params - Filter parameters
     * @returns {Array} Filtered movements
     */
    applyFilters(movements, params) {
        let filtered = [...movements]
        
        // Date range filter
        if (params.startDate) {
            const startDate = new Date(params.startDate)
            filtered = filtered.filter(m => new Date(m.dateCreated) >= startDate)
        }
        if (params.endDate) {
            const endDate = new Date(params.endDate)
            endDate.setHours(23, 59, 59, 999)
            filtered = filtered.filter(m => new Date(m.dateCreated) <= endDate)
        }
        
        // Movement type filter
        if (params.movementTypes) {
            const types = params.movementTypes.split(',')
            filtered = filtered.filter(m => types.includes(m.movementType))
        }
        
        // Warehouse filter
        if (params.warehouseId) {
            filtered = filtered.filter(m => m.warehouseId === parseInt(params.warehouseId))
        }
        
        // Product filter
        if (params.productId) {
            filtered = filtered.filter(m => m.productId === parseInt(params.productId))
        }
        
        // Search filter
        if (params.search) {
            const searchLower = params.search.toLowerCase()
            filtered = filtered.filter(m => 
                m.productName?.toLowerCase().includes(searchLower) ||
                m.sku?.toLowerCase().includes(searchLower) ||
                m.reason?.toLowerCase().includes(searchLower) ||
                m.recordedBy?.toLowerCase().includes(searchLower)
            )
        }
        
        return filtered
    }

    /**
     * Group movements by period for trend analysis
     * @param {Array} movements - Array of movements
     * @param {string} period - Period type (daily, weekly, monthly)
     * @param {Array} labels - Pre-generated labels
     * @returns {Object} Grouped movement data
     */
    groupMovementsByPeriod(movements, period, labels) {
        const stockIn = new Array(labels.length).fill(0)
        const stockOut = new Array(labels.length).fill(0)
        const sales = new Array(labels.length).fill(0)
        
        movements.forEach(movement => {
            const date = new Date(movement.dateCreated)
            const labelIndex = this.getLabelIndex(date, period, labels)
            
            if (labelIndex >= 0 && labelIndex < labels.length) {
                const quantity = Math.abs(movement.quantity)
                
                if (movement.quantity > 0) {
                    stockIn[labelIndex] += quantity
                } else {
                    stockOut[labelIndex] += quantity
                }
                
                if (movement.movementType === 'SALE') {
                    sales[labelIndex] += quantity
                }
            }
        })
        
        return { stockIn, stockOut, sales }
    }

    /**
     * Get the index of a date in the labels array
     * @param {Date} date - The date to find
     * @param {string} period - Period type
     * @param {Array} labels - Array of labels
     * @returns {number} Index in labels array
     */
    getLabelIndex(date, period, labels) {
        const now = new Date()
        
        if (period === 'daily') {
            const daysDiff = Math.floor((now - date) / (1000 * 60 * 60 * 24))
            return labels.length - 1 - daysDiff
        } else if (period === 'weekly') {
            const weeksDiff = Math.floor((now - date) / (1000 * 60 * 60 * 24 * 7))
            return labels.length - 1 - weeksDiff
        } else {
            const monthsDiff = (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth())
            return labels.length - 1 - monthsDiff
        }
    }

    /**
     * Generate mock movements for demonstration
     * @param {Object} params - Filter parameters
     * @returns {Array} Mock movement records
     */
    generateMockMovements(params = {}) {
        const movements = []
        const products = ['Product A', 'Product B', 'Product C', 'Product D', 'Product E']
        const warehouses = ['Main Warehouse', 'Secondary Warehouse', 'Distribution Center']
        const types = Object.values(STOCK_MOVEMENT_TYPE)
        const users = ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Williams']

        // Generate 50 mock movements for a better demonstration
        for (let i = 0; i < 50; i++) {
            const isInbound = Math.random() > 0.5
            const movementType = types[Math.floor(Math.random() * types.length)]
            
            movements.push({
                id: i + 1,
                movementType,
                quantity: isInbound ? Math.floor(Math.random() * 50) + 10 : -(Math.floor(Math.random() * 30) + 5),
                productName: products[Math.floor(Math.random() * products.length)],
                sku: `SKU-${Math.floor(Math.random() * 1000) + 1000}`,
                warehouseName: warehouses[Math.floor(Math.random() * warehouses.length)],
                reason: `${movementType} - Regular operation`,
                notes: Math.random() > 0.5 ? 'Additional notes about this movement' : null,
                recordedBy: users[Math.floor(Math.random() * users.length)],
                dateCreated: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
                openingStock: Math.floor(Math.random() * 200) + 100,
                closingStock: Math.floor(Math.random() * 200) + 100
            })
        }

        return movements.sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated))
    }

    /**
     * Generate trend labels based on period
     * @param {string} period - Period type (daily, weekly, monthly)
     * @returns {Array} Array of labels
     */
    generateTrendLabels(period) {
        const labels = []
        const now = new Date()

        if (period === 'daily') {
            for (let i = 6; i >= 0; i--) {
                const date = new Date(now)
                date.setDate(date.getDate() - i)
                labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))
            }
        } else if (period === 'weekly') {
            for (let i = 3; i >= 0; i--) {
                labels.push(`Week ${4 - i}`)
            }
        } else {
            for (let i = 11; i >= 0; i--) {
                const date = new Date(now)
                date.setMonth(date.getMonth() - i)
                labels.push(date.toLocaleDateString('en-US', { month: 'short' }))
            }
        }

        return labels
    }

    /**
     * Calculate growth percentage based on historical data
     * @param {number} currentValue - Current period value
     * @param {number} previousValue - Previous period value (optional)
     * @returns {number} Growth percentage
     */
    calculateGrowth(currentValue, previousValue = null) {
        if (previousValue === null || previousValue === 0) {
            return 0 // No previous data or division by zero
        }
        return ((currentValue - previousValue) / previousValue) * 100
    }

    /**
     * Fallback method for mock stock movement report
     * @param {Object} params - Filter parameters
     * @returns {Object} Mock report data
     */
    getMockStockMovementReport(params) {
        const mockMovements = this.generateMockMovements(params)
        
        // Apply filters
        let filteredMovements = this.applyFilters(mockMovements, params)
        
        // Sort by date
        filteredMovements.sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated))
        
        // Paginate
        const page = params.page || 0
        const size = params.size || 20
        const start = page * size
        const end = start + size
        const paginatedMovements = filteredMovements.slice(start, end)
        
        return {
            content: paginatedMovements,
            totalElements: filteredMovements.length,
            totalPages: Math.ceil(filteredMovements.length / size),
            number: page
        }
    }

    /**
     * Generate CSV export from real movement data
     * @param {Object} params - Export parameters
     * @returns {Promise<Blob>} CSV blob
     */
    async generateCSVExport(params) {
        try {
            const movementData = await this.getStockMovementReport(params)
            const movements = movementData.content || []
            
            // CSV headers with detailed fields
            const headers = [
                'Date', 'Movement Type', 'Product', 'SKU', 'Warehouse', 
                'Quantity', 'Opening Stock', 'Closing Stock', 'Reason', 
                'Recorded By', 'Campaign', 'Movement ID'
            ]
            
            // Convert movements to CSV rows with all detailed fields
            const rows = movements.map(m => [
                new Date(m.dateCreated).toLocaleDateString(),
                m.movementType,
                m.productName || m.stockProductName || '',
                m.sku || m.stockSku || '',
                m.warehouseName || '',
                m.quantity,
                m.openingStock || '',
                m.closingStock || '',
                m.reason || '',
                m.recordedBy || m.recordedByName || '',
                m.activationName || '',
                m.id || ''
            ])
            
            // Build CSV content
            const csvContent = [
                headers.join(','),
                ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
            ].join('\n')
            
            // Create blob
            return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        } catch (error) {
            console.error('Error generating CSV export:', error)
            throw error
        }
    }
}

export default new StockMovementReportService()