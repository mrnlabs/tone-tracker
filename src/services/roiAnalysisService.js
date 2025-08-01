import { apiService } from './api'

class ROIAnalysisService {
    /**
     * Get ROI analysis for activation
     * @param {number} activationId - Activation ID
     * @returns {Promise} ROI analysis data
     */
    async getROIAnalysis(activationId) {
        try {
            const response = await apiService.get(`/roi-analysis/activation/${activationId}`)
            return response.data
        } catch (error) {
            console.error('Error fetching ROI analysis:', error)
            throw error
        }
    }

    /**
     * Get cost breakdown for activation
     * @param {number} activationId - Activation ID
     * @returns {Promise} Cost breakdown data
     */
    async getCostBreakdown(activationId) {
        try {
            const response = await apiService.get(`/roi-analysis/activation/${activationId}/costs`)
            return response.data
        } catch (error) {
            console.error('Error fetching cost breakdown:', error)
            throw error
        }
    }

    /**
     * Get investment comparison across activations
     * @param {Object} params - Query parameters
     * @returns {Promise} Comparison data
     */
    async getInvestmentComparison(params = {}) {
        try {
            const response = await apiService.get('/roi-analysis/comparison', { params })
            return response.data
        } catch (error) {
            console.error('Error fetching investment comparison:', error)
            throw error
        }
    }

    /**
     * Export ROI analysis report
     * @param {number} activationId - Activation ID
     * @param {string} format - Export format (PDF, Excel)
     * @returns {Promise} Export blob
     */
    async exportROIReport(activationId, format = 'PDF') {
        try {
            const response = await apiService.get(`/roi-analysis/activation/${activationId}/export`, {
                params: { format },
                responseType: 'blob'
            })
            return response.data
        } catch (error) {
            console.error('Error exporting ROI report:', error)
            throw error
        }
    }

    /**
     * Format ROI percentage for display
     * @param {number} roi - ROI percentage
     * @returns {Object} Formatted ROI with status
     */
    formatROI(roi) {
        const status = this.getROIStatus(roi)
        return {
            value: roi,
            formatted: `${roi >= 0 ? '+' : ''}${roi.toFixed(1)}%`,
            status: status.level,
            color: status.color,
            label: status.label
        }
    }

    /**
     * Get ROI status based on percentage
     * @param {number} roi - ROI percentage
     * @returns {Object} ROI status configuration
     */
    getROIStatus(roi) {
        if (roi >= 50) {
            return { level: 'excellent', color: '#10b981', label: 'Excellent' }
        } else if (roi >= 20) {
            return { level: 'good', color: '#3b82f6', label: 'Good' }
        } else if (roi >= 10) {
            return { level: 'average', color: '#f59e0b', label: 'Average' }
        } else if (roi >= 0) {
            return { level: 'poor', color: '#f97316', label: 'Poor' }
        } else {
            return { level: 'loss', color: '#ef4444', label: 'Loss' }
        }
    }

    /**
     * Calculate profit margin
     * @param {number} revenue - Total revenue
     * @param {number} costs - Total costs
     * @returns {Object} Profit margin data
     */
    calculateProfitMargin(revenue, costs) {
        if (!revenue || revenue === 0) {
            return { percentage: 0, formatted: '0%', status: 'unknown' }
        }

        const margin = ((revenue - costs) / revenue) * 100
        const status = margin >= 30 ? 'excellent' : 
                      margin >= 20 ? 'good' : 
                      margin >= 10 ? 'average' : 
                      margin >= 0 ? 'poor' : 'loss'

        return {
            percentage: margin,
            formatted: `${margin.toFixed(1)}%`,
            status,
            isPositive: margin >= 0
        }
    }

    /**
     * Format currency for display
     * @param {number} amount - Amount to format
     * @param {string} currency - Currency code
     * @returns {string} Formatted currency
     */
    formatCurrency(amount, currency = 'USD') {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount)
    }

    /**
     * Calculate cost per metric
     * @param {number} totalCost - Total cost
     * @param {number} metric - Metric value (leads, sales, etc.)
     * @returns {Object} Cost per metric data
     */
    calculateCostPerMetric(totalCost, metric) {
        if (!metric || metric === 0) {
            return { value: 0, formatted: '$0', efficiency: 'unknown' }
        }

        const costPer = totalCost / metric
        const efficiency = costPer <= 50 ? 'excellent' :
                          costPer <= 100 ? 'good' :
                          costPer <= 200 ? 'average' : 'poor'

        return {
            value: costPer,
            formatted: this.formatCurrency(costPer),
            efficiency
        }
    }

    /**
     * Generate cost breakdown chart data
     * @param {Object} costs - Cost breakdown object
     * @returns {Object} Chart data
     */
    generateCostChartData(costs) {
        const {
            promoterCosts = 0,
            stockCosts = 0,
            operationalCosts = 0,
            marketingCosts = 0
        } = costs

        return {
            labels: ['Promoter Costs', 'Stock Costs', 'Operational Costs', 'Marketing Costs'],
            datasets: [{
                data: [promoterCosts, stockCosts, operationalCosts, marketingCosts],
                backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'],
                borderWidth: 0
            }]
        }
    }

    /**
     * Generate ROI trend data
     * @param {Array} historicalData - Historical ROI data
     * @returns {Object} Trend chart data
     */
    generateROITrendData(historicalData) {
        const sortedData = historicalData.sort((a, b) => new Date(a.date) - new Date(b.date))
        
        return {
            labels: sortedData.map(item => new Date(item.date).toLocaleDateString()),
            datasets: [{
                label: 'ROI %',
                data: sortedData.map(item => item.roi),
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
                fill: true
            }]
        }
    }

    /**
     * Calculate benchmark comparison
     * @param {number} actualROI - Actual ROI
     * @param {number} benchmarkROI - Industry benchmark ROI
     * @returns {Object} Comparison data
     */
    calculateBenchmarkComparison(actualROI, benchmarkROI) {
        if (!benchmarkROI || benchmarkROI === 0) {
            return { difference: 0, performance: 'unknown', status: 'No benchmark available' }
        }

        const difference = actualROI - benchmarkROI
        const performance = difference >= 0 ? 'above' : 'below'
        const percentage = Math.abs((difference / benchmarkROI) * 100)

        return {
            difference,
            percentage,
            performance,
            formatted: `${difference >= 0 ? '+' : ''}${difference.toFixed(1)}%`,
            status: difference >= 0 ? 
                `${percentage.toFixed(1)}% above benchmark` : 
                `${percentage.toFixed(1)}% below benchmark`
        }
    }

    /**
     * Generate performance recommendations
     * @param {Object} roiData - ROI analysis data
     * @returns {Array} Array of recommendations
     */
    generateRecommendations(roiData) {
        const recommendations = []
        const { roiPercentage, leadConversionRate, costPerLead, profitMargin } = roiData

        // ROI-based recommendations
        if (roiPercentage < 10) {
            recommendations.push({
                type: 'critical',
                title: 'Improve ROI Performance',
                message: 'Consider reducing costs or improving lead quality to increase profitability.',
                priority: 'high'
            })
        } else if (roiPercentage > 50) {
            recommendations.push({
                type: 'success',
                title: 'Scale Successful Strategies',
                message: 'Excellent ROI performance. Consider scaling this activation model.',
                priority: 'medium'
            })
        }

        // Conversion rate recommendations
        if (leadConversionRate < 20) {
            recommendations.push({
                type: 'warning',
                title: 'Improve Lead Quality',
                message: 'Focus on capturing higher-quality leads to improve conversion rates.',
                priority: 'medium'
            })
        }

        // Cost efficiency recommendations
        if (costPerLead > 200) {
            recommendations.push({
                type: 'warning',
                title: 'Optimize Lead Acquisition Costs',
                message: 'Lead acquisition costs are high. Review promoter efficiency and strategies.',
                priority: 'medium'
            })
        }

        return recommendations
    }
}

export default new ROIAnalysisService()