// Role checking middleware for the Activation Tracking System

import { useAuthStore } from '@/stores/auth'
import { hasPermission, USER_ROLES } from '@/utils/constants'

/**
 * Check if user has required role(s)
 * @param {string|Array} requiredRoles - Single role or array of roles
 * @returns {boolean} - True if user has required role
 */
export const hasRole = (requiredRoles) => {
  const authStore = useAuthStore()
  const userRole = authStore.userRole
  
  if (!userRole) return false
  
  if (Array.isArray(requiredRoles)) {
    return requiredRoles.includes(userRole)
  }
  
  return userRole === requiredRoles
}

/**
 * Check if user has specific permission
 * @param {string} permission - Permission to check
 * @returns {boolean} - True if user has permission
 */
export const hasUserPermission = (permission) => {
  const authStore = useAuthStore()
  return hasPermission(authStore.userRole, permission)
}

/**
 * Check if user can access a specific route
 * @param {Object} route - Vue route object
 * @returns {boolean} - True if user can access route
 */
export const canAccessRoute = (route) => {
  const authStore = useAuthStore()
  
  // If route doesn't require auth, allow access
  if (!route.meta?.requiresAuth) return true
  
  // If user is not authenticated, deny access
  if (!authStore.isAuthenticated) return false
  
  // If route has no role restrictions, allow access
  if (!route.meta?.roles || route.meta.roles.length === 0) return true
  
  // Check if user has any of the required roles
  return hasRole(route.meta.roles)
}

/**
 * Admin role check
 * @returns {boolean} - True if user is admin
 */
export const isAdmin = () => hasRole(USER_ROLES.ADMIN)

/**
 * Activation manager role check
 * @returns {boolean} - True if user is activation manager
 */
export const isActivationManager = () => hasRole(USER_ROLES.ACTIVATION_MANAGER)

/**
 * Warehouse manager role check
 * @returns {boolean} - True if user is warehouse manager
 */
export const isWarehouseManager = () => hasRole(USER_ROLES.WAREHOUSE_MANAGER)

/**
 * Promoter role check
 * @returns {boolean} - True if user is promoter
 */
export const isPromoter = () => hasRole(USER_ROLES.PROMOTER)

/**
 * Client role check
 * @returns {boolean} - True if user is client
 */
export const isClient = () => hasRole(USER_ROLES.CLIENT)

/**
 * Check if user can manage other users
 * @returns {boolean} - True if user can manage users
 */
export const canManageUsers = () => hasUserPermission('manage_users')

/**
 * Check if user can manage activations
 * @returns {boolean} - True if user can manage activations
 */
export const canManageActivations = () => hasUserPermission('manage_activations')

/**
 * Check if user can manage warehouse
 * @returns {boolean} - True if user can manage warehouse
 */
export const canManageWarehouse = () => hasUserPermission('manage_warehouse')

/**
 * Check if user can view reports
 * @returns {boolean} - True if user can view reports
 */
export const canViewReports = () => {
  return hasUserPermission('view_all_reports') || 
         hasUserPermission('view_activation_reports') || 
         hasUserPermission('view_own_reports')
}

/**
 * Router guard helper for role-based access control
 * @param {Array} allowedRoles - Array of roles allowed to access the route
 * @returns {Function} - Router guard function
 */
export const requireRoles = (allowedRoles) => {
  return (to, from, next) => {
    if (hasRole(allowedRoles)) {
      next()
    } else {
      // Redirect to dashboard or show unauthorized message
      next('/dashboard')
    }
  }
}

export default {
  hasRole,
  hasUserPermission,
  canAccessRoute,
  isAdmin,
  isActivationManager,
  isWarehouseManager,
  isPromoter,
  isClient,
  canManageUsers,
  canManageActivations,
  canManageWarehouse,
  canViewReports,
  requireRoles
}