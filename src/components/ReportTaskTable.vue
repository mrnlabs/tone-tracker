<script setup>
const props = defineProps({
    tasks: Array,
    statuses: Array,
    activation: String
});

const getClass = (status) => {
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
const getStatus = (status) => {
    return props.statuses.find(stat => stat.code === status).name;
}
</script>
<template>
    <div class="card-body">
        <div class="table-responsive table table-dark table-striped">
            <table class="table align-middle mb-0">
                <thead class="table-light">
                    <tr>
                        <th>Project</th>
                        <th>Task</th>
                        <th>Job Number</th>
                        <th>Risk</th>
                        <th>Planned End-Date</th>
                        <th>Time Record</th>
                        <th>Completion</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="tasks?.length > 0" v-for="task in tasks" :key="task.id" class="maz-table-row-height">
                        <td>{{ activation }}</td>
                    <td>{{ task.name }}</td>
                    <td>{{ task.jobNumber }}</td>
                    <td  :class="getClass(task.status)">
                        {{ getStatus(task.status) }}
                    </td>
                    <td>{{task.plannedEndDate}}</td>
                    <td>{{task.timeRecord}}</td>
                    <td>{{task.completion}}</td>
                    </tr>
                    <tr v-else>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td class="text-center text-danger">No tasks found.</td>
                        <td></td>
                        <td></td>
                    </tr>										
                </tbody>
            </table>
        </div>
    </div>
</template>
<style scoped>
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