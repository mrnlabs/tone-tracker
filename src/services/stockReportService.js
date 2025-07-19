import api from './api'

class StockReportService {
    /**
     * Get comprehensive stock report for a specific stock item
     * @param {number} stockId - The stock ID
     * @param {Object} params - Query parameters (startDate, endDate)
     * @returns {Promise} Stock report data
     */
    async getStockReport(stockId, params = {}) {
        try {
            const response = await api.get(`/stocks/${stockId}/report`, { params })
            return response.data
        } catch (error) {
            console.error('Error fetching stock report:', error)
            throw error
        }
    }

    /**
     * Get stock report for a date range
     * @param {number} stockId - The stock ID
     * @param {string} startDate - Start date (ISO format)
     * @param {string} endDate - End date (ISO format)
     * @returns {Promise} Stock report data
     */
    async getStockReportByDateRange(stockId, startDate, endDate) {
        try {
            const params = {
                startDate: startDate,
                endDate: endDate
            }
            return await this.getStockReport(stockId, params)
        } catch (error) {
            console.error('Error fetching stock report by date range:', error)
            throw error
        }
    }

    /**
     * Get current month stock report
     * @param {number} stockId - The stock ID
     * @returns {Promise} Stock report data
     */
    async getCurrentMonthStockReport(stockId) {
        try {
            const now = new Date()
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
            
            return await this.getStockReportByDateRange(
                stockId,
                startOfMonth.toISOString(),
                endOfMonth.toISOString()
            )
        } catch (error) {
            console.error('Error fetching current month stock report:', error)
            throw error
        }
    }

    /**
     * Get last 30 days stock report
     * @param {number} stockId - The stock ID
     * @returns {Promise} Stock report data
     */
    async getLast30DaysStockReport(stockId) {
        try {
            const endDate = new Date()
            const startDate = new Date()
            startDate.setDate(endDate.getDate() - 30)
            
            return await this.getStockReportByDateRange(
                stockId,
                startDate.toISOString(),
                endDate.toISOString()
            )
        } catch (error) {
            console.error('Error fetching last 30 days stock report:', error)
            throw error
        }
    }

    /**
     * Get stock report for a specific activation period
     * @param {number} stockId - The stock ID
     * @param {number} activationId - The activation ID
     * @returns {Promise} Stock report data
     */
    async getStockReportForActivation(stockId, activationId) {
        try {
            const params = {
                activationId: activationId
            }
            return await this.getStockReport(stockId, params)
        } catch (error) {
            console.error('Error fetching stock report for activation:', error)
            throw error
        }
    }

    /**
     * Get multiple stock reports for comparison
     * @param {Array} stockIds - Array of stock IDs
     * @param {Object} params - Query parameters
     * @returns {Promise} Array of stock reports
     */
    async getMultipleStockReports(stockIds, params = {}) {
        try {
            const reportPromises = stockIds.map(stockId => 
                this.getStockReport(stockId, params)
            )
            const reports = await Promise.allSettled(reportPromises)
            
            return reports.map((result, index) => ({
                stockId: stockIds[index],
                success: result.status === 'fulfilled',
                data: result.status === 'fulfilled' ? result.value : null,
                error: result.status === 'rejected' ? result.reason : null
            }))
        } catch (error) {
            console.error('Error fetching multiple stock reports:', error)
            throw error
        }
    }

    /**
     * Export stock report data
     * @param {number} stockId - The stock ID
     * @param {Object} params - Query parameters
     * @param {string} format - Export format (csv, excel, pdf)
     * @returns {Promise} File blob
     */
    async exportStockReport(stockId, params = {}, format = 'csv') {
        try {
            const response = await api.get(`/stocks/${stockId}/report/export`, {
                params: { ...params, format },
                responseType: 'blob'
            })
            return response.data
        } catch (error) {
            console.error('Error exporting stock report:', error)
            throw error
        }
    }

    /**
     * Get stock performance metrics
     * @param {number} stockId - The stock ID
     * @param {Object} params - Query parameters
     * @returns {Promise} Performance metrics
     */
    async getStockPerformanceMetrics(stockId, params = {}) {
        try {
            const report = await this.getStockReport(stockId, params)
            
            // Calculate additional metrics
            const metrics = {
                ...report,
                // Calculate turnover rate
                turnoverRate: report.openingStock > 0 ? 
                    (report.stockSold / report.openingStock) * 100 : 0,
                
                // Calculate days of inventory
                daysOfInventory: report.stockSold > 0 ? 
                    (report.closingStock / (report.stockSold / 30)) : 0,
                
                // Calculate sample rate
                sampleRate: report.stockSold > 0 ? 
                    (report.stockSampled / report.stockSold) * 100 : 0,
                
                // Stock efficiency
                stockEfficiency: report.openingStock > 0 ? 
                    ((report.stockSold + report.stockSampled) / report.openingStock) * 100 : 0
            }
            
            return metrics
        } catch (error) {
            console.error('Error calculating stock performance metrics:', error)
            throw error
        }
    }

    /**
     * Get replenishment recommendations
     * @param {number} stockId - The stock ID
     * @param {Object} params - Query parameters
     * @returns {Promise} Replenishment recommendations
     */
    async getReplenishmentRecommendations(stockId, params = {}) {
        try {
            const report = await this.getStockReport(stockId, params)
            
            // Calculate replenishment metrics
            const avgDailySales = report.stockSold / 30 // Assuming 30 days
            const avgDailySamples = report.stockSampled / 30
            const avgDailyConsumption = avgDailySales + avgDailySamples
            
            const daysOfStockRemaining = avgDailyConsumption > 0 ? 
                report.closingStock / avgDailyConsumption : 0
            
            const recommendations = {
                ...report,
                avgDailySales,
                avgDailySamples,
                avgDailyConsumption,
                daysOfStockRemaining,
                replenishmentRequired: report.replenishmentRequired,
                recommendedOrderQuantity: report.recommendedOrderQuantity || 0,
                urgencyLevel: daysOfStockRemaining < 7 ? 'HIGH' : 
                            daysOfStockRemaining < 14 ? 'MEDIUM' : 'LOW',
                nextOrderDate: new Date(Date.now() + (daysOfStockRemaining - 7) * 24 * 60 * 60 * 1000)
            }
            
            return recommendations
        } catch (error) {
            console.error('Error getting replenishment recommendations:', error)
            throw error
        }
    }
}

export default new StockReportService()