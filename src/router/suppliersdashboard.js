import SupplierBrief from "@/views/suppliers/SupplierBrief.vue";
import SuppliersDashboard from "../views/suppliers/SuppliersDashboard.vue";
import ViewSupplierTask from "@/views/suppliers/ViewSupplierTask.vue";
import SupplierAwarded from "@/views/suppliers/SupplierAwarded.vue";
import ViewSupplierAwardedTask from "@/views/suppliers/ViewSupplierAwardedTask.vue";
import Suppliers from "@/views/suppliers/Suppliers.vue";

export default [
    {
        path: '/suppliers',
        name: 'suppliers',
        component: Suppliers
    },
    {
        path: '/supplier-dashboard',
        name: 'supplier-dashboard',
        component: SuppliersDashboard
    },
    {
        path: '/supplier-briefs',
        name: 'supplier-briefs',
        component: SupplierBrief
    },
    {
        path: '/view-supplier-task/:id/:bidId',
        name: 'view-supplier-task',
        component: ViewSupplierTask
    },
    {
        path: '/supplier-awarded-tasks',
        name: 'supplier-awarded-tasks',
        component: SupplierAwarded
    },
    {
        path: '/view-awarded-tasks/:id',
        name: 'view-awarded-tasks',
        component: ViewSupplierAwardedTask
    },
]