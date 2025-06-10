
import ViewActivation from '@/views/activations/ViewActivation.vue';
import AdminActivations from '../views/activations/AdminActivations.vue';
import CreateActivation from '../views/activations/CreateActivation.vue';
import ActivationImages from '@/views/activations/ActivationImages.vue';
import EditActivation from '@/views/activations/EditActivation.vue';
export default [
        {
                path: '/admin-activations',
                name: 'admin-activations',
                component: AdminActivations,
        },
        {
                path: '/create-activation',
                name: 'create-activation',
                component: CreateActivation,
        },
        {
                path: '/edit-activation',
                name: 'edit-activation',
                component: EditActivation,
        },
        {
                path: '/view-activation',
                name: 'view-activation',
                component: ViewActivation,
        },
        {
                path: '/activation-images',
                name: 'activation-images',
                component: ActivationImages,
        }
];
