import { apiService } from './api'

class LiveMetricsService {
    /**
     * Get live metrics dashboard data
     * @returns {Promise} Live metrics data
     */
    async getLiveMetrics() {
        try {
            const response = await apiService.get('/live-metrics')
            return response.data
        } catch (error) {
            console.error('Error fetching live metrics:', error)
            // Return mock data when backend is not available
            return this.getMockLiveMetrics()
        }
    }

    /**
     * Get current alerts
     * @param {boolean} unacknowledgedOnly - Get only unacknowledged alerts
     * @returns {Promise} Alerts data
     */
    async getAlerts(unacknowledgedOnly = false) {
        try {
            const endpoint = unacknowledgedOnly 
                ? '/live-metrics/alerts/unacknowledged'
                : '/live-metrics/alerts'
            const response = await apiService.get(endpoint)
            return response.data
        } catch (error) {
            console.error('Error fetching alerts:', error)
            // Return mock data when backend is not available
            const alerts = this.getMockAlerts()
            return unacknowledgedOnly ? alerts.filter(alert => !alert.isAcknowledged) : alerts
        }
    }

    /**
     * Acknowledge an alert
     * @param {number} alertId - Alert ID
     * @returns {Promise} Acknowledgment response
     */
    async acknowledgeAlert(alertId) {
        try {
            const response = await apiService.post(`/live-metrics/alerts/${alertId}/acknowledge`)
            return response.data
        } catch (error) {
            console.error('Error acknowledging alert:', error)
            throw error
        }
    }

    /**
     * Get real-time performance data for activation
     * @param {number} activationId - Activation ID
     * @returns {Promise} Performance data
     */
    async getActivationMetrics(activationId) {
        try {
            const response = await apiService.get(`/live-metrics/activation/${activationId}`)
            return response
        } catch (error) {
            console.error('Error fetching activation metrics:', error)
            throw error
        }
    }

    /**
     * Get alert severity configuration
     * @returns {Object} Alert severity settings
     */
    getAlertSeverityConfig() {
        return {
            CRITICAL: { 
                color: '#ef4444', 
                icon: 'pi-exclamation-triangle', 
                label: 'Critical',
                priority: 1
            },
            HIGH: { 
                color: '#f97316', 
                icon: 'pi-exclamation-circle', 
                label: 'High',
                priority: 2
            },
            MEDIUM: { 
                color: '#f59e0b', 
                icon: 'pi-info-circle', 
                label: 'Medium',
                priority: 3
            },
            LOW: { 
                color: '#3b82f6', 
                icon: 'pi-info', 
                label: 'Low',
                priority: 4
            }
        }
    }

    /**
     * Format alert for display
     * @param {Object} alert - Alert object
     * @returns {Object} Formatted alert
     */
    formatAlert(alert) {
        const config = this.getAlertSeverityConfig()[alert.severity] || this.getAlertSeverityConfig().LOW
        
        return {
            ...alert,
            displayColor: config.color,
            displayIcon: config.icon,
            displayLabel: config.label,
            priority: config.priority,
            timeAgo: this.getTimeAgo(alert.timestamp)
        }
    }

    /**
     * Get time ago string
     * @param {string} timestamp - ISO timestamp
     * @returns {string} Time ago description
     */
    getTimeAgo(timestamp) {
        const now = new Date()
        const alertTime = new Date(timestamp)
        const diffMs = now - alertTime
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMins / 60)
        const diffDays = Math.floor(diffHours / 24)

        if (diffMins < 1) return 'Just now'
        if (diffMins < 60) return `${diffMins}m ago`
        if (diffHours < 24) return `${diffHours}h ago`
        return `${diffDays}d ago`
    }

    /**
     * Sort alerts by priority and timestamp
     * @param {Array} alerts - Array of alerts
     * @returns {Array} Sorted alerts
     */
    sortAlerts(alerts) {
        if (!Array.isArray(alerts)) {
            return []
        }
        return alerts
            .map(alert => this.formatAlert(alert))
            .sort((a, b) => {
                // First sort by acknowledgment status
                if (a.isAcknowledged !== b.isAcknowledged) {
                    return a.isAcknowledged ? 1 : -1
                }
                // Then by priority
                if (a.priority !== b.priority) {
                    return a.priority - b.priority
                }
                // Finally by timestamp (newest first)
                return new Date(b.timestamp) - new Date(a.timestamp)
            })
    }

    /**
     * Get trend direction icon and color
     * @param {string} direction - Trend direction (UP/DOWN/STABLE)
     * @returns {Object} Icon and color configuration
     */
    getTrendConfig(direction) {
        const configs = {
            UP: { icon: 'pi-arrow-up', color: '#10b981', label: 'Increasing' },
            DOWN: { icon: 'pi-arrow-down', color: '#ef4444', label: 'Decreasing' },
            STABLE: { icon: 'pi-minus', color: '#6b7280', label: 'Stable' }
        }
        return configs[direction] || configs.STABLE
    }

    /**
     * Format revenue for display
     * @param {number} amount - Revenue amount
     * @returns {string} Formatted revenue
     */
    formatRevenue(amount) {
        if (amount >= 1000000) {
            return `$${(amount / 1000000).toFixed(1)}M`
        }
        if (amount >= 1000) {
            return `$${(amount / 1000).toFixed(1)}K`
        }
        return `$${amount.toFixed(2)}`
    }

    /**
     * Calculate performance status
     * @param {number} current - Current value
     * @param {number} target - Target value
     * @returns {Object} Performance status
     */
    calculatePerformanceStatus(current, target) {
        if (!target || target === 0) {
            return { status: 'unknown', percentage: 0, color: '#6b7280' }
        }

        const percentage = (current / target) * 100
        
        if (percentage >= 100) {
            return { status: 'excellent', percentage, color: '#10b981' }
        } else if (percentage >= 80) {
            return { status: 'good', percentage, color: '#3b82f6' }
        } else if (percentage >= 60) {
            return { status: 'warning', percentage, color: '#f59e0b' }
        } else {
            return { status: 'critical', percentage, color: '#ef4444' }
        }
    }

    /**
     * Start live metrics polling
     * @param {Function} callback - Callback function for updates
     * @param {number} interval - Polling interval in milliseconds (default: 30 seconds)
     * @returns {Object} Polling control object
     */
    startPolling(callback, interval = 30000) {
        const poll = async () => {
            try {
                const metrics = await this.getLiveMetrics()
                callback(metrics)
            } catch (error) {
                console.error('Polling error:', error)
            }
        }

        // Initial fetch
        poll()
        
        // Set up interval
        const intervalId = setInterval(poll, interval)
        
        return {
            stop: () => clearInterval(intervalId),
            restart: () => {
                clearInterval(intervalId)
                return this.startPolling(callback, interval)
            }
        }
    }

    /**
     * Get mock live metrics data when backend is unavailable
     * @returns {Object} Mock live metrics data
     */
    getMockLiveMetrics() {
        return {
            totalRevenue: 25000,
            dailyRevenueTarget: 30000,
            totalActivations: 5,
            activeActivations: 3,
            promotersOnDuty: 12,
            totalLeads: 45,
            optInRate: 78.5,
            averagePerformanceScore: 82.3,
            revenueTrend: { direction: 'UP', percentage: 12.5 },
            leadsTrend: { direction: 'UP', percentage: 8.2 },
            topPerformingActivations: [
                {
                    id: 1,
                    name: 'Summer Campaign 2024',
                    location: 'Mall Central',
                    revenue: 8500,
                    leads: 15,
                    score: 89.2
                },
                {
                    id: 2,
                    name: 'Product Launch Event',
                    location: 'Shopping Plaza',
                    revenue: 6200,
                    leads: 12,
                    score: 85.1
                }
            ],
            promoterPerformance: [
                {
                    id: 1,
                    name: 'John Smith',
                    activationName: 'Summer Campaign 2024',
                    status: 'ACTIVE',
                    revenue: 2800,
                    leads: 8,
                    score: 91.5
                },
                {
                    id: 2,
                    name: 'Sarah Johnson',
                    activationName: 'Product Launch Event',
                    status: 'ACTIVE',
                    revenue: 2200,
                    leads: 6,
                    score: 87.3
                }
            ],
            revenueHistory: Array.from({ length: 24 }, (_, i) => ({
                timestamp: new Date(Date.now() - (23 - i) * 60 * 60 * 1000),
                amount: Math.floor(Math.random() * 2000) + 800
            })),
            systemHealth: {
                api: 'healthy',
                database: 'healthy',
                monitoring: 'healthy',
                responseTime: 145,
                activeConnections: 23,
                memoryUsage: 67,
                cpuUsage: 45
            }
        }
    }

    /**
     * Get mock alerts data when backend is unavailable
     * @returns {Array} Mock alerts data
     */
    getMockAlerts() {
        return [
            {
                id: 1,
                title: 'High Traffic Alert',
                message: 'Unusual traffic spike detected at Mall Central location',
                severity: 'MEDIUM',
                timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
                isAcknowledged: false,
                activationName: 'Summer Campaign 2024'
            },
            {
                id: 2,
                title: 'Low Performance Warning',
                message: 'Team performance below target for the last 2 hours',
                severity: 'HIGH',
                timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
                isAcknowledged: false,
                activationName: 'Product Launch Event'
            }
        ]
    }
}

export default new LiveMetricsService()