<script setup>
import { ref, reactive, watch } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required, email } from '@vuelidate/validators';
import useToaster from '@/composables/useToaster';
import { useCrmStore } from '@/stores/crm';
import { useActivation } from '@/stores/activation';
import Row from '@/components/general/Row.vue';
import InputError from '@/components/form-components/InputError.vue';
import InputNumber from '@/components/form-components/InputNumber.vue';
import InputLabel from '@/components/form-components/InputLabel.vue';
import Input from '@/components/form-components/Input.vue';
import Spinner from '@/components/buttons/Spinner.vue';
import { useUserStore } from '@/stores/userStore';
import debounce from 'lodash.debounce';
import Button from '@/components/buttons/Button.vue';
import Column from '@/components/general/Column.vue';

const emit = defineEmits(['closeModal', 'activationChange']);
const props = defineProps({
  showModal: Boolean,
  modalData: Object,
  regions: Array
});

const crmStore = useCrmStore();
const toaster = useToaster();
let showLoading = ref(false);
let activations = ref([]);
const activationStore = useActivation();
const userStore = useUserStore();

let form = reactive({
  id: 0,
  name : '',
  surname: '',
  email: '',
  phone: '',
  optIn: '',
  activation: '',
  region: '',
  address: '',
  ambassadorCode: ''
});

watch(() => props.modalData, (newVal) => { 
  Object.assign(form, {
    id: newVal.id || 0,
    name: newVal.name || '',
    surname: newVal.surname || '',
    email: newVal.email || '',
    phone: newVal.phone || '',
    optIn: newVal.optIn || '',
    activation: newVal.activation || 4,
    region: newVal.region || '',
    address: '' || newVal.address || '',
    ambassadorCode: newVal.ambassadorCode || ''
  });
}, { deep: true });

const rules = {
  name: { required },
  surname: { required },
  email: { required , email},
  phone: { required },
  activation: { required },
  region: { required },
  address: { required },
  ambassadorCode: { required }
};

const v$ = useVuelidate(rules, form);

watch(
  () => form.activation,
  () => {
    if (form.activation){
     let activationObj = activations.value.find(activation => activation.id === form.activation)
      emit('activationChange', activationObj)
    }
  }
);

const getAllActivationsByRegion = async () => {
  showLoading.value = true;
  try {
    const response = await activationStore.getAllActivationByRegionId(form.region);
    activations.value = response.data.content;
  } catch (error) {
    toaster.error("Error fetching Activation Area");
    console.error(error);
  } finally {
    showLoading.value = false;
  }
};

const onSubmit = async () => { 
  const isFormValid = await v$.value.$validate();
  if (!isFormValid) return;

  showLoading.value = true;
  try {
    
      console.log(form);
      await crmStore.createCrm(form);
      toaster.success("User created successfully");
    
    emit('closeModal');
  } catch (error) {
    toaster.error("Error saving user");
    console.error(error);
  } finally {
    showLoading.value = false;
  }
};

const phoneValidationError = ref(false);
const emailValidationError = ref(false);

const isPhoneUnique = debounce(() => {
  userStore.isFieldUnique('phone', form.phone, form.id).then((response) => {
    phoneValidationError.value = response.data === true; 
  });
}, 500);


const isEmailUnique = debounce(() => {
  userStore.isFieldUnique('email', form.email,form.id).then((response) => {
    emailValidationError.value = response.data === true;
  });
}, 500);


watch(
  () => form.phone,
  () => {
    if (form.phone) isPhoneUnique();
  }
);

watch(
  () => form.email,
  () => {
    if (form.email) isEmailUnique();
  }
);

// Form validation function
const isClientFormValid = () => {
  return !phoneValidationError.value && !emailValidationError.value || showLoading.value == true;
};

</script>

<template>
  <Row class="g-3">
    <Column classes="col-md-6">
      <InputLabel labelText="Name" classes="form-label" htmlFor="name"/>
      <Input v-model="form.name" type="text" classes="form-control" id="name" placeholder="" />
      <InputError classes="input-errors" :errors="v$.name.$errors" message="Name is required" />
     </Column>
    <Column classes="col-md-6">
      <InputLabel labelText="Surname" classes="form-label" htmlFor="surname"/>
      <Input v-model="form.surname" type="text" classes="form-control" id="surname" placeholder="" />
      <InputError classes="input-errors" :errors="v$.surname.$errors" message="Surname is required" />
      </Column>

      <Column classes="col-md-6">
        <InputLabel labelText="Email" classes="form-label" htmlFor="email"/>
        <Input v-model="form.email" type="text" classes="form-control" id="email" @blur="isEmailUnique"/>
        <span v-if="emailValidationError" class="text-danger">Email already exist.</span>
        <InputError v-else-if="!emailValidationError" classes="input-errors" :errors="v$.email.$errors" message="Email is required" />
      </Column>
     
      <Column class="col-md-6">
        <InputLabel labelText="Cell Number" classes="form-label" htmlFor="phone"/>
        <InputNumber id="phone" v-model="form.phone" classes="form-control" placeholder="" />
        <span v-if="phoneValidationError" class="text-danger">Cell Number already exist.</span>
         <InputError v-else-if="!phoneValidationError" classes="input-errors" :errors="v$.phone.$errors" message="Cell Number is required" />
      </Column>

      <Column classes="col-md-6">
        <InputLabel labelText="Address" classes="form-label" htmlFor="address"/>
        <Input v-model="form.address" type="text" classes="form-control" id="address" placeholder="" />
        <InputError classes="input-errors" :errors="v$.address.$errors" message="Address is required" />
       </Column>

       <Column classes="col-md-6">
        <InputLabel labelText="Ambassador Code" classes="form-label" htmlFor="ambassadorCode"/>
        <Input v-model="form.ambassadorCode" type="text" classes="form-control" id="ambassadorCode" placeholder="" />
        <InputError classes="input-errors" :errors="v$.ambassadorCode.$errors" message="Ambassador Code is required" />
       </Column>
    
    <Column class="col-md-6">
      <InputLabel labelText="Region" classes="form-label" htmlFor="region"/>
      <select @change="getAllActivationsByRegion" v-model="form.region" class="form-select" id="region">
        <option value="" selected disabled>Select Region</option>
        <option v-for="region in regions" :key="region" :value="region.id">
          {{ region.name }}
        </option>
      </select>
      <InputError classes="input-errors" :errors="v$.region.$errors" message="Region is required" />
      <!-- <div class="text-danger" v-if="v$.region.$error"></div> -->
    </Column>
    <Column class="col-md-6" v-if="form.region != ''">
      <InputLabel labelText="Activation Area" classes="form-label" htmlFor="activation"/>
      <select v-model="form.activation" class="form-select" id="activation">
        <option value="" selected disabled>Select Activation Area</option>
        <option v-for="activation in activations" :key="activation" :value="activation.id">
          {{ activation.name }}
        </option>
      </select>
      <div class="text-danger" v-if="v$.activation.$error">Activation Area is required</div>
    </Column>
    <Column class="col-md-3">
      <label for="opt-in" class="form-label d-block invisible">Address</label>
      <input v-model="form.optIn" type="checkbox" class="" id="opt-in">
      <InputLabel labelText="Opt In" classes="form-label ms-2" htmlFor="opt-in"/>
    </Column>        
  </Row>
  
  <div class="mt-4">
    <Button @click="onSubmit" classes="btn btn-primary maz-gradient-btn w-100" type="button" 
      :disabled="!isClientFormValid()">
      <template #content>
        {{ modalData.id ? 'Update' : 'Submit' }}
      </template>									  
       <Spinner v-if="showLoading" class="spinner-border spinner-border-sm" />
     </Button>
  </div>
</template>
