import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/auth/Login.vue';
import Dashboard from '../views/dashboard/Dashboard.vue';
import Status from '../views/dashboard/Status.vue';
import Report from '../views/dashboard/Report.vue';
import Activations from '../views/dashboard/Activations.vue';
import Budget from '../views/dashboard/Budget.vue';
import Warehouse from '../views/dashboard/Warehouse.vue';
import Profile from '../views/dashboard/Profile.vue';
import chat from './chat';
import users from './users';
import brief from './brief';
import job from './job';
import upload from './upload';
import teaching from './teaching';
import crm from './crm';
import client from './client';
import campaigns from './campaigns';
import task from './task';
import adminactivations from './adminactivations';
import promoter from './promoter';
import region from './region';
import warehouse from './warehouse';
import staff from './staff';
import admincontact from './admincontact';
import forgotpassword from './forgotpassword';
import resertpassword from './resertpassword';
import ActivationManagerDashboard from '@/views/dashboard/activation-manager/ActivationManagerDashboard.vue';
import suppliersdashboard from './suppliersdashboard';
import costs from './costs';
import SupplierProfile from '@/views/dashboard/SupplierProfile.vue';
import StaffProfile from '@/views/dashboard/StaffProfile.vue';
import ClientProfile from '@/views/clientDashboard/ClientProfile.vue';




const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    ...costs,
    ...chat,
    ...users,
    ...promoter,
    ...brief,
    ...job,
    ...upload,
    ...teaching,
    ...crm,
    ...client,
    ...campaigns,
    ...task,
    ...adminactivations,
    ...region,
    ...warehouse,
    ...staff,
    ...admincontact,
    ...forgotpassword,
    ...resertpassword,
    ...suppliersdashboard,

    {
      path: '/',
      name: 'home',
      component: Login
    },

    {
      path: '/dashboard',
      name: 'dashboard',
      component: Dashboard
    },
    {
      path: '/activations',
      name: 'activations',
      component: Activations
    },
    {
      path: '/activations-dashboard',
      name: 'activationsDashboard',
      component: ActivationManagerDashboard
    },
    {
      path: '/status',
      name: 'status',
      component: Status
    },

    {
      path: '/budget',
      name: 'budget',
      component: Budget
    },

    {
      path: '/warehouse',
      name: 'warehouse',
      component: Warehouse
    },

    {
      path: '/report',
      name: 'report',
      component: Report
    },

    {
      path: '/profile/:id/:userId',
      name: 'view-profile',
      component: Profile
    },
    {
      path: '/profile',
      name: 'profile',
      component: Profile
    },
    {
      path: '/supplier-profile/:id/:userId',
      name: 'supplier-profile',
      component: SupplierProfile
    },
    {
      path: '/staff-profile/:id/:userId',
      name: 'staff-profile',
      component: StaffProfile
    },
    {
      path: '/client-profile/:id/:userId',
      name: 'client-profile',
      component: ClientProfile
    },


    /* {
       path: '/about',
       name: 'about',
       // route level code-splitting
       // this generates a separate chunk (About.[hash].js) for this route
       // which is lazy-loaded when the route is visited.
       component: () => import('../views/AboutView.vue')
     }
     */
  ]
})

// router.beforeResolve((to, from, next) => {
//   next()
// })

// router.afterEach(() => {

// })

export default router
