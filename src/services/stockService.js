import api from './api'

class StockService {
    // Basic CRUD Operations
    async getAllStocks(params = {}) {
        try {
            const response = await api.get('/stocks', { params })
            return response.data
        } catch (error) {
            console.error('Error fetching stocks:', error)
            throw error
        }
    }

    async getStockById(id) {
        try {
            const response = await api.get(`/stocks/${id}`)
            return response.data
        } catch (error) {
            console.error('Error fetching stock:', error)
            throw error
        }
    }

    async createStock(stockData) {
        try {
            const response = await api.post('/stocks', stockData)
            return response.data
        } catch (error) {
            console.error('Error creating stock:', error)
            throw error
        }
    }

    async updateStock(id, stockData) {
        try {
            const response = await api.put(`/stocks/${id}`, stockData)
            return response.data
        } catch (error) {
            console.error('Error updating stock:', error)
            throw error
        }
    }

    async deleteStock(id) {
        try {
            const response = await api.delete(`/stocks/${id}`)
            return response.data
        } catch (error) {
            console.error('Error deleting stock:', error)
            throw error
        }
    }

    async deactivateStock(id) {
        try {
            const response = await api.post(`/stocks/${id}/deactivate`)
            return response.data
        } catch (error) {
            console.error('Error deactivating stock:', error)
            throw error
        }
    }

    // Search & Filter Operations
    async searchStocks(searchTerm, params = {}) {
        try {
            const response = await api.get('/stocks/search', {
                params: { searchTerm, ...params }
            })
            return response.data
        } catch (error) {
            console.error('Error searching stocks:', error)
            throw error
        }
    }

    async getAvailableStocks(params = {}) {
        try {
            const response = await api.get('/stocks/available', { params })
            return response.data
        } catch (error) {
            console.error('Error fetching available stocks:', error)
            throw error
        }
    }

    async getLowStockItems(params = {}) {
        try {
            const response = await api.get('/stocks/low-stock', { params })
            return response.data
        } catch (error) {
            console.error('Error fetching low stock items:', error)
            throw error
        }
    }

    async getStockBySku(sku) {
        try {
            const response = await api.get(`/stocks/by-sku/${sku}`)
            return response.data
        } catch (error) {
            console.error('Error fetching stock by SKU:', error)
            throw error
        }
    }

    async getStocksByWarehouse(warehouseId, params = {}) {
        try {
            const response = await api.get(`/stocks/warehouse/${warehouseId}`, { params })
            return response.data
        } catch (error) {
            console.error('Error fetching stocks by warehouse:', error)
            throw error
        }
    }

    async createStockForWarehouse(warehouseId, stockData) {
        try {
            const response = await api.post(`/stocks/warehouse/${warehouseId}`, stockData)
            return response.data
        } catch (error) {
            console.error('Error creating stock for warehouse:', error)
            throw error
        }
    }

    // Stock Operations
    async allocateStock(stockId, allocationData) {
        try {
            const response = await api.post(`/stocks/${stockId}/allocate`, allocationData)
            return response.data
        } catch (error) {
            console.error('Error allocating stock:', error)
            throw error
        }
    }

    async replenishStock(stockId, replenishmentData) {
        try {
            const response = await api.post(`/stocks/${stockId}/replenish`, replenishmentData)
            return response.data
        } catch (error) {
            console.error('Error replenishing stock:', error)
            throw error
        }
    }

    async adjustStock(stockId, adjustmentData) {
        try {
            const response = await api.post(`/stocks/${stockId}/adjust`, adjustmentData)
            return response.data
        } catch (error) {
            console.error('Error adjusting stock:', error)
            throw error
        }
    }

    async checkStockAvailability(stockId) {
        try {
            const response = await api.get(`/stocks/${stockId}/availability`)
            return response.data
        } catch (error) {
            console.error('Error checking stock availability:', error)
            throw error
        }
    }

    // Stock Movement Operations
    async getStockMovements(stockId, params = {}) {
        try {
            const response = await api.get(`/stocks/${stockId}/movements`, { params })
            return response.data
        } catch (error) {
            console.error('Error fetching stock movements:', error)
            throw error
        }
    }

    async createStockMovement(stockId, movementData) {
        try {
            const response = await api.post(`/stocks/${stockId}/movements`, movementData)
            return response.data
        } catch (error) {
            console.error('Error creating stock movement:', error)
            throw error
        }
    }

    // Reports
    async getStockReport(stockId, params = {}) {
        try {
            const response = await api.get(`/stocks/${stockId}/report`, { params })
            return response.data
        } catch (error) {
            console.error('Error fetching stock report:', error)
            throw error
        }
    }

    // Utility Methods
    async exportStocks(params = {}) {
        try {
            const response = await api.get('/stocks/export', {
                params,
                responseType: 'blob'
            })
            return response.data
        } catch (error) {
            console.error('Error exporting stocks:', error)
            throw error
        }
    }

    async exportStockMovements(stockId, params = {}) {
        try {
            const response = await api.get(`/stocks/${stockId}/movements/export`, {
                params,
                responseType: 'blob'
            })
            return response.data
        } catch (error) {
            console.error('Error exporting stock movements:', error)
            throw error
        }
    }

    // Batch Operations
    async bulkUpdateStocks(stockUpdates) {
        try {
            const response = await api.post('/stocks/bulk-update', { stocks: stockUpdates })
            return response.data
        } catch (error) {
            console.error('Error bulk updating stocks:', error)
            throw error
        }
    }

    async bulkAllocateStocks(allocations) {
        try {
            const response = await api.post('/stocks/bulk-allocate', { allocations })
            return response.data
        } catch (error) {
            console.error('Error bulk allocating stocks:', error)
            throw error
        }
    }

    // Helper methods for common operations
    async recordSale(stockId, saleData) {
        return this.createStockMovement(stockId, {
            movementType: 'SALE',
            quantity: saleData.quantity,
            openingStock: saleData.openingStock,
            closingStock: saleData.closingStock,
            recordedBy: { id: saleData.recordedById },
            activation: saleData.activationId ? { id: saleData.activationId } : null,
            reason: saleData.reason || 'Product sale'
        })
    }

    async recordSample(stockId, sampleData) {
        return this.createStockMovement(stockId, {
            movementType: 'SAMPLE',
            quantity: sampleData.quantity,
            openingStock: sampleData.openingStock,
            closingStock: sampleData.closingStock,
            recordedBy: { id: sampleData.recordedById },
            activation: sampleData.activationId ? { id: sampleData.activationId } : null,
            reason: sampleData.reason || 'Product sample'
        })
    }

    async recordReturn(stockId, returnData) {
        return this.createStockMovement(stockId, {
            movementType: 'RETURN',
            quantity: returnData.quantity,
            openingStock: returnData.openingStock,
            closingStock: returnData.closingStock,
            recordedBy: { id: returnData.recordedById },
            activation: returnData.activationId ? { id: returnData.activationId } : null,
            reason: returnData.reason || 'Product return'
        })
    }

    async recordDistribution(stockId, distributionData) {
        return this.createStockMovement(stockId, {
            movementType: 'DISTRIBUTION',
            quantity: distributionData.quantity,
            openingStock: distributionData.openingStock,
            closingStock: distributionData.closingStock,
            recordedBy: { id: distributionData.recordedById },
            activation: distributionData.activationId ? { id: distributionData.activationId } : null,
            reason: distributionData.reason || 'Product distribution'
        })
    }
}

export default new StockService()