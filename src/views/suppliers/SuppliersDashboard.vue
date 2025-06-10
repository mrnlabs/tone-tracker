<script setup>
import { ref, onMounted } from 'vue';
import Layout from '../shared/Layout.vue';
import { useAuth } from '@/stores/auth';
import { useSupplier } from '@/stores/supplier';

const supplierStore = useSupplier();
const authStore = useAuth();

const user = JSON.parse(authStore.user);

const tasks = ref([]);

onMounted(() => {
  if(!user.activeUserId){
    return
  }
  getSuppliertasks();
});

const getSuppliertasks = () => {
  supplierStore.getThirdPartyTasks(user.activeUserId).then(response => {
    console.log('tasks', response)
    tasks.value = response.data;
  })
}
</script>
<template>
    <Layout>
    <div class="page-wrapper">
      <div class="page-content">
        <div class="container-fluid">
          <div class="row mb-4">
            <div class="col">
              <h1 class="display-6">Welcome</h1>
              <p class="lead">View live data</p>
            </div>
          </div>
          <!-- <div class="row row-cols-1 row-cols-md-3 row-cols-xl-4">
            <div class="col">
              <div class="card ">
                <div class="card-body">
                  <router-link   to="/supplier-briefs" class="text-center">
                    <div class="widgets-icons mx-auto  mb-3">
                      <i class='bx bxs-file-blank text-blue'></i>  
                    </div>
                    <p class="mb-0 fs-6 text-secondary text-white">Briefs</p>
                    <h4 class="my-1 maz-height">823</h4>
  
                  </router-link>
                </div>
              </div>
            </div>
            <div class="col">
              <div class="card radius-10">
                <div class="card-body">
                  <div class="text-center">
                    <div class="widgets-icons mx-auto mb-3"><svg width="44" height="59"
                        viewBox="0 0 44 59" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M38.4251 7.6052H29.2763C29.2763 3.56828 25.9941 0.286133 21.9572 0.286133C17.9203 0.286133 14.6381 3.56828 14.6381 7.6052H5.4893C2.45875 7.6052 0 10.0639 0 13.0945V53.3494C0 56.3799 2.45875 58.8387 5.4893 58.8387H38.4251C41.4556 58.8387 43.9144 56.3799 43.9144 53.3494V13.0945C43.9144 10.0639 41.4556 7.6052 38.4251 7.6052ZM10.9786 48.7749C9.4576 48.7749 8.23395 47.5513 8.23395 46.0303C8.23395 44.5093 9.4576 43.2856 10.9786 43.2856C12.4996 43.2856 13.7232 44.5093 13.7232 46.0303C13.7232 47.5513 12.4996 48.7749 10.9786 48.7749ZM10.9786 37.7963C9.4576 37.7963 8.23395 36.5727 8.23395 35.0517C8.23395 33.5307 9.4576 32.307 10.9786 32.307C12.4996 32.307 13.7232 33.5307 13.7232 35.0517C13.7232 36.5727 12.4996 37.7963 10.9786 37.7963ZM10.9786 26.8177C9.4576 26.8177 8.23395 25.5941 8.23395 24.0731C8.23395 22.5521 9.4576 21.3284 10.9786 21.3284C12.4996 21.3284 13.7232 22.5521 13.7232 24.0731C13.7232 25.5941 12.4996 26.8177 10.9786 26.8177ZM21.9572 4.86055C23.4782 4.86055 24.7018 6.0842 24.7018 7.6052C24.7018 9.12619 23.4782 10.3498 21.9572 10.3498C20.4362 10.3498 19.2125 9.12619 19.2125 7.6052C19.2125 6.0842 20.4362 4.86055 21.9572 4.86055ZM36.5953 46.9452C36.5953 47.4484 36.1836 47.8601 35.6804 47.8601H19.2125C18.7094 47.8601 18.2977 47.4484 18.2977 46.9452V45.1154C18.2977 44.6122 18.7094 44.2005 19.2125 44.2005H35.6804C36.1836 44.2005 36.5953 44.6122 36.5953 45.1154V46.9452ZM36.5953 35.9666C36.5953 36.4698 36.1836 36.8815 35.6804 36.8815H19.2125C18.7094 36.8815 18.2977 36.4698 18.2977 35.9666V34.1368C18.2977 33.6336 18.7094 33.2219 19.2125 33.2219H35.6804C36.1836 33.2219 36.5953 33.6336 36.5953 34.1368V35.9666ZM36.5953 24.988C36.5953 25.4912 36.1836 25.9029 35.6804 25.9029H19.2125C18.7094 25.9029 18.2977 25.4912 18.2977 24.988V23.1582C18.2977 22.655 18.7094 22.2433 19.2125 22.2433H35.6804C36.1836 22.2433 36.5953 22.655 36.5953 23.1582V24.988Z"
                          fill="#019BFE" />
                      </svg>
  
                    </div>
                    <p class="mb-0 fs-6 text-secondary text-white">Upload Documents</p>
                    <h4 class="my-1 maz-height">23</h4>
  
                  </div>
                </div>
              </div>
            </div>
            <div class="col">
              <div class="card radius-10">
                <div class="card-body">
                  <div class="text-center">
                    <div class="widgets-icons  mx-auto  mb-3">
                      <svg width="62" height="62" viewBox="0 0 62 62" fill="none"
                        xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M58.7134 28.4333V30.9961C58.7064 43.3329 50.5857 54.1957 38.7551 57.6936C26.9246 61.1915 14.2024 56.4913 7.48773 46.1419C0.773067 35.7925 1.66544 22.2592 9.68094 12.8811C17.6964 3.50299 30.9256 0.514021 42.1944 5.53511"
                          stroke="#019BFE" stroke-width="5" stroke-linecap="round"
                          stroke-linejoin="round" />
                        <path d="M58.7136 8.71094L30.857 36.5954L22.5 28.2384" stroke="#019BFE"
                          stroke-width="5" stroke-linecap="round" />
                      </svg>
  
                    </div>
                    <p class="mb-0 fs-6 text-secondary text-white">Learning Management System</p>
                    <h4 class="my-1 maz-height">53</h4>
  
                  </div>
                </div>
              </div>
            </div>
            <div class="col">
              <div class="card radius-10">
                <div class="card-body">
                  <div class="text-center">
                    <div class="widgets-icons mx-auto  mb-3">
                      <i class='bx bxs-calculator text-blue'></i>
  
                    </div>
                    <p class="mb-0 fs-6 text-secondary text-white">CRM</p>
                    <h4 class="my-1 maz-height">7</h4>
  
                  </div>
                </div>
              </div>
            </div>
  
          </div> -->

          <div class="row">
            <div class="col">
                <div class="table-responsive p-3">
    <table class="table table-dark table-borderless w-50 m-auto">
        <thead class="custom-table-bg">
          <tr>
              <th class="text-white border-0">Name</th>
              <th class="text-white border-0">Job number</th>
              <th class="text-white border-0">Name of quote</th>
              <th class="text-white border-0">Location</th>
              <th class="border-0">
              <th class="text-white border-0">Action</th>
              </th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="tasks?.length > 0" v-for="task in tasks" :key="task.id" class="custom-table-bg">
              <td class="text-white border-0">{{task?.taskDTO.name}}</td>
              <td class="text-white border-0">{{task?.taskDTO.jobNumber}}</td>
              <td class="text-white border-0">JN_129</td>
              <td class="text-white border-0">{{task?.taskDTO.address}}</td>
              <td class="border-0">
              <router-link :to="`/view-supplier-task/${task.taskDTO?.id}/${task.id}?isBid=false`" class="btn btn-secondary btn-sm">View</router-link>
              </td>
          </tr>
          <tr v-else>
              <td class="text-danger text-center" colspan="5">No tasks found</td>
          </tr>
        </tbody>
    </table>
    </div>


            </div>
          </div>
        </div>
      </div>
    </div>
  </Layout>
  </template>
  


  
<style scoped>
.text-blue{
  color: #019BFE;
}

.card {
  background-color: #12181a !important;
  padding: 1rem !important;
  box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.2), 0 5px 5px 0 rgba(0, 0, 0, 0.24) !important;
}
html.dark-theme .table thead th {
    border-bottom: 2px solid rgb(255 255 255 / 12%);
}

.custom-table-bg{
background-color: #12181a;
}
</style>

