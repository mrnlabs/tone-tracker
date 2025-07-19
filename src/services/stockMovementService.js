import api from './api'
import { API_ENDPOINTS } from '@/utils/constants'

class StockMovementService {
    /**
     * Get stock movement history for a specific stock item
     * @param {number} stockId - The stock item ID
     * @param {Object} params - Query parameters (page, size, startDate, endDate, movementType)
     * @returns {Promise} Stock movement history
     */
    async getStockMovements(stockId, params = {}) {
        try {
            const endpoint = `/api/stocks/${stockId}/movements`
            const response = await api.get(endpoint, { params })
            return response.data
        } catch (error) {
            console.error('Error fetching stock movements:', error)
            throw error
        }
    }

    /**
     * Record a sale transaction
     * @param {number} stockId - The stock item ID
     * @param {Object} saleData - Sale information
     * @returns {Promise} Created sale record
     */
    async recordSale(stockId, saleData) {
        try {
            const endpoint = '/api/sales'
            const response = await api.post(endpoint, {
                activationId: saleData.activationId,
                stockId: stockId,
                promoterId: saleData.promoterId,
                unitsSold: saleData.quantity,
                paymentMethod: saleData.paymentMethod,
                amount: saleData.totalAmount,
                usdEquivalent: saleData.usdEquivalent || null,
                saleDateTime: saleData.saleDateTime || new Date().toISOString(),
                notes: saleData.notes || null
            })
            return response.data
        } catch (error) {
            console.error('Error recording sale:', error)
            throw error
        }
    }

    /**
     * Record a sample given out
     * @param {number} stockId - The stock item ID
     * @param {Object} sampleData - Sample information
     * @returns {Promise} Created sample record
     */
    async recordSample(stockId, sampleData) {
        try {
            const endpoint = `/api/stocks/${stockId}/movements`
            const response = await api.post(endpoint, {
                movementType: 'SAMPLE',
                quantity: sampleData.quantity,
                reason: sampleData.reason || 'Product sample',
                activationId: sampleData.activationId,
                customerId: sampleData.customerId,
                notes: sampleData.notes,
                openingStock: sampleData.openingStock || null,
                closingStock: sampleData.closingStock || null
            })
            return response.data
        } catch (error) {
            console.error('Error recording sample:', error)
            throw error
        }
    }

    /**
     * Record stock adjustment
     * @param {number} stockId - The stock item ID
     * @param {Object} adjustmentData - Adjustment information
     * @returns {Promise} Created adjustment record
     */
    async recordAdjustment(stockId, adjustmentData) {
        try {
            const endpoint = `/api/stocks/${stockId}/movements`
            const response = await api.post(endpoint, {
                movementType: 'ADJUSTMENT',
                quantity: adjustmentData.quantity,
                reason: adjustmentData.reason,
                notes: adjustmentData.notes,
                activationId: adjustmentData.activationId || null,
                recordedById: adjustmentData.recordedById || null,
                openingStock: adjustmentData.openingStock || null,
                closingStock: adjustmentData.closingStock || null
            })
            return response.data
        } catch (error) {
            console.error('Error recording adjustment:', error)
            throw error
        }
    }

    /**
     * Record stock in (receiving stock)
     * @param {number} stockId - The stock item ID
     * @param {Object} stockInData - Stock in information
     * @returns {Promise} Created stock in record
     */
    async recordStockIn(stockId, stockInData) {
        try {
            const endpoint = `/api/stocks/${stockId}/movements`
            const response = await api.post(endpoint, {
                movementType: 'REPLENISHMENT',
                quantity: stockInData.quantity,
                reason: stockInData.reason || 'Stock received',
                supplierId: stockInData.supplierId,
                purchaseOrderNumber: stockInData.purchaseOrderNumber,
                unitCost: stockInData.unitCost,
                notes: stockInData.notes,
                openingStock: stockInData.openingStock || null,
                closingStock: stockInData.closingStock || null,
                activationId: stockInData.activationId || null
            })
            return response.data
        } catch (error) {
            console.error('Error recording stock in:', error)
            throw error
        }
    }

    /**
     * Record stock transfer between warehouses
     * @param {number} stockId - The stock item ID
     * @param {Object} transferData - Transfer information
     * @returns {Promise} Created transfer record
     */
    async recordTransfer(stockId, transferData) {
        try {
            const endpoint = `/api/stocks/${stockId}/movements`
            const response = await api.post(endpoint, {
                movementType: 'ALLOCATION',
                quantity: transferData.quantity,
                reason: transferData.reason || 'Stock transfer',
                fromWarehouseId: transferData.fromWarehouseId,
                toWarehouseId: transferData.toWarehouseId,
                notes: transferData.notes,
                openingStock: transferData.openingStock || null,
                closingStock: transferData.closingStock || null,
                activationId: transferData.activationId || null
            })
            return response.data
        } catch (error) {
            console.error('Error recording transfer:', error)
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
            const response = await api.get(endpoint, { params })
            return response.data
        } catch (error) {
            console.error('Error fetching movement summary:', error)
            throw error
        }
    }

    /**
     * Get stock movements by activation
     * @param {number} activationId - The activation ID
     * @param {Object} params - Query parameters
     * @returns {Promise} Stock movements for the activation
     */
    async getMovementsByActivation(activationId, params = {}) {
        try {
            const endpoint = `/activations/${activationId}/stock-movements`
            const response = await api.get(endpoint, { params })
            return response.data
        } catch (error) {
            console.error('Error fetching movements by activation:', error)
            throw error
        }
    }

    /**
     * Bulk record sales (for offline sync)
     * @param {Array} sales - Array of sale records
     * @returns {Promise} Bulk operation result
     */
    async bulkRecordSales(sales) {
        try {
            const response = await api.post('/stocks/movements/bulk', {
                movements: sales.map(sale => ({
                    ...sale,
                    movementType: 'SALE'
                }))
            })
            return response.data
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
            const endpoint = `/stocks/${stockId}/movements/export`
            const response = await api.get(endpoint, {
                params,
                responseType: 'blob'
            })
            return response.data
        } catch (error) {
            console.error('Error exporting movements:', error)
            throw error
        }
    }
}

export default new StockMovementService()