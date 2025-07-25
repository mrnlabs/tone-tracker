import api from './api'
import stockService from './stockService'

class StockMovementService {
    async getAllStockMovements(params = {}) {
        try {
            const data = await api.get('/stock-movements', { params })
            return data
        } catch (error) {
            console.error('Error fetching stock movements:', error)
            throw error
        }
    }

    async getStockMovementById(id) {
        try {
            const data = await api.get(`/stock-movements/${id}`)
            return data
        } catch (error) {
            console.error('Error fetching stock movement:', error)
            throw error
        }
    }

    async getStockMovements(stockId, params = {}) {
        try {
            console.log(`Fetching movements for stock ${stockId} with params:`, params)
            
            // Check if token is available
            const token = localStorage.getItem('activation_auth_token')
            console.log(`Auth token available for stock ${stockId} request:`, !!token)
            
            // API service returns response.data directly, so 'data' is the actual response
            const data = await api.get(`/stocks/${stockId}/movements`, { params })
            console.log(`Response data for stock ${stockId}:`, data)
            console.log(`Type of data:`, typeof data)
            console.log(`Is data array:`, Array.isArray(data))
            
            // Handle undefined or null data
            if (data === undefined || data === null) {
                console.warn(`API returned undefined/null data for stock ${stockId}, returning empty array`)
                return []
            }
            
            // The API returns a plain array
            if (Array.isArray(data)) {
                console.log(`API returned array with ${data.length} movements for stock ${stockId}`)
                return data
            }
            
            // If it's an object with content property (paginated response)
            if (data.content && Array.isArray(data.content)) {
                console.log(`API returned paginated response with ${data.content.length} movements for stock ${stockId}`)
                return data
            }
            
            console.warn(`Unexpected response format for stock ${stockId}:`, typeof data, data)
            return data
        } catch (error) {
            console.error(`Error fetching stock movements for stock ${stockId}:`, error)
            console.error(`Error response:`, error.response)
            console.error(`Error status:`, error.response?.status)
            console.error(`Error data:`, error.response?.data)
            
            if (error.response?.status === 404) {
                // Return empty array for 404 instead of throwing
                console.warn(`No movements found for stock ${stockId}`)
                return []
            }
            if (error.response?.status === 401) {
                console.error(`Authentication failed for stock ${stockId} - token may be invalid`)
            }
            if (error.response?.status === 403) {
                console.error(`Authorization failed for stock ${stockId} - insufficient permissions`)
            }
            throw error
        }
    }

    async createStockMovement(stockId, movementData) {
        try {
            const data = await api.post(`/stocks/${stockId}/movements`, movementData)
            return data
        } catch (error) {
            console.error('Error creating stock movement:', error)
            throw error
        }
    }

    async createStockMovementGeneral(movementData) {
        try {
            const data = await api.post('/stock-movements', movementData)
            return data
        } catch (error) {
            console.error('Error creating stock movement:', error)
            throw error
        }
    }

    async updateStockMovement(id, movementData) {
        try {
            const data = await api.put(`/stock-movements/${id}`, movementData)
            return data
        } catch (error) {
            console.error('Error updating stock movement:', error)
            throw error
        }
    }

    async deleteStockMovement(id) {
        try {
            const data = await api.delete(`/stock-movements/${id}`)
            return data
        } catch (error) {
            console.error('Error deleting stock movement:', error)
            throw error
        }
    }

    async recordSale(stockId, saleData) {
        try {
            return await stockService.recordSale(stockId, saleData)
        } catch (error) {
            console.error('Error recording sale:', error)
            throw error
        }
    }

    async recordSample(stockId, sampleData) {
        try {
            return await stockService.recordSample(stockId, sampleData)
        } catch (error) {
            console.error('Error recording sample:', error)
            throw error
        }
    }

    async recordAdjustment(stockId, adjustmentData) {
        try {
            return await stockService.adjustStock(stockId, adjustmentData)
        } catch (error) {
            console.error('Error recording adjustment:', error)
            throw error
        }
    }

    async recordStockIn(stockId, stockInData) {
        try {
            return await stockService.replenishStock(stockId, stockInData)
        } catch (error) {
            console.error('Error recording stock in:', error)
            throw error
        }
    }

    async recordAllocation(stockId, allocationData) {
        try {
            return await stockService.allocateStock(stockId, allocationData)
        } catch (error) {
            console.error('Error recording allocation:', error)
            throw error
        }
    }

    /**
     * Get stock movement summary for reporting
     * @param {number} stockId - The stock item ID
     * @param {Object} params - Query parameters (startDate, endDate)
     * @returns {Promise} Movement summary
     */
    async getMovementSummary(stockId, params = {}) {
        try {
            const endpoint = `/stocks/${stockId}/movements/summary`
            const data = await api.get(endpoint, { params })
            return data
        } catch (error) {
            console.error('Error fetching movement summary:', error)
            throw error
        }
    }

    async getMovementsByActivation(activationId, params = {}) {
        try {
            const data = await api.get(`/activations/${activationId}/stock-movements`, { params })
            return data
        } catch (error) {
            console.error('Error fetching movements by activation:', error)
            throw error
        }
    }

    async getMovementTypes() {
        try {
            const data = await api.get('/stock-movements/movement-types')
            return data
        } catch (error) {
            console.error('Error fetching movement types:', error)
            return ['IN', 'OUT', 'ALLOCATION', 'REPLENISHMENT', 'ADJUSTMENT', 'DISTRIBUTION', 'RETURN', 'SAMPLE', 'SALE']
        }
    }

    /**
     * Bulk record sales (for offline sync)
     * @param {Array} sales - Array of sale records
     * @returns {Promise} Bulk operation result
     */
    async bulkRecordSales(sales) {
        try {
            const data = await api.post('/stocks/movements/bulk', {
                movements: sales.map(sale => ({
                    ...sale,
                    movementType: 'SALE'
                }))
            })
            return data
        } catch (error) {
            console.error('Error bulk recording sales:', error)
            throw error
        }
    }

    /**
     * Export stock movements to Excel/CSV
     * @param {number} stockId - The stock item ID
     * @param {Object} params - Export parameters
     * @returns {Promise} File blob
     */
    async exportMovements(stockId, params = {}) {
        try {
            return await stockService.exportStockMovements(stockId, params)
        } catch (error) {
            console.error('Error exporting movements:', error)
            throw error
        }
    }

    /**
     * Export warehouse stock movements to Excel/CSV
     * @param {Object} params - Export parameters including warehouseId
     * @returns {Promise} File blob
     */
    async exportWarehouseMovements(params = {}) {
        try {
            const response = await api.get('/stock-movements/export', {
                params,
                responseType: 'blob'
            })
            return response
        } catch (error) {
            console.error('Error exporting warehouse movements:', error)
            throw error
        }
    }
}

export default new StockMovementService()