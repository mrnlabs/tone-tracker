import api from './api'

class LeadService {
    /**
     * Create a new lead
     * @param {Object} leadData - Lead information
     * @returns {Promise} Created lead data
     */
    async createLead(leadData) {
        try {
            const response = await api.post('/leads', leadData)
            // API service already returns response.data, so just return response
            return response
        } catch (error) {
            console.error('Error creating lead:', error)
            throw error
        }
    }

    /**
     * Get all leads with pagination
     * @param {Object} params - Query parameters (page, size, sort)
     * @returns {Promise} Paginated leads data
     */
    async getLeads(params = {}) {
        try {
            const response = await api.get('/leads', { params })
            return response
        } catch (error) {
            console.error('Error fetching leads:', error)
            throw error
        }
    }

    /**
     * Search leads by term
     * @param {string} searchTerm - Search term
     * @param {Object} params - Additional query parameters
     * @returns {Promise} Search results
     */
    async searchLeads(searchTerm, params = {}) {
        try {
            const response = await api.get('/leads/search', {
                params: { searchTerm, ...params }
            })
            return response
        } catch (error) {
            console.error('Error searching leads:', error)
            throw error
        }
    }

    /**
     * Get leads by activation ID with role-based access
     * @param {number} activationId - Activation ID
     * @param {Object} params - Query parameters
     * @param {string} userRole - Current user role for role-based access
     * @param {number} userId - Current user ID for promoter-specific access
     * @returns {Promise} Leads for specific activation
     */
    async getLeadsByActivation(activationId, params = {}, userRole = null, userId = null) {
        console.log('LeadService: Fetching leads for activation:', activationId, 'with params:', params, 'role:', userRole)
        
        // For promoters, try alternative endpoints
        if (userRole === 'PROMOTER') {
            return await this.getLeadsForPromoter(activationId, params, userId)
        }
        
        // For other roles, use direct access
        try {
            const response = await api.get(`/leads/activation/${activationId}`, { params })
            console.log('LeadService: Raw API response:', response)
            return response
        } catch (error) {
            console.error('LeadService: Error fetching leads by activation:', error)
            console.error('LeadService: Error status:', error.status)
            console.error('LeadService: Error details:', error.details)
            
            // Check if it's a permission error
            if (error.status === 403 || error.status === 401) {
                console.log('LeadService: Permission error detected for leads endpoint')
                return {
                    content: [],
                    totalElements: 0,
                    page: {
                        number: 0,
                        size: params.size || 10,
                        totalPages: 0
                    }
                }
            }
            
            throw error
        }
    }

    /**
     * Get leads for promoter with new backend endpoints
     * @param {number} activationId - Activation ID
     * @param {Object} params - Query parameters
     * @param {number} userId - Promoter user ID
     * @returns {Promise} Leads accessible to promoter
     */
    async getLeadsForPromoter(activationId, params = {}, userId = null) {
        console.log('LeadService: Attempting promoter-specific lead access for activation:', activationId)
        
        // Try 1: New promoter activation-specific endpoint
        try {
            const response = await api.get(`/leads/my-activations/${activationId}`, { params })
            console.log('LeadService: Successfully fetched via /leads/my-activations/{activationId}')
            return response
        } catch (activationError) {
            console.log('LeadService: Failed to fetch via /leads/my-activations/{activationId}:', activationError)
        }
        
        // Try 2: Fallback to user-specific leads endpoint with activation filter
        try {
            const response = await api.get(`/users/current/leads`, { params: { ...params, activationId } })
            console.log('LeadService: Successfully fetched via /users/current/leads')
            return response
        } catch (currentUserError) {
            console.log('LeadService: Failed to fetch via /users/current/leads:', currentUserError)
        }
        
        // Fallback: Return empty structure
        console.log('LeadService: All lead endpoints failed for promoter, returning empty structure')
        
        return {
            content: [],
            totalElements: 0,
            page: {
                number: 0,
                size: params.size || 10,
                totalPages: 0
            }
        }
    }

    /**
     * Get opted-in leads
     * @param {Object} params - Query parameters
     * @returns {Promise} Opted-in leads data
     */
    async getOptedInLeads(params = {}) {
        try {
            const response = await api.get('/leads/opted-in', { params })
            return response
        } catch (error) {
            console.error('Error fetching opted-in leads:', error)
            throw error
        }
    }

    /**
     * Get WhatsApp opted-in leads
     * @param {Object} params - Query parameters
     * @returns {Promise} WhatsApp opted-in leads data
     */
    async getWhatsAppOptedInLeads(params = {}) {
        try {
            const response = await api.get('/leads/whatsapp-opted-in', { params })
            return response
        } catch (error) {
            console.error('Error fetching WhatsApp opted-in leads:', error)
            throw error
        }
    }

    /**
     * Get lead by ID
     * @param {number} leadId - Lead ID
     * @returns {Promise} Lead data
     */
    async getLeadById(leadId) {
        try {
            const response = await api.get(`/leads/${leadId}`)
            return response
        } catch (error) {
            console.error('Error fetching lead:', error)
            throw error
        }
    }

    /**
     * Update lead
     * @param {number} leadId - Lead ID
     * @param {Object} leadData - Updated lead data
     * @returns {Promise} Updated lead data
     */
    async updateLead(leadId, leadData) {
        try {
            const response = await api.put(`/leads/${leadId}`, leadData)
            return response
        } catch (error) {
            console.error('Error updating lead:', error)
            throw error
        }
    }

    /**
     * Delete lead
     * @param {number} leadId - Lead ID
     * @returns {Promise} Success response
     */
    async deleteLead(leadId) {
        try {
            const response = await api.delete(`/leads/${leadId}`)
            return response
        } catch (error) {
            console.error('Error deleting lead:', error)
            throw error
        }
    }

    /**
     * Export leads to CSV/Excel
     * @param {Object} params - Export parameters
     * @param {string} format - Export format (csv, xlsx)
     * @returns {Promise} File blob
     */
    async exportLeads(params = {}, format = 'csv') {
        try {
            const response = await api.get('/leads/export', {
                params: { ...params, format },
                responseType: 'blob'
            })
            return response
        } catch (error) {
            console.error('Error exporting leads:', error)
            throw error
        }
    }

    /**
     * Export leads for specific activation
     * @param {number} activationId - Activation ID
     * @param {string} format - Export format (csv, xlsx)
     * @returns {Promise} File blob
     */
    async exportActivationLeads(activationId, format = 'csv') {
        try {
            const response = await api.get(`/leads/export/activation/${activationId}`, {
                params: { format },
                responseType: 'blob'
            })
            return response
        } catch (error) {
            console.error('Error exporting activation leads:', error)
            throw error
        }
    }

    /**
     * Download exported file
     * @param {Blob} blob - File blob
     * @param {string} filename - Filename for download
     */
    downloadExportFile(blob, filename) {
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
    }

    /**
     * Get all leads for current promoter across all activations
     * @param {Object} params - Query parameters (page, size, sort)
     * @returns {Promise} All promoter leads data
     */
    async getMyActivationLeads(params = {}) {
        try {
            const response = await api.get('/leads/my-activations', { params })
            console.log('LeadService: Successfully fetched all promoter leads via /leads/my-activations')
            return response
        } catch (error) {
            console.error('Error fetching promoter leads:', error)
            // Fallback to user current leads
            try {
                const fallbackResponse = await api.get('/users/current/leads', { params })
                console.log('LeadService: Fallback to /users/current/leads successful')
                return fallbackResponse
            } catch (fallbackError) {
                console.error('Error with fallback endpoint:', fallbackError)
                throw error
            }
        }
    }

    /**
     * Get lead statistics
     * @param {Object} params - Filter parameters
     * @returns {Promise} Lead statistics
     */
    async getLeadStatistics(params = {}) {
        try {
            const response = await api.get('/leads/statistics', { params })
            return response
        } catch (error) {
            console.error('Error fetching lead statistics:', error)
            throw error
        }
    }

    /**
     * Validate lead data before submission
     * @param {Object} leadData - Lead data to validate
     * @returns {Object} Validation result
     */
    validateLeadData(leadData) {
        const errors = {}

        // Required fields
        if (!leadData.name || leadData.name.trim().length === 0) {
            errors.name = 'First name is required'
        } else if (leadData.name.length > 100) {
            errors.name = 'First name must be 100 characters or less'
        }

        if (!leadData.surname || leadData.surname.trim().length === 0) {
            errors.surname = 'Last name is required'
        } else if (leadData.surname.length > 100) {
            errors.surname = 'Last name must be 100 characters or less'
        }

        if (!leadData.phone || leadData.phone.trim().length === 0) {
            errors.phone = 'Phone number is required'
        } else if (leadData.phone.length < 7 || leadData.phone.length > 20) {
            errors.phone = 'Phone number must be between 7-20 characters'
        }

        if (!leadData.email || leadData.email.trim().length === 0) {
            errors.email = 'Email is required'
        } else if (leadData.email.length > 150) {
            errors.email = 'Email must be 150 characters or less'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(leadData.email)) {
            errors.email = 'Please enter a valid email address'
        }

        // Optional field validations
        if (leadData.address && leadData.address.length > 500) {
            errors.address = 'Address must be 500 characters or less'
        }

        if (leadData.customerFeedback && leadData.customerFeedback.length > 2000) {
            errors.customerFeedback = 'Customer feedback must be 2000 characters or less'
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        }
    }

    /**
     * Format lead data for display
     * @param {Object} lead - Raw lead data
     * @returns {Object} Formatted lead data
     */
    formatLeadForDisplay(lead) {
        return {
            ...lead,
            fullName: `${lead.name} ${lead.surname}`,
            formattedPhone: this.formatPhoneNumber(lead.phone),
            genderLabel: this.getGenderLabel(lead.customerGender),
            ageGroupLabel: this.getAgeGroupLabel(lead.ageGroup),
            customerTypeLabel: this.getCustomerTypeLabel(lead.customerType),
            repeatPurchaseLabel: this.getRepeatPurchaseLabel(lead.repeatPurchaseIntent)
        }
    }

    /**
     * Format phone number for display
     * @param {string} phone - Raw phone number
     * @returns {string} Formatted phone number
     */
    formatPhoneNumber(phone) {
        if (!phone) return ''
        // Simple formatting - can be enhanced based on requirements
        return phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')
    }

    /**
     * Get display label for gender
     * @param {string} gender - Gender enum value
     * @returns {string} Display label
     */
    getGenderLabel(gender) {
        const labels = {
            'MALE': 'Male',
            'FEMALE': 'Female',
            'OTHER': 'Other'
        }
        return labels[gender] || gender
    }

    /**
     * Get display label for age group
     * @param {string} ageGroup - Age group enum value
     * @returns {string} Display label
     */
    getAgeGroupLabel(ageGroup) {
        const labels = {
            'UNDER_18': 'Under 18',
            'BETWEEN_18_25': '18-25',
            'BETWEEN_26_35': '26-35',
            'BETWEEN_36_45': '36-45',
            'BETWEEN_46_55': '46-55',
            'OVER_55': 'Over 55'
        }
        return labels[ageGroup] || ageGroup
    }

    /**
     * Get display label for customer type
     * @param {string} customerType - Customer type enum value
     * @returns {string} Display label
     */
    getCustomerTypeLabel(customerType) {
        const labels = {
            'SHOPPER': 'Shopper',
            'RETAILER': 'Retailer',
            'DISTRIBUTOR': 'Distributor'
        }
        return labels[customerType] || customerType
    }

    /**
     * Get display label for repeat purchase intent
     * @param {string} intent - Repeat purchase intent enum value
     * @returns {string} Display label
     */
    getRepeatPurchaseLabel(intent) {
        const labels = {
            'YES': 'Yes',
            'NO': 'No',
            'MAYBE': 'Maybe'
        }
        return labels[intent] || intent
    }

    // =================== PROMOTER LEAD COMMENTING SYSTEM ===================

    /**
     * Add or update promoter comments on a lead
     * @param {number} leadId - Lead ID
     * @param {Object} commentData - Promoter comment data
     * @returns {Promise} Updated lead data
     */
    async addPromoterComment(leadId, commentData) {
        try {
            const response = await api.post(`/leads/${leadId}/add-promoter-comment`, commentData)
            return response
        } catch (error) {
            console.error('Error adding promoter comment:', error)
            throw error
        }
    }

    /**
     * Get leads requiring follow-up for current promoter
     * @param {Object} params - Query parameters
     * @returns {Promise} Follow-up leads data
     */
    async getMyFollowUpLeads(params = {}) {
        try {
            const response = await api.get('/leads/my-follow-ups', { params })
            return response
        } catch (error) {
            console.error('Error fetching follow-up leads:', error)
            throw error
        }
    }

    /**
     * Get all leads requiring follow-up (for managers)
     * @param {Object} params - Query parameters
     * @returns {Promise} Follow-up leads data
     */
    async getFollowUpRequiredLeads(params = {}) {
        try {
            const response = await api.get('/leads/follow-up-required', { params })
            return response
        } catch (error) {
            console.error('Error fetching follow-up required leads:', error)
            throw error
        }
    }

    /**
     * Get leads with high purchase intent
     * @param {number} minIntentLevel - Minimum intent level (default: 4)
     * @param {Object} params - Additional query parameters
     * @returns {Promise} High intent leads data
     */
    async getHighPurchaseIntentLeads(minIntentLevel = 4, params = {}) {
        try {
            const response = await api.get('/leads/high-purchase-intent', {
                params: { minIntentLevel, ...params }
            })
            return response
        } catch (error) {
            console.error('Error fetching high purchase intent leads:', error)
            throw error
        }
    }

    /**
     * Get leads with low brand awareness
     * @param {number} maxAwarenessLevel - Maximum awareness level (default: 2)
     * @param {Object} params - Additional query parameters
     * @returns {Promise} Low awareness leads data
     */
    async getLowBrandAwarenessLeads(maxAwarenessLevel = 2, params = {}) {
        try {
            const response = await api.get('/leads/low-brand-awareness', {
                params: { maxAwarenessLevel, ...params }
            })
            return response
        } catch (error) {
            console.error('Error fetching low brand awareness leads:', error)
            throw error
        }
    }

    /**
     * Get leads mentioning competitors
     * @param {Object} params - Query parameters
     * @returns {Promise} Competitor mentions leads data
     */
    async getCompetitorMentionLeads(params = {}) {
        try {
            const response = await api.get('/leads/competitor-mentions', { params })
            return response
        } catch (error) {
            console.error('Error fetching competitor mention leads:', error)
            throw error
        }
    }

    /**
     * Get leads with high engagement quality
     * @param {number} minEngagementQuality - Minimum engagement quality (default: 4)
     * @param {Object} params - Additional query parameters
     * @returns {Promise} High engagement leads data
     */
    async getHighEngagementLeads(minEngagementQuality = 4, params = {}) {
        try {
            const response = await api.get('/leads/high-engagement', {
                params: { minEngagementQuality, ...params }
            })
            return response
        } catch (error) {
            console.error('Error fetching high engagement leads:', error)
            throw error
        }
    }

    /**
     * Get label for brand awareness level
     * @param {number} level - Brand awareness level (1-5)
     * @returns {string} Display label
     */
    getBrandAwarenessLevelLabel(level) {
        const labels = {
            1: 'Never heard of brand',
            2: 'Heard of brand',
            3: 'Familiar with brand',
            4: 'Very familiar with brand',
            5: 'Brand enthusiast'
        }
        return labels[level] || `Level ${level}`
    }

    /**
     * Get label for purchase intent level
     * @param {number} level - Purchase intent level (1-5)
     * @returns {string} Display label
     */
    getPurchaseIntentLevelLabel(level) {
        const labels = {
            1: 'No purchase intent',
            2: 'Low purchase intent',
            3: 'Moderate purchase intent',
            4: 'High purchase intent',
            5: 'Will definitely purchase'
        }
        return labels[level] || `Level ${level}`
    }

    /**
     * Get label for engagement quality level
     * @param {number} level - Engagement quality level (1-5)
     * @returns {string} Display label
     */
    getEngagementQualityLabel(level) {
        const labels = {
            1: 'Poor interaction',
            2: 'Below average interaction',
            3: 'Average interaction',
            4: 'Good interaction',
            5: 'Excellent interaction'
        }
        return labels[level] || `Level ${level}`
    }

    /**
     * Validate promoter comment data
     * @param {Object} commentData - Comment data to validate
     * @returns {Object} Validation result
     */
    validatePromoterComment(commentData) {
        const errors = {}

        // Brand awareness validation
        if (commentData.brandAwarenessLevel !== undefined) {
            if (commentData.brandAwarenessLevel < 1 || commentData.brandAwarenessLevel > 5) {
                errors.brandAwarenessLevel = 'Brand awareness level must be between 1 and 5'
            }
        }

        // Purchase intent validation
        if (commentData.purchaseIntentLevel !== undefined) {
            if (commentData.purchaseIntentLevel < 1 || commentData.purchaseIntentLevel > 5) {
                errors.purchaseIntentLevel = 'Purchase intent level must be between 1 and 5'
            }
        }

        // Engagement quality validation
        if (commentData.engagementQuality !== undefined) {
            if (commentData.engagementQuality < 1 || commentData.engagementQuality > 5) {
                errors.engagementQuality = 'Engagement quality must be between 1 and 5'
            }
        }

        // Text field length validations
        if (commentData.brandAwarenessComments && commentData.brandAwarenessComments.length > 1000) {
            errors.brandAwarenessComments = 'Brand awareness comments must be 1000 characters or less'
        }

        if (commentData.purchaseIntentComments && commentData.purchaseIntentComments.length > 1000) {
            errors.purchaseIntentComments = 'Purchase intent comments must be 1000 characters or less'
        }

        if (commentData.priceSensitivity && commentData.priceSensitivity.length > 1000) {
            errors.priceSensitivity = 'Price sensitivity notes must be 1000 characters or less'
        }

        if (commentData.competitorMentions && commentData.competitorMentions.length > 1000) {
            errors.competitorMentions = 'Competitor mentions must be 1000 characters or less'
        }

        if (commentData.usageContext && commentData.usageContext.length > 1000) {
            errors.usageContext = 'Usage context must be 1000 characters or less'
        }

        if (commentData.decisionMakerStatus && commentData.decisionMakerStatus.length > 500) {
            errors.decisionMakerStatus = 'Decision maker status must be 500 characters or less'
        }

        if (commentData.followUpNotes && commentData.followUpNotes.length > 1000) {
            errors.followUpNotes = 'Follow-up notes must be 1000 characters or less'
        }

        if (commentData.promoterObservations && commentData.promoterObservations.length > 2000) {
            errors.promoterObservations = 'Promoter observations must be 2000 characters or less'
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        }
    }
}

export default new LeadService()