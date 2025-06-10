import AdminViewWarehouse from '@/views/warehouses/AdminViewWarehouse.vue';
import AdminWarehouse from '@/views/warehouses/AdminWarehouse.vue';
import Units from '@/views/warehouses/Units.vue';
export default [
    {
        path: '/admin-warehouse',
        name: 'Adminwarehouse',
        component: AdminWarehouse
      },
      {
        path: '/admin-view-warehouses-by-region/:id',
        name: 'AdminViewWarehouse',
        component: AdminViewWarehouse
      },
      {
        path: '/view-warehouse/:id',
        name: 'view-warehouse',
        component: Units
      },
      
  ]