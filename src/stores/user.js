// src/stores/users.js
// User and team management store for the Activation Tracking System

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { userService } from '@/services/api'
import { USER_ROLES, USER_STATUS } from '@/utils/constants'
import { useAuthStore } from './auth'

export const useUsersStore = defineStore('users', () => {
    // === STATE ===
    const users = ref([])
    const currentUser = ref(null)
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
        role: null,
        status: null,
        department: null,
        location: null,
        search: '',
        active: null
    })
    const sortBy = ref('lastName')
    const sortOrder = ref('asc')

    // Team assignments and performance tracking
    const teamAssignments = ref([])
    const userPerformance = ref(new Map())
    const attendanceRecords = ref(new Map())

    // === GETTERS (COMPUTED) ===
    const filteredUsers = computed(() => {
        let result = users.value

        // Apply filters
        if (filters.value.role) {
            result = result.filter(user => user.role === filters.value.role)
        }

        if (filters.value.status) {
            result = result.filter(user => user.status === filters.value.status)
        }

        if (filters.value.department) {
            result = result.filter(user => user.department === filters.value.department)
        }

        if (filters.value.location) {
            result = result.filter(user => user.location === filters.value.location)
        }

        if (filters.value.active !== null) {
            result = result.filter(user => user.active === filters.value.active)
        }

        if (filters.value.search) {
            const searchTerm = filters.value.search.toLowerCase()
            result = result.filter(user =>
                user.firstName.toLowerCase().includes(searchTerm) ||
                user.lastName.toLowerCase().includes(searchTerm) ||
                user.email.toLowerCase().includes(searchTerm) ||
                user.username?.toLowerCase().includes(searchTerm) ||
                user.phone?.includes(searchTerm)
            )
        }

        return result
    })

    const usersByRole = computed(() => {
        return Object.values(USER_ROLES).reduce((acc, role) => {
            acc[role] = users.value.filter(user => user.role === role)
            return acc
        }, {})
    })

    const activeUsers = computed(() =>
        users.value.filter(user => user.active && user.status !== USER_STATUS.OFFLINE)
    )

    const onlineUsers = computed(() =>
        users.value.filter(user => user.status === USER_STATUS.ONLINE)
    )

    const checkedInUsers = computed(() =>
        users.value.filter(user => user.status === USER_STATUS.CHECKED_IN)
    )

    const promoters = computed(() =>
        users.value.filter(user => user.role === USER_ROLES.PROMOTER)
    )

    const activationManagers = computed(() =>
        users.value.filter(user => user.role === USER_ROLES.ACTIVATION_MANAGER)
    )

    const warehouseManagers = computed(() =>
        users.value.filter(user => user.role === USER_ROLES.WAREHOUSE_MANAGER)
    )

    const availablePromoters = computed(() =>
        promoters.value.filter(user =>
            user.active &&
            user.status !== USER_STATUS.ABSENT &&
            !isUserAssigned(user.id)
        )
    )

    const userStats = computed(() => {
        const total = users.value.length
        const active = activeUsers.value.length
        const online = onlineUsers.value.length
        const checkedIn = checkedInUsers.value.length

        return {
            total,
            active,
            online,
            checkedIn,
            offline: total - online,
            promoters: promoters.value.length,
            managers: activationManagers.value.length,
            warehouseStaff: warehouseManagers.value.length,
            activeRate: total > 0 ? Math.round((active / total) * 100) : 0,
            onlineRate: total > 0 ? Math.round((online / total) * 100) : 0
        }
    })

    const teamOptions = computed(() => {
        const authStore = useAuthStore()
        let availableUsers = users.value

        // Filter based on current user's role
        if (authStore.isActivationManager) {
            // Activation managers can assign promoters
            availableUsers = promoters.value
        } else if (authStore.isAdmin) {
            // Admins can assign anyone except other admins
            availableUsers = users.value.filter(user => user.role !== USER_ROLES.ADMIN)
        }

        return availableUsers
            .filter(user => user.active)
            .map(user => ({
                label: `${user.firstName} ${user.lastName}`,
                value: user.id,
                role: user.role,
                email: user.email,
                phone: user.phone,
                status: user.status,
                avatar: user.avatar
            }))
    })

    // === ACTIONS ===

    /**
     * Fetch users with pagination and filters
     */
    const fetchUsers = async (params = {}) => {
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

            const response = await userService.getUsers(queryParams)

            users.value = response.data
            pagination.value = {
                total: response.meta.total,
                page: response.meta.page,
                limit: response.meta.limit,
                totalPages: Math.ceil(response.meta.total / response.meta.limit)
            }

            return response
        } catch (err) {
            error.value = err.message || 'Failed to fetch users'
            throw err
        } finally {
            isLoading.value = false
        }
    }

    /**
     * Get user by ID
     */
    const getUser = async (id) => {
        try {
            isLoading.value = true
            error.value = null

            const user = await userService.getUser(id)
            currentUser.value = user

            return user
        } catch (err) {
            error.value = err.message || 'Failed to fetch user'
            throw err
        } finally {
            isLoading.value = false
        }
    }

    /**
     * Create new user
     */
    const createUser = async (userData) => {
        try {
            isCreating.value = true
            error.value = null

            const newUser = await userService.createUser(userData)

            // Add to the beginning of the list
            users.value.unshift(newUser)

            // Update pagination total
            pagination.value.total += 1

            return newUser
        } catch (err) {
            error.value = err.message || 'Failed to create user'
            throw err
        } finally {
            isCreating.value = false
        }
    }

    /**
     * Update user
     */
    const updateUser = async (id, userData) => {
        try {
            isUpdating.value = true
            error.value = null

            const updatedUser = await userService.updateUser(id, userData)

            // Update in the list
            const index = users.value.findIndex(user => user.id === id)
            if (index !== -1) {
                users.value[index] = updatedUser
            }

            // Update current user if it's the same
            if (currentUser.value?.id === id) {
                currentUser.value = updatedUser
            }

            return updatedUser
        } catch (err) {
            error.value = err.message || 'Failed to update user'
            throw err
        } finally {
            isUpdating.value = false
        }
    }

    /**
     * Delete user
     */
    const deleteUser = async (id) => {
        try {
            error.value = null

            await userService.deleteUser(id)

            // Remove from list
            const index = users.value.findIndex(user => user.id === id)
            if (index !== -1) {
                users.value.splice(index, 1)
            }

            // Clear current user if it's the same
            if (currentUser.value?.id === id) {
                currentUser.value = null
            }

            // Clear related data
            userPerformance.value.delete(id)
            attendanceRecords.value.delete(id)

            // Update pagination total
            pagination.value.total = Math.max(0, pagination.value.total - 1)

            return true
        } catch (err) {
            error.value = err.message || 'Failed to delete user'
            throw err
        }
    }

    /**
     * Assign role to user
     */
    const assignRole = async (userId, role) => {
        try {
            error.value = null

            const updatedUser = await userService.assignRole(userId, role)

            // Update in the list
            const index = users.value.findIndex(user => user.id === userId)
            if (index !== -1) {
                users.value[index] = { ...users.value[index], role }
            }

            if (currentUser.value?.id === userId) {
                currentUser.value = { ...currentUser.value, role }
            }

            return updatedUser
        } catch (err) {
            error.value = err.message || 'Failed to assign role'
            throw err
        }
    }

    /**
     * Activate user
     */
    const activateUser = async (id) => {
        try {
            error.value = null

            const updatedUser = await userService.activateUser(id)

            // Update in the list
            const index = users.value.findIndex(user => user.id === id)
            if (index !== -1) {
                users.value[index] = { ...users.value[index], active: true }
            }

            if (currentUser.value?.id === id) {
                currentUser.value = { ...currentUser.value, active: true }
            }

            return updatedUser
        } catch (err) {
            error.value = err.message || 'Failed to activate user'
            throw err
        }
    }

    /**
     * Deactivate user
     */
    const deactivateUser = async (id) => {
        try {
            error.value = null

            const updatedUser = await userService.deactivateUser(id)

            // Update in the list
            const index = users.value.findIndex(user => user.id === id)
            if (index !== -1) {
                users.value[index] = { ...users.value[index], active: false }
            }

            if (currentUser.value?.id === id) {
                currentUser.value = { ...currentUser.value, active: false }
            }

            return updatedUser
        } catch (err) {
            error.value = err.message || 'Failed to deactivate user'
            throw err
        }
    }

    /**
     * Update user status (online, offline, checked-in, etc.)
     */
    const updateUserStatus = async (id, status) => {
        try {
            error.value = null

            // Update locally first for immediate feedback
            const index = users.value.findIndex(user => user.id === id)
            if (index !== -1) {
                users.value[index] = { ...users.value[index], status, lastActivity: new Date().toISOString() }
            }

            if (currentUser.value?.id === id) {
                currentUser.value = { ...currentUser.value, status, lastActivity: new Date().toISOString() }
            }

            // Note: This might be handled by real-time updates rather than API calls
            return { success: true, status }
        } catch (err) {
            error.value = err.message || 'Failed to update user status'
            throw err
        }
    }

    /**
     * Track user performance
     */
    const trackUserPerformance = (userId, performanceData) => {
        const current = userPerformance.value.get(userId) || {
            activationsCompleted: 0,
            salesGenerated: 0,
            customerEngagements: 0,
            averageRating: 0,
            attendanceRate: 100
        }

        const updated = { ...current, ...performanceData }
        userPerformance.value.set(userId, updated)
    }

    /**
     * Record attendance
     */
    const recordAttendance = (userId, attendanceData) => {
        const userAttendance = attendanceRecords.value.get(userId) || []
        userAttendance.push({
            ...attendanceData,
            timestamp: new Date().toISOString()
        })
        attendanceRecords.value.set(userId, userAttendance)
    }

    /**
     * Check if user is assigned to any active activation
     */
    const isUserAssigned = (userId) => {
        return teamAssignments.value.some(assignment =>
            assignment.userId === userId && assignment.status === 'active'
        )
    }

    /**
     * Get user assignments
     */
    const getUserAssignments = (userId) => {
        return teamAssignments.value.filter(assignment => assignment.userId === userId)
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
            role: null,
            status: null,
            department: null,
            location: null,
            search: '',
            active: null
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
    const setSorting = (field, order = 'asc') => {
        sortBy.value = field
        sortOrder.value = order
        pagination.value.page = 1
    }

    /**
     * Refresh users list
     */
    const refreshUsers = async () => {
        await fetchUsers()
    }

    /**
     * Clear error
     */
    const clearError = () => {
        error.value = null
    }

    /**
     * Get user by email
     */
    const getUserByEmail = (email) => {
        return users.value.find(user => user.email === email)
    }

    /**
     * Search users
     */
    const searchUsers = async (searchTerm) => {
        setFilters({ search: searchTerm })
        await fetchUsers()
    }

    /**
     * Get user performance data
     */
    const getUserPerformance = (userId) => {
        return userPerformance.value.get(userId) || null
    }

    /**
     * Get user attendance records
     */
    const getUserAttendance = (userId) => {
        return attendanceRecords.value.get(userId) || []
    }

    /**
     * Calculate user statistics
     */
    const calculateUserStats = (userId) => {
        const performance = getUserPerformance(userId)
        const attendance = getUserAttendance(userId)

        if (!performance && attendance.length === 0) return null

        const totalDays = attendance.length
        const presentDays = attendance.filter(record => record.status === 'present').length
        const lateDays = attendance.filter(record => record.late).length

        return {
            attendanceRate: totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100,
            punctualityRate: totalDays > 0 ? Math.round(((presentDays - lateDays) / totalDays) * 100) : 100,
            activationsCompleted: performance?.activationsCompleted || 0,
            salesGenerated: performance?.salesGenerated || 0,
            customerEngagements: performance?.customerEngagements || 0,
            averageRating: performance?.averageRating || 0
        }
    }

    // Return store interface
    return {
        // State
        users,
        currentUser,
        teamAssignments,
        isLoading,
        isCreating,
        isUpdating,
        error,
        pagination,
        filters,
        sortBy,
        sortOrder,

        // Getters
        filteredUsers,
        usersByRole,
        activeUsers,
        onlineUsers,
        checkedInUsers,
        promoters,
        activationManagers,
        warehouseManagers,
        availablePromoters,
        userStats,
        teamOptions,

        // Actions
        fetchUsers,
        getUser,
        createUser,
        updateUser,
        deleteUser,
        assignRole,
        activateUser,
        deactivateUser,
        updateUserStatus,
        trackUserPerformance,
        recordAttendance,
        isUserAssigned,
        getUserAssignments,
        setFilters,
        clearFilters,
        setPagination,
        setSorting,
        refreshUsers,
        clearError,
        getUserByEmail,
        searchUsers,
        getUserPerformance,
        getUserAttendance,
        calculateUserStats
    }
})

export default useUsersStore