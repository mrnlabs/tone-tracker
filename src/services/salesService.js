import api from './api'
import { STOCK_MOVEMENT_TYPE } from '@/utils/constants'

class SalesService {
    /**
     * Create a new sale
     * @param {Object} saleData - Sale information matching SaleDTO
     * @returns {Promise} Created sale record
     */
    async createSale(saleData) {
        try {
            const response = await api.post('/sales', {
                activationId: saleData.activationId,
                stockId: saleData.stockId,
                promoterId: saleData.promoterId,
                unitsSold: saleData.unitsSold,
                paymentMethod: saleData.paymentMethod,
                amount: saleData.amount,
                usdEquivalent: saleData.usdEquivalent || null,
                saleDateTime: saleData.saleDateTime,
                notes: saleData.notes || null,
                // Stock movement data for backend
                movementType: STOCK_MOVEMENT_TYPE.SALE,
                quantity: saleData.unitsSold,
                reason: saleData.reason || `Sale of ${saleData.unitsSold} units`
            })
            return response.data
        } catch (error) {
            console.error('Error creating sale:', error)
            throw error
        }
    }

    /**
     * Get sales for a specific activation
     * @param {number} activationId - The activation ID
     * @param {Object} params - Query parameters
     * @returns {Promise} Sales data
     */
    async getSalesByActivation(activationId, params = {}) {
        try {
            const response = await api.get('/sales', {
                params: {
                    activationId,
                    ...params
                }
            })
            return response.data
        } catch (error) {
            console.error('Error fetching sales by activation:', error)
            throw error
        }
    }

    /**
     * Get sales for a specific promoter
     * @param {number} promoterId - The promoter ID
     * @param {Object} params - Query parameters
     * @returns {Promise} Sales data
     */
    async getSalesByPromoter(promoterId, params = {}) {
        try {
            const response = await api.get('/sales', {
                params: {
                    promoterId,
                    ...params
                }
            })
            return response.data
        } catch (error) {
            console.error('Error fetching sales by promoter:', error)
            throw error
        }
    }

    /**
     * Get sales for a specific stock item
     * @param {number} stockId - The stock ID
     * @param {Object} params - Query parameters
     * @returns {Promise} Sales data
     */
    async getSalesByStock(stockId, params = {}) {
        try {
            const response = await api.get('/sales', {
                params: {
                    stockId,
                    ...params
                }
            })
            return response.data
        } catch (error) {
            console.error('Error fetching sales by stock:', error)
            throw error
        }
    }

    /**
     * Get all sales with optional filtering
     * @param {Object} params - Query parameters
     * @returns {Promise} Sales data
     */
    async getAllSales(params = {}) {
        try {
            const response = await api.get('/sales', { params })
            return response.data
        } catch (error) {
            console.error('Error fetching all sales:', error)
            throw error
        }
    }

    /**
     * Get sales summary/statistics
     * @param {Object} params - Query parameters (startDate, endDate, activationId, etc.)
     * @returns {Promise} Sales summary data
     */
    async getSalesSummary(params = {}) {
        try {
            const response = await api.get('/sales/summary', { params })
            return response.data
        } catch (error) {
            console.error('Error fetching sales summary:', error)
            throw error
        }
    }

    /**
     * Export sales data
     * @param {Object} params - Export parameters
     * @returns {Promise} File blob
     */
    async exportSales(params = {}) {
        try {
            const response = await api.get('/sales/export', {
                params,
                responseType: 'blob'
            })
            return response.data
        } catch (error) {
            console.error('Error exporting sales:', error)
            throw error
        }
    }
}

export default new SalesService()