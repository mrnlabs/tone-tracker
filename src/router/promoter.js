import TalentTask from '@/views/talent/TalentTask.vue';
import Promoter from '../views/promoters/Promoter.vue';
import Profile from '@/views/dashboard/Profile.vue';
import ViewTalentTask from '@/views/talent/ViewTalentTask.vue';
export default [
    {
        path: '/promoters',
        name: 'promoters',
        component: Promoter
      },
      {
        path: '/talent',
        name: 'talent',
        component: TalentTask
      },
      {
        path: '/talent/images',
        name: 'talent/images',
        component: TalentTask
      },
      {
        path: '/talent/images/:id',
        name: 'talent/images',
        component: TalentTask
      },
      {
        path: '/profile/',
        name: 'profile',
        component: Profile
      },
      {
        path: '/talent/check',
        name: 'talent/check',
        component: TalentTask
      },

      {
        path: '/view-talent-task/:id',
        name: 'view-talent-task',
        component: ViewTalentTask
      },
  ]