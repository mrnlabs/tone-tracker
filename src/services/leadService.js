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
     * Get leads by activation ID
     * @param {number} activationId - Activation ID
     * @param {Object} params - Query parameters
     * @returns {Promise} Leads for specific activation
     */
    async getLeadsByActivation(activationId, params = {}) {
        try {
            const response = await api.get(`/leads/activation/${activationId}`, { params })
            // API service already returns response.data, so just return response
            return response
        } catch (error) {
            console.error('Error fetching leads by activation:', error)
            throw error
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
}

export default new LeadService()