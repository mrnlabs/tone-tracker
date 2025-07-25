// utils/warehouseNavigation.js
// Helper functions for warehouse navigation

import { useRouter } from 'vue-router'

export const useWarehouseNavigation = () => {
    const router = useRouter()

    // Warehouse Management Navigation
    const navigateToWarehouses = () => router.push('/warehouses')
    const navigateToCreateWarehouse = () => router.push('/warehouses/create')
    const navigateToWarehouseDetails = (id) => router.push(`/warehouses/${id}`)
    const navigateToEditWarehouse = (id) => router.push(`/warehouses/${id}/edit`)
    const navigateToWarehouseInventory = (id) => router.push(`/warehouses/${id}/inventory`)

    // Inventory Management Navigation
    const navigateToInventoryManagement = () => router.push('/warehouses/inventory')
    const navigateToCreateInventoryItem = () => router.push('/warehouses/inventory/create')
    const navigateToInventoryItemDetails = (sku) => router.push(`/warehouses/inventory/${sku}`)
    const navigateToEditInventoryItem = (sku) => router.push(`/warehouses/inventory/${sku}/edit`)
    const navigateToInventoryHistory = (sku) => router.push(`/warehouses/inventory/${sku}/history`)
    const navigateToAllocateInventory = (sku) => router.push(`/warehouses/inventory/${sku}/allocate`)

    // Stock Management Navigation
    const navigateToStockManagement = () => router.push('/warehouses/stock')
    const navigateToStockMovements = () => router.push('/warehouses/stock/movements')
    const navigateToStockMovementDetails = (id) => router.push(`/warehouses/stock/movements/${id}`)
    const navigateToStockTransfers = () => router.push('/warehouses/stock/transfers')
    const navigateToCreateStockTransfer = () => router.push('/warehouses/stock/transfers/create')
    const navigateToStockAdjustments = () => router.push('/warehouses/stock/adjustments')
    const navigateToCreateStockAdjustment = () => router.push('/warehouses/stock/adjustments/create')
    const navigateToStockAllocations = () => router.push('/warehouses/stock/allocations')
    const navigateToCreateStockAllocation = () => router.push('/warehouses/stock/allocations/create')
    const navigateToStockAllocationDetails = (id) => router.push(`/warehouses/stock/allocations/${id}`)

    // Reports Navigation
    const navigateToWarehouseReports = () => router.push('/warehouses/reports')
    const navigateToInventoryReports = () => router.push('/warehouses/reports/inventory')
    const navigateToMovementReports = () => router.push('/warehouses/reports/movements')
    const navigateToPerformanceReports = () => router.push('/warehouses/reports/performance')

    // SKU Management Navigation
    const navigateToSKUManagement = () => router.push('/warehouses/skus')
    const navigateToCreateSKU = () => router.push('/warehouses/skus/create')
    const navigateToSKUDetails = (sku) => router.push(`/warehouses/skus/${sku}`)
    const navigateToEditSKU = (sku) => router.push(`/warehouses/skus/${sku}/edit`)

    // Supplier Management Navigation
    const navigateToSupplierManagement = () => router.push('/warehouses/suppliers')
    const navigateToCreateSupplier = () => router.push('/warehouses/suppliers/create')
    const navigateToSupplierDetails = (id) => router.push(`/warehouses/suppliers/${id}`)
    const navigateToEditSupplier = (id) => router.push(`/warehouses/suppliers/${id}/edit`)

    // Purchase Orders Navigation
    const navigateToPurchaseOrders = () => router.push('/warehouses/purchase-orders')
    const navigateToCreatePurchaseOrder = () => router.push('/warehouses/purchase-orders/create')
    const navigateToPurchaseOrderDetails = (id) => router.push(`/warehouses/purchase-orders/${id}`)
    const navigateToEditPurchaseOrder = (id) => router.push(`/warehouses/purchase-orders/${id}/edit`)

    // Utility functions
    const getCurrentRoute = () => router.currentRoute.value
    const goBack = () => router.go(-1)
    const goToParent = () => {
        const currentPath = router.currentRoute.value.path
        const segments = currentPath.split('/').filter(Boolean)
        if (segments.length > 1) {
            segments.pop()
            router.push('/' + segments.join('/'))
        }
    }

    return {
        // Warehouse Management
        navigateToWarehouses,
        navigateToCreateWarehouse,
        navigateToWarehouseDetails,
        navigateToEditWarehouse,
        navigateToWarehouseInventory,

        // Inventory Management
        navigateToInventoryManagement,
        navigateToCreateInventoryItem,
        navigateToInventoryItemDetails,
        navigateToEditInventoryItem,
        navigateToInventoryHistory,
        navigateToAllocateInventory,

        // Stock Management
        navigateToStockManagement,
        navigateToStockMovements,
        navigateToStockMovementDetails,
        navigateToStockTransfers,
        navigateToCreateStockTransfer,
        navigateToStockAdjustments,
        navigateToCreateStockAdjustment,
        navigateToStockAllocations,
        navigateToCreateStockAllocation,
        navigateToStockAllocationDetails,

        // Reports
        navigateToWarehouseReports,
        navigateToInventoryReports,
        navigateToMovementReports,
        navigateToPerformanceReports,

        // SKU Management
        navigateToSKUManagement,
        navigateToCreateSKU,
        navigateToSKUDetails,
        navigateToEditSKU,

        // Supplier Management
        navigateToSupplierManagement,
        navigateToCreateSupplier,
        navigateToSupplierDetails,
        navigateToEditSupplier,

        // Purchase Orders
        navigateToPurchaseOrders,
        navigateToCreatePurchaseOrder,
        navigateToPurchaseOrderDetails,
        navigateToEditPurchaseOrder,

        // Utilities
        getCurrentRoute,
        goBack,
        goToParent
    }
}

// Route validation helper
export const validateWarehouseRoute = (route, userRole) => {
    const warehouseRoutes = [
        '/warehouses',
        '/warehouses/inventory',
        '/warehouses/stock',
        '/warehouses/reports',
        '/warehouses/skus',
        '/warehouses/suppliers',
        '/warehouses/purchase-orders'
    ]

    const adminOnlyRoutes = [
        '/warehouses/create',
        '/warehouses/skus/create',
        '/warehouses/suppliers/create',
        '/warehouses/purchase-orders/create'
    ]

    const warehouseManagerRoutes = [
        '/warehouses/stock/adjustments',
        '/warehouses/stock/adjustments/create'
    ]

    // Check if user has access to warehouse routes
    if (warehouseRoutes.some(r => route.path.startsWith(r))) {
        const allowedRoles = ['ADMIN', 'WAREHOUSE_MANAGER']
        if (!allowedRoles.includes(userRole)) {
            return false
        }
    }

    // Check admin-only routes
    if (adminOnlyRoutes.some(r => route.path.includes(r))) {
        return userRole === 'ADMIN' || userRole === 'WAREHOUSE_MANAGER'
    }

    // Check warehouse manager specific routes
    if (warehouseManagerRoutes.some(r => route.path.includes(r))) {
        return userRole === 'ADMIN' || userRole === 'WAREHOUSE_MANAGER'
    }

    return true
}

// Generate breadcrumb navigation
export const generateWarehouseBreadcrumb = (route) => {
    const pathSegments = route.path.split('/').filter(Boolean)
    const breadcrumbs = []

    // Base breadcrumb
    breadcrumbs.push({
        label: 'Dashboard',
        path: '/dashboard',
        icon: 'pi pi-home'
    })

    if (pathSegments.length > 0 && pathSegments[0] === 'warehouses') {
        breadcrumbs.push({
            label: 'Warehouses',
            path: '/warehouses',
            icon: 'pi pi-box'
        })

        // Handle specific warehouse sections
        if (pathSegments.length > 1) {
            switch (pathSegments[1]) {
                case 'inventory':
                    breadcrumbs.push({
                        label: 'Inventory Management',
                        path: '/warehouses/inventory',
                        icon: 'pi pi-list'
                    })
                    break
                case 'stock':
                    breadcrumbs.push({
                        label: 'Stock Management',
                        path: '/warehouses/stock',
                        icon: 'pi pi-shopping-cart'
                    })
                    break
                case 'reports':
                    breadcrumbs.push({
                        label: 'Reports',
                        path: '/warehouses/reports',
                        icon: 'pi pi-chart-bar'
                    })
                    break
                case 'skus':
                    breadcrumbs.push({
                        label: 'SKU Management',
                        path: '/warehouses/skus',
                        icon: 'pi pi-tags'
                    })
                    break
                case 'suppliers':
                    breadcrumbs.push({
                        label: 'Supplier Management',
                        path: '/warehouses/suppliers',
                        icon: 'pi pi-truck'
                    })
                    break
                case 'purchase-orders':
                    breadcrumbs.push({
                        label: 'Purchase Orders',
                        path: '/warehouses/purchase-orders',
                        icon: 'pi pi-file-import'
                    })
                    break
                case 'create':
                    breadcrumbs.push({
                        label: 'Create Warehouse',
                        path: '/warehouses/create',
                        icon: 'pi pi-plus'
                    })
                    break
                default:
                    // Handle warehouse details
                    if (pathSegments[1] && !isNaN(pathSegments[1])) {
                        breadcrumbs.push({
                            label: 'Warehouse Details',
                            path: `/warehouses/${pathSegments[1]}`,
                            icon: 'pi pi-info-circle'
                        })
                    }
            }
        }

        // Handle deeper navigation
        if (pathSegments.length > 2) {
            const action = pathSegments[pathSegments.length - 1]
            switch (action) {
                case 'create':
                    breadcrumbs.push({
                        label: 'Create',
                        path: route.path,
                        icon: 'pi pi-plus'
                    })
                    break
                case 'edit':
                    breadcrumbs.push({
                        label: 'Edit',
                        path: route.path,
                        icon: 'pi pi-pencil'
                    })
                    break
                case 'history':
                    breadcrumbs.push({
                        label: 'History',
                        path: route.path,
                        icon: 'pi pi-clock'
                    })
                    break
                case 'allocate':
                    breadcrumbs.push({
                        label: 'Allocate',
                        path: route.path,
                        icon: 'pi pi-send'
                    })
                    break
            }
        }
    }

    return breadcrumbs
}