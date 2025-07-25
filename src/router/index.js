import { createRouter, createWebHistory } from 'vue-router'
import { STORAGE_KEYS } from '@/utils/constants'

// Auth views - keep these non-lazy for faster initial load
import Login from '@/views/auth/Login.vue'
import ForgotPassword from '@/views/auth/ForgotPassword.vue'
import ResetPassword from '@/views/auth/ResetPassword.vue'

// Dashboard - keep this non-lazy as it's frequently accessed
import Dashboard from '@/views/dashboard/Dashboard.vue'

// All other views will be lazy-loaded

// Import warehouse routes
import { warehouseRoutes } from './warehouses'

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
    {
        path: '/reset-password',
        name: 'reset-password',
        component: ResetPassword,
        meta: {
            requiresAuth: false,
            title: 'Reset Password - Activation Tracker'
        }
    },

    // Dashboard Routes - No role restrictions
    {
        path: '/dashboard',
        name: 'dashboard',
        component: Dashboard,
        meta: {
            requiresAuth: true,
            title: 'Dashboard - Activation Tracker'
            // No roles restriction - accessible to all authenticated users
        }
    },

    // Client Management Routes
    {
        path: '/clients',
        name: 'clients',
        component: () => import('@/views/clients/Clients.vue'),
        meta: {
            requiresAuth: true,
            title: 'Clients - Activation Tracker',
            roles: ['ADMIN']
        }
    },
    {
        path: '/clients/create',
        name: 'create-client',
        component: () => import('@/views/clients/CreateClient.vue'),
        meta: {
            requiresAuth: true,
            title: 'Add New Client - Activation Tracker',
            roles: ['ADMIN']
        }
    },
    {
        path: '/clients/:id',
        name: 'client-details',
        component: () => import('@/views/clients/ClientDetails.vue'),
        meta: {
            requiresAuth: true,
            title: 'Client Details - Activation Tracker',
            roles: ['ADMIN', 'CLIENT']
        }
    },
    {
        path: '/clients/:id/edit',
        name: 'edit-client',
        component: () => import('@/views/clients/EditClient.vue'),
        meta: {
            requiresAuth: true,
            title: 'Edit Client - Activation Tracker',
            roles: ['ADMIN']
        }
    },

    // Activation Management Routes
    {
        path: '/activations',
        name: 'activations',
        component: () => import('@/views/activations/Activations.vue'),
        meta: {
            requiresAuth: true,
            title: 'Activations - Activation Tracker',
            roles: ['ADMIN', 'ACTIVATION_MANAGER', 'CLIENT', 'PROMOTER']
        }
    },
    {
        path: '/activations/create',
        name: 'create-activation',
        component: () => import('@/views/activations/CreateActivation.vue'),
        meta: {
            requiresAuth: true,
            title: 'Create Activation - Activation Tracker',
            roles: ['ADMIN']
        }
    },
    {
        path: '/activations/:id',
        name: 'activation-details',
        component: () => import('@/views/activations/ActivationDetails.vue'),
        meta: {
            requiresAuth: true,
            title: 'Activation Details - Activation Tracker',
            roles: ['ADMIN', 'ACTIVATION_MANAGER', 'CLIENT', 'PROMOTER']
        }
    },
    {
        path: '/activations/:id/edit',
        name: 'edit-activation',
        component: () => import('@/views/activations/EditActivation.vue'),
        meta: {
            requiresAuth: true,
            title: 'Edit Activation - Activation Tracker',
            roles: ['ADMIN']
        }
    },
    {
        path: '/activations/:id/team',
        name: 'activation-team',
        component: () => import('@/views/activations/ActivationTeam.vue'),
        meta: {
            requiresAuth: true,
            title: 'Manage Team - Activation Tracker',
            roles: ['ADMIN', 'ACTIVATION_MANAGER']
        }
    },
    {
        path: '/activations/briefs',
        name: 'activation-briefs',
        component: () => import('@/views/activations/ActivationBriefs.vue'),
        meta: {
            requiresAuth: true,
            title: 'Activation Briefs - Activation Tracker',
            roles: ['ADMIN', 'ACTIVATION_MANAGER', 'CLIENT', 'PROMOTER']
        }
    },

    // Promoter Management Routes
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
        path: '/promoters/create',
        name: 'create-promoter',
        component: () => import('@/views/promoters/CreatePromoter.vue'),
        meta: {
            requiresAuth: true,
            title: 'Add New Promoter - Activation Tracker',
            roles: ['ADMIN', 'ACTIVATION_MANAGER']
        }
    },
    {
        path: '/promoters/:id',
        name: 'promoter-details',
        component: () => import('@/views/promoters/PromoterDetails.vue'),
        meta: {
            requiresAuth: true,
            title: 'Promoter Details - Activation Tracker',
            roles: ['ADMIN', 'ACTIVATION_MANAGER', 'PROMOTER']
        }
    },
    {
        path: '/promoters/:id/edit',
        name: 'edit-promoter',
        component: () => import('@/views/promoters/EditPromoter.vue'),
        meta: {
            requiresAuth: true,
            title: 'Edit Promoter - Activation Tracker',
            roles: ['ADMIN', 'ACTIVATION_MANAGER']
        }
    },

    // Warehouse routes (imported from separate file)
    ...warehouseRoutes,


    {
        path: '/reports',
        name: 'reports',
        component: () => import('@/views/reports/Reports.vue'),
        meta: {
            requiresAuth: true,
            title: 'Reports - Activation Tracker',
            roles: ['ADMIN', 'ACTIVATION_MANAGER', 'CLIENT']
        }
    },
    {
        path: '/reports/stock-movements',
        name: 'stock-movement-report',
        component: () => import('@/views/reports/StockMovementReport.vue'),
        meta: {
            requiresAuth: true,
            title: 'Stock Movement Report - Activation Tracker',
            roles: ['ADMIN', 'WAREHOUSE_MANAGER', 'ACTIVATION_MANAGER']
        }
    },
    
    // Stock Movement Routes
    {
        path: '/stock-movements',
        name: 'stock-movements',
        component: () => import('@/views/stock-movements/StockMovements.vue'),
        meta: {
            requiresAuth: true,
            title: 'Stock Movements - Activation Tracker',
            roles: ['ADMIN', 'WAREHOUSE_MANAGER', 'ACTIVATION_MANAGER']
        }
    },
    {
        path: '/stock-movements/create',
        name: 'create-stock-movement',
        component: () => import('@/views/stock-movements/CreateStockMovement.vue'),
        meta: {
            requiresAuth: true,
            title: 'Record Stock Movement - Activation Tracker',
            roles: ['ADMIN', 'WAREHOUSE_MANAGER', 'ACTIVATION_MANAGER']
        }
    },
    {
        path: '/stock-movements/:id',
        name: 'stock-movement-details',
        component: () => import('@/views/stock-movements/StockMovementDetails.vue'),
        meta: {
            requiresAuth: true,
            title: 'Stock Movement Details - Activation Tracker',
            roles: ['ADMIN', 'WAREHOUSE_MANAGER', 'ACTIVATION_MANAGER']
        }
    },
    {
        path: '/stock-movements/:id/edit',
        name: 'edit-stock-movement',
        component: () => import('@/views/stock-movements/EditStockMovement.vue'),
        meta: {
            requiresAuth: true,
            title: 'Edit Stock Movement - Activation Tracker',
            roles: ['ADMIN', 'WAREHOUSE_MANAGER']
        }
    },
    // User Management Routes
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
    {
        path: '/users/create',
        name: 'create-user',
        component: () => import('@/views/users/CreateUser.vue'),
        meta: {
            requiresAuth: true,
            title: 'Add New User - Activation Tracker',
            roles: ['ADMIN']
        }
    },
    {
        path: '/users/:id',
        name: 'user-details',
        component: () => import('@/views/users/UserDetails.vue'),
        meta: {
            requiresAuth: true,
            title: 'User Details - Activation Tracker',
            roles: ['ADMIN']
        }
    },
    {
        path: '/users/:id/edit',
        name: 'edit-user',
        component: () => import('@/views/users/EditUser.vue'),
        meta: {
            requiresAuth: true,
            title: 'Edit User - Activation Tracker',
            roles: ['ADMIN']
        }
    },

    // Profile Routes - Accessible to all authenticated users
    {
        path: '/profile',
        name: 'profile',
        component: () => import('@/views/dashboard/Profile.vue'),
        meta: {
            requiresAuth: true,
            title: 'My Profile - Activation Tracker'
        }
    },

    // Test route for component development
    {
        path: '/test/components',
        name: 'component-test',
        component: () => import('@/views/test/ComponentTest.vue'),
        meta: {
            requiresAuth: false,
            title: 'Component Test - Debug'
        }
    },

    // Catch-all route
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

// Enhanced navigation guard with proper token checking
router.beforeEach((to, from, next) => {
    console.log(`🚦 Router Guard: Navigating to ${to.path}`)

    // Set page title
    document.title = to.meta.title || 'Activation Tracker'

    // Check if route requires authentication
    if (to.meta.requiresAuth) {
        // Check for authentication token using consistent storage key
        const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
        let user = null
        try {
            const userStr = localStorage.getItem('user')
            user = userStr && userStr !== 'undefined' ? JSON.parse(userStr) : null
        } catch (error) {
            console.warn('Failed to parse user from localStorage:', error)
            user = null
        }

        console.log(`🔍 Auth check - Token: ${token ? 'EXISTS' : 'MISSING'}, User: ${user ? 'EXISTS' : 'MISSING'}`)

        if (!token) {
            console.log('❌ No token found, redirecting to login')
            next('/')
            return
        }

        // Dashboard route has no role restrictions
        if (to.name === 'dashboard') {
            console.log('✅ Dashboard access granted')
            next()
            return
        }

        // Check role-based access for other routes
        if (to.meta.roles && user && !to.meta.roles.includes(user.role)) {
            console.log(`❌ Role ${user.role} not allowed for ${to.path}, redirecting to dashboard`)
            next('/dashboard')
            return
        }

        console.log('✅ Access granted')
        next()
    } else {
        // Public routes (login, forgot password)
        const token = localStorage.getItem('activation_auth_token')

        if (to.path === '/' && token) {
            console.log('🔄 Already authenticated, redirecting to dashboard')
            next('/dashboard')
            return
        }

        console.log('✅ Public route access granted')
        next()
    }
})

export default router