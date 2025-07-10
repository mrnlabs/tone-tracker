// src/stores/clients.js
// Client management store for the Activation Tracking System

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { clientService } from '@/services/api'
import { CLIENT_STATUS } from '@/utils/constants'
import { useAuthStore } from './auth'

export const useClientsStore = defineStore('clients', () => {
    // === STATE ===
    const clients = ref([])
    const currentClient = ref(null)
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
        industry: null,
        region: null,
        search: '',
        dateRange: null
    })
    const sortBy = ref('created_at')
    const sortOrder = ref('desc')

    // Client activations cache
    const clientActivations = ref(new Map())
    const clientReports = ref(new Map())

    // === GETTERS (COMPUTED) ===
    const filteredClients = computed(() => {
        let result = clients.value

        // Apply filters
        if (filters.value.status) {
            result = result.filter(client => client.status === filters.value.status)
        }

        if (filters.value.industry) {
            result = result.filter(client => client.industry === filters.value.industry)
        }

        if (filters.value.region) {
            result = result.filter(client => client.region === filters.value.region)
        }

        if (filters.value.search) {
            const searchTerm = filters.value.search.toLowerCase()
            result = result.filter(client =>
                client.name.toLowerCase().includes(searchTerm) ||
                client.company.toLowerCase().includes(searchTerm) ||
                client.email.toLowerCase().includes(searchTerm) ||
                client.contactPerson?.toLowerCase().includes(searchTerm)
            )
        }

        if (filters.value.dateRange) {
            const { start, end } = filters.value.dateRange
            result = result.filter(client => {
                const clientDate = new Date(client.createdAt)
                return clientDate >= new Date(start) && clientDate <= new Date(end)
            })
        }

        return result
    })

    const clientsByStatus = computed(() => {
        return Object.values(CLIENT_STATUS).reduce((acc, status) => {
            acc[status] = clients.value.filter(client => client.status === status)
            return acc
        }, {})
    })

    const activeClients = computed(() =>
        clients.value.filter(client =>
            client.status === CLIENT_STATUS.ACTIVE ||
            client.status === CLIENT_STATUS.VERIFIED
        )
    )

    const newClients = computed(() =>
        clients.value.filter(client => client.status === CLIENT_STATUS.NEW)
    )

    const clientStats = computed(() => {
        const total = clients.value.length
        const active = activeClients.value.length
        const newCount = newClients.value.length
        const verified = clientsByStatus.value[CLIENT_STATUS.VERIFIED]?.length || 0
        const inactive = clientsByStatus.value[CLIENT_STATUS.INACTIVE]?.length || 0

        return {
            total,
            active,
            new: newCount,
            verified,
            inactive,
            activeRate: total > 0 ? Math.round((active / total) * 100) : 0,
            verificationRate: total > 0 ? Math.round((verified / total) * 100) : 0
        }
    })

    const clientOptions = computed(() =>
        activeClients.value.map(client => ({
            label: client.company || client.name,
            value: client.id,
            email: client.email,
            contactPerson: client.contactPerson
        }))
    )

    const myClient = computed(() => {
        const authStore = useAuthStore()
        if (!authStore.isClient || !authStore.user?.clientId) return null

        return clients.value.find(client => client.id === authStore.user.clientId)
    })

    // === ACTIONS ===

    /**
     * Fetch clients with pagination and filters
     */
    const fetchClients = async (params = {}) => {
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

            const response = await clientService.getClients(queryParams)

            clients.value = response.data
            pagination.value = {
                total: response.meta.total,
                page: response.meta.page,
                limit: response.meta.limit,
                totalPages: Math.ceil(response.meta.total / response.meta.limit)
            }

            return response
        } catch (err) {
            error.value = err.message || 'Failed to fetch clients'
            throw err
        } finally {
            isLoading.value = false
        }
    }

    /**
     * Get client by ID
     */
    const getClient = async (id) => {
        try {
            isLoading.value = true
            error.value = null

            const client = await clientService.getClient(id)
            currentClient.value = client

            return client
        } catch (err) {
            error.value = err.message || 'Failed to fetch client'
            throw err
        } finally {
            isLoading.value = false
        }
    }

    /**
     * Create new client
     */
    const createClient = async (clientData) => {
        try {
            isCreating.value = true
            error.value = null

            const newClient = await clientService.createClient(clientData)

            // Add to the beginning of the list
            clients.value.unshift(newClient)

            // Update pagination total
            pagination.value.total += 1

            return newClient
        } catch (err) {
            error.value = err.message || 'Failed to create client'
            throw err
        } finally {
            isCreating.value = false
        }
    }

    /**
     * Update client
     */
    const updateClient = async (id, clientData) => {
        try {
            isUpdating.value = true
            error.value = null

            const updatedClient = await clientService.updateClient(id, clientData)

            // Update in the list
            const index = clients.value.findIndex(client => client.id === id)
            if (index !== -1) {
                clients.value[index] = updatedClient
            }

            // Update current client if it's the same
            if (currentClient.value?.id === id) {
                currentClient.value = updatedClient
            }

            return updatedClient
        } catch (err) {
            error.value = err.message || 'Failed to update client'
            throw err
        } finally {
            isUpdating.value = false
        }
    }

    /**
     * Delete client
     */
    const deleteClient = async (id) => {
        try {
            error.value = null

            await clientService.deleteClient(id)

            // Remove from list
            const index = clients.value.findIndex(client => client.id === id)
            if (index !== -1) {
                clients.value.splice(index, 1)
            }

            // Clear current client if it's the same
            if (currentClient.value?.id === id) {
                currentClient.value = null
            }

            // Clear related data
            clientActivations.value.delete(id)
            clientReports.value.delete(id)

            // Update pagination total
            pagination.value.total = Math.max(0, pagination.value.total - 1)

            return true
        } catch (err) {
            error.value = err.message || 'Failed to delete client'
            throw err
        }
    }

    /**
     * Get client activations
     */
    const getClientActivations = async (clientId, params = {}) => {
        try {
            error.value = null

            const response = await clientService.getClientActivations(clientId, params)

            // Cache the activations
            clientActivations.value.set(clientId, response.data)

            return response
        } catch (err) {
            error.value = err.message || 'Failed to fetch client activations'
            throw err
        }
    }

    /**
     * Get client reports
     */
    const getClientReports = async (clientId, params = {}) => {
        try {
            error.value = null

            const response = await clientService.getClientReports(clientId, params)

            // Cache the reports
            clientReports.value.set(clientId, response.data)

            return response
        } catch (err) {
            error.value = err.message || 'Failed to fetch client reports'
            throw err
        }
    }

    /**
     * Verify client
     */
    const verifyClient = async (id) => {
        try {
            error.value = null

            const updatedClient = await clientService.updateClient(id, {
                status: CLIENT_STATUS.VERIFIED
            })

            // Update in the list
            const index = clients.value.findIndex(client => client.id === id)
            if (index !== -1) {
                clients.value[index] = updatedClient
            }

            if (currentClient.value?.id === id) {
                currentClient.value = updatedClient
            }

            return updatedClient
        } catch (err) {
            error.value = err.message || 'Failed to verify client'
            throw err
        }
    }

    /**
     * Activate client
     */
    const activateClient = async (id) => {
        try {
            error.value = null

            const updatedClient = await clientService.updateClient(id, {
                status: CLIENT_STATUS.ACTIVE
            })

            // Update in the list
            const index = clients.value.findIndex(client => client.id === id)
            if (index !== -1) {
                clients.value[index] = updatedClient
            }

            if (currentClient.value?.id === id) {
                currentClient.value = updatedClient
            }

            return updatedClient
        } catch (err) {
            error.value = err.message || 'Failed to activate client'
            throw err
        }
    }

    /**
     * Deactivate client
     */
    const deactivateClient = async (id) => {
        try {
            error.value = null

            const updatedClient = await clientService.updateClient(id, {
                status: CLIENT_STATUS.INACTIVE
            })

            // Update in the list
            const index = clients.value.findIndex(client => client.id === id)
            if (index !== -1) {
                clients.value[index] = updatedClient
            }

            if (currentClient.value?.id === id) {
                currentClient.value = updatedClient
            }

            return updatedClient
        } catch (err) {
            error.value = err.message || 'Failed to deactivate client'
            throw err
        }
    }

    /**
     * Suspend client
     */
    const suspendClient = async (id, reason = '') => {
        try {
            error.value = null

            const updatedClient = await clientService.updateClient(id, {
                status: CLIENT_STATUS.SUSPENDED,
                suspensionReason: reason
            })

            // Update in the list
            const index = clients.value.findIndex(client => client.id === id)
            if (index !== -1) {
                clients.value[index] = updatedClient
            }

            if (currentClient.value?.id === id) {
                currentClient.value = updatedClient
            }

            return updatedClient
        } catch (err) {
            error.value = err.message || 'Failed to suspend client'
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
            industry: null,
            region: null,
            search: '',
            dateRange: null
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
     * Refresh clients list
     */
    const refreshClients = async () => {
        await fetchClients()
    }

    /**
     * Clear error
     */
    const clearError = () => {
        error.value = null
    }

    /**
     * Get client by email
     */
    const getClientByEmail = (email) => {
        return clients.value.find(client => client.email === email)
    }

    /**
     * Search clients
     */
    const searchClients = async (searchTerm) => {
        setFilters({ search: searchTerm })
        await fetchClients()
    }

    /**
     * Get cached client activations
     */
    const getCachedClientActivations = (clientId) => {
        return clientActivations.value.get(clientId) || []
    }

    /**
     * Get cached client reports
     */
    const getCachedClientReports = (clientId) => {
        return clientReports.value.get(clientId) || []
    }

    /**
     * Clear client cache
     */
    const clearClientCache = (clientId) => {
        if (clientId) {
            clientActivations.value.delete(clientId)
            clientReports.value.delete(clientId)
        } else {
            clientActivations.value.clear()
            clientReports.value.clear()
        }
    }

    // Return store interface
    return {
        // State
        clients,
        currentClient,
        isLoading,
        isCreating,
        isUpdating,
        error,
        pagination,
        filters,
        sortBy,
        sortOrder,

        // Getters
        filteredClients,
        clientsByStatus,
        activeClients,
        newClients,
        clientStats,
        clientOptions,
        myClient,

        // Actions
        fetchClients,
        getClient,
        createClient,
        updateClient,
        deleteClient,
        getClientActivations,
        getClientReports,
        verifyClient,
        activateClient,
        deactivateClient,
        suspendClient,
        setFilters,
        clearFilters,
        setPagination,
        setSorting,
        refreshClients,
        clearError,
        getClientByEmail,
        searchClients,
        getCachedClientActivations,
        getCachedClientReports,
        clearClientCache
    }
})

export default useClientsStore