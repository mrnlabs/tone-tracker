// src/router/guards.js
// Route protection and navigation guards for the Activation Tracking System

import { useAuthStore } from '@/stores/auth'
import { canAccessRoute } from '@/utils/constants'

/**
 * Authentication guard - requires user to be logged in
 */
export const requireAuth = (to, from, next) => {
    const authStore = useAuthStore()

    if (!authStore.isAuthenticated) {
        // Store intended destination
        const redirectTo = to.fullPath !== '/login' ? to.fullPath : undefined

        next({
            path: '/login',
            query: redirectTo ? { redirect: redirectTo } : undefined
        })
        return
    }

    next()
}

/**
 * Guest guard - redirects authenticated users away from auth pages
 */
export const requireGuest = (to, from, next) => {
    const authStore = useAuthStore()

    if (authStore.isAuthenticated) {
        // Redirect authenticated users to dashboard
        next('/dashboard')
        return
    }

    next()
}

/**
 * Role-based access guard
 */
export const requireRole = (allowedRoles) => {
    return (to, from, next) => {
        const authStore = useAuthStore()

        if (!authStore.isAuthenticated) {
            next({
                path: '/login',
                query: { redirect: to.fullPath }
            })
            return
        }

        const userRole = authStore.userRole

        if (!allowedRoles.includes(userRole)) {
            next({
                path: '/unauthorized',
                query: { attempted: to.fullPath }
            })
            return
        }

        next()
    }
}

/**
 * Permission-based access guard
 */
export const requirePermission = (requiredPermissions) => {
    return (to, from, next) => {
        const authStore = useAuthStore()

        if (!authStore.isAuthenticated) {
            next({
                path: '/login',
                query: { redirect: to.fullPath }
            })
            return
        }

        if (!authStore.canAccessRoute(requiredPermissions)) {
            next({
                path: '/unauthorized',
                query: { attempted: to.fullPath }
            })
            return
        }

        next()
    }
}

/**
 * Admin-only guard
 */
export const requireAdmin = (to, from, next) => {
    const authStore = useAuthStore()

    if (!authStore.isAuthenticated) {
        next({
            path: '/login',
            query: { redirect: to.fullPath }
        })
        return
    }

    if (!authStore.isAdmin) {
        next({
            path: '/unauthorized',
            query: { attempted: to.fullPath }
        })
        return
    }

    next()
}

/**
 * Client-only guard
 */
export const requireClient = (to, from, next) => {
    const authStore = useAuthStore()

    if (!authStore.isAuthenticated) {
        next({
            path: '/login',
            query: { redirect: to.fullPath }
        })
        return
    }

    if (!authStore.isClient) {
        next({
            path: '/unauthorized',
            query: { attempted: to.fullPath }
        })
        return
    }

    next()
}

/**
 * Email verification guard
 */
export const requireEmailVerified = (to, from, next) => {
    const authStore = useAuthStore()

    if (!authStore.isAuthenticated) {
        next({
            path: '/login',
            query: { redirect: to.fullPath }
        })
        return
    }

    if (!authStore.user?.emailVerified) {
        next({
            path: '/verify-email',
            query: { redirect: to.fullPath }
        })
        return
    }

    next()
}

/**
 * Account active guard
 */
export const requireActiveAccount = (to, from, next) => {
    const authStore = useAuthStore()

    if (!authStore.isAuthenticated) {
        next({
            path: '/login',
            query: { redirect: to.fullPath }
        })
        return
    }

    if (!authStore.user?.active) {
        next({
            path: '/account-suspended',
            query: { attempted: to.fullPath }
        })
        return
    }

    next()
}

/**
 * Composite guard that combines multiple checks
 */
export const requireAuthAndPermissions = (options = {}) => {
    const {
        roles = [],
        permissions = [],
        requireEmailVerification = false,
        requireActiveAccount = true
    } = options

    return (to, from, next) => {
        const authStore = useAuthStore()

        // Check authentication
        if (!authStore.isAuthenticated) {
            next({
                path: '/login',
                query: { redirect: to.fullPath }
            })
            return
        }

        // Check account status
        if (requireActiveAccount && !authStore.user?.active) {
            next({
                path: '/account-suspended',
                query: { attempted: to.fullPath }
            })
            return
        }

        // Check email verification
        if (requireEmailVerification && !authStore.user?.emailVerified) {
            next({
                path: '/verify-email',
                query: { redirect: to.fullPath }
            })
            return
        }

        // Check roles
        if (roles.length > 0) {
            const userRole = authStore.userRole
            if (!roles.includes(userRole)) {
                next({
                    path: '/unauthorized',
                    query: { attempted: to.fullPath }
                })
                return
            }
        }

        // Check permissions
        if (permissions.length > 0) {
            if (!authStore.canAccessRoute(permissions)) {
                next({
                    path: '/unauthorized',
                    query: { attempted: to.fullPath }
                })
                return
            }
        }

        next()
    }
}

/**
 * Navigation guard to update user activity
 */
export const updateActivity = (to, from, next) => {
    const authStore = useAuthStore()

    if (authStore.isAuthenticated) {
        authStore.updateLastActivity()
    }

    next()
}

/**
 * Guard to handle route meta requirements
 */
export const handleRouteMeta = (to, from, next) => {
    const authStore = useAuthStore()

    // Check if route requires authentication
    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
        next({
            path: '/login',
            query: { redirect: to.fullPath }
        })
        return
    }

    // Check if route is guest-only
    if (to.meta.guestOnly && authStore.isAuthenticated) {
        next('/dashboard')
        return
    }

    // Check roles
    if (to.meta.roles && to.meta.roles.length > 0) {
        if (!authStore.isAuthenticated) {
            next({
                path: '/login',
                query: { redirect: to.fullPath }
            })
            return
        }

        const userRole = authStore.userRole
        if (!to.meta.roles.includes(userRole)) {
            next({
                path: '/unauthorized',
                query: { attempted: to.fullPath }
            })
            return
        }
    }

    // Check permissions
    if (to.meta.permissions && to.meta.permissions.length > 0) {
        if (!authStore.isAuthenticated) {
            next({
                path: '/login',
                query: { redirect: to.fullPath }
            })
            return
        }

        if (!authStore.canAccessRoute(to.meta.permissions)) {
            next({
                path: '/unauthorized',
                query: { attempted: to.fullPath }
            })
            return
        }
    }

    next()
}

/**
 * Global before guard setup
 */
export const setupGlobalGuards = (router) => {
    // Update activity on route changes
    router.beforeEach(updateActivity)

    // Handle route meta requirements
    router.beforeEach(handleRouteMeta)

    // Track navigation for analytics (optional)
    router.beforeEach((to, from, next) => {
        // You can add analytics tracking here
        // trackPageView(to.path, to.name)
        next()
    })

    // Handle navigation errors
    router.onError((error) => {
        console.error('Router navigation error:', error)

        // You can add error reporting here
        // reportError(error)
    })
}

/**
 * Route-specific guard helpers
 */
export const guardHelpers = {
    // Quick check if user can access a route
    canUserAccess: (routePath, userRole, userPermissions = []) => {
        // This would check against your route configuration
        // For now, return true - implement based on your route structure
        return true
    },

    // Get redirect path for unauthorized access
    getUnauthorizedRedirect: (attemptedPath, userRole) => {
        if (!userRole) {
            return '/login'
        }

        // Role-specific redirects
        switch (userRole) {
            case 'CLIENT':
                return '/client-dashboard'
            case 'PROMOTER':
                return '/promoter-dashboard'
            case 'ACTIVATION_MANAGER':
                return '/manager-dashboard'
            case 'WAREHOUSE_MANAGER':
                return '/warehouse-dashboard'
            case 'ADMIN':
                return '/admin-dashboard'
            default:
                return '/dashboard'
        }
    },

    // Check if route should be protected
    shouldProtectRoute: (routePath) => {
        const publicRoutes = [
            '/login',
            '/register',
            '/forgot-password',
            '/reset-password',
            '/verify-email',
            '/privacy',
            '/terms',
            '/support'
        ]

        return !publicRoutes.some(route => routePath.startsWith(route))
    }
}

// Export all guards and helpers
export default {
    requireAuth,
    requireGuest,
    requireRole,
    requirePermission,
    requireAdmin,
    requireClient,
    requireEmailVerified,
    requireActiveAccount,
    requireAuthAndPermissions,
    updateActivity,
    handleRouteMeta,
    setupGlobalGuards,
    guardHelpers
}