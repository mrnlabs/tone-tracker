import { createRouter, createWebHistory } from 'vue-router'

// Import components
import Login from '@/views/auth/Login.vue'
import ForgotPassword from '@/views/auth/ForgotPassword.vue'
import Dashboard from '@/views/dashboard/Dashboard.vue'

// Client Management Views
import Clients from '@/views/clients/Clients.vue'
import CreateClient from '@/views/clients/CreateClient.vue'
import ClientDetails from '@/views/clients/ClientDetails.vue'
import EditClient from '@/views/clients/EditClient.vue'

// Activation Management Views
import Activations from '@/views/activations/Activations.vue'
import CreateActivation from '@/views/activations/CreateActivation.vue'
import ActivationDetails from '@/views/activations/ActivationDetails.vue'
import EditActivation from '@/views/activations/EditActivation.vue'

const routes = [
    // Auth Routes
    {
        path: '/',
        name: 'login',
        component: Login,
        meta: {
            requiresAuth: false,
            title: 'Login - Activation Tracker'
        }
    },
    {
        path: '/forgot-password',
        name: 'forgot-password',
        component: ForgotPassword,
        meta: {
            requiresAuth: false,
            title: 'Forgot Password - Activation Tracker'
        }
    },

    // Dashboard Routes
    {
        path: '/dashboard',
        name: 'dashboard',
        component: Dashboard,
        meta: {
            requiresAuth: true,
            title: 'Dashboard - Activation Tracker',
            roles: ['ADMIN', 'ACTIVATION_MANAGER', 'CLIENT', 'WAREHOUSE_MANAGER', 'PROMOTER']
        }
    },

    // Client Management Routes
    {
        path: '/clients',
        name: 'clients',
        component: Clients,
        meta: {
            requiresAuth: true,
            title: 'Clients - Activation Tracker',
            roles: ['ADMIN', 'ACTIVATION_MANAGER']
        }
    },
    {
        path: '/clients/create',
        name: 'create-client',
        component: CreateClient,
        meta: {
            requiresAuth: true,
            title: 'Add New Client - Activation Tracker',
            roles: ['ADMIN', 'ACTIVATION_MANAGER']
        }
    },
    {
        path: '/clients/:id',
        name: 'client-details',
        component: ClientDetails,
        meta: {
            requiresAuth: true,
            title: 'Client Details - Activation Tracker',
            roles: ['ADMIN', 'ACTIVATION_MANAGER', 'CLIENT']
        }
    },
    {
        path: '/clients/:id/edit',
        name: 'edit-client',
        component: EditClient,
        meta: {
            requiresAuth: true,
            title: 'Edit Client - Activation Tracker',
            roles: ['ADMIN', 'ACTIVATION_MANAGER']
        }
    },

    // Activation Management Routes
    {
        path: '/activations',
        name: 'activations',
        component: Activations,
        meta: {
            requiresAuth: true,
            title: 'Activations - Activation Tracker',
            roles: ['ADMIN', 'ACTIVATION_MANAGER', 'CLIENT', 'PROMOTER']
        }
    },
    {
        path: '/activations/create',
        name: 'create-activation',
        component: CreateActivation,
        meta: {
            requiresAuth: true,
            title: 'Create Activation - Activation Tracker',
            roles: ['ADMIN', 'ACTIVATION_MANAGER']
        }
    },
    {
        path: '/activations/:id',
        name: 'activation-details',
        component: ActivationDetails,
        meta: {
            requiresAuth: true,
            title: 'Activation Details - Activation Tracker',
            roles: ['ADMIN', 'ACTIVATION_MANAGER', 'CLIENT', 'PROMOTER']
        }
    },
    {
        path: '/activations/:id/edit',
        name: 'edit-activation',
        component: EditActivation,
        meta: {
            requiresAuth: true,
            title: 'Edit Activation - Activation Tracker',
            roles: ['ADMIN', 'ACTIVATION_MANAGER']
        }
    },

    // Other sections (using lazy loading)
    {
        path: '/promoters',
        name: 'promoters',
        component: () => import('@/views/promoters/Promoters.vue'),
        meta: {
            requiresAuth: true,
            title: 'Promoters - Activation Tracker',
            roles: ['ADMIN', 'ACTIVATION_MANAGER']
        }
    },
    {
        path: '/warehouses',
        name: 'warehouses',
        component: () => import('@/views/warehouses/Warehouses.vue'),
        meta: {
            requiresAuth: true,
            title: 'Warehouses - Activation Tracker',
            roles: ['ADMIN', 'WAREHOUSE_MANAGER', 'ACTIVATION_MANAGER']
        }
    }, {
        path: '/warehouses',
        name: 'warehouses',
        component: () => import('@/views/warehouses/Warehouses.vue'),
        meta: {
            requiresAuth: true,
            title: 'Warehouses - Activation Tracker',
            roles: ['ADMIN', 'WAREHOUSE_MANAGER', 'ACTIVATION_MANAGER']
        }
    },
    {
        path: '/warehouses/create',
        name: 'create-warehouse',
        component: () => import('@/views/warehouses/CreateWarehouse.vue'),
        meta: {
            requiresAuth: true,
            title: 'Create Warehouse - Activation Tracker',
            roles: ['ADMIN', 'WAREHOUSE_MANAGER']
        }
    },
    {
        path: '/warehouses/:id',
        name: 'warehouse-details',
        component: () => import('@/views/warehouses/WarehouseDetails.vue'),
        meta: {
            requiresAuth: true,
            title: 'Warehouse Details - Activation Tracker',
            roles: ['ADMIN', 'WAREHOUSE_MANAGER', 'ACTIVATION_MANAGER']
        }
    },
    {
        path: '/warehouses/:id/edit',
        name: 'edit-warehouse',
        component: () => import('@/views/warehouses/EditWarehouse.vue'),
        meta: {
            requiresAuth: true,
            title: 'Edit Warehouse - Activation Tracker',
            roles: ['ADMIN', 'WAREHOUSE_MANAGER']
        }
    },
    {
        path: '/warehouses/:id/inventory',
        name: 'warehouse-inventory',
        component: () => import('@/views/warehouses/WarehouseInventory.vue'),
        meta: {
            requiresAuth: true,
            title: 'Warehouse Inventory - Activation Tracker',
            roles: ['ADMIN', 'WAREHOUSE_MANAGER', 'ACTIVATION_MANAGER']
        }
    },
    {
        path: '/warehouses/inventory',
        name: 'inventory-management',
        component: () => import('@/views/warehouses/InventoryManagement.vue'),
        meta: {
            requiresAuth: true,
            title: 'Inventory Management - Activation Tracker',
            roles: ['ADMIN', 'WAREHOUSE_MANAGER', 'ACTIVATION_MANAGER']
        }
    },
    {
        path: '/warehouses/inventory/create',
        name: 'create-inventory-item',
        component: () => import('@/views/warehouses/CreateInventoryItem.vue'),
        meta: {
            requiresAuth: true,
            title: 'Add Inventory Item - Activation Tracker',
            roles: ['ADMIN', 'WAREHOUSE_MANAGER']
        }
    },
    {
        path: '/warehouses/inventory/:sku',
        name: 'inventory-item-details',
        component: () => import('@/views/warehouses/InventoryItemDetails.vue'),
        meta: {
            requiresAuth: true,
            title: 'Inventory Item Details - Activation Tracker',
            roles: ['ADMIN', 'WAREHOUSE_MANAGER', 'ACTIVATION_MANAGER']
        }
    },
    {
        path: '/warehouses/inventory/:sku/edit',
        name: 'edit-inventory-item',
        component: () => import('@/views/warehouses/EditInventoryItem.vue'),
        meta: {
            requiresAuth: true,
            title: 'Edit Inventory Item - Activation Tracker',
            roles: ['ADMIN', 'WAREHOUSE_MANAGER']
        }
    },
    {
        path: '/warehouses/inventory/:sku/history',
        name: 'inventory-history',
        component: () => import('@/views/warehouses/InventoryHistory.vue'),
        meta: {
            requiresAuth: true,
            title: 'Inventory History - Activation Tracker',
            roles: ['ADMIN', 'WAREHOUSE_MANAGER', 'ACTIVATION_MANAGER']
        }
    },
    {
        path: '/warehouses/inventory/:sku/allocate',
        name: 'allocate-inventory',
        component: () => import('@/views/warehouses/AllocateInventory.vue'),
        meta: {
            requiresAuth: true,
            title: 'Allocate Inventory - Activation Tracker',
            roles: ['ADMIN', 'WAREHOUSE_MANAGER', 'ACTIVATION_MANAGER']
        }
    },

// Stock Management Routes
    {
        path: '/warehouses/stock',
        name: 'stock-management',
        component: () => import('@/views/warehouses/StockManagement.vue'),
        meta: {
            requiresAuth: true,
            title: 'Stock Management - Activation Tracker',
            roles: ['ADMIN', 'WAREHOUSE_MANAGER', 'ACTIVATION_MANAGER']
        }
    },
    {
        path: '/warehouses/stock/movements',
        name: 'stock-movements',
        component: () => import('@/views/warehouses/StockMovements.vue'),
        meta: {
            requiresAuth: true,
            title: 'Stock Movements - Activation Tracker',
            roles: ['ADMIN', 'WAREHOUSE_MANAGER', 'ACTIVATION_MANAGER']
        }
    },
    {
        path: '/warehouses/stock/movements/:id',
        name: 'stock-movement-details',
        component: () => import('@/views/warehouses/StockMovementDetails.vue'),
        meta: {
            requiresAuth: true,
            title: 'Stock Movement Details - Activation Tracker',
            roles: ['ADMIN', 'WAREHOUSE_MANAGER', 'ACTIVATION_MANAGER']
        }
    },
    {
        path: '/warehouses/stock/transfers',
        name: 'stock-transfers',
        component: () => import('@/views/warehouses/StockTransfers.vue'),
        meta: {
            requiresAuth: true,
            title: 'Stock Transfers - Activation Tracker',
            roles: ['ADMIN', 'WAREHOUSE_MANAGER', 'ACTIVATION_MANAGER']
        }
    },
    {
        path: '/warehouses/stock/transfers/create',
        name: 'create-stock-transfer',
        component: () => import('@/views/warehouses/CreateStockTransfer.vue'),
        meta: {
            requiresAuth: true,
            title: 'Create Stock Transfer - Activation Tracker',
            roles: ['ADMIN', 'WAREHOUSE_MANAGER', 'ACTIVATION_MANAGER']
        }
    },
    {
        path: '/warehouses/stock/adjustments',
        name: 'stock-adjustments',
        component: () => import('@/views/warehouses/StockAdjustments.vue'),
        meta: {
            requiresAuth: true,
            title: 'Stock Adjustments - Activation Tracker',
            roles: ['ADMIN', 'WAREHOUSE_MANAGER']
        }
    },
    {
        path: '/warehouses/stock/adjustments/create',
        name: 'create-stock-adjustment',
        component: () => import('@/views/warehouses/CreateStockAdjustment.vue'),
        meta: {
            requiresAuth: true,
            title: 'Create Stock Adjustment - Activation Tracker',
            roles: ['ADMIN', 'WAREHOUSE_MANAGER']
        }
    },
    {
        path: '/warehouses/stock/allocations',
        name: 'stock-allocations',
        component: () => import('@/views/warehouses/StockAllocations.vue'),
        meta: {
            requiresAuth: true,
            title: 'Stock Allocations - Activation Tracker',
            roles: ['ADMIN', 'WAREHOUSE_MANAGER', 'ACTIVATION_MANAGER']
        }
    },
    {
        path: '/warehouses/stock/allocations/create',
        name: 'create-stock-allocation',
        component: () => import('@/views/warehouses/CreateStockAllocation.vue'),
        meta: {
            requiresAuth: true,
            title: 'Create Stock Allocation - Activation Tracker',
            roles: ['ADMIN', 'WAREHOUSE_MANAGER', 'ACTIVATION_MANAGER']
        }
    },
    {
        path: '/warehouses/stock/allocations/:id',
        name: 'stock-allocation-details',
        component: () => import('@/views/warehouses/StockAllocationDetails.vue'),
        meta: {
            requiresAuth: true,
            title: 'Stock Allocation Details - Activation Tracker',
            roles: ['ADMIN', 'WAREHOUSE_MANAGER', 'ACTIVATION_MANAGER']
        }
    },

// Warehouse Reports Routes
    {
        path: '/warehouses/reports',
        name: 'warehouse-reports',
        component: () => import('@/views/warehouses/WarehouseReports.vue'),
        meta: {
            requiresAuth: true,
            title: 'Warehouse Reports - Activation Tracker',
            roles: ['ADMIN', 'WAREHOUSE_MANAGER', 'ACTIVATION_MANAGER']
        }
    },
    {
        path: '/warehouses/reports/inventory',
        name: 'inventory-reports',
        component: () => import('@/views/warehouses/InventoryReports.vue'),
        meta: {
            requiresAuth: true,
            title: 'Inventory Reports - Activation Tracker',
            roles: ['ADMIN', 'WAREHOUSE_MANAGER', 'ACTIVATION_MANAGER']
        }
    },
    {
        path: '/warehouses/reports/movements',
        name: 'movement-reports',
        component: () => import('@/views/warehouses/MovementReports.vue'),
        meta: {
            requiresAuth: true,
            title: 'Movement Reports - Activation Tracker',
            roles: ['ADMIN', 'WAREHOUSE_MANAGER', 'ACTIVATION_MANAGER']
        }
    },
    {
        path: '/warehouses/reports/performance',
        name: 'warehouse-performance-reports',
        component: () => import('@/views/warehouses/PerformanceReports.vue'),
        meta: {
            requiresAuth: true,
            title: 'Warehouse Performance Reports - Activation Tracker',
            roles: ['ADMIN', 'WAREHOUSE_MANAGER', 'ACTIVATION_MANAGER']
        }
    },

// SKU Management Routes
    {
        path: '/warehouses/skus',
        name: 'sku-management',
        component: () => import('@/views/warehouses/SKUManagement.vue'),
        meta: {
            requiresAuth: true,
            title: 'SKU Management - Activation Tracker',
            roles: ['ADMIN', 'WAREHOUSE_MANAGER']
        }
    },
    {
        path: '/warehouses/skus/create',
        name: 'create-sku',
        component: () => import('@/views/warehouses/CreateSKU.vue'),
        meta: {
            requiresAuth: true,
            title: 'Create SKU - Activation Tracker',
            roles: ['ADMIN', 'WAREHOUSE_MANAGER']
        }
    },
    {
        path: '/warehouses/skus/:sku',
        name: 'sku-details',
        component: () => import('@/views/warehouses/SKUDetails.vue'),
        meta: {
            requiresAuth: true,
            title: 'SKU Details - Activation Tracker',
            roles: ['ADMIN', 'WAREHOUSE_MANAGER', 'ACTIVATION_MANAGER']
        }
    },
    {
        path: '/warehouses/skus/:sku/edit',
        name: 'edit-sku',
        component: () => import('@/views/warehouses/EditSKU.vue'),
        meta: {
            requiresAuth: true,
            title: 'Edit SKU - Activation Tracker',
            roles: ['ADMIN', 'WAREHOUSE_MANAGER']
        }
    },

    {
        path: '/reports',
        name: 'reports',
        component: () => import('@/views/reports/Reports.vue'),
        meta: {
            requiresAuth: true,
            title: 'Reports - Activation Tracker',
            roles: ['ADMIN', 'ACTIVATION_MANAGER', 'CLIENT', 'WAREHOUSE_MANAGER']
        }
    },
    {
        path: '/users',
        name: 'users',
        component: () => import('@/views/users/Users.vue'),
        meta: {
            requiresAuth: true,
            title: 'User Management - Activation Tracker',
            roles: ['ADMIN']
        }
    },

    // Catch-all route for 404
    {
        path: '/:pathMatch(.*)*',
        name: 'not-found',
        redirect: '/dashboard'
    }
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
})

// Enhanced navigation guard with role-based access
router.beforeEach((to, from, next) => {
    // Set page title
    document.title = to.meta.title || 'Activation Tracker'

    // Check if route requires authentication
    if (to.meta.requiresAuth) {
        const token = localStorage.getItem('authToken')
        const user = JSON.parse(localStorage.getItem('user') || 'null')

        if (!token || !user) {
            next('/')
            return
        }

        // Check role-based access
        if (to.meta.roles && !to.meta.roles.includes(user.role)) {
            // Redirect to dashboard if user doesn't have required role
            next('/dashboard')
            return
        }
    } else if (to.path === '/' && localStorage.getItem('authToken')) {
        // Redirect to dashboard if already logged in and trying to access login
        next('/dashboard')
        return
    }

    next()
})

export default router