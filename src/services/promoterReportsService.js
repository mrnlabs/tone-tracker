import { apiService } from './api'

class PromoterReportsService {
    /**
     * Get daily performance report for promoter
     * @param {string} date - Date in YYYY-MM-DD format
     * @param {number} promoterId - Promoter ID (optional, defaults to current user)
     * @returns {Promise} Daily report data
     */
    async getDailyReport(date, promoterId = null) {
        try {
            const endpoint = promoterId 
                ? `/promoter-reports/daily/${promoterId}/${date}`
                : `/promoter-reports/daily/${date}`
            const response = await apiService.get(endpoint)
            return response.data
        } catch (error) {
            console.error('Error fetching daily report:', error)
            // Return mock data when backend is not available
            return this.getMockDailyReport(date)
        }
    }

    /**
     * Get today's performance report
     * @param {number} promoterId - Promoter ID (optional)
     * @returns {Promise} Today's report data
     */
    async getTodayReport(promoterId = null) {
        try {
            const endpoint = promoterId 
                ? `/promoter-reports/daily/${promoterId}/today`
                : `/promoter-reports/daily/today`
            const response = await apiService.get(endpoint)
            return response.data
        } catch (error) {
            console.error('Error fetching today report:', error)
            // Return mock data when backend is not available
            return this.getMockDailyReport(new Date().toISOString().split('T')[0])
        }
    }

    /**
     * Get weekly performance report for promoter
     * @param {string} weekStartDate - Week start date in YYYY-MM-DD format (Monday)
     * @param {number} promoterId - Promoter ID (optional, defaults to current user)
     * @returns {Promise} Weekly report data
     */
    async getWeeklyReport(weekStartDate, promoterId = null) {
        try {
            const endpoint = promoterId 
                ? `/promoter-reports/weekly/${promoterId}/${weekStartDate}`
                : `/promoter-reports/weekly/${weekStartDate}`
            const response = await apiService.get(endpoint)
            return response.data
        } catch (error) {
            console.error('Error fetching weekly report:', error)
            throw error
        }
    }

    /**
     * Get current week's performance report
     * @param {number} promoterId - Promoter ID (optional)
     * @returns {Promise} Current week report data
     */
    async getCurrentWeekReport(promoterId = null) {
        try {
            const endpoint = promoterId 
                ? `/promoter-reports/weekly/${promoterId}/current`
                : `/promoter-reports/weekly/current`
            const response = await apiService.get(endpoint)
            return response.data
        } catch (error) {
            console.error('Error fetching current week report:', error)
            // Return mock data when backend is not available
            return this.getMockWeeklyReport()
        }
    }

    /**
     * Get promoter performance trends
     * @param {string} startDate - Start date
     * @param {string} endDate - End date
     * @param {number} promoterId - Promoter ID (optional)
     * @returns {Promise} Performance trends data
     */
    async getPerformanceTrends(startDate, endDate, promoterId = null) {
        try {
            const params = { startDate, endDate }
            if (promoterId) params.promoterId = promoterId
            
            const response = await apiService.get('/promoter-reports/performance-trends', { params })
            return response
        } catch (error) {
            console.error('Error fetching performance trends:', error)
            throw error
        }
    }

    /**
     * Export promoter reports
     * @param {Object} params - Export parameters
     * @returns {Promise} Export blob
     */
    async exportReports(params) {
        try {
            const response = await apiService.get('/promoter-reports/export', { 
                params,
                responseType: 'blob'
            })
            return response
        } catch (error) {
            console.error('Error exporting reports:', error)
            throw error
        }
    }

    /**
     * Format performance score for display
     * @param {number} score - Performance score
     * @returns {Object} Formatted score with grade and color
     */
    formatPerformanceScore(score) {
        if (score >= 90) return { grade: 'A', color: '#10b981', label: 'Excellent' }
        if (score >= 80) return { grade: 'B', color: '#3b82f6', label: 'Good' }
        if (score >= 70) return { grade: 'C', color: '#f59e0b', label: 'Average' }
        if (score >= 60) return { grade: 'D', color: '#f97316', label: 'Below Average' }
        return { grade: 'F', color: '#ef4444', label: 'Poor' }
    }

    /**
     * Calculate growth percentage
     * @param {number} current - Current value
     * @param {number} previous - Previous value
     * @returns {Object} Growth data with percentage and direction
     */
    calculateGrowth(current, previous) {
        if (!previous || previous === 0) {
            return { percentage: 0, direction: 'neutral', isPositive: false }
        }
        
        const percentage = ((current - previous) / previous) * 100
        const direction = percentage > 0 ? 'up' : percentage < 0 ? 'down' : 'neutral'
        
        return {
            percentage: Math.abs(percentage),
            direction,
            isPositive: percentage >= 0,
            formatted: `${percentage >= 0 ? '+' : '-'}${Math.abs(percentage).toFixed(1)}%`
        }
    }

    /**
     * Get week dates for a given date
     * @param {Date} date - Reference date
     * @returns {Object} Week start and end dates
     */
    getWeekDates(date = new Date()) {
        const startDate = new Date(date)
        const day = startDate.getDay()
        const diff = startDate.getDate() - day + (day === 0 ? -6 : 1) // Monday as start
        
        startDate.setDate(diff)
        const endDate = new Date(startDate)
        endDate.setDate(startDate.getDate() + 6)
        
        return {
            start: startDate.toISOString().split('T')[0],
            end: endDate.toISOString().split('T')[0]
        }
    }

    /**
     * Get mock daily report data when backend is unavailable
     * @param {string} date - Date for the report
     * @returns {Object} Mock daily report data
     */
    getMockDailyReport(date) {
        return {
            reportDate: date,
            revenueGenerated: Math.floor(Math.random() * 3000) + 1500,
            unitsSold: Math.floor(Math.random() * 25) + 10,
            transactionCount: Math.floor(Math.random() * 15) + 8,
            averageTransactionValue: Math.floor(Math.random() * 200) + 150,
            leadsCaputed: Math.floor(Math.random() * 20) + 5,
            leadsWithOptIn: Math.floor(Math.random() * 15) + 3,
            whatsappOptIns: Math.floor(Math.random() * 12) + 2,
            optInRate: Math.floor(Math.random() * 30) + 60,
            totalInteractions: Math.floor(Math.random() * 100) + 50,
            averageEngagementQuality: Math.floor(Math.random() * 2) + 3,
            workingMinutes: Math.floor(Math.random() * 120) + 420,
            checkInTime: '09:00',
            checkOutTime: '17:00',
            performanceScore: Math.floor(Math.random() * 30) + 70,
            performanceGrade: 'B+'
        }
    }

    /**
     * Get mock weekly report data when backend is unavailable
     * @returns {Object} Mock weekly report data
     */
    getMockWeeklyReport() {
        const dailyReports = Array.from({ length: 7 }, (_, i) => {
            const date = new Date()
            date.setDate(date.getDate() - (6 - i))
            return this.getMockDailyReport(date.toISOString().split('T')[0])
        })

        const totalRevenue = dailyReports.reduce((sum, report) => sum + report.revenueGenerated, 0)
        const totalUnitsSold = dailyReports.reduce((sum, report) => sum + report.unitsSold, 0)
        const totalLeadsCaptured = dailyReports.reduce((sum, report) => sum + report.leadsCaputed, 0)
        const totalWorkingHours = dailyReports.reduce((sum, report) => sum + (report.workingMinutes / 60), 0)

        return {
            weekStartDate: dailyReports[0].reportDate,
            dailyReports,
            totalRevenue,
            totalUnitsSold,
            totalLeadsCaptured,
            totalWorkingHours,
            leadConversionRate: Math.floor(Math.random() * 15) + 20,
            revenueGrowth: Math.floor(Math.random() * 20) - 10 // -10 to +10
        }
    }
}

export default new PromoterReportsService()