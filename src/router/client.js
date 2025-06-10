import ClientCampaigns from '@/views/clientDashboard/ClientCampaigns.vue';
import Client from '../views/clients/Client.vue';
import AdminContact from '@/views/admincontacts/AdminContact.vue';
export default [
  {
    path: '/clients',
    name: 'clients',
    component: Client
  },
  {
    path: '/manage-contacts',
    name: 'manage-contacts',
    component: AdminContact
  },
  {
    path: '/client-campaigns/:id',
    name: 'client-campaigns',
    component: Client
  },
  {
    path: '/client-campaigns',
    name: 'client-campaigns',
    component: ClientCampaigns
  }
]