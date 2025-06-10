<script setup>
import useToaster from '@/composables/useToaster';
import { useSupplier } from '@/stores/supplier';
import { useTask } from '@/stores/task';
import MultiSelect from 'primevue/multiselect';
import { onMounted, ref } from 'vue';

const thirdPartySuppliers = ref([]);
const showLoading = ref(false);
const supplierStore = useSupplier();
const taskStore = useTask();
const toaster = useToaster();

const emit = defineEmits(['closeThirdPartyModal']);
onMounted(() => {
    getThirdPartySuppliers();
})

const props = defineProps({
    taskId: Number
})

const getThirdPartySuppliers = async () => {
        supplierStore.getThirdParties().then(response => {
            supplierStore.setAllSuppliers(response.data.content);
            let result = supplierStore.allSuppliers;
            console.log('result',result);
            if(result.length > 0) {
                //map third party suppliers
                thirdPartySuppliers.value = result.map(supplier => {
                    return { name: supplier.userDetails.firstName + ' ' + supplier.userDetails.lastName, code: supplier.id }
                })
            }
        }).catch(error => {
            console.log(error);
        })
    }

    const clientColor = JSON.parse(localStorage.getItem('clientColor'));

		const clientColorStyles = {
			color: `#${clientColor?.color} !important`, //clientColor?.color,
			background: `#${clientColor?.color} !important`, //clientColor?.color
			borderColor: `#${clientColor?.color} !important`,
		}

const selectedThirdPaties = ref();
const error = ref();

const submitThirdParty = () => {
    if(!selectedThirdPaties.value) {
        error.value ="Please select a supplier";
        return
    }
    const supplierArray = [];
    selectedThirdPaties.value.forEach(supplier => {
        supplierArray.push(supplier.code)
    });
    let myObj = {
        "thirdParties": supplierArray,
        "task": props.taskId
    }
    showLoading.value = true;
   taskStore.addThirdPartiesToTask(myObj).then(response => {
       emit('closeThirdPartyModal');
       toaster.success("Third party suppliers added successfully");
       showThirdPartyModal.value = false;
       showLoading.value = false;
   }).catch(error => {
       toaster.error("Error adding third party suppliers");
       console.log(error);
   }).finally(() => {
       showLoading.value = false;
   })
}


</script>
<template>
    <div class="card flex justify-center">
        <MultiSelect v-model="selectedThirdPaties" display="chip" :options="thirdPartySuppliers" optionLabel="name" filter placeholder="Select Third Party"
            :maxSelectedLabels="3" class="w-full md:w-80" />
            <div class="d-grid">
                <button :style="{ background: clientColorStyles?.background }" @click="submitThirdParty" class="btn  maz-gradient-btn w-100 text-white d-flex justify-content-center align-items-center mt-3" type="button" 
                   :disabled="!selectedThirdPaties"> 
                    <span v-if="showLoading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    {{ showLoading ? '' : 'Submit' }}
                </button>
              </div>
    </div>
</template>