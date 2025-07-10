// src/services/api.js
// Centralized API service for the Activation Tracking System

import axios from 'axios'
import { API_ENDPOINTS, STORAGE_KEYS, ERROR_MESSAGES } from '@/utils/constants'

/**
 * API Client Configuration
 */
class ApiService {
    constructor() {
        this.client = axios.create({
            baseURL:  'http://localhost:8080/api',
            timeout: 30000, // 30 seconds
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
                page: 1,
                limit: 10,
                sort: 'created_at',
                order: 'desc'
            }

            const queryParams = { ...defaultParams, ...params }
            const response = await this.client.get(url, { params: queryParams })

            return {
                data: response.data.data || response.data,
                meta: response.data.meta || {
                    total: response.data.length,
                    page: queryParams.page,
                    limit: queryParams.limit
                }
            }
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

    async getFileUrl(id) {
        return await apiService.get(`/files/${id}/url`)
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
    userService,
    clientService,
    activationService,
    inventoryService,
    reportService,
    fileService,
    notificationService,
    settingsService
}