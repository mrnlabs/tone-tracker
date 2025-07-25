import { defineStore } from 'pinia'
import stockMovementService from '@/services/stockMovementService'

export const useStockMovementStore = defineStore('stockMovement', {
    state: () => ({
        stockMovements: [],
        currentStockMovement: null,
        movementTypes: ['IN', 'OUT', 'ALLOCATION', 'REPLENISHMENT', 'ADJUSTMENT', 'DISTRIBUTION', 'RETURN', 'SAMPLE', 'SALE'],
        loading: false,
        error: null,
        pagination: {
            page: 0,
            size: 20,
            totalElements: 0,
            totalPages: 0
        }
    }),

    getters: {
        getMovementsByStock: (state) => (stockId) => {
            return state.stockMovements.filter(movement => movement.stock?.id === stockId)
        },

        getMovementsByActivation: (state) => (activationId) => {
            return state.stockMovements.filter(movement => movement.activation?.id === activationId)
        },

        getMovementsByType: (state) => (movementType) => {
            return state.stockMovements.filter(movement => movement.movementType === movementType)
        },

        getStockBalance: (state) => (stockId) => {
            const movements = state.stockMovements
                .filter(movement => movement.stock?.id === stockId)
                .sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated))
            
            return movements.length > 0 ? movements[0].closingStock : 0
        },

        getMovementTypeOptions: (state) => {
            return state.movementTypes.map(type => ({
                label: type.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()),
                value: type
            }))
        }
    },

    actions: {
        async fetchAllStockMovements(params = {}) {
            this.loading = true
            this.error = null
            try {
                const response = await stockMovementService.getAllStockMovements(params)
                this.stockMovements = response.content || response
                if (response.totalElements !== undefined) {
                    this.pagination = {
                        page: response.number,
                        size: response.size,
                        totalElements: response.totalElements,
                        totalPages: response.totalPages
                    }
                }
                return response
            } catch (error) {
                this.error = error.message || 'Failed to fetch stock movements'
                throw error
            } finally {
                this.loading = false
            }
        },

        async fetchStockMovementById(id) {
            this.loading = true
            this.error = null
            try {
                const movement = await stockMovementService.getStockMovementById(id)
                this.currentStockMovement = movement
                return movement
            } catch (error) {
                this.error = error.message || 'Failed to fetch stock movement'
                throw error
            } finally {
                this.loading = false
            }
        },

        async fetchStockMovements(stockId, params = {}) {
            this.loading = true
            this.error = null
            try {
                // Service now returns the actual data directly
                const data = await stockMovementService.getStockMovements(stockId, params)
                
                // Handle different response formats
                let movements = []
                if (data) {
                    if (Array.isArray(data)) {
                        // API returns plain array
                        movements = data
                        console.log(`Store: Processing plain array with ${movements.length} movements`)
                    } else if (data.content && Array.isArray(data.content)) {
                        // Paginated response
                        movements = data.content
                        console.log(`Store: Processing paginated response with ${movements.length} movements`)
                    } else {
                        console.warn('Store: Unexpected response format:', typeof data, data)
                        movements = []
                    }
                }
                
                if (params.append) {
                    this.stockMovements.push(...movements)
                } else {
                    this.stockMovements = movements
                }
                

                // Handle pagination if present
                if (data && typeof data === 'object' && !Array.isArray(data)) {
                    if (data.totalElements !== undefined) {
                        this.pagination = {
                            page: data.number || 0,
                            size: data.size || 20,
                            totalElements: data.totalElements,
                            totalPages: data.totalPages || 0
                        }
                    }
                }
                
                return { content: movements, ...data }
            } catch (error) {
                this.error = error.message || 'Failed to fetch stock movements'
                console.error('Error in fetchStockMovements:', error)
                return { content: [] } // Return empty array instead of throwing
            } finally {
                this.loading = false
            }
        },

        async createStockMovement(stockId, movementData) {
            this.loading = true
            this.error = null
            try {
                const newMovement = await stockMovementService.createStockMovement(stockId, movementData)
                this.stockMovements.unshift(newMovement)
                this.currentStockMovement = newMovement
                return newMovement
            } catch (error) {
                this.error = error.message || 'Failed to create stock movement'
                throw error
            } finally {
                this.loading = false
            }
        },

        async recordSale(stockId, saleData) {
            this.loading = true
            this.error = null
            try {
                // Ensure activation ID is included if provided
                const saleDataWithActivation = {
                    ...saleData,
                    activationId: saleData.activationId || saleData.activation?.id || null
                }
                const movement = await stockMovementService.recordSale(stockId, saleDataWithActivation)
                this.stockMovements.unshift(movement)
                return movement
            } catch (error) {
                this.error = error.message || 'Failed to record sale'
                throw error
            } finally {
                this.loading = false
            }
        },

        async recordSample(stockId, sampleData) {
            this.loading = true
            this.error = null
            try {
                // Ensure activation ID is included if provided
                const sampleDataWithActivation = {
                    ...sampleData,
                    activationId: sampleData.activationId || sampleData.activation?.id || null
                }
                const movement = await stockMovementService.recordSample(stockId, sampleDataWithActivation)
                this.stockMovements.unshift(movement)
                return movement
            } catch (error) {
                this.error = error.message || 'Failed to record sample'
                throw error
            } finally {
                this.loading = false
            }
        },

        async recordAdjustment(stockId, adjustmentData) {
            this.loading = true
            this.error = null
            try {
                const movement = await stockMovementService.recordAdjustment(stockId, adjustmentData)
                this.stockMovements.unshift(movement)
                return movement
            } catch (error) {
                this.error = error.message || 'Failed to record adjustment'
                throw error
            } finally {
                this.loading = false
            }
        },

        async recordStockIn(stockId, stockInData) {
            this.loading = true
            this.error = null
            try {
                const movement = await stockMovementService.recordStockIn(stockId, stockInData)
                this.stockMovements.unshift(movement)
                return movement
            } catch (error) {
                this.error = error.message || 'Failed to record stock in'
                throw error
            } finally {
                this.loading = false
            }
        },

        async recordAllocation(stockId, allocationData) {
            this.loading = true
            this.error = null
            try {
                // Ensure activation ID is included if provided
                const allocationDataWithActivation = {
                    ...allocationData,
                    activationId: allocationData.activationId || allocationData.activation?.id || null
                }
                const movement = await stockMovementService.recordAllocation(stockId, allocationDataWithActivation)
                this.stockMovements.unshift(movement)
                return movement
            } catch (error) {
                this.error = error.message || 'Failed to record allocation'
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
                this.stockMovements = response.content || response
                return response
            } catch (error) {
                this.error = error.message || 'Failed to fetch movements by activation'
                throw error
            } finally {
                this.loading = false
            }
        },

        async updateStockMovement(id, movementData) {
            this.loading = true
            this.error = null
            try {
                const updatedMovement = await stockMovementService.updateStockMovement(id, movementData)
                const index = this.stockMovements.findIndex(movement => movement.id === id)
                if (index !== -1) {
                    this.stockMovements[index] = updatedMovement
                }
                this.currentStockMovement = updatedMovement
                return updatedMovement
            } catch (error) {
                this.error = error.message || 'Failed to update stock movement'
                throw error
            } finally {
                this.loading = false
            }
        },

        async deleteStockMovement(id) {
            this.loading = true
            this.error = null
            try {
                await stockMovementService.deleteStockMovement(id)
                this.stockMovements = this.stockMovements.filter(movement => movement.id !== id)
                if (this.currentStockMovement?.id === id) {
                    this.currentStockMovement = null
                }
            } catch (error) {
                this.error = error.message || 'Failed to delete stock movement'
                throw error
            } finally {
                this.loading = false
            }
        },

        async exportStockMovements(params = {}) {
            this.loading = true
            this.error = null
            try {
                const blob = await stockMovementService.exportMovements(params.stockId, params)
                
                const url = window.URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.href = url
                link.download = `stock-movements-${params.stockId || 'all'}-${new Date().toISOString().split('T')[0]}.xlsx`
                document.body.appendChild(link)
                link.click()
                link.remove()
                window.URL.revokeObjectURL(url)
                
                return true
            } catch (error) {
                this.error = error.message || 'Failed to export stock movements'
                throw error
            } finally {
                this.loading = false
            }
        },

        async exportWarehouseMovements(params = {}) {
            this.loading = true
            this.error = null
            try {
                const blob = await stockMovementService.exportWarehouseMovements(params)
                
                const url = window.URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.href = url
                link.download = `warehouse-movements-${params.warehouseId || 'all'}-${new Date().toISOString().split('T')[0]}.xlsx`
                document.body.appendChild(link)
                link.click()
                link.remove()
                window.URL.revokeObjectURL(url)
                
                return true
            } catch (error) {
                this.error = error.message || 'Failed to export warehouse movements'
                throw error
            } finally {
                this.loading = false
            }
        },

        async fetchMovementTypes() {
            try {
                const types = await stockMovementService.getMovementTypes()
                this.movementTypes = types
                return types
            } catch (error) {
                console.warn('Failed to fetch movement types, using defaults')
                return this.movementTypes
            }
        },

        clearError() {
            this.error = null
        },

        clearCurrentMovement() {
            this.currentStockMovement = null
        },

        clearMovements() {
            this.stockMovements = []
            this.pagination = {
                page: 0,
                size: 20,
                totalElements: 0,
                totalPages: 0
            }
        }
    }
})