import Cost from '@/views/suppliers/Cost.vue';
export default [
    {
        path: '/costs',
        name: 'cost',
        component: Cost
    },
    {
        path: '/add-supplier-costing/:id/:bidId',
        name: 'add-supplier-costing',
        component: Cost
    }
]