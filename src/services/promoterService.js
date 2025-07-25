import api from './api'

const promoterService = {
  // Dashboard and Statistics
  async getDashboardStats() {
    const response = await api.get('/promoters/dashboard/stats')
    return response.data
  },

  async getPromoterActivations(promoterId, params = {}) {
    const response = await api.get(`/promoters/${promoterId}/activations`, { params })
    return response.data
  },

  async getTodaySchedule(promoterId) {
    const response = await api.get(`/promoters/${promoterId}/schedule/today`)
    return response.data
  },

  // Check-in/Check-out
  async checkIn(activationId, data) {
    const response = await api.post(`/promoters/activations/${activationId}/check-in`, {
      ...data,
      timestamp: new Date().toISOString(),
      location: data.location || null
    })
    return response.data
  },

  async checkOut(activationId, data) {
    const response = await api.post(`/promoters/activations/${activationId}/check-out`, {
      ...data,
      timestamp: new Date().toISOString(),
      location: data.location || null
    })
    return response.data
  },

  async getCheckInStatus(activationId) {
    const response = await api.get(`/promoters/activations/${activationId}/check-status`)
    return response.data
  },

  // Sales Recording
  async recordSale(activationId, saleData) {
    const response = await api.post(`/promoters/activations/${activationId}/sales`, {
      ...saleData,
      timestamp: new Date().toISOString()
    })
    return response.data
  },

  async getSales(activationId, params = {}) {
    const response = await api.get(`/promoters/activations/${activationId}/sales`, { params })
    return response.data
  },

  async updateSale(activationId, saleId, data) {
    const response = await api.put(`/promoters/activations/${activationId}/sales/${saleId}`, data)
    return response.data
  },

  async deleteSale(activationId, saleId) {
    const response = await api.delete(`/promoters/activations/${activationId}/sales/${saleId}`)
    return response.data
  },

  // Activity Logging
  async logActivity(activationId, activityData) {
    const response = await api.post(`/promoters/activations/${activationId}/activities`, {
      ...activityData,
      timestamp: new Date().toISOString()
    })
    return response.data
  },

  async getActivities(activationId, params = {}) {
    const response = await api.get(`/promoters/activations/${activationId}/activities`, { params })
    return response.data
  },

  // Customer Interactions
  async recordCustomerInteraction(activationId, interactionData) {
    const response = await api.post(`/promoters/activations/${activationId}/interactions`, {
      ...interactionData,
      timestamp: new Date().toISOString()
    })
    return response.data
  },

  async getCustomerInteractions(activationId, params = {}) {
    const response = await api.get(`/promoters/activations/${activationId}/interactions`, { params })
    return response.data
  },

  async captureCustomerLead(activationId, leadData) {
    const response = await api.post(`/promoters/activations/${activationId}/leads`, {
      ...leadData,
      capturedAt: new Date().toISOString()
    })
    return response.data
  },

  // Stock Management
  async performStockCount(activationId, countData) {
    const response = await api.post(`/promoters/activations/${activationId}/stock-counts`, {
      ...countData,
      countedAt: new Date().toISOString()
    })
    return response.data
  },

  async getStockCounts(activationId, params = {}) {
    const response = await api.get(`/promoters/activations/${activationId}/stock-counts`, { params })
    return response.data
  },

  async reportStockIssue(activationId, issueData) {
    const response = await api.post(`/promoters/activations/${activationId}/stock-issues`, {
      ...issueData,
      reportedAt: new Date().toISOString()
    })
    return response.data
  },

  // Expense Reporting
  async submitExpense(expenseData) {
    const response = await api.post('/promoters/expenses', {
      ...expenseData,
      submittedAt: new Date().toISOString()
    })
    return response.data
  },

  async getExpenses(params = {}) {
    const response = await api.get('/promoters/expenses', { params })
    return response.data
  },

  async updateExpense(expenseId, data) {
    const response = await api.put(`/promoters/expenses/${expenseId}`, data)
    return response.data
  },

  async deleteExpense(expenseId) {
    const response = await api.delete(`/promoters/expenses/${expenseId}`)
    return response.data
  },

  async uploadExpenseReceipt(expenseId, file) {
    const formData = new FormData()
    formData.append('receipt', file)
    const response = await api.post(`/promoters/expenses/${expenseId}/receipt`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  // Incident Reporting
  async reportIncident(activationId, incidentData) {
    const response = await api.post(`/promoters/activations/${activationId}/incidents`, {
      ...incidentData,
      reportedAt: new Date().toISOString()
    })
    return response.data
  },

  async getIncidents(params = {}) {
    const response = await api.get('/promoters/incidents', { params })
    return response.data
  },

  async updateIncident(incidentId, data) {
    const response = await api.put(`/promoters/incidents/${incidentId}`, data)
    return response.data
  },

  // Training and Compliance
  async getTrainingModules() {
    const response = await api.get('/promoters/training/modules')
    return response.data
  },

  async completeTraining(moduleId, data) {
    const response = await api.post(`/promoters/training/modules/${moduleId}/complete`, {
      ...data,
      completedAt: new Date().toISOString()
    })
    return response.data
  },

  async getTrainingProgress() {
    const response = await api.get('/promoters/training/progress')
    return response.data
  },

  // Performance and Feedback
  async getPerformanceMetrics(promoterId, params = {}) {
    const response = await api.get(`/promoters/${promoterId}/performance`, { params })
    return response.data
  },

  async submitFeedback(activationId, feedbackData) {
    const response = await api.post(`/promoters/activations/${activationId}/feedback`, {
      ...feedbackData,
      submittedAt: new Date().toISOString()
    })
    return response.data
  },

  // Location Services
  async updateLocation(location) {
    const response = await api.post('/promoters/location/update', {
      ...location,
      timestamp: new Date().toISOString()
    })
    return response.data
  },

  async getLocationHistory(params = {}) {
    const response = await api.get('/promoters/location/history', { params })
    return response.data
  },

  // Utility Functions
  async uploadImage(activationId, file, type = 'general') {
    const formData = new FormData()
    formData.append('image', file)
    formData.append('type', type)
    const response = await api.post(`/promoters/activations/${activationId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  async getNotifications() {
    const response = await api.get('/promoters/notifications')
    return response.data
  },

  async markNotificationRead(notificationId) {
    const response = await api.put(`/promoters/notifications/${notificationId}/read`)
    return response.data
  },

  // Report Generation (for promoter-specific reports)
  async generateReport(type, params = {}) {
    const response = await api.get(`/promoters/reports/${type}`, { 
      params,
      responseType: 'blob' 
    })
    return response.data
  }
}

export default promoterService