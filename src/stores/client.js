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
    const sortBy = ref('companyName')
    const sortOrder = ref('asc')

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
                client.companyName?.toLowerCase().includes(searchTerm) ||
                client.brandName?.toLowerCase().includes(searchTerm) ||
                client.primaryContactEmail?.toLowerCase().includes(searchTerm) ||
                client.primaryContactName?.toLowerCase().includes(searchTerm) ||
                client.description?.toLowerCase().includes(searchTerm)
            )
        }

        if (filters.value.dateRange) {
            const { start, end } = filters.value.dateRange
            result = result.filter(client => {
                const clientDate = new Date(client.dateCreated)
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
            verificationRate: total > 0 ? Math.round((verified / total) * 100) : 0,
            totalRevenue: clients.value.reduce((sum, client) => sum + (client.totalRevenue || 0), 0),
            activeActivations: clients.value.reduce((sum, client) => sum + (client.totalActivations || 0), 0)
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
                page: pagination.value.page - 1, // API uses 0-based pagination
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

            const response = await clientService.getClients(queryParams)


            clients.value = response.data || []
            
            // Handle different response structures safely
            const meta = response.meta || {}
            const total = meta.total || response.data?.length || 0
            const currentPage = meta.page !== undefined ? meta.page + 1 : pagination.value.page // Convert back to 1-based for UI
            const pageSize = meta.size || meta.limit || pagination.value.limit || 10
            const totalPages = meta.totalPages || Math.ceil(total / pageSize)
            
            pagination.value = {
                total,
                page: currentPage,
                limit: pageSize,
                totalPages
            }
            
            console.log('API Response:', response)
            console.log('Updated pagination:', pagination.value)


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
    const setSorting = (sortConfig) => {
        if (typeof sortConfig === 'object') {
            sortBy.value = sortConfig.field
            sortOrder.value = sortConfig.order || 'desc'
        } else {
            // Backward compatibility
            sortBy.value = sortConfig
            sortOrder.value = arguments[1] || 'desc'
        }
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

    // === CONTACT MANAGEMENT ===
    
    /**
     * Get client contacts
     */
    const getClientContacts = async (clientId, params = {}) => {
        try {
            error.value = null
            const response = await clientService.getClientContacts(clientId, params)
            return response
        } catch (err) {
            error.value = err.message || 'Failed to fetch client contacts'
            throw err
        }
    }

    /**
     * Create client contact
     */
    const createClientContact = async (clientId, contactData) => {
        try {
            error.value = null
            const newContact = await clientService.createClientContact(clientId, contactData)
            return newContact
        } catch (err) {
            error.value = err.message || 'Failed to create client contact'
            throw err
        }
    }

    /**
     * Update client contact
     */
    const updateClientContact = async (clientId, contactId, contactData) => {
        try {
            error.value = null
            const updatedContact = await clientService.updateClientContact(clientId, contactId, contactData)
            return updatedContact
        } catch (err) {
            error.value = err.message || 'Failed to update client contact'
            throw err
        }
    }

    /**
     * Delete client contact
     */
    const deleteClientContact = async (clientId, contactId) => {
        try {
            error.value = null
            await clientService.deleteClientContact(clientId, contactId)
            return true
        } catch (err) {
            error.value = err.message || 'Failed to delete client contact'
            throw err
        }
    }

    /**
     * Set primary contact
     */
    const setPrimaryContact = async (clientId, contactId) => {
        try {
            error.value = null
            const result = await clientService.setPrimaryContact(clientId, contactId)
            
            // Update current client if it matches
            if (currentClient.value?.id === parseInt(clientId)) {
                await getClient(clientId) // Refresh client data to get updated primary contact
            }
            
            return result
        } catch (err) {
            error.value = err.message || 'Failed to set primary contact'
            throw err
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
        clearClientCache,
        
        // Contact management
        getClientContacts,
        createClientContact,
        updateClientContact,
        deleteClientContact,
        setPrimaryContact
    }
})

export default useClientsStore