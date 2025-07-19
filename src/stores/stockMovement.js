import { defineStore } from 'pinia'
import stockMovementService from '@/services/stockMovementService'
import { STOCK_MOVEMENT_TYPE } from '@/utils/constants'

export const useStockMovementStore = defineStore('stockMovement', {
    state: () => ({
        movements: [],
        currentMovement: null,
        movementsByStock: {},
        movementsByActivation: {},
        loading: false,
        error: null,
        pagination: {
            page: 1,
            size: 20,
            total: 0,
            totalPages: 0
        },
        filters: {
            movementType: null,
            startDate: null,
            endDate: null,
            activationId: null
        },
        summary: {
            totalIn: 0,
            totalOut: 0,
            totalSales: 0,
            totalSamples: 0,
            totalAdjustments: 0,
            netChange: 0
        }
    }),

    getters: {
        salesMovements: (state) => {
            return state.movements.filter(m => m.movementType === STOCK_MOVEMENT_TYPE.SALE)
        },

        adjustmentMovements: (state) => {
            return state.movements.filter(m => m.movementType === STOCK_MOVEMENT_TYPE.ADJUSTMENT)
        },

        sampleMovements: (state) => {
            return state.movements.filter(m => m.movementType === STOCK_MOVEMENT_TYPE.SAMPLE)
        },

        movementsByDate: (state) => {
            return [...state.movements].sort((a, b) => 
                new Date(b.dateCreated) - new Date(a.dateCreated)
            )
        },

        totalQuantityMoved: (state) => {
            return state.movements.reduce((total, movement) => {
                if (movement.movementType === STOCK_MOVEMENT_TYPE.IN) {
                    return total + movement.quantity
                } else {
                    return total - movement.quantity
                }
            }, 0)
        },

        movementStats: (state) => {
            const stats = {}
            Object.values(STOCK_MOVEMENT_TYPE).forEach(type => {
                stats[type] = {
                    count: 0,
                    quantity: 0
                }
            })

            state.movements.forEach(movement => {
                if (stats[movement.movementType]) {
                    stats[movement.movementType].count++
                    stats[movement.movementType].quantity += movement.quantity
                }
            })

            return stats
        },

        hasMorePages: (state) => {
            return state.pagination.page < state.pagination.totalPages
        }
    },

    actions: {
        async fetchMovements(stockId, params = {}) {
            this.loading = true
            this.error = null
            
            try {
                const response = await stockMovementService.getStockMovements(stockId, {
                    ...this.filters,
                    ...params,
                    page: this.pagination.page - 1,
                    size: this.pagination.size
                })

                this.movements = response.content || []
                this.movementsByStock[stockId] = response.content || []
                
                this.pagination = {
                    page: response.pageable?.pageNumber + 1 || 1,
                    size: response.pageable?.pageSize || 20,
                    total: response.totalElements || 0,
                    totalPages: response.totalPages || 0
                }

                this.calculateSummary()
                
                return response
            } catch (error) {
                this.error = error.response?.data?.message || 'Failed to fetch stock movements'
                throw error
            } finally {
                this.loading = false
            }
        },

        async recordSale(stockId, saleData) {
            this.loading = true
            this.error = null
            
            try {
                const response = await stockMovementService.recordSale(stockId, saleData)
                this.movements.unshift(response)
                this.calculateSummary()
                return response
            } catch (error) {
                this.error = error.response?.data?.message || 'Failed to record sale'
                throw error
            } finally {
                this.loading = false
            }
        },

        async recordSample(stockId, sampleData) {
            this.loading = true
            this.error = null
            
            try {
                const response = await stockMovementService.recordSample(stockId, sampleData)
                this.movements.unshift(response)
                this.calculateSummary()
                return response
            } catch (error) {
                this.error = error.response?.data?.message || 'Failed to record sample'
                throw error
            } finally {
                this.loading = false
            }
        },

        async recordAdjustment(stockId, adjustmentData) {
            this.loading = true
            this.error = null
            
            try {
                const response = await stockMovementService.recordAdjustment(stockId, adjustmentData)
                this.movements.unshift(response)
                this.calculateSummary()
                return response
            } catch (error) {
                this.error = error.response?.data?.message || 'Failed to record adjustment'
                throw error
            } finally {
                this.loading = false
            }
        },

        async recordStockIn(stockId, stockInData) {
            this.loading = true
            this.error = null
            
            try {
                const response = await stockMovementService.recordStockIn(stockId, stockInData)
                this.movements.unshift(response)
                this.calculateSummary()
                return response
            } catch (error) {
                this.error = error.response?.data?.message || 'Failed to record stock in'
                throw error
            } finally {
                this.loading = false
            }
        },

        async fetchMovementsByActivation(activationId, params = {}) {
            this.loading = true
            this.error = null
            
            try {
                const response = await stockMovementService.getMovementsByActivation(activationId, params)
                this.movementsByActivation[activationId] = response.content || []
                return response
            } catch (error) {
                this.error = error.response?.data?.message || 'Failed to fetch activation movements'
                throw error
            } finally {
                this.loading = false
            }
        },

        async bulkRecordSales(sales) {
            this.loading = true
            this.error = null
            
            try {
                const response = await stockMovementService.bulkRecordSales(sales)
                // Refresh movements after bulk operation
                if (sales.length > 0 && sales[0].stockId) {
                    await this.fetchMovements(sales[0].stockId)
                }
                return response
            } catch (error) {
                this.error = error.response?.data?.message || 'Failed to bulk record sales'
                throw error
            } finally {
                this.loading = false
            }
        },

        async exportMovements(stockId, format = 'xlsx') {
            this.loading = true
            this.error = null
            
            try {
                const blob = await stockMovementService.exportMovements(stockId, {
                    ...this.filters,
                    format
                })
                
                // Create download link
                const url = window.URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.href = url
                link.download = `stock-movements-${stockId}-${new Date().toISOString().split('T')[0]}.${format}`
                link.click()
                window.URL.revokeObjectURL(url)
                
                return true
            } catch (error) {
                this.error = error.response?.data?.message || 'Failed to export movements'
                throw error
            } finally {
                this.loading = false
            }
        },

        setFilters(filters) {
            this.filters = {
                ...this.filters,
                ...filters
            }
            this.pagination.page = 1
        },

        clearFilters() {
            this.filters = {
                movementType: null,
                startDate: null,
                endDate: null,
                activationId: null
            }
            this.pagination.page = 1
        },

        setPage(page) {
            this.pagination.page = page
        },

        calculateSummary() {
            const summary = {
                totalIn: 0,
                totalOut: 0,
                totalSales: 0,
                totalSamples: 0,
                totalAdjustments: 0,
                netChange: 0
            }

            this.movements.forEach(movement => {
                const quantity = movement.quantity || 0
                
                switch(movement.movementType) {
                    case STOCK_MOVEMENT_TYPE.IN:
                        summary.totalIn += quantity
                        summary.netChange += quantity
                        break
                    case STOCK_MOVEMENT_TYPE.OUT:
                        summary.totalOut += quantity
                        summary.netChange -= quantity
                        break
                    case STOCK_MOVEMENT_TYPE.SALE:
                        summary.totalSales += quantity
                        summary.netChange -= quantity
                        break
                    case STOCK_MOVEMENT_TYPE.SAMPLE:
                        summary.totalSamples += quantity
                        summary.netChange -= quantity
                        break
                    case STOCK_MOVEMENT_TYPE.ADJUSTMENT:
                        summary.totalAdjustments += quantity
                        summary.netChange += quantity // Adjustments can be positive or negative
                        break
                }
            })

            this.summary = summary
        },

        clearMovements() {
            this.movements = []
            this.currentMovement = null
            this.movementsByStock = {}
            this.movementsByActivation = {}
            this.error = null
            this.pagination = {
                page: 1,
                size: 20,
                total: 0,
                totalPages: 0
            }
            this.summary = {
                totalIn: 0,
                totalOut: 0,
                totalSales: 0,
                totalSamples: 0,
                totalAdjustments: 0,
                netChange: 0
            }
        }
    }
})