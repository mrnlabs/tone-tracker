<script setup>
import { onClickOutside } from '@vueuse/core'
import { onMounted, ref } from 'vue';
import Layout from '@/views/shared/Layout.vue';
import BreadCrumb from '@/components/BreadCrumb.vue';
import { useTask } from '@/stores/task';
import { useAuth } from '@/stores/auth';

const taskStore = useTask();
const authStore = useAuth();
const user = JSON.parse(authStore.user);
const awardedTasks = ref([]);

onMounted(() => {
    getAwardedTasks();
})
let showDropdown = ref(null);
onClickOutside(showDropdown, event => showDropdown.value.classList.remove('show'));

const toggleDropdown = () => {
    showDropdown.value.classList.toggle('show');
};

   const getAwardedTasks = async () => {
    taskStore.getAwardedTasks(user.activeUserId).then(function (response) {
        awardedTasks.value = response.data;
    })
    }

    const statuses = ref([
        { name: 'Finished', code: 'FINISHED' },
        { name: 'Planned', code: 'PLANNED' },
        { name: 'On Track', code: 'ONTRACK' },
        { name: 'Delayed', code: 'DELAYED' },
        { name: 'At Risk', code: 'ATRISK' }
    ]);
const getStatus = (status) => {
    return statuses.value.find(stat => stat.code === status).name;
}

const getClass = (status) => {
    console.log('status', status)
    if(status === 'FINISHED') {
        return 'risk-finished';
    } else if(status === 'PLANNED') {
        return 'risk-planned';
    } else if(status === 'ONTRACK') {
        return 'risk-on-track';
    } else if(status === 'DELAYED') {
        return 'risk-delayed';
    } else if(status === 'ATRISK') {
        return 'risk-at-risk';
    }
}

</script>

<template>
    <Layout>
        <div class="page-wrapper">
            <div class="page-content">
                <BreadCrumb title="Jobs" icon="bx bxs-calculator" />

                <!-- Code here -->
                <div class="">
                    <div class="table-container-colour p-5">
                        <div class="d-flex justify-content-between">
                            <h5>Database</h5>
                            <div class="filter-dropdown">
                                <h5 style="display: inline;">Filter</h5>
                                <img src="https://img.icons8.com/ios-filled/20/ffffff/filter.png" alt="Filter Icon"
                                    class="filter-icon" @click="toggleDropdown" />
                                <div ref="showDropdown" class="filter-dropdown-content">
                                    <a href="#">Gauteng Central</a>
                                    <a href="#">Eastern Region</a>
                                    <a href="#">Western Region</a>
                                    <a href="#">Clear Filter</a>
                                </div>
                            </div>

                        </div>
                        <table class="table table-dark table-bordered">
                            <thead>
                                <tr class="table-dark-color">
                                    <th>Task</th>
                                    <th>Start Date</th>
                                    <th>End Date</th>
                                    <th>Status</th>
                                    <th>Address</th>  
                                    <th>Region</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-if="awardedTasks?.length > 0" v-for="task in awardedTasks" :key="task.id" class="table-dark-black">
                                    <td>{{task.taskDetails.name}}</td>
                                    <td>{{task.taskDetails.jobNumber}}</td>
                                    <td>{{task.taskDetails.startDate}}</td>
                                    <td>{{task.taskDetails.plannedEndDate}}</td>
                                    <td :class="getClass(task.taskDetails.status)">{{getStatus(task.taskDetails.status)}}</td>
                                    <td>{{task.taskDetails.address}}</td>
                                    <td><router-link :to="`/view-awarded-tasks/${task.id}?isBid=true`" type="button" class="btn maz-gradient-btn">View</router-link></td>
                                </tr>
                                <tr v-else>
                                    <td colspan="7" class="text-center">No records found</td>
                                </tr>
                            </tbody>
                        </table>
                        <div class="text-end">
                            <button class="btn btn-secondary btn-export rounded-0 mb-0 mx-2">Export</button>
                            <button class="btn btn-primary btn-download rounded-0 mb-0">Download</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </Layout>
</template>

<style scoped>
body {
    background-color: #1e1e1e;
    color: white;
    font-family: Arial, sans-serif;
}

.crm-header {
    display: flex;
    align-items: center;
    padding: 20px;
    padding-left: 0;
}

.crm-header img {
    width: 50px;
    margin-right: 15px;
}

.crm-header h1 {
    margin: 0;
}

.table-dark {
    background-color: #2c2c2c;
}

.btn-export,
.btn-download {
    margin: 10px 0;
}

.table-container-colour {
    background-color: #212020 !important;
}

.table-dark-color {
    background-color: #252525;
}

.table-dark-black {
    background-color: #1e1e1e;
}

.table-dark-light {
    background-color: #504f4f;
}

.table-dark td,
.table-dark th,
.table-dark thead th {
    padding: 10px !important;
    border: none !important;
}

/* Filter dropdown styling */
.filter-dropdown {
    position: relative;
    display: inline-block;
}

.filter-dropdown-content {
    display: none;
    position: absolute;
    background-color: #1e90ff;
    min-width: 160px;
    box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
    z-index: 1;
}

.filter-dropdown-content a {
    color: white;
    padding: 12px 16px;
    text-decoration: none;
    display: block;
}

.filter-dropdown-content a:hover {
    background-color: #0056b3;
}

.filter-icon {
    width: 20px;
    margin-left: 10px;
    cursor: pointer;
}

.show {
    display: block;
}
.risk-at-risk {
    background-color: #ff0055;
    color: white;
  }
  
  .risk-on-track {
    background-color: #00d2ff;
    color: white;
  }
  
  .risk-planned {
    background-color: #ffa500;
    color: white;
  }
  
  .risk-delayed {
    background-color: #b200ff;
    color: white;
  }
</style>
