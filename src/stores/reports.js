// src/stores/reports.js
// Reports and analytics store for the Activation Tracking System

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { reportService } from '@/services/api'
import { REPORT_TYPES } from '@/utils/constants'
import { useAuthStore } from './auth'

export const useReportsStore = defineStore('reports', () => {
    // === STATE ===
    const reports = ref([])
    const currentReport = ref(null)
    const dashboardStats = ref({})
    const analytics = ref({})
    const isLoading = ref(false)
    const isGenerating = ref(false)
    const error = ref(null)
    const pagination = ref({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
    })
    const filters = ref({
        type: null,
        status: null,
        createdBy: null,
        dateRange: null,
        search: ''
    })
    const sortBy = ref('created_at')
    const sortOrder = ref('desc')

    // Report generation queue and status
    const generationQueue = ref([])
    const reportStatus = ref(new Map())

    // Cached analytics data
    const analyticsCache = ref(new Map())
    const cacheExpiry = ref(new Map())
    const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

    // === GETTERS (COMPUTED) ===
    const filteredReports = computed(() => {
        let result = reports.value

        // Apply filters
        if (filters.value.type) {
            result = result.filter(report => report.type === filters.value.type)
        }

        if (filters.value.status) {
            result = result.filter(report => report.status === filters.value.status)
        }

        if (filters.value.createdBy) {
            result = result.filter(report => report.createdBy === filters.value.createdBy)
        }

        if (filters.value.search) {
            const searchTerm = filters.value.search.toLowerCase()
            result = result.filter(report =>
                report.title.toLowerCase().includes(searchTerm) ||
                report.description?.toLowerCase().includes(searchTerm)
            )
        }

        if (filters.value.dateRange) {
            const { start, end } = filters.value.dateRange
            result = result.filter(report => {
                const reportDate = new Date(report.createdAt)
                return reportDate >= new Date(start) && reportDate <= new Date(end)
            })
        }

        return result
    })

    const reportsByType = computed(() => {
        return Object.values(REPORT_TYPES).reduce((acc, type) => {
            acc[type] = reports.value.filter(report => report.type === type)
            return acc
        }, {})
    })

    const recentReports = computed(() =>
        reports.value
            .filter(report => report.status === 'completed')
            .slice(0, 10)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    )

    const pendingReports = computed(() =>
        reports.value.filter(report =>
            report.status === 'pending' || report.status === 'generating'
        )
    )

    const myReports = computed(() => {
        const authStore = useAuthStore()
        if (!authStore.user) return []

        return reports.value.filter(report => {
            // For clients, show only their own reports
            if (authStore.isClient) {
                return report.clientId === authStore.user.clientId
            }

            // For others, show reports they created or have access to
            return report.createdBy === authStore.user.id ||
                report.sharedWith?.includes(authStore.user.id)
        })
    })

    const reportStats = computed(() => {
        const total = reports.value.length
        const completed = reports.value.filter(r => r.status === 'completed').length
        const pending = pendingReports.value.length
        const failed = reports.value.filter(r => r.status === 'failed').length

        return {
            total,
            completed,
            pending,
            failed,
            completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
            failureRate: total > 0 ? Math.round((failed / total) * 100) : 0
        }
    })

    const reportTypeOptions = computed(() =>
        Object.entries(REPORT_TYPES).map(([key, value]) => ({
            label: value.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            value: key
        }))
    )

    // === ACTIONS ===

    /**
     * Fetch reports with pagination and filters
     */
    const fetchReports = async (params = {}) => {
        try {
            isLoading.value = true
            error.value = null

            const queryParams = {
                page: pagination.value.page,
                limit: pagination.value.limit,
                sort: sortBy.value,
                order: sortOrder.value,
                ...filters.value,
                ...params
            }

            // Remove empty filters
            Object.keys(queryParams).forEach(key => {
                if (queryParams[key] === null || queryParams[key] === '' || queryParams[key] === undefined) {
                    delete queryParams[key]
                }
            })

            const response = await reportService.getReports(queryParams)

            reports.value = response.data
            pagination.value = {
                total: response.meta.total,
                page: response.meta.page,
                limit: response.meta.limit,
                totalPages: Math.ceil(response.meta.total / response.meta.limit)
            }

            return response
        } catch (err) {
            error.value = err.message || 'Failed to fetch reports'
            throw err
        } finally {
            isLoading.value = false
        }
    }

    /**
     * Get report by ID
     */
    const getReport = async (id) => {
        try {
            isLoading.value = true
            error.value = null

            const report = await reportService.getReport(id)
            currentReport.value = report

            return report
        } catch (err) {
            error.value = err.message || 'Failed to fetch report'
            throw err
        } finally {
            isLoading.value = false
        }
    }

    /**
     * Generate new report
     */
    const generateReport = async (reportConfig) => {
        try {
            isGenerating.value = true
            error.value = null

            // Add to generation queue
            const queueItem = {
                id: Date.now().toString(),
                config: reportConfig,
                status: 'queued',
                createdAt: new Date().toISOString()
            }
            generationQueue.value.push(queueItem)

            const response = await reportService.generateReport(reportConfig)

            // Update queue status
            const queueIndex = generationQueue.value.findIndex(item => item.id === queueItem.id)
            if (queueIndex !== -1) {
                generationQueue.value[queueIndex].status = 'generating'
                generationQueue.value[queueIndex].reportId = response.id
            }

            // Add to reports list if completed immediately
            if (response.status === 'completed') {
                reports.value.unshift(response)
                pagination.value.total += 1

                // Remove from queue
                generationQueue.value.splice(queueIndex, 1)
            } else {
                // Track status for async generation
                reportStatus.value.set(response.id, response.status)
            }

            return response
        } catch (err) {
            error.value = err.message || 'Failed to generate report'

            // Update queue with error
            const queueIndex = generationQueue.value.findIndex(item => item.id === queueItem.id)
            if (queueIndex !== -1) {
                generationQueue.value[queueIndex].status = 'failed'
                generationQueue.value[queueIndex].error = err.message
            }

            throw err
        } finally {
            isGenerating.value = false
        }
    }

    /**
     * Download report
     */
    const downloadReport = async (id, format = 'pdf') => {
        try {
            error.value = null
            return await reportService.downloadReport(id, format)
        } catch (err) {
            error.value = err.message || 'Failed to download report'
            throw err
        }
    }

    /**
     * Delete report
     */
    const deleteReport = async (id) => {
        try {
            error.value = null

            await reportService.deleteReport(id)

            // Remove from list
            const index = reports.value.findIndex(report => report.id === id)
            if (index !== -1) {
                reports.value.splice(index, 1)
            }

            // Clear current report if it's the same
            if (currentReport.value?.id === id) {
                currentReport.value = null
            }

            // Clean up status tracking
            reportStatus.value.delete(id)

            // Update pagination total
            pagination.value.total = Math.max(0, pagination.value.total - 1)

            return true
        } catch (err) {
            error.value = err.message || 'Failed to delete report'
            throw err
        }
    }

    /**
     * Get dashboard statistics
     */
    const fetchDashboardStats = async (params = {}) => {
        try {
            error.value = null

            const stats = await reportService.getDashboardStats(params)
            dashboardStats.value = stats

            return stats
        } catch (err) {
            error.value = err.message || 'Failed to fetch dashboard statistics'
            throw err
        }
    }

    /**
     * Get analytics data with caching
     */
    const fetchAnalytics = async (type, params = {}, useCache = true) => {
        const cacheKey = `${type}_${JSON.stringify(params)}`

        // Check cache first
        if (useCache && isAnalyticsCached(cacheKey)) {
            const cached = analyticsCache.value.get(cacheKey)
            analytics.value[type] = cached
            return cached
        }

        try {
            error.value = null

            const data = await reportService.getAnalytics(type, params)

            // Cache the result
            cacheAnalytics(cacheKey, data)
            analytics.value[type] = data

            return data
        } catch (err) {
            error.value = err.message || `Failed to fetch ${type} analytics`
            throw err
        }
    }

    /**
     * Update report status (for real-time updates)
     */
    const updateReportStatus = (reportId, status, additionalData = {}) => {
        // Update in reports list
        const index = reports.value.findIndex(report => report.id === reportId)
        if (index !== -1) {
            reports.value[index] = {
                ...reports.value[index],
                status,
                ...additionalData,
                updatedAt: new Date().toISOString()
            }
        }

        // Update current report if it's the same
        if (currentReport.value?.id === reportId) {
            currentReport.value = {
                ...currentReport.value,
                status,
                ...additionalData,
                updatedAt: new Date().toISOString()
            }
        }

        // Update status tracking
        reportStatus.value.set(reportId, status)

        // If completed, add to reports list if not already there
        if (status === 'completed' && index === -1 && additionalData.report) {
            reports.value.unshift(additionalData.report)
            pagination.value.total += 1
        }

        // Update generation queue
        const queueIndex = generationQueue.value.findIndex(item => item.reportId === reportId)
        if (queueIndex !== -1) {
            if (status === 'completed' || status === 'failed') {
                generationQueue.value.splice(queueIndex, 1)
            } else {
                generationQueue.value[queueIndex].status = status
            }
        }
    }

    /**
     * Share report with users
     */
    const shareReport = async (reportId, userIds, permissions = ['view']) => {
        try {
            error.value = null

            // This would call an API endpoint to share the report
            // For now, we'll update locally
            const index = reports.value.findIndex(report => report.id === reportId)
            if (index !== -1) {
                const currentShared = reports.value[index].sharedWith || []
                reports.value[index].sharedWith = [...new Set([...currentShared, ...userIds])]
            }

            return { success: true, sharedWith: userIds }
        } catch (err) {
            error.value = err.message || 'Failed to share report'
            throw err
        }
    }

    /**
     * Get report generation history
     */
    const getGenerationHistory = (limit = 20) => {
        return [...generationQueue.value]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, limit)
    }

    /**
     * Cache management functions
     */
    const isAnalyticsCached = (key) => {
        if (!analyticsCache.value.has(key)) return false

        const expiry = cacheExpiry.value.get(key)
        if (expiry && Date.now() > expiry) {
            // Cache expired
            analyticsCache.value.delete(key)
            cacheExpiry.value.delete(key)
            return false
        }

        return true
    }

    const cacheAnalytics = (key, data) => {
        analyticsCache.value.set(key, data)
        cacheExpiry.value.set(key, Date.now() + CACHE_DURATION)
    }

    const clearAnalyticsCache = (type = null) => {
        if (type) {
            // Clear specific analytics type
            const keysToDelete = []
            for (const key of analyticsCache.value.keys()) {
                if (key.startsWith(type)) {
                    keysToDelete.push(key)
                }
            }
            keysToDelete.forEach(key => {
                analyticsCache.value.delete(key)
                cacheExpiry.value.delete(key)
            })
        } else {
            // Clear all cache
            analyticsCache.value.clear()
            cacheExpiry.value.clear()
        }
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
            type: null,
            status: null,
            createdBy: null,
            dateRange: null,
            search: ''
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
    const setSorting = (field, order = 'desc') => {
        sortBy.value = field
        sortOrder.value = order
        pagination.value.page = 1
    }

    /**
     * Refresh reports list
     */
    const refreshReports = async () => {
        await fetchReports()
    }

    /**
     * Clear error
     */
    const clearError = () => {
        error.value = null
    }

    /**
     * Search reports
     */
    const searchReports = async (searchTerm) => {
        setFilters({ search: searchTerm })
        await fetchReports()
    }

    /**
     * Get cached analytics
     */
    const getCachedAnalytics = (type) => {
        return analytics.value[type] || null
    }

    /**
     * Export analytics data
     */
    const exportAnalytics = (type, format = 'csv') => {
        const data = analytics.value[type]
        if (!data) return null

        // Simple CSV export implementation
        if (format === 'csv' && Array.isArray(data)) {
            const headers = Object.keys(data[0] || {})
            const csvContent = [
                headers.join(','),
                ...data.map(row => headers.map(header => row[header]).join(','))
            ].join('\n')

            const blob = new Blob([csvContent], { type: 'text/csv' })
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `${type}_analytics.csv`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)

            return true
        }

        return false
    }

    // Return store interface
    return {
        // State
        reports,
        currentReport,
        dashboardStats,
        analytics,
        generationQueue,
        isLoading,
        isGenerating,
        error,
        pagination,
        filters,
        sortBy,
        sortOrder,

        // Getters
        filteredReports,
        reportsByType,
        recentReports,
        pendingReports,
        myReports,
        reportStats,
        reportTypeOptions,

        // Actions
        fetchReports,
        getReport,
        generateReport,
        downloadReport,
        deleteReport,
        fetchDashboardStats,
        fetchAnalytics,
        updateReportStatus,
        shareReport,
        getGenerationHistory,
        clearAnalyticsCache,
        setFilters,
        clearFilters,
        setPagination,
        setSorting,
        refreshReports,
        clearError,
        searchReports,
        getCachedAnalytics,
        exportAnalytics
    }
})

export default useReportsStore