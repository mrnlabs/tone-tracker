import Task from '@/views/tasks/Task.vue';
import ViewTask from '@/views/tasks/ViewTask.vue';
export default [
    {
        path: '/tasks',
        name: 'tasks',
        component: Task
    },
    {
        path: '/tasks/:id',
        name: 'view-task',
        component: ViewTask
    }
  ]