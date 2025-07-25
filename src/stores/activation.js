// src/stores/activations.js
// Activations management store for the Activation Tracking System

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { activationService, promoterService } from '@/services/api'
import { ACTIVATION_STATUS, ACTIVATION_TYPES, PRIORITY_LEVELS } from '@/utils/constants'
import { useAuthStore } from './auth'

export const useActivationStore = defineStore('activations', () => {
    // === STATE ===
    const activations = ref([])
    const currentActivation = ref(null)
    const isLoading = ref(false)
    const isCreating = ref(false)
    const isUpdating = ref(false)
    const error = ref(null)
    const pagination = ref({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
    })
    const filters = ref({
        status: null,
        type: null,
        priority: null,
        client: null,
        assignedTo: null,
        dateRange: null,
        search: ''
    })
    const sortBy = ref('dateCreated')
    const sortOrder = ref('desc')

    // Cache for activation details
    const activationCache = ref(new Map())
    const cacheExpiry = ref(new Map())
    const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

    // === GETTERS (COMPUTED) ===
    const filteredActivations = computed(() => {
        let result = activations.value

        // Apply filters
        if (filters.value.status) {
            result = result.filter(activation => activation.status === filters.value.status)
        }

        if (filters.value.type) {
            result = result.filter(activation => activation.type === filters.value.type)
        }

        if (filters.value.priority) {
            result = result.filter(activation => activation.priority === filters.value.priority)
        }

        if (filters.value.client) {
            result = result.filter(activation => activation.clientId === filters.value.client)
        }

        if (filters.value.assignedTo) {
            result = result.filter(activation =>
                activation.teamMembers?.some(member => member.id === filters.value.assignedTo)
            )
        }

        if (filters.value.search) {
            const searchTerm = filters.value.search.toLowerCase()
            result = result.filter(activation =>
                activation.name?.toLowerCase().includes(searchTerm) ||
                activation.id?.toString().includes(searchTerm) ||
                activation.clientCompanyName?.toLowerCase().includes(searchTerm) ||
                activation.clientBrandName?.toLowerCase().includes(searchTerm) ||
                activation.locationName?.toLowerCase().includes(searchTerm) ||
                activation.city?.toLowerCase().includes(searchTerm)
            )
        }

        if (filters.value.dateRange) {
            const { start, end } = filters.value.dateRange
            result = result.filter(activation => {
                const activationDate = new Date(activation.dateCreated)
                return activationDate >= new Date(start) && activationDate <= new Date(end)
            })
        }

        return result
    })

    const activationsByStatus = computed(() => {
        return Object.values(ACTIVATION_STATUS).reduce((acc, status) => {
            acc[status] = activations.value.filter(activation => activation.status === status)
            return acc
        }, {})
    })

    const activationsByPriority = computed(() => {
        return Object.values(PRIORITY_LEVELS).reduce((acc, priority) => {
            acc[priority] = activations.value.filter(activation => activation.priority === priority)
            return acc
        }, {})
    })

    const activeActivations = computed(() =>
        activations.value.filter(activation => activation.status === ACTIVATION_STATUS.ACTIVE)
    )

    const upcomingActivations = computed(() =>
        activations.value.filter(activation =>
            activation.status === ACTIVATION_STATUS.SCHEDULED &&
            new Date(activation.startDate) > new Date()
        )
    )

    const overdueActivations = computed(() =>
        activations.value.filter(activation => activation.status === ACTIVATION_STATUS.OVERDUE)
    )

    const myActivations = computed(() => {
        const authStore = useAuthStore()
        if (!authStore.user) return []

        return activations.value.filter(activation => {
            // For activation managers, show assigned activations
            if (authStore.isActivationManager) {
                return activation.managerId === authStore.user.id
            }

            // For promoters, show activations they're assigned to
            if (authStore.isPromoter) {
                return activation.teamMembers?.some(member => member.id === authStore.user.id)
            }

            // For clients, show their own activations
            if (authStore.isClient) {
                return activation.clientId === authStore.user.clientId
            }

            // For admins and warehouse managers, show all
            return true
        })
    })

    const activationStats = computed(() => {
        const total = activations.value.length
        const active = activeActivations.value.length
        const completed = activationsByStatus.value[ACTIVATION_STATUS.COMPLETED]?.length || 0
        const cancelled = activationsByStatus.value[ACTIVATION_STATUS.CANCELLED]?.length || 0
        const overdue = overdueActivations.value.length

        return {
            total,
            active,
            completed,
            cancelled,
            overdue,
            upcoming: upcomingActivations.value.length,
            completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
            activeRate: total > 0 ? Math.round((active / total) * 100) : 0
        }
    })

    // === ACTIONS ===

    /**
     * Fetch activations with pagination and filters
     */
    const fetchActivations = async (params = {}) => {
        try {
            isLoading.value = true
            error.value = null
            
            const authStore = useAuthStore()
            const userRole = authStore.userRole
            const userId = authStore.userId

            const queryParams = {
                page: pagination.value.page - 1, // Convert to 0-based for Spring Boot
                size: pagination.value.limit,
                sort: [`${sortBy.value},${sortOrder.value}`],
                ...filters.value,
                ...params
            }

            // Remove empty filters
            Object.keys(queryParams).forEach(key => {
                if (queryParams[key] === null || queryParams[key] === '' || queryParams[key] === undefined) {
                    delete queryParams[key]
                }
            })

            console.log('Fetching activations for role:', userRole, 'with params:', queryParams)

            let response
            // Use different endpoints based on user role
            if (userRole === 'PROMOTER') {
                // Promoters only see their assigned activations
                console.log('Fetching activations for promoter user:', userId)
                try {
                    // Try the user-based activations endpoint first (now working)
                    response = await activationService.getCurrentUserActivations(queryParams)
                    console.log('Successfully fetched activations via /users/current/activations endpoint')
                } catch (currentUserError) {
                    console.log('Failed to fetch via /users/current/activations, trying promoter assignments:', currentUserError)
                    try {
                        // Try using the promoter assignments endpoint with user ID (now working)
                        response = await promoterService.getPromoterAssignments(userId, queryParams)
                        console.log('Successfully fetched via promoter assignments endpoint')
                    } catch (promoterError) {
                        console.log('Failed to fetch promoter assignments, trying /activations/my:', promoterError)
                        try {
                            // Final fallback to the dedicated "my activations" endpoint
                            response = await activationService.getMyActivations(queryParams)
                            console.log('Successfully fetched activations via /activations/my endpoint')
                        } catch (myActivationsError) {
                            console.log('All activation endpoints failed for promoter:', myActivationsError)
                            
                            // Show user-friendly error message
                            if (typeof window !== 'undefined' && window.toast) {
                                window.toast.add({
                                    severity: 'warn',
                                    summary: 'Limited Access',
                                    detail: 'Unable to load activations. Please contact your administrator if you should have access to activations.',
                                    life: 8000
                                })
                            }
                            
                            response = {
                                content: [],
                                page: {
                                    totalElements: 0,
                                    number: 0,
                                    size: queryParams.size || 10,
                                    totalPages: 0
                                }
                            }
                        }
                    }
                }
            } else {
                // Admins, managers, etc. see all activations
                response = await activationService.getActivations(queryParams)
            }

            console.log('API response structure:', {
                hasContent: !!response.content,
                hasData: !!response.data,
                isArray: Array.isArray(response),
                responseKeys: Object.keys(response),
                sampleItem: response.content?.[0] || response.data?.[0] || response[0]
            })

            // Handle both custom and Spring Boot pagination response structures
            if (response.content) {
                // Spring Boot pagination response
                let activationsData = response.content
                
                // For promoter assignments, extract the activation from each assignment
                if (userRole === 'PROMOTER' && activationsData.length > 0) {
                    if (activationsData[0].activation) {
                        console.log('Extracting activations from assignments')
                        activationsData = activationsData.map(assignment => assignment.activation)
                    } else if (activationsData[0].activationId || activationsData[0].assignment) {
                        console.log('Processing assignment data with activationId references')
                        // If assignments only have activationId, we might need to fetch the activation details
                        // For now, just log this case
                        console.log('Assignment data structure:', activationsData[0])
                    }
                }
                
                activations.value = activationsData
                pagination.value = {
                    total: response.page.totalElements,
                    page: response.page.number + 1, // Convert 0-based to 1-based for UI
                    limit: response.page.size,
                    totalPages: response.page.totalPages
                }
            } else if (response.data) {
                // Custom pagination response
                let activationsData = response.data
                
                // For promoter assignments, extract the activation from each assignment
                if (userRole === 'PROMOTER' && activationsData.length > 0) {
                    if (activationsData[0].activation) {
                        console.log('Extracting activations from assignments')
                        activationsData = activationsData.map(assignment => assignment.activation)
                    } else if (activationsData[0].activationId || activationsData[0].assignment) {
                        console.log('Processing assignment data with activationId references')
                        // If assignments only have activationId, we might need to fetch the activation details
                        // For now, just log this case
                        console.log('Assignment data structure:', activationsData[0])
                    }
                }
                
                activations.value = activationsData
                pagination.value = {
                    total: response.meta.total,
                    page: response.meta.page,
                    limit: response.meta.limit,
                    totalPages: Math.ceil(response.meta.total / response.meta.limit)
                }
            } else {
                // Direct array response
                let activationsData = Array.isArray(response) ? response : [response]
                
                // For promoter assignments, extract the activation from each assignment
                if (userRole === 'PROMOTER' && activationsData.length > 0) {
                    if (activationsData[0].activation) {
                        console.log('Extracting activations from assignments')
                        activationsData = activationsData.map(assignment => assignment.activation)
                    } else if (activationsData[0].activationId || activationsData[0].assignment) {
                        console.log('Processing assignment data with activationId references')
                        // If assignments only have activationId, we might need to fetch the activation details
                        // For now, just log this case
                        console.log('Assignment data structure:', activationsData[0])
                    }
                }
                
                activations.value = activationsData
                pagination.value = {
                    total: activationsData.length,
                    page: 1,
                    limit: 10,
                    totalPages: 1
                }
            }

            return response
        } catch (err) {
            error.value = err.message || 'Failed to fetch activations'
            throw err
        } finally {
            isLoading.value = false
        }
    }

    /**
     * Get activation by ID with caching and role-based access
     */
    const getActivation = async (id, forceRefresh = false) => {
        // Check cache first
        if (!forceRefresh && isActivationCached(id)) {
            const cached = activationCache.value.get(id)
            currentActivation.value = cached
            return cached
        }

        try {
            isLoading.value = true
            error.value = null

            const authStore = useAuthStore()
            const userRole = authStore.userRole
            const userId = authStore.userId

            let activation

            // Use role-specific access for promoters
            if (userRole === 'PROMOTER') {
                console.log('Fetching activation details for promoter user:', userId)
                try {
                    activation = await activationService.getActivationForPromoter(id, userId)
                    console.log('Successfully fetched activation details via promoter-specific method')
                } catch (promoterError) {
                    console.log('Failed to fetch activation via promoter method, trying direct access:', promoterError)
                    // Try direct access as fallback
                    activation = await activationService.getActivation(id)
                }
            } else {
                // For non-promoters, use direct access
                activation = await activationService.getActivation(id)
            }

            // Cache the result
            cacheActivation(id, activation)
            currentActivation.value = activation

            return activation
        } catch (err) {
            error.value = err.message || 'Failed to fetch activation'
            throw err
        } finally {
            isLoading.value = false
        }
    }

    /**
     * Create new activation
     */
    const createActivation = async (activationData) => {
        try {
            isCreating.value = true
            error.value = null

            const newActivation = await activationService.createActivation(activationData)

            // Add to the beginning of the list
            activations.value.unshift(newActivation)

            // Update pagination total
            pagination.value.total += 1

            return newActivation
        } catch (err) {
            error.value = err.message || 'Failed to create activation'
            throw err
        } finally {
            isCreating.value = false
        }
    }

    /**
     * Update activation
     */
    const updateActivation = async (id, activationData) => {
        try {
            isUpdating.value = true
            error.value = null

            const updatedActivation = await activationService.updateActivation(id, activationData)

            // Update in the list
            const index = activations.value.findIndex(activation => activation.id === id)
            if (index !== -1) {
                activations.value[index] = updatedActivation
            }

            // Update current activation if it's the same
            if (currentActivation.value?.id === id) {
                currentActivation.value = updatedActivation
            }

            // Update cache
            cacheActivation(id, updatedActivation)

            return updatedActivation
        } catch (err) {
            error.value = err.message || 'Failed to update activation'
            throw err
        } finally {
            isUpdating.value = false
        }
    }

    /**
     * Delete activation
     */
    const deleteActivation = async (id) => {
        try {
            error.value = null

            await activationService.deleteActivation(id)

            // Remove from list
            const index = activations.value.findIndex(activation => activation.id === id)
            if (index !== -1) {
                activations.value.splice(index, 1)
            }

            // Clear current activation if it's the same
            if (currentActivation.value?.id === id) {
                currentActivation.value = null
            }

            // Remove from cache
            activationCache.value.delete(id)
            cacheExpiry.value.delete(id)

            // Update pagination total
            pagination.value.total = Math.max(0, pagination.value.total - 1)

            return true
        } catch (err) {
            error.value = err.message || 'Failed to delete activation'
            throw err
        }
    }

    /**
     * Update activation status
     */
    const updateActivationStatus = async (id, status) => {
        try {
            error.value = null

            const updatedActivation = await activationService.updateStatus(id, status)

            // Update in the list
            const index = activations.value.findIndex(activation => activation.id === id)
            if (index !== -1) {
                activations.value[index] = { ...activations.value[index], status }
            }

            // Update current activation if it's the same
            if (currentActivation.value?.id === id) {
                currentActivation.value = { ...currentActivation.value, status }
            }

            // Update cache
            if (isActivationCached(id)) {
                const cached = activationCache.value.get(id)
                cacheActivation(id, { ...cached, status })
            }

            return updatedActivation
        } catch (err) {
            error.value = err.message || 'Failed to update activation status'
            throw err
        }
    }

    /**
     * Assign team to activation
     */
    const assignTeam = async (activationId, teamData) => {
        try {
            error.value = null

            const result = await activationService.assignTeam(activationId, teamData)

            // Update activation with new team data
            const index = activations.value.findIndex(activation => activation.id === activationId)
            if (index !== -1) {
                activations.value[index] = { ...activations.value[index], teamMembers: teamData.members }
            }

            if (currentActivation.value?.id === activationId) {
                currentActivation.value = { ...currentActivation.value, teamMembers: teamData.members }
            }

            return result
        } catch (err) {
            error.value = err.message || 'Failed to assign team'
            throw err
        }
    }

    /**
     * Upload activation brief
     */
    const uploadBrief = async (activationId, file, onProgress) => {
        try {
            error.value = null

            const result = await activationService.uploadBrief(activationId, file, onProgress)

            // Update activation with brief info
            const index = activations.value.findIndex(activation => activation.id === activationId)
            if (index !== -1) {
                activations.value[index] = { ...activations.value[index], brief: result }
            }

            if (currentActivation.value?.id === activationId) {
                currentActivation.value = { ...currentActivation.value, brief: result }
            }

            return result
        } catch (err) {
            error.value = err.message || 'Failed to upload brief'
            throw err
        }
    }

    /**
     * Record promoter check-in
     */
    const checkinPromoter = async (activationId, userId, location, notes = null) => {
        try {
            error.value = null
            return await activationService.checkinPromoter(activationId, userId, location, notes)
        } catch (err) {
            // Extract meaningful error message from response
            let errorMessage = 'Failed to check in promoter'
            
            if (err.response?.data?.message) {
                errorMessage = err.response.data.message
            } else if (err.message) {
                errorMessage = err.message
            }
            
            error.value = errorMessage
            throw err
        }
    }

    /**
     * Record promoter check-out
     */
    const checkoutPromoter = async (activationId, userId, attendanceRecordId, location) => {
        try {
            error.value = null
            return await activationService.checkoutPromoter(activationId, userId, attendanceRecordId, location)
        } catch (err) {
            // Extract meaningful error message from response
            let errorMessage = 'Failed to check out promoter'
            
            if (err.response?.data?.message) {
                errorMessage = err.response.data.message
            } else if (err.message) {
                errorMessage = err.message
            }
            
            error.value = errorMessage
            throw err
        }
    }

    /**
     * Get check-in history for an activation (all promoters)
     */
    const getCheckInHistory = async (activationId) => {
        try {
            error.value = null
            const response = await activationService.getCheckInHistory(activationId)
            
            // Transform AttendanceRecordDTO to match frontend format
            // Handle both direct array response and wrapped response
            let rawData = null
            if (Array.isArray(response)) {
                rawData = response
            } else if (response && response.data) {
                rawData = response.data
            }
            
            if (rawData && Array.isArray(rawData)) {
                const transformedData = rawData.map(record => ({
                    id: record.id,
                    date: record.attendanceDate,
                    promoterName: `${record.promoterFirstName} ${record.promoterLastName}`,
                    promoterId: record.promoterId,
                    checkInTime: record.checkInTime,
                    checkOutTime: record.checkOutTime,
                    duration: calculateDuration(record.checkInTime, record.checkOutTime),
                    location: {
                        latitude: record.checkInLatitude,
                        longitude: record.checkInLongitude,
                        address: record.checkInAddress || record.locationName || 'Unknown location'
                    },
                    checkOutLocation: record.checkOutLatitude && record.checkOutLongitude ? {
                        latitude: record.checkOutLatitude,
                        longitude: record.checkOutLongitude,
                        address: record.checkOutAddress || 'Unknown location'
                    } : null,
                    status: record.isCheckedOut ? 'Complete' : 'In Progress',
                    isCheckedIn: record.isCheckedIn,
                    isCheckedOut: record.isCheckedOut
                }))
                
                // Return in consistent format - always return transformed data directly
                return transformedData
            }
            
            return response
        } catch (err) {
            error.value = err.message || 'Failed to fetch check-in history'
            throw err
        }
    }

    /**
     * Get check-in history for current user only
     */
    const getCurrentUserCheckInHistory = async (activationId) => {
        try {
            error.value = null
            const response = await activationService.getCurrentUserCheckInHistory(activationId)
            
            // Transform AttendanceRecordDTO to match frontend format
            if (response && response.data) {
                const transformedData = response.data.map(record => ({
                    id: record.id,
                    date: record.attendanceDate,
                    promoterName: `${record.promoterFirstName} ${record.promoterLastName}`,
                    promoterId: record.promoterId,
                    checkInTime: record.checkInTime,
                    checkOutTime: record.checkOutTime,
                    duration: calculateDuration(record.checkInTime, record.checkOutTime),
                    location: {
                        latitude: record.checkInLatitude,
                        longitude: record.checkInLongitude,
                        address: record.checkInAddress || record.locationName || 'Unknown location'
                    },
                    checkOutLocation: record.checkOutLatitude && record.checkOutLongitude ? {
                        latitude: record.checkOutLatitude,
                        longitude: record.checkOutLongitude,
                        address: record.checkOutAddress || 'Unknown location'
                    } : null,
                    status: record.isCheckedOut ? 'Complete' : 'In Progress',
                    isCheckedIn: record.isCheckedIn,
                    isCheckedOut: record.isCheckedOut
                }))
                
                return { ...response, data: transformedData }
            }
            
            return response
        } catch (err) {
            error.value = err.message || 'Failed to fetch current user check-in history'
            throw err
        }
    }
    

    /**
     * Calculate duration between check-in and check-out times
     */
    const calculateDuration = (checkInTime, checkOutTime) => {
        if (!checkInTime) return null
        
        const startTime = new Date(checkInTime)
        const endTime = checkOutTime ? new Date(checkOutTime) : new Date()
        const diffMs = endTime - startTime
        
        // Return duration in milliseconds for the component to format
        return diffMs > 0 ? diffMs : 0
    }

    /**
     * Record sales data
     */
    const recordSales = async (activationId, salesData) => {
        try {
            error.value = null
            return await activationService.recordSales(activationId, salesData)
        } catch (err) {
            error.value = err.message || 'Failed to record sales'
            throw err
        }
    }

    /**
     * Record customer data
     */
    const recordCustomerData = async (activationId, customerData) => {
        try {
            error.value = null
            return await activationService.recordCustomerData(activationId, customerData)
        } catch (err) {
            error.value = err.message || 'Failed to record customer data'
            throw err
        }
    }

    /**
     * Set filters
     */
    const setFilters = (newFilters) => {
        filters.value = { ...filters.value, ...newFilters }
        // Reset to first page when filters change
        pagination.value.page = 1
    }

    /**
     * Clear filters
     */
    const clearFilters = () => {
        filters.value = {
            status: null,
            type: null,
            priority: null,
            client: null,
            assignedTo: null,
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
        pagination.value.page = 1 // Reset to first page
    }

    /**
     * Refresh activations list
     */
    const refreshActivations = async () => {
        await fetchActivations()
    }

    /**
     * Cache management functions
     */
    const isActivationCached = (id) => {
        if (!activationCache.value.has(id)) return false

        const expiry = cacheExpiry.value.get(id)
        if (expiry && Date.now() > expiry) {
            // Cache expired
            activationCache.value.delete(id)
            cacheExpiry.value.delete(id)
            return false
        }

        return true
    }

    const cacheActivation = (id, activation) => {
        activationCache.value.set(id, activation)
        cacheExpiry.value.set(id, Date.now() + CACHE_DURATION)
    }

    const clearCache = () => {
        activationCache.value.clear()
        cacheExpiry.value.clear()
    }

    /**
     * Clear error
     */
    const clearError = () => {
        error.value = null
    }

    /**
     * Get activation by code
     */
    const getActivationByCode = (code) => {
        return activations.value.find(activation => activation.code === code)
    }

    /**
     * Search activations
     */
    const searchActivations = async (searchTerm) => {
        setFilters({ search: searchTerm })
        await fetchActivations()
    }

    // Return store interface
    return {
        // State
        activations,
        currentActivation,
        isLoading,
        isCreating,
        isUpdating,
        error,
        pagination,
        filters,
        sortBy,
        sortOrder,

        // Getters
        filteredActivations,
        activationsByStatus,
        activationsByPriority,
        activeActivations,
        upcomingActivations,
        overdueActivations,
        myActivations,
        activationStats,

        // Actions
        fetchActivations,
        getActivation,
        createActivation,
        updateActivation,
        deleteActivation,
        updateActivationStatus,
        assignTeam,
        uploadBrief,
        checkinPromoter,
        checkoutPromoter,
        getCheckInHistory,
        getCurrentUserCheckInHistory,
        recordSales,
        recordCustomerData,
        setFilters,
        clearFilters,
        setPagination,
        setSorting,
        refreshActivations,
        clearCache,
        clearError,
        getActivationByCode,
        searchActivations
    }
})

export default useActivationStore