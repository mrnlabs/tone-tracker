<script setup>
import ConfirmPopup from 'primevue/confirmpopup';
import Dialog from 'primevue/dialog';
import MultiSelect from 'primevue/multiselect';
import ProgressSpinner from 'primevue/progressspinner';
import SplitButton from 'primevue/splitbutton';
import { ref } from 'vue';
import URLrouter from '@/router';
import AddThirdPartySuppliers from './AddThirdPartySuppliers.vue';

const emit= defineEmits(['editTask','delete','closeThirdPartyModal','addtask']);


const props = defineProps({
    tasks: Array,
    statuses: Array,
    showLoading: Boolean
})
const clientColor = JSON.parse(localStorage.getItem('clientColor'));

const clientColorStyles = {
    color: `#${clientColor?.color} !important`, //clientColor?.color,
    background: `#${clientColor?.color} !important`, //clientColor?.color
    borderColor: `#${clientColor?.color} !important`,
}

const getStatus = (status) => {
    return props.statuses.find(stat => stat.code === status).name;
}



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

const getTaskType = (type) => {
    if(type === 'INHOUSE') {
        return 'In House';
    } else if(type === 'THIRDPARTY') {
        return 'Third Party';
    }
}



const deleteRecord = ( task) => {
  if(!window.confirm("Are you sure you want to delete this task?")) {
    return
  }
  emit('delete', task);
};


const taskId = ref(null);
const showThirdPartyModal = ref(false);
const toggleModal = (task) => {
    showThirdPartyModal.value = true;
    taskId.value = task.id;
}

const taskItems = (task) => {
    const items = [
        {
            label: 'Edit',
            icon: 'bx bxs-edit fs-4 maz-gradient-txt',
            command: () => {
                emit('editTask', task);
            }
        },
        {
            label: 'View',
            icon: 'bx bx-show fs-4 maz-gradient-txt',
            command: () => {
                URLrouter.push(`/tasks/${task.id}?name=${task.name}`);
            }
        },
    ];

    // Conditionally add the "Add Third Party Suppliers" item
    if (task.type == 'THIRDPARTY') {
        items.push({
            label: 'Add Third Party Suppliers',
            icon: 'bx bx-user-plus fs-4 maz-gradient-txt',
            command: () => {
                toggleModal(task);
            }
        });
    }
    items.push({
        label: 'Delete',
        icon: 'bx bx-trash text-danger fs-3',
        command: () => {
            deleteRecord(task);
        }
    });

    return items;
};

const closeThirdPartyModal = () => {
    emit('closeThirdPartyModal');
}
const addtask = () => {
    emit('addtask');
}

</script>
<template>
    <table class="table table-striped table-bordered">
        <thead>
            <tr class="table-dark-color">
                <th>Task</th>
                <th>Job Number</th>
                <th>Risk</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Time Record</th>
                <th>Type</th>
                <th>Completion</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            <tr v-if="tasks.length > 0" v-for="task in tasks" :key="task.id" class="table-dark-black">
                <td>{{ task.name }}</td>
                <td>{{ task.jobNumber }}</td>
                <td  :class="getClass(task.status)">
                    {{ getStatus(task.status) }}
                </td>
                <td>{{task.startDate}}</td>
                <td>{{task.plannedEndDate}}</td>
                <td>{{task.timeRecord}}</td>
                <td>{{ getTaskType(task.type) }}</td>
                <td>{{task.completion}}%</td>
                <td>
                    <div class="d-flex order-actions">
                        <SplitButton class="text-white" label="" 
                        icon="bx bx-cog fs-4" 
                        dropdownIcon="text-white fs-4 bx bx-chevron-down" 
                        :model="taskItems(task)"/>
                    </div>
                    
                  </td>
            </tr>
            <tr v-else>
                <td v-if="showLoading" colspan="9" class="text-center text-danger">
                   <ProgressSpinner style="width: 30px; height: 30px" strokeWidth="8" fill="transparent" animationDuration=".5s" aria-label="Custom ProgressSpinner" />
                </td>

                <td v-else colspan="9" class="text-center text-danger">
                    <span class="text-danger me-1"> No tasks found.</span>
                    <span @click="addtask" class="text-primary  cursor-pointer text-decoration-underline">Add?</span>
                </td>
            </tr>
           
        </tbody>
    </table>
    <Dialog v-model:visible="showThirdPartyModal" position="top" modal header="Add Third Party Suppliers" :style="{ width: '30rem', color: clientColorStyles?.color }">
        <AddThirdPartySuppliers :taskId="taskId" @closeThirdPartyModal="closeThirdPartyModal" />
    </Dialog>
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
.risk-finished {
    background-color: #15ca20 !important;
    color: white;
}

.risk-delayed {
    background-color: #b200ff;
    color: white;
}

</style>