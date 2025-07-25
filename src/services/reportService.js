import api from './api'

class ReportService {
    /**
     * Create a daily activation report
     * @param {Object} reportData - Daily report data including consumer behavior insights
     * @returns {Promise} Created report data
     */
    async createDailyReport(reportData) {
        try {
            const response = await api.post('/reports', reportData)
            return response
        } catch (error) {
            console.error('Error creating daily report:', error)
            throw error
        }
    }

    /**
     * Get daily reports with pagination
     * @param {Object} params - Query parameters
     * @returns {Promise} Daily reports data
     */
    async getDailyReports(params = {}) {
        try {
            const response = await api.get('/reports', { params })
            return response
        } catch (error) {
            console.error('Error fetching daily reports:', error)
            throw error
        }
    }

    /**
     * Get reports by activation ID
     * @param {number} activationId - Activation ID
     * @param {Object} params - Query parameters
     * @returns {Promise} Activation reports data
     */
    async getReportsByActivation(activationId, params = {}) {
        try {
            const response = await api.get(`/reports/activation/${activationId}`, { params })
            return response
        } catch (error) {
            console.error('Error fetching activation reports:', error)
            throw error
        }
    }

    /**
     * Get report by ID
     * @param {number} reportId - Report ID
     * @returns {Promise} Report data
     */
    async getReportById(reportId) {
        try {
            const response = await api.get(`/reports/${reportId}`)
            return response
        } catch (error) {
            console.error('Error fetching report:', error)
            throw error
        }
    }

    /**
     * Update daily report
     * @param {number} reportId - Report ID
     * @param {Object} reportData - Updated report data
     * @returns {Promise} Updated report data
     */
    async updateDailyReport(reportId, reportData) {
        try {
            const response = await api.put(`/reports/${reportId}`, reportData)
            return response
        } catch (error) {
            console.error('Error updating daily report:', error)
            throw error
        }
    }

    /**
     * Delete daily report
     * @param {number} reportId - Report ID
     * @returns {Promise} Success response
     */
    async deleteDailyReport(reportId) {
        try {
            const response = await api.delete(`/reports/${reportId}`)
            return response
        } catch (error) {
            console.error('Error deleting daily report:', error)
            throw error
        }
    }

    /**
     * Get available SKUs for top purchased SKU selection
     * @param {number} activationId - Activation ID
     * @returns {Promise} Available SKUs
     */
    async getAvailableSKUs(activationId) {
        try {
            const response = await api.get(`/reports/activation/${activationId}/available-skus`)
            return response
        } catch (error) {
            console.error('Error fetching available SKUs:', error)
            throw error
        }
    }

    /**
     * Get consumer behavior analytics
     * @param {Object} params - Query parameters
     * @returns {Promise} Consumer behavior analytics
     */
    async getConsumerBehaviorAnalytics(params = {}) {
        try {
            const response = await api.get('/reports/analytics/consumer-behavior', { params })
            return response
        } catch (error) {
            console.error('Error fetching consumer behavior analytics:', error)
            throw error
        }
    }

    /**
     * Export daily reports
     * @param {Object} params - Export parameters
     * @param {string} format - Export format (csv, xlsx, pdf)
     * @returns {Promise} File blob
     */
    async exportDailyReports(params = {}, format = 'xlsx') {
        try {
            const response = await api.get('/reports/export', {
                params: { ...params, format },
                responseType: 'blob'
            })
            return response
        } catch (error) {
            console.error('Error exporting daily reports:', error)
            throw error
        }
    }

    /**
     * Validate daily report data
     * @param {Object} reportData - Report data to validate
     * @returns {Object} Validation result
     */
    validateDailyReport(reportData) {
        const errors = {}

        // Required fields
        if (!reportData.activationId) {
            errors.activationId = 'Activation is required'
        }

        if (!reportData.reportDate) {
            errors.reportDate = 'Report date is required'
        }

        // Consumer behavior validations
        if (reportData.topSkuUnitsSold !== undefined && reportData.topSkuUnitsSold < 0) {
            errors.topSkuUnitsSold = 'Units sold cannot be negative'
        }

        if (reportData.topSkuRevenue !== undefined && reportData.topSkuRevenue < 0) {
            errors.topSkuRevenue = 'Revenue cannot be negative'
        }

        // Purchase reason counts validation
        const totalSales = (reportData.priceDrivenSales || 0) + 
                          (reportData.promoDrivenSales || 0) + 
                          (reportData.brandLoyaltySales || 0) + 
                          (reportData.recommendationSales || 0)

        if (totalSales > 0 && !reportData.primaryPurchaseReason) {
            errors.primaryPurchaseReason = 'Primary purchase reason is required when sales are recorded'
        }

        // Text field length validations
        if (reportData.observedMarketTrends && reportData.observedMarketTrends.length > 2000) {
            errors.observedMarketTrends = 'Market trends must be 2000 characters or less'
        }

        if (reportData.customerBehaviorNotes && reportData.customerBehaviorNotes.length > 2000) {
            errors.customerBehaviorNotes = 'Customer behavior notes must be 2000 characters or less'
        }

        if (reportData.competitiveActivity && reportData.competitiveActivity.length > 2000) {
            errors.competitiveActivity = 'Competitive activity must be 2000 characters or less'
        }

        if (reportData.locationInsights && reportData.locationInsights.length > 2000) {
            errors.locationInsights = 'Location insights must be 2000 characters or less'  
        }

        if (reportData.productFeedback && reportData.productFeedback.length > 2000) {
            errors.productFeedback = 'Product feedback must be 2000 characters or less'
        }

        if (reportData.improvementOpportunities && reportData.improvementOpportunities.length > 2000) {
            errors.improvementOpportunities = 'Improvement opportunities must be 2000 characters or less'
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        }
    }

    /**
     * Get label for purchase reason
     * @param {string} reason - Purchase reason enum value
     * @returns {string} Display label
     */
    getPurchaseReasonLabel(reason) {
        const labels = {
            'PRICE': 'Price-driven',
            'PROMO': 'Promotion-driven',
            'BRAND_LOYALTY': 'Brand Loyalty',
            'RECOMMENDATION': 'Recommendation'
        }
        return labels[reason] || reason
    }

    /**
     * Get label for customer type
     * @param {string} type - Customer type enum value
     * @returns {string} Display label
     */
    getCustomerTypeLabel(type) {
        const labels = {
            'SHOPPER': 'Shopper',
            'RETAILER': 'Retailer',
            'DISTRIBUTOR': 'Distributor'
        }
        return labels[type] || type
    }

    /**
     * Get label for age group
     * @param {string} ageGroup - Age group enum value
     * @returns {string} Display label
     */
    getAgeGroupLabel(ageGroup) {
        const labels = {
            'AGE_18_25': '18-25',
            'AGE_26_35': '26-35',
            'AGE_36_45': '36-45',
            'AGE_46_55': '46-55',
            'AGE_56_PLUS': '56+'
        }
        return labels[ageGroup] || ageGroup
    }

    /**
     * Get label for gender
     * @param {string} gender - Gender enum value
     * @returns {string} Display label
     */
    getGenderLabel(gender) {
        const labels = {
            'MALE': 'Male',
            'FEMALE': 'Female',
            'OTHER': 'Other'
        }
        return labels[gender] || gender
    }

    /**
     * Calculate purchase reason percentages
     * @param {Object} reportData - Report data with purchase counts
     * @returns {Object} Purchase reason percentages
     */
    calculatePurchaseReasonPercentages(reportData) {
        const total = (reportData.priceDrivenSales || 0) + 
                     (reportData.promoDrivenSales || 0) + 
                     (reportData.brandLoyaltySales || 0) + 
                     (reportData.recommendationSales || 0)

        if (total === 0) {
            return {
                price: 0,
                promo: 0,
                brandLoyalty: 0,
                recommendation: 0
            }
        }

        return {
            price: Math.round((reportData.priceDrivenSales || 0) / total * 100),
            promo: Math.round((reportData.promoDrivenSales || 0) / total * 100),
            brandLoyalty: Math.round((reportData.brandLoyaltySales || 0) / total * 100),
            recommendation: Math.round((reportData.recommendationSales || 0) / total * 100)
        }
    }

    /**
     * Format report data for display
     * @param {Object} report - Raw report data
     * @returns {Object} Formatted report data
     */
    formatReportForDisplay(report) {
        return {
            ...report,
            primaryPurchaseReasonLabel: this.getPurchaseReasonLabel(report.primaryPurchaseReason),
            dominantCustomerTypeLabel: this.getCustomerTypeLabel(report.dominantCustomerType),
            dominantAgeGroupLabel: this.getAgeGroupLabel(report.dominantAgeGroup),
            dominantGenderLabel: this.getGenderLabel(report.dominantGender),
            purchaseReasonPercentages: this.calculatePurchaseReasonPercentages(report),
            formattedRevenue: report.topSkuRevenue ? `$${report.topSkuRevenue.toFixed(2)}` : null,
            formattedDate: report.reportDate ? new Date(report.reportDate).toLocaleDateString() : null
        }
    }
}

export default new ReportService()