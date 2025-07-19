// src/router/warehouses.js
// Warehouse and inventory management routes for the Activation Tracking System

export const warehouseRoutes = [
  {
    path: '/warehouses',
    name: 'Warehouses',
    component: () => import('@/views/warehouses/Warehouses.vue'),
    meta: {
      requiresAuth: true,
      roles: ['ADMIN', 'WAREHOUSE_MANAGER', 'ACTIVATION_MANAGER'],
      title: 'Warehouse Management'
    }
  },
  {
    path: '/warehouses/create',
    name: 'CreateWarehouse',
    component: () => import('@/views/warehouses/CreateWarehouse.vue'),
    meta: {
      requiresAuth: true,
      roles: ['ADMIN', 'WAREHOUSE_MANAGER'],
      title: 'Create Warehouse'
    }
  },
  {
    path: '/warehouses/:id',
    name: 'WarehouseDetails',
    component: () => import('@/views/warehouses/WarehouseDetails.vue'),
    meta: {
      requiresAuth: true,
      roles: ['ADMIN', 'WAREHOUSE_MANAGER', 'ACTIVATION_MANAGER'],
      title: 'Warehouse Details'
    }
  },
  {
    path: '/warehouses/:id/edit',
    name: 'EditWarehouse',
    component: () => import('@/views/warehouses/EditWarehouse.vue'),
    meta: {
      requiresAuth: true,
      roles: ['ADMIN', 'WAREHOUSE_MANAGER'],
      title: 'Edit Warehouse'
    }
  },
  {
    path: '/warehouses/:id/inventory',
    name: 'WarehouseInventory',
    component: () => import('@/views/warehouses/WarehouseInventory.vue'),
    meta: {
      requiresAuth: true,
      roles: ['ADMIN', 'WAREHOUSE_MANAGER', 'ACTIVATION_MANAGER'],
      title: 'Warehouse Inventory'
    }
  },
  {
    path: '/warehouses/inventory',
    name: 'InventoryManagement',
    component: () => import('@/views/warehouses/InventoryManagement.vue'),
    meta: {
      requiresAuth: true,
      roles: ['ADMIN', 'WAREHOUSE_MANAGER', 'ACTIVATION_MANAGER'],
      title: 'Inventory Management'
    }
  },
  {
    path: '/warehouses/stock',
    name: 'StockManagement',
    component: () => import('@/views/warehouses/StockManagement.vue'),
    meta: {
      requiresAuth: true,
      roles: ['ADMIN', 'WAREHOUSE_MANAGER'],
      title: 'Stock Management'
    }
  },
  {
    path: '/warehouses/reports',
    name: 'WarehouseReports',
    component: () => import('@/views/warehouses/WarehouseReports.vue'),
    meta: {
      requiresAuth: true,
      roles: ['ADMIN', 'WAREHOUSE_MANAGER', 'ACTIVATION_MANAGER'],
      title: 'Warehouse Reports'
    }
  },
  {
    path: '/warehouses/stock-movements',
    name: 'StockMovements',
    component: () => import('@/views/warehouses/StockMovements.vue'),
    meta: {
      requiresAuth: true,
      roles: ['ADMIN', 'WAREHOUSE_MANAGER', 'ACTIVATION_MANAGER', 'PROMOTER'],
      title: 'Stock Movements'
    }
  },
  {
    path: '/warehouses/stock-adjustments',
    name: 'StockAdjustments',
    component: () => import('@/views/warehouses/StockAdjustments.vue'),
    meta: {
      requiresAuth: true,
      roles: ['ADMIN', 'WAREHOUSE_MANAGER'],
      title: 'Stock Adjustments'
    }
  },
  {
    path: '/warehouses/stock-transfers',
    name: 'StockTransfers',
    component: () => import('@/views/warehouses/StockTransfers.vue'),
    meta: {
      requiresAuth: true,
      roles: ['ADMIN', 'WAREHOUSE_MANAGER', 'ACTIVATION_MANAGER'],
      title: 'Stock Transfers'
    }
  }
]

export default warehouseRoutes