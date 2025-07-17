// src/services/api.js
// Centralized API service for the Activation Tracking System
// Updated: Contact endpoints now use hardcoded URLs

import axios from 'axios'
import { API_ENDPOINTS, STORAGE_KEYS, ERROR_MESSAGES } from '@/utils/constants'

/**
 * API Client Configuration
 */
class ApiService {
    constructor() {
        this.client = axios.create({
            baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
            timeout: parseInt(import.meta.env.VITE_APP_TIMEOUT) || 30000,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        })

        this.setupInterceptors()
    }

    /**
     * Setup request and response interceptors
     */
    setupInterceptors() {
        // Request interceptor - Add auth token
        this.client.interceptors.request.use(
            (config) => {
                const token = this.getAuthToken()
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`
                }

                // Add request ID for tracking
                config.headers['X-Request-ID'] = this.generateRequestId()

                return config
            },
            (error) => {
                return Promise.reject(this.handleError(error))
            }
        )

        // Response interceptor - Handle common errors
        this.client.interceptors.response.use(
            (response) => {
                return response
            },
            async (error) => {
                // Handle token refresh for 401 errors
                if (error.response?.status === 401 && !error.config._retry) {
                    error.config._retry = true

                    try {
                        await this.refreshToken()
                        const token = this.getAuthToken()
                        error.config.headers.Authorization = `Bearer ${token}`
                        return this.client.request(error.config)
                    } catch (refreshError) {
                        this.logout()
                        return Promise.reject(this.handleError(refreshError))
                    }
                }

                return Promise.reject(this.handleError(error))
            }
        )
    }

    /**
     * Generate unique request ID
     */
    generateRequestId() {
        return Math.random().toString(36).substring(2) + Date.now().toString(36)
    }

    /**
     * Get auth token from storage
     */
    getAuthToken() {
        return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
    }

    /**
     * Get refresh token from storage
     */
    getRefreshToken() {
        return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
    }

    /**
     * Set auth tokens in storage
     */
    setAuthTokens(accessToken, refreshToken) {
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, accessToken)
        if (refreshToken) {
            localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken)
        }
    }

    /**
     * Clear auth tokens from storage
     */
    clearAuthTokens() {
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
    }

    /**
     * Refresh authentication token
     */
    async refreshToken() {
        const refreshToken = this.getRefreshToken()
        if (!refreshToken) {
            throw new Error('No refresh token available')
        }

        const response = await this.client.post(API_ENDPOINTS.REFRESH, {
            refresh_token: refreshToken
        })

        const { access_token, refresh_token: newRefreshToken } = response.data
        this.setAuthTokens(access_token, newRefreshToken)

        return access_token
    }

    /**
     * Logout user and clear tokens
     */
    logout() {
        this.clearAuthTokens()
        // Redirect to login page
        if (typeof window !== 'undefined') {
            window.location.href = '/login'
        }
    }

    /**
     * Handle API errors consistently
     */
    handleError(error) {
        const apiError = {
            message: ERROR_MESSAGES.SERVER_ERROR,
            status: null,
            code: null,
            details: null,
            timestamp: new Date().toISOString()
        }

        if (error.response) {
            // Server responded with error status
            apiError.status = error.response.status
            apiError.details = error.response.data

            switch (error.response.status) {
                case 400:
                    apiError.message = error.response.data?.message || ERROR_MESSAGES.VALIDATION_ERROR
                    break
                case 401:
                    apiError.message = ERROR_MESSAGES.UNAUTHORIZED
                    break
                case 403:
                    apiError.message = ERROR_MESSAGES.FORBIDDEN
                    break
                case 404:
                    apiError.message = ERROR_MESSAGES.NOT_FOUND
                    break
                case 422:
                    apiError.message = ERROR_MESSAGES.VALIDATION_ERROR
                    break
                case 429:
                    apiError.message = 'Too many requests. Please try again later.'
                    break
                case 500:
                default:
                    apiError.message = ERROR_MESSAGES.SERVER_ERROR
            }
        } else if (error.request) {
            // Network error
            apiError.message = ERROR_MESSAGES.NETWORK_ERROR
            apiError.code = 'NETWORK_ERROR'
        } else {
            // Other error
            apiError.message = error.message || 'An unexpected error occurred'
        }

        console.error('API Error:', apiError)
        return apiError
    }

    /**
     * Generic GET request
     */
    async get(url, config = {}) {
        try {
            const response = await this.client.get(url, config)
            return response.data
        } catch (error) {
            throw error
        }
    }

    /**
     * Generic POST request
     */
    async post(url, data = {}, config = {}) {
        try {
            const response = await this.client.post(url, data, config)
            return response.data
        } catch (error) {
            throw error
        }
    }

    /**
     * Generic PUT request
     */
    async put(url, data = {}, config = {}) {
        try {
            const response = await this.client.put(url, data, config)
            return response.data
        } catch (error) {
            throw error
        }
    }

    /**
     * Generic PATCH request
     */
    async patch(url, data = {}, config = {}) {
        try {
            const response = await this.client.patch(url, data, config)
            return response.data
        } catch (error) {
            throw error
        }
    }

    /**
     * Generic DELETE request
     */
    async delete(url, config = {}) {
        try {
            const response = await this.client.delete(url, config)
            return response.data
        } catch (error) {
            throw error
        }
    }

    /**
     * File upload request
     */
    async uploadFile(url, file, onProgress = null, additionalData = {}) {
        try {
            const formData = new FormData()
            formData.append('file', file)

            // Add any additional data
            Object.keys(additionalData).forEach(key => {
                formData.append(key, additionalData[key])
            })

            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }

            if (onProgress) {
                config.onUploadProgress = (progressEvent) => {
                    const percentCompleted = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    )
                    onProgress(percentCompleted)
                }
            }

            const response = await this.client.post(url, formData, config)
            return response.data
        } catch (error) {
            throw error
        }
    }

    /**
     * Download file request
     */
    async downloadFile(url, filename = null) {
        try {
            const response = await this.client.get(url, {
                responseType: 'blob'
            })

            // Create download link
            const blob = new Blob([response.data])
            const downloadUrl = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = downloadUrl

            // Set filename from response header or parameter
            const contentDisposition = response.headers['content-disposition']
            if (contentDisposition && !filename) {
                const filenameMatch = contentDisposition.match(/filename="(.+)"/)
                filename = filenameMatch ? filenameMatch[1] : 'download'
            }

            link.download = filename || 'download'
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(downloadUrl)

            return true
        } catch (error) {
            throw error
        }
    }

    /**
     * Paginated GET request
     */
    async getPaginated(url, params = {}) {
        try {
            const defaultParams = {
                page: 0,
                size: 10,
                sort: ['companyName,asc']
            }

            const queryParams = { ...defaultParams, ...params }
            const response = await this.client.get(url, { params: queryParams })

            // Handle different response structures
            let data, meta
            
            if (response.data.content) {
                // Spring Boot pagination response
                data = response.data.content
                meta = {
                    total: response.data.page.totalElements,
                    page: response.data.page.number,
                    size: response.data.page.size,
                    totalPages: response.data.page.totalPages
                }
            } else if (response.data.data) {
                // Custom pagination response
                data = response.data.data
                meta = response.data.meta || {
                    total: response.data.total || data.length,
                    page: queryParams.page,
                    size: queryParams.size
                }
            } else {
                // Direct array response
                data = Array.isArray(response.data) ? response.data : [response.data]
                meta = {
                    total: data.length,
                    page: queryParams.page,
                    size: queryParams.size
                }
            }


            return { data, meta }
        } catch (error) {
            throw error
        }
    }

    /**
     * Batch requests
     */
    async batch(requests) {
        try {
            const promises = requests.map(request => {
                const { method, url, data, config } = request
                return this.client[method](url, data, config)
            })

            const responses = await Promise.allSettled(promises)

            return responses.map((response, index) => ({
                success: response.status === 'fulfilled',
                data: response.status === 'fulfilled' ? response.value.data : null,
                error: response.status === 'rejected' ? this.handleError(response.reason) : null,
                request: requests[index]
            }))
        } catch (error) {
            throw error
        }
    }

    /**
     * Health check
     */
    async healthCheck() {
        try {
            const response = await this.client.get('/health')
            return response.data
        } catch (error) {
            return {
                status: 'error',
                message: 'API is not accessible',
                timestamp: new Date().toISOString()
            }
        }
    }
}

// Create singleton instance
const apiService = new ApiService()

/**
 * Authentication Service
 */
 const authService = {
    async login(credentials) {
        const response = await apiService.post(API_ENDPOINTS.LOGIN, credentials)
        if (response.access_token) {
            apiService.setAuthTokens(response.access_token, response.refresh_token)
        }
        return response
    },

    async logout() {
        try {
            await apiService.post(API_ENDPOINTS.LOGOUT)
        } catch (error) {
            console.warn('Logout API call failed:', error)
        } finally {
            apiService.clearAuthTokens()
        }
    },

    async register(userData) {
        return await apiService.post('/auth/register', userData)
    },

    async forgotPassword(email) {
        return await apiService.post(API_ENDPOINTS.FORGOT_PASSWORD, { email })
    },

    async resetPassword(token, newPassword) {
        return await apiService.post(API_ENDPOINTS.RESET_PASSWORD, {
            token,
            password: newPassword
        })
    },

    async verifyEmail(token) {
        return await apiService.post(API_ENDPOINTS.VERIFY_EMAIL, { token })
    },

    async getCurrentUser() {
        return await apiService.get(API_ENDPOINTS.USER_PROFILE)
    },

    async updateProfile(userData) {
        return await apiService.put(API_ENDPOINTS.UPDATE_PROFILE, userData)
    },

    async uploadProfilePicture(userId, formData) {
        const userIdPath = userId === 'current' ? 'current' : userId
        return await apiService.post(`/users/${userIdPath}/profile-picture`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
    },

    async deleteProfilePicture(userId) {
        const userIdPath = userId === 'current' ? 'current' : userId
        return await apiService.delete(`/users/${userIdPath}/profile-picture`)
    }
}

/**
 * Promoter Management Service
 */
 const promoterService = {
    async getPromoters(params = {}) {
        return await apiService.getPaginated('/promoters', params)
    },

    async getPromoter(id) {
        return await apiService.get(`/promoters/${id}`)
    },

    async createPromoter(promoterData) {
        return await apiService.post('/promoters/with-user', promoterData)
    },

    async updatePromoter(id, promoterData) {
        return await apiService.put(`/promoters/${id}`, promoterData)
    },

    async deletePromoter(id) {
        return await apiService.delete(`/promoters/${id}`)
    },

    async activatePromoter(id) {
        return await apiService.patch(`/promoters/${id}/activate`)
    },

    async deactivatePromoter(id) {
        return await apiService.patch(`/promoters/${id}/deactivate`)
    },

    async getPromoterAssignments(promoterId, params = {}) {
        return await apiService.getPaginated(`/promoters/${promoterId}/assignments`, params)
    },

    async assignToActivation(promoterId, activationId, assignmentData) {
        return await apiService.post(`/promoters/${promoterId}/assignments`, {
            activationId,
            ...assignmentData
        })
    },

    async getPromoterPerformance(promoterId, params = {}) {
        return await apiService.get(`/promoters/${promoterId}/performance`, { params })
    },

    async updatePromoterLocation(promoterId, locationData) {
        return await apiService.patch(`/promoters/${promoterId}/location`, locationData)
    }
}

/**
 * User Management Service
 */
 const userService = {
    async getUsers(params = {}) {
        return await apiService.getPaginated(API_ENDPOINTS.USERS, params)
    },

    async getUser(id) {
        return await apiService.get(`${API_ENDPOINTS.USERS}/${id}`)
    },

    async createUser(userData) {
        return await apiService.post(API_ENDPOINTS.USERS, userData)
    },

    async createStaffUser(userData) {
        return await apiService.post('/staff/with-user', userData)
    },

    async updateUser(id, userData) {
        return await apiService.put(`${API_ENDPOINTS.USERS}/${id}`, userData)
    },

    async deleteUser(id) {
        return await apiService.delete(`${API_ENDPOINTS.USERS}/${id}`)
    },

    async assignRole(userId, role) {
        return await apiService.patch(`${API_ENDPOINTS.USERS}/${userId}/role`, { role })
    },

    async deactivateUser(id) {
        return await apiService.patch(`${API_ENDPOINTS.USERS}/${id}/deactivate`)
    },

    async activateUser(id) {
        return await apiService.patch(`${API_ENDPOINTS.USERS}/${id}/activate`)
    },

    async resetPassword(userId) {
        return await apiService.post(`${API_ENDPOINTS.USERS}/${userId}/reset-password`)
    },

    async updatePassword(userId, passwordData) {
        return await apiService.patch(`${API_ENDPOINTS.USERS}/${userId}/password`, passwordData)
    },

    async getUsersByRole(role, params = {}) {
        const queryParams = { role, ...params }
        return await apiService.get('/users/by-role', { params: queryParams })
    }
}

/**
 * Client Management Service
 */
 const clientService = {
    async getClients(params = {}) {
        return await apiService.getPaginated(API_ENDPOINTS.CLIENTS, params)
    },

    async getClient(id) {
        return await apiService.get(`${API_ENDPOINTS.CLIENTS}/${id}`)
    },

    async createClient(clientData) {
        return await apiService.post(API_ENDPOINTS.CLIENTS, clientData)
    },

    async createClientWithAccountOwner(clientData) {
        return await apiService.post('/clients/with-account-owner', clientData)
    },

    async updateClient(id, clientData) {
        return await apiService.put(`${API_ENDPOINTS.CLIENTS}/${id}`, clientData)
    },

    async deleteClient(id) {
        return await apiService.delete(`${API_ENDPOINTS.CLIENTS}/${id}`)
    },

    async getClientActivations(clientId, params = {}) {
        const url = API_ENDPOINTS.CLIENT_ACTIVATIONS.replace(':id', clientId)
        return await apiService.getPaginated(url, params)
    },

    async getClientReports(clientId, params = {}) {
        return await apiService.getPaginated(`${API_ENDPOINTS.CLIENTS}/${clientId}/reports`, params)
    },

    // Contact management
    async getClientContacts(clientId, params = {}) {
        // Direct hardcoded endpoint to bypass any import issues
        const url = `/contacts/by-client/${clientId}`
        console.log('getClientContacts using hardcoded url:', url)
        return await apiService.getPaginated(url, params)
    },

    async createClientContact(clientId, contactData) {
        // Add clientId to the contact data for the backend
        const dataWithClientId = { ...contactData, clientId }
        const url = '/contacts'
        console.log('createClientContact using hardcoded url:', url)
        return await apiService.post(url, dataWithClientId)
    },

    async updateClientContact(clientId, contactId, contactData) {
        const dataWithClientId = { ...contactData, clientId }
        const url = `/contacts/${contactId}`
        console.log('updateClientContact using hardcoded url:', url)
        return await apiService.put(url, dataWithClientId)
    },

    async deleteClientContact(clientId, contactId) {
        const url = `/contacts/${contactId}`
        console.log('deleteClientContact using hardcoded url:', url)
        return await apiService.delete(url)
    },

    async setPrimaryContact(clientId, contactId) {
        const url = `/contacts/${contactId}/set-primary`
        console.log('setPrimaryContact using hardcoded url:', url)
        return await apiService.post(url, {})
    },

    async getPrimaryContact(clientId) {
        const url = `/contacts/primary/${clientId}`
        console.log('getPrimaryContact using hardcoded url:', url)
        return await apiService.get(url)
    },

    async searchClientContacts(clientId, searchTerm, params = {}) {
        const url = `/contacts/search/${clientId}`
        console.log('searchClientContacts using hardcoded url:', url)
        return await apiService.getPaginated(url, { ...params, search: searchTerm })
    }
}

/**
 * Activation Management Service
 */
 const activationService = {
    async getActivations(params = {}) {
        return await apiService.getPaginated(API_ENDPOINTS.ACTIVATIONS, params)
    },

    async getActivation(id) {
        const url = API_ENDPOINTS.ACTIVATION_DETAILS.replace(':id', id)
        return await apiService.get(url)
    },

    async createActivation(activationData) {
        return await apiService.post(API_ENDPOINTS.ACTIVATIONS, activationData)
    },

    async createActivationWithDocument(activationData, briefDocument = null) {
        const formData = new FormData()
        
        // Add activation data as JSON string
        formData.append('activation', JSON.stringify(activationData))
        
        // Add brief document if provided
        if (briefDocument) {
            formData.append('briefDocument', briefDocument)
        }
        
        return await apiService.post('/activations/with-document', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
    },

    async updateActivation(id, activationData) {
        return await apiService.put(`${API_ENDPOINTS.ACTIVATIONS}/${id}`, activationData)
    },

    async deleteActivation(id) {
        return await apiService.delete(`${API_ENDPOINTS.ACTIVATIONS}/${id}`)
    },

    async uploadBrief(activationId, file, onProgress) {
        const url = API_ENDPOINTS.ACTIVATION_BRIEF.replace(':id', activationId)
        return await apiService.uploadFile(url, file, onProgress)
    },

    async assignTeam(activationId, teamData) {
        const url = API_ENDPOINTS.ACTIVATION_TEAM.replace(':id', activationId)
        return await apiService.post(url, teamData)
    },

    async updateTeam(activationId, teamData) {
        const url = API_ENDPOINTS.ACTIVATION_TEAM.replace(':id', activationId)
        return await apiService.put(url, teamData)
    },

    async getActivationReports(activationId, params = {}) {
        const url = API_ENDPOINTS.ACTIVATION_REPORTS.replace(':id', activationId)
        return await apiService.getPaginated(url, params)
    },

    async updateStatus(id, status) {
        return await apiService.patch(`${API_ENDPOINTS.ACTIVATIONS}/${id}/status`, { status })
    },

    async checkinPromoter(activationId, promoterId, location) {
        return await apiService.post(`${API_ENDPOINTS.ACTIVATIONS}/${activationId}/checkin`, {
            promoter_id: promoterId,
            location
        })
    },

    async checkoutPromoter(activationId, promoterId) {
        return await apiService.post(`${API_ENDPOINTS.ACTIVATIONS}/${activationId}/checkout`, {
            promoter_id: promoterId
        })
    },

    async recordSales(activationId, salesData) {
        return await apiService.post(`${API_ENDPOINTS.ACTIVATIONS}/${activationId}/sales`, salesData)
    },

    async recordCustomerData(activationId, customerData) {
        return await apiService.post(`${API_ENDPOINTS.ACTIVATIONS}/${activationId}/customers`, customerData)
    }
}

/**
 * Inventory/Warehouse Service
 */
 const inventoryService = {
    async getInventory(params = {}) {
        return await apiService.getPaginated(API_ENDPOINTS.INVENTORY, params)
    },

    async getInventoryItem(id) {
        return await apiService.get(`${API_ENDPOINTS.INVENTORY}/${id}`)
    },

    async createInventoryItem(itemData) {
        return await apiService.post(API_ENDPOINTS.INVENTORY, itemData)
    },

    async updateInventoryItem(id, itemData) {
        return await apiService.put(`${API_ENDPOINTS.INVENTORY}/${id}`, itemData)
    },

    async deleteInventoryItem(id) {
        return await apiService.delete(`${API_ENDPOINTS.INVENTORY}/${id}`)
    },

    async allocateStock(allocationData) {
        return await apiService.post(API_ENDPOINTS.STOCK_ALLOCATION, allocationData)
    },

    async getStockMovements(params = {}) {
        return await apiService.getPaginated(API_ENDPOINTS.STOCK_MOVEMENTS, params)
    },

    async updateStock(itemId, quantity, type = 'adjustment', notes = '') {
        return await apiService.post(`${API_ENDPOINTS.INVENTORY}/${itemId}/movements`, {
            quantity,
            type,
            notes
        })
    },

    async getLowStockAlerts() {
        return await apiService.get(`${API_ENDPOINTS.INVENTORY}/alerts/low-stock`)
    }
}

/**
 * Warehouse Service
 */
const warehouseService = {
    async getWarehouses(params = {}) {
        return await apiService.getPaginated(API_ENDPOINTS.WAREHOUSES, params)
    },

    async getWarehouse(id) {
        return await apiService.get(`${API_ENDPOINTS.WAREHOUSES}/${id}`)
    },

    async createWarehouse(warehouseData) {
        return await apiService.post(API_ENDPOINTS.WAREHOUSES, warehouseData)
    },

    async updateWarehouse(id, warehouseData) {
        return await apiService.put(`${API_ENDPOINTS.WAREHOUSES}/${id}`, warehouseData)
    },

    async deleteWarehouse(id) {
        return await apiService.delete(`${API_ENDPOINTS.WAREHOUSES}/${id}`)
    },

    async getWarehouseInventory(warehouseId, params = {}) {
        return await apiService.getPaginated(`${API_ENDPOINTS.WAREHOUSES}/${warehouseId}/inventory`, params)
    },

    async getWarehouseStats(warehouseId) {
        return await apiService.get(`${API_ENDPOINTS.WAREHOUSES}/${warehouseId}/stats`)
    },

    async getWarehouseReports(warehouseId, params = {}) {
        return await apiService.getPaginated(`${API_ENDPOINTS.WAREHOUSES}/${warehouseId}/reports`, params)
    },

    async transferStock(transferData) {
        return await apiService.post(`${API_ENDPOINTS.WAREHOUSES}/transfers`, transferData)
    },

    async getStockTransfers(params = {}) {
        return await apiService.getPaginated(`${API_ENDPOINTS.WAREHOUSES}/transfers`, params)
    },

    async updateWarehouseCapacity(warehouseId, capacityData) {
        return await apiService.put(`${API_ENDPOINTS.WAREHOUSES}/${warehouseId}/capacity`, capacityData)
    },

    async getWarehouseManagers() {
        return await apiService.get('/users', { params: { role: 'WAREHOUSE_MANAGER' } })
    },

    async getWarehouseStocks(warehouseId) {
        return await apiService.get(`/stocks/warehouse/${warehouseId}`)
    },

    async createWarehouseStock(warehouseId, stockData) {
        return await apiService.post('/stocks', stockData)
    }
}

/**
 * Reports Service
 */
 const reportService = {
    async getReports(params = {}) {
        return await apiService.getPaginated(API_ENDPOINTS.REPORTS, params)
    },

    async generateReport(reportConfig) {
        return await apiService.post(API_ENDPOINTS.GENERATE_REPORT, reportConfig)
    },

    async getReport(id) {
        return await apiService.get(`${API_ENDPOINTS.REPORTS}/${id}`)
    },

    async downloadReport(id, format = 'pdf') {
        const url = API_ENDPOINTS.DOWNLOAD_REPORT.replace(':id', id)
        return await apiService.downloadFile(`${url}?format=${format}`)
    },

    async deleteReport(id) {
        return await apiService.delete(`${API_ENDPOINTS.REPORTS}/${id}`)
    },

    async getAnalytics(type, params = {}) {
        return await apiService.get(`/analytics/${type}`, { params })
    },

    async getDashboardStats(params = {}) {
        return await apiService.get('/analytics/dashboard', { params })
    }
}

/**
 * File Management Service
 */
 const fileService = {
    async uploadFile(file, onProgress, metadata = {}) {
        return await apiService.uploadFile(API_ENDPOINTS.UPLOAD_FILE, file, onProgress, metadata)
    },

    async deleteFile(id) {
        const url = API_ENDPOINTS.DELETE_FILE.replace(':id', id)
        return await apiService.delete(url)
    },

    async getFileUrl(filePath) {
        // Handle both file IDs and file paths
        let endpoint = '';
        
        if (filePath.startsWith('/') || filePath.includes('/')) {
            // File path format (e.g., '/briefs/document.pdf')
            endpoint = `/files/url?path=${encodeURIComponent(filePath)}`;
        } else {
            // File ID format 
            endpoint = `/files/${filePath}/url`;
        }
        
        const response = await apiService.get(endpoint);
        
        // Handle different response formats
        if (response.data && response.data.url) {
            return response.data;
        } else if (response.url) {
            return response;
        } else if (typeof response === 'string') {
            // Direct S3 URL response
            return { url: response };
        }
        
        throw new Error('Invalid file URL response format');
    },

    async getS3FileUrl(filePath) {
        // Direct S3 URL construction using environment variable
        try {
            const s3BucketUrl = import.meta.env.VITE_AWS_S3_BUCKET;
            
            if (!s3BucketUrl) {
                throw new Error('S3 bucket URL not configured. Please set VITE_AWS_S3_BUCKET environment variable.');
            }
            
            // Clean the file path (remove leading slash if present)
            let cleanPath = filePath;
            if (cleanPath.startsWith('/')) {
                cleanPath = cleanPath.substring(1);
            }
            
            // Construct direct S3 URL
            const s3Url = s3BucketUrl.endsWith('/') 
                ? `${s3BucketUrl}${cleanPath}`
                : `${s3BucketUrl}/${cleanPath}`;
            
            console.log('Constructed S3 URL:', s3Url);
            return s3Url;
            
        } catch (error) {
            console.error('Failed to construct S3 URL:', error);
            
            // Fallback to API endpoint if direct S3 construction fails
            try {
                console.log('Falling back to API endpoint for S3 URL...');
                const response = await apiService.get(`/files/s3-url?path=${encodeURIComponent(filePath)}`);
                
                // Return S3 signed URL from API
                if (response.data && response.data.signedUrl) {
                    return response.data.signedUrl;
                } else if (response.signedUrl) {
                    return response.signedUrl;
                } else if (typeof response === 'string' && response.includes('amazonaws.com')) {
                    return response;
                }
                
                throw new Error('No valid S3 URL returned from API');
            } catch (apiError) {
                console.error('API fallback also failed:', apiError);
                throw new Error('Failed to access file from S3 bucket');
            }
        }
    },

    getDirectS3Url(filePath) {
        // Synchronous direct S3 URL construction for immediate use
        const s3BucketUrl = import.meta.env.VITE_AWS_S3_BUCKET;
        
        if (!s3BucketUrl) {
            console.warn('S3 bucket URL not configured');
            return null;
        }
        
        // Clean the file path
        let cleanPath = filePath;
        if (cleanPath.startsWith('/')) {
            cleanPath = cleanPath.substring(1);
        }
        
        // Construct and return direct S3 URL
        const s3Url = s3BucketUrl.endsWith('/') 
            ? `${s3BucketUrl}${cleanPath}`
            : `${s3BucketUrl}/${cleanPath}`;
            
        return s3Url;
    }
}

/**
 * Notification Service
 */
 const notificationService = {
    async getNotifications(params = {}) {
        return await apiService.getPaginated('/notifications', params)
    },

    async markAsRead(id) {
        return await apiService.patch(`/notifications/${id}/read`)
    },

    async markAllAsRead() {
        return await apiService.patch('/notifications/read-all')
    },

    async deleteNotification(id) {
        return await apiService.delete(`/notifications/${id}`)
    },

    async getUnreadCount() {
        return await apiService.get('/notifications/unread-count')
    }
}

/**
 * Settings Service
 */
 const settingsService = {
    async getSettings() {
        return await apiService.get('/settings')
    },

    async updateSettings(settings) {
        return await apiService.put('/settings', settings)
    },

    async getSystemInfo() {
        return await apiService.get('/system/info')
    }
}

// Export the main API service instance and all specialized services
export default apiService

export {
    apiService,
    authService,
    promoterService,
    userService,
    clientService,
    activationService,
    inventoryService,
    warehouseService,
    reportService,
    fileService,
    notificationService,
    settingsService
}