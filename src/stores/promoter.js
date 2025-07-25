import { defineStore } from 'pinia'
import promoterService from '@/services/promoterService'

export const usePromoterStore = defineStore('promoter', {
  state: () => ({
    // Dashboard Data
    dashboardStats: {
      monthlyAssignments: 0,
      completedActivations: 0,
      totalHours: 0,
      averageRating: 0,
      totalSales: 0,
      customerInteractions: 0
    },
    
    // Current Activations
    todayActivations: [],
    upcomingActivations: [],
    recentActivations: [],
    currentActivation: null,
    
    // Check-in/Check-out Status
    checkInStatus: {},
    
    // Sales Data
    sales: [],
    todaySales: [],
    
    // Activities
    activities: [],
    activityLog: [],
    
    // Customer Interactions
    customerInteractions: [],
    customerLeads: [],
    
    // Stock Management
    stockCounts: [],
    stockIssues: [],
    
    // Expenses
    expenses: [],
    expenseCategories: [
      { label: 'Transport', value: 'transport' },
      { label: 'Meals', value: 'meals' },
      { label: 'Accommodation', value: 'accommodation' },
      { label: 'Communication', value: 'communication' },
      { label: 'Materials', value: 'materials' },
      { label: 'Other', value: 'other' }
    ],
    
    // Incidents
    incidents: [],
    
    // Training
    trainingModules: [],
    trainingProgress: {
      completed: 0,
      total: 0,
      percentage: 0
    },
    
    // Performance
    performanceMetrics: {
      salesGrowth: 0,
      customerSatisfaction: 0,
      attendanceRate: 0,
      taskCompletion: 0
    },
    
    // Notifications
    notifications: [],
    unreadNotifications: 0,
    
    // UI State
    loading: {
      dashboard: false,
      checkIn: false,
      sales: false,
      activities: false,
      expenses: false
    },
    
    error: null
  }),

  getters: {
    // Dashboard Getters
    getMonthlyStats: (state) => state.dashboardStats,
    
    getTodayActivations: (state) => state.todayActivations,
    
    getActiveActivation: (state) => 
      state.todayActivations.find(activation => 
        activation.checkedIn && !activation.checkedOut
      ),
    
    // Sales Getters
    getTodaySalesTotal: (state) => 
      state.todaySales.reduce((total, sale) => total + (sale.totalAmount || 0), 0),
    
    getSalesCount: (state) => state.sales.length,
    
    // Activity Getters
    getTodayActivities: (state) => 
      state.activities.filter(activity => 
        new Date(activity.timestamp).toDateString() === new Date().toDateString()
      ),
    
    // Expense Getters
    getPendingExpenses: (state) => 
      state.expenses.filter(expense => expense.status === 'pending'),
    
    getThisMonthExpenses: (state) => 
      state.expenses.filter(expense => {
        const expenseDate = new Date(expense.date)
        const now = new Date()
        return expenseDate.getMonth() === now.getMonth() && 
               expenseDate.getFullYear() === now.getFullYear()
      }),
    
    // Performance Getters
    getAttendanceRate: (state) => {
      const completed = state.recentActivations.filter(a => a.status === 'completed').length
      const total = state.recentActivations.length
      return total > 0 ? (completed / total) * 100 : 0
    },
    
    // Notification Getters
    getUnreadNotifications: (state) => 
      state.notifications.filter(notification => !notification.read)
  },

  actions: {
    // Dashboard Actions
    async fetchDashboardStats() {
      this.loading.dashboard = true
      try {
        const stats = await promoterService.getDashboardStats()
        this.dashboardStats = stats
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to load dashboard stats'
        throw error
      } finally {
        this.loading.dashboard = false
      }
    },

    async fetchTodaySchedule() {
      try {
        const schedule = await promoterService.getTodaySchedule()
        this.todayActivations = schedule
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to load today\'s schedule'
        throw error
      }
    },

    async fetchUpcomingActivations() {
      try {
        const activations = await promoterService.getPromoterActivations(null, { 
          status: 'upcoming',
          limit: 10 
        })
        this.upcomingActivations = activations
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to load upcoming activations'
        throw error
      }
    },

    async fetchRecentActivations() {
      try {
        const activations = await promoterService.getPromoterActivations(null, { 
          status: 'completed',
          limit: 10,
          sortBy: 'date',
          order: 'desc'
        })
        this.recentActivations = activations
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to load recent activations'
        throw error
      }
    },

    // Check-in/Check-out Actions
    async checkIn(activationId, data) {
      this.loading.checkIn = true
      try {
        const result = await promoterService.checkIn(activationId, data)
        
        // Update local state
        const activation = this.todayActivations.find(a => a.id === activationId)
        if (activation) {
          activation.checkedIn = true
          activation.checkInTime = result.checkInTime
        }
        
        this.checkInStatus[activationId] = {
          checkedIn: true,
          checkInTime: result.checkInTime,
          attendanceRecord: result.attendanceRecord || result.attendanceId || result.id || result.recordId
        }
        
        return result
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to check in'
        throw error
      } finally {
        this.loading.checkIn = false
      }
    },

    async checkOut(activationId, data) {
      this.loading.checkIn = true
      try {
        // Include attendance record ID and format location correctly
        const checkOutData = {
          attendanceRecord: this.checkInStatus[activationId]?.attendanceRecord,
          summary: data.summary,
          activities: data.activities || [],
          latitude: data.location?.latitude,
          longitude: data.location?.longitude,
          address: data.location?.address || "Location address not available",
          notes: data.notes || data.summary || "Additional notes"
        }
        const result = await promoterService.checkOut(activationId, checkOutData)
        
        // Update local state
        const activation = this.todayActivations.find(a => a.id === activationId)
        if (activation) {
          activation.checkedOut = true
          activation.checkOutTime = result.checkOutTime
        }
        
        this.checkInStatus[activationId] = {
          ...this.checkInStatus[activationId],
          checkedOut: true,
          checkOutTime: result.checkOutTime,
          attendanceRecord: this.checkInStatus[activationId]?.attendanceRecord || result.attendanceRecord || result.attendanceId || result.id || result.recordId
        }
        
        return result
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to check out'
        throw error
      } finally {
        this.loading.checkIn = false
      }
    },

    // Sales Actions
    async recordSale(activationId, saleData) {
      this.loading.sales = true
      try {
        const sale = await promoterService.recordSale(activationId, saleData)
        this.sales.unshift(sale)
        this.todaySales.unshift(sale)
        
        // Update dashboard stats
        this.dashboardStats.totalSales += sale.totalAmount
        
        return sale
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to record sale'
        throw error
      } finally {
        this.loading.sales = false
      }
    },

    async fetchSales(activationId, params = {}) {
      try {
        const sales = await promoterService.getSales(activationId, params)
        this.sales = sales
        
        // Filter today's sales
        const today = new Date().toDateString()
        this.todaySales = sales.filter(sale => 
          new Date(sale.timestamp).toDateString() === today
        )
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to load sales'
        throw error
      }
    },

    // Activity Actions
    async logActivity(activationId, activityData) {
      this.loading.activities = true
      try {
        const activity = await promoterService.logActivity(activationId, activityData)
        this.activities.unshift(activity)
        this.activityLog.unshift(activity)
        return activity
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to log activity'
        throw error
      } finally {
        this.loading.activities = false
      }
    },

    async fetchActivities(activationId, params = {}) {
      try {
        const activities = await promoterService.getActivities(activationId, params)
        this.activities = activities
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to load activities'
        throw error
      }
    },

    // Customer Interaction Actions
    async recordCustomerInteraction(activationId, interactionData) {
      try {
        const interaction = await promoterService.recordCustomerInteraction(activationId, interactionData)
        this.customerInteractions.unshift(interaction)
        this.dashboardStats.customerInteractions++
        return interaction
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to record customer interaction'
        throw error
      }
    },

    async captureCustomerLead(activationId, leadData) {
      try {
        const lead = await promoterService.captureCustomerLead(activationId, leadData)
        this.customerLeads.unshift(lead)
        return lead
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to capture customer lead'
        throw error
      }
    },

    // Stock Management Actions
    async performStockCount(activationId, countData) {
      try {
        const stockCount = await promoterService.performStockCount(activationId, countData)
        this.stockCounts.unshift(stockCount)
        return stockCount
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to perform stock count'
        throw error
      }
    },

    async reportStockIssue(activationId, issueData) {
      try {
        const issue = await promoterService.reportStockIssue(activationId, issueData)
        this.stockIssues.unshift(issue)
        return issue
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to report stock issue'
        throw error
      }
    },

    // Expense Actions
    async submitExpense(expenseData) {
      this.loading.expenses = true
      try {
        const expense = await promoterService.submitExpense(expenseData)
        this.expenses.unshift(expense)
        return expense
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to submit expense'
        throw error
      } finally {
        this.loading.expenses = false
      }
    },

    async fetchExpenses(params = {}) {
      try {
        const expenses = await promoterService.getExpenses(params)
        this.expenses = expenses
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to load expenses'
        throw error
      }
    },

    async uploadExpenseReceipt(expenseId, file) {
      try {
        const result = await promoterService.uploadExpenseReceipt(expenseId, file)
        
        // Update expense in local state
        const expense = this.expenses.find(e => e.id === expenseId)
        if (expense) {
          expense.receiptUrl = result.receiptUrl
        }
        
        return result
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to upload receipt'
        throw error
      }
    },

    // Incident Actions
    async reportIncident(activationId, incidentData) {
      try {
        const incident = await promoterService.reportIncident(activationId, incidentData)
        this.incidents.unshift(incident)
        return incident
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to report incident'
        throw error
      }
    },

    async fetchIncidents(params = {}) {
      try {
        const incidents = await promoterService.getIncidents(params)
        this.incidents = incidents
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to load incidents'
        throw error
      }
    },

    // Training Actions
    async fetchTrainingModules() {
      try {
        const modules = await promoterService.getTrainingModules()
        this.trainingModules = modules
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to load training modules'
        throw error
      }
    },

    async completeTraining(moduleId, data) {
      try {
        const result = await promoterService.completeTraining(moduleId, data)
        
        // Update module status
        const module = this.trainingModules.find(m => m.id === moduleId)
        if (module) {
          module.completed = true
          module.completedAt = result.completedAt
        }
        
        // Update progress
        this.trainingProgress.completed++
        this.trainingProgress.percentage = (this.trainingProgress.completed / this.trainingProgress.total) * 100
        
        return result
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to complete training'
        throw error
      }
    },

    async fetchTrainingProgress() {
      try {
        const progress = await promoterService.getTrainingProgress()
        this.trainingProgress = progress
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to load training progress'
        throw error
      }
    },

    // Performance Actions
    async fetchPerformanceMetrics(params = {}) {
      try {
        const metrics = await promoterService.getPerformanceMetrics(null, params)
        this.performanceMetrics = metrics
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to load performance metrics'
        throw error
      }
    },

    // Notification Actions
    async fetchNotifications() {
      try {
        const notifications = await promoterService.getNotifications()
        this.notifications = notifications
        this.unreadNotifications = notifications.filter(n => !n.read).length
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to load notifications'
        throw error
      }
    },

    async markNotificationRead(notificationId) {
      try {
        await promoterService.markNotificationRead(notificationId)
        
        // Update local state
        const notification = this.notifications.find(n => n.id === notificationId)
        if (notification) {
          notification.read = true
          this.unreadNotifications--
        }
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to mark notification as read'
        throw error
      }
    },

    // Utility Actions
    async uploadImage(activationId, file, type = 'general') {
      try {
        const result = await promoterService.uploadImage(activationId, file, type)
        return result
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to upload image'
        throw error
      }
    },

    async updateLocation(location) {
      try {
        const result = await promoterService.updateLocation(location)
        return result
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to update location'
        throw error
      }
    },

    // Initialize store data
    async initializeDashboard() {
      try {
        await Promise.all([
          this.fetchDashboardStats(),
          this.fetchTodaySchedule(),
          this.fetchRecentActivations(),
          this.fetchNotifications()
        ])
      } catch (error) {
        console.error('Failed to initialize promoter dashboard:', error)
      }
    },

    // Clear store data
    clearStore() {
      this.$reset()
    },

    // Clear error
    clearError() {
      this.error = null
    }
  }
})