<script setup>
import { onMounted, ref, reactive, watch } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { email, maxValue, minValue, numeric, required } from '@vuelidate/validators';
import Layout from '@/views/shared/Layout.vue';
import BreadCrumb from '@/components/BreadCrumb.vue';
import useToaster from '@/composables/useToaster';
import { useClientStore } from '@/stores/useClient';
import ColorPicker from 'primevue/colorpicker';
import router from "@/router";
import SplitButton from 'primevue/splitbutton';
import Dialog from 'primevue/dialog';
import Badge from 'primevue/badge';
import Paginator from '@/components/Paginator.vue';
import SearchInput from '@/components/form-components/SearchInput.vue';
import Button from '@/components/buttons/Button.vue';
import Spinner from '@/components/buttons/Spinner.vue';
import Column from '@/components/general/Column.vue';
import Card from '@/components/general/Card.vue';
import CardBody from '@/components/general/CardBody.vue';
import Row from '@/components/general/Row.vue';
import InputError from '@/components/form-components/InputError.vue';
import InputLabel from '@/components/form-components/InputLabel.vue';
import Input from '@/components/form-components/Input.vue';
import InputNumber from '@/components/form-components/InputNumber.vue';
import debounce from 'lodash.debounce';
import { useUserStore } from '@/stores/userStore';
import ProgressSpinner from 'primevue/progressspinner';

const toaster = useToaster();
const clientStore = useClientStore();
const userStore = useUserStore();

let clients = ref([...clientStore.allClients]);
const totalRecords = ref(0);

const allData = ref([]); 


let showLoading = ref(false);
let loading = ref(false);  
let searchInput = ref('');

const form = reactive({ 
  id: 0,
  name: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  role: 'CLIENT',
  color: ''
});
onMounted(() => {
  getAllClients();
});

const rules = { 
  name: { required },
  firstName: { required },
  lastName: { required },
  email: { required, email },
  phone: { required, numeric, maxValue: 10, minValue: 10 },
  color: { required }
};
const v$ = useVuelidate(rules, form);

const createClient = async () => {
  const isFormValid = await v$.value.$validate();
  if (!isFormValid) {
    return;
  }
  loading.value = true;  
  clientStore.submitClient(form).then(function (response) {
    loading.value = false;
    toaster.success("Client created successfully");
    getAllClients();
    form.id = 0;
    form.name = ''; 
    form.firstName = '';
    form.lastName = '';
    form.email = '';
    form.phone = '';
    form.color = '';
	v$.value.$errors = [];
	v$.value.$reset();
  }).catch(function (error) {
    toaster.error("Error creating client");
    console.log(error);
    loading.value = false;
  }).finally(() => {
    loading.value = false; 
  });
};

const getAllClients = () => {
  showLoading.value = true;
  clientStore.getClients()
    .then((response) => {
      showLoading.value = false;
      // Use the store's `setClients` to update `allClients`
      allData.value = response.data
      clientStore.setClients(response.data.content.map(client => ({ ...client, isEditing: false })));
      clients.value = clientStore.allClients;
      totalRecords.value = clientStore.allClients.length;
    })
    .catch((error) => {
      toaster.error('Error fetching clients');
      console.error(error);
    })
    .finally(() => {
      showLoading.value = false;
    });
};


const deleteClient = (client) => {
  if(!window.confirm("Are you sure you want to delete this client?")){ return; }
  clientStore.deleteClient(client.id).then(function (response) {
    toaster.success("Client deleted successfully");
    getAllClients();
  }).catch(function (error) {
    toaster.error("Error deleting client");
    console.log(error);
  });
};


const onInput = () => {
  if (searchInput.value && searchInput.value.length >= 3) {
    const searchTerm = searchInput.value.toLowerCase();
    clientStore.getClients(undefined,searchTerm).then(function (response) {
      clients.value = response.data.content.map(client => ({ ...client, isEditing: false }));
      allData.value = response.data//update pagination too
    })
  } else {
    clients.value = [...clientStore.allClients];
  }
};


const redirectToCampaign = (client) => {
  router.push({ 
    path: '/campaigns', 
    query: { client: client.id } // Add query parameter properly
  });
};

const viewContacts = (client) => {
  router.push({ 
    path: '/manage-contacts', 
    query: { client: client.id } // Add query parameter properly
  });
};
const viewedClient = ref(null);
const visible = ref(false);

const editForm = reactive({ 
  name: '',
  color: '#007bff',
  users:[]
});


const editRules = { 
  name: { required },
  color: { required }
};
const vEdit$ = useVuelidate(editRules, editForm);

const openModal = (client) => {
    visible.value = true;
    viewedClient.value = client;
    editForm.id = client.id;
    editForm.name= client.name;
    editForm.firstName = client?.users[0]?.firstName;
    editForm.lastName = client?.users[0]?.lastName;
    editForm.email = client?.users[0]?.email;
    editForm.phone = client?.users[0]?.phone;
    editForm.role = client?.users[0]?.role;
    editForm.color = client.color;
    editForm.users = client.users;
};

const updateClient = () => {
  loading.value = true;
  clientStore.updateClient(editForm.id,editForm).then(response => {
    loading.value = false;
    //filter clients to get the index of the editForm and update the object where the id is equal to the id of the client
     const updatedClient = clientStore.allClients.filter((client) => client.id === editForm.id);

    const index = clientStore.allClients.indexOf(updatedClient[0]);

    if (index !== -1) {
      clientStore.allClients[index] = editForm;
    }
    //now update clientStore.allClients
    clientStore.setClients(clientStore.allClients);
    toaster.success("Client updated successfully");
    visible.value = false;
  }).catch(error => {
    toaster.error("Error updating client");
    loading.value = false;
    console.log(error);
  });
};
watch(searchInput, () => {
  onInput();
});

const items = (client) => [
    {
        label: 'Edit',
        icon: 'bx bxs-edit fs-4 maz-gradient-txt',
        command: () => {
          openModal(client)
        }
    },
	
    {
        label: 'View Campaigns',
        icon: 'bx bx-building-house fs-4 maz-gradient-txt',
        command: () => {
          localStorage.removeItem('clientColor');
          localStorage.setItem('clientColor', JSON.stringify(client));
          redirectToCampaign(client)
        }
    },
    {
        label: 'View Contacts',
        icon: 'bx bx-user fs-4 maz-gradient-txt',
        command: () => {
            viewContacts(client)
        }
    },
    {
        label: 'Delete',
        icon: 'bx bx-trash text-danger fs-4 ',
        command: () => {
          deleteClient(client)
        }
    }
];

const handlePageChange = (newPage) => {
  clientStore.getClients(newPage).then(function (response) {
  clientStore.setClients(response.data.content);
	clients.value = clientStore.allClients;
  });
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
  return !phoneValidationError.value && !emailValidationError.value || loading.value == true;
};
</script>

<template>
  <Layout>
    <div class="page-wrapper">
      <div class="page-content">
        <BreadCrumb title="Clients" icon="bx bx-user-circle"/>
        <Card class="card">         
          <CardBody class="card-body">            
            <Row class="row">
              <Column class="col-8 col-lg-8 col-xl-8 pl-5 d-flex ">
                <div class="position-relative mb-3">
                  <SearchInput 
                    placeholder="Search" 
                    id="searchInput"
                    v-model="searchInput" classes="form-control ps-5" type="search">
                    <template #search>
                      <span class="position-absolute top-50 product-show translate-middle-y">
                        <i class="bx bx-search"></i>
                      </span>
                    </template>
								</SearchInput>
                </div>
              </Column>
              <Column class="col-8 col-lg-8 col-xl-8 d-flex">
                <div class="radius-10 w-100">
                  <CardBody class="card-body border border-3 p-4 rounded">
                    <div class="table-responsive">
                      <table class="table mb-0">
                        <thead class="table-light">
                          <tr>
                            <th>#</th>
                            <th>Name</th>
                            <th>Person Responsible</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-if="clients?.length > 0" v-for="(client, index) in clients" :key="client.id">
                            <td> <Badge :value="index + 1 " size="large" :style="{'background-color': '#'+ client.color}" ></Badge></td>
                            <td>{{ client.name }}</td>
                            <td>{{ 
                              client?.users?.length > 0 ? client?.users[0]?.firstName + ' ' + client?.users[0]?.lastName : ''
                             }}</td>
                            <td>
                              <div class="d-flex order-actions">
                                <SplitButton class="text-white" label="" 
                                icon="bx bx-cog fs-4" 
                                dropdownIcon="text-white fs-4 bx bx-chevron-down" 
                                :model="items(client)"/>
                              </div>
                            </td>
                          </tr>
                          <tr v-else>
                            <td v-if="showLoading" colspan="9" class="text-center text-danger">
                              <ProgressSpinner style="width: 30px; height: 30px" strokeWidth="8" fill="transparent" animationDuration=".5s" aria-label="Custom ProgressSpinner" />
                             </td>
                            <td v-else colspan="9" class="text-center text-danger">
                              No clients found
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div class="card mt-4 ml-2" v-if="!showLoading" style="margin-left: 1rem;">
                      <Paginator :page="allData?.page" @changePage="handlePageChange" class="ml-2"/>
                    </div>
                  </CardBody>
                </div>
              </Column>
              <Column class="col-4 col-lg-4 col-xl-4 d-flex border border-3 p-2 rounded mr-1">
                <div class=" w-100 radius-10">
                      <Column classes="col-md-12">
                        <InputLabel labelText="Client Name" classes="form-label" htmlFor="name"/>
                        <Input v-model="form.name" type="text" classes="form-control" id="name" placeholder="" />
                        <InputError classes="input-errors" :errors="v$.name.$errors" message="Client Name is required" />
                      </Column>

                      <Column classes="col-md-12 mt-2">
                        <InputLabel labelText="First Name" classes="form-label" htmlFor="firstname"/>
                        <Input v-model="form.firstName" type="text" classes="form-control" id="firstname" placeholder="" />
                        <InputError classes="input-errors" :errors="v$.firstName.$errors" message="First Name is required" />
                      </Column>

                      <Column classes="col-md-12 mt-2">
                        <InputLabel labelText="Last Name" classes="form-label" htmlFor="lastName"/>
                        <Input v-model="form.lastName" type="text" classes="form-control" id="lastName" placeholder="" />
                        <InputError classes="input-errors" :errors="v$.lastName.$errors" message="Last Name is required" />
                      </Column>
                  
                      <Column classes="col-md-12 mt-2">
                        <InputLabel labelText="Phone Number" classes="form-label" htmlFor="cell"/>
                        <InputNumber v-model="form.phone" classes="form-control" id="cell" placeholder="" />
                        <span v-if="phoneValidationError" class="text-danger">Phone Number already exist.</span>
                        <InputError v-else-if="!phoneValidationError" classes="input-errors" :errors="v$.phone.$errors" message="Phone Number is required" />
                      </Column>

                      <Column classes="col-md-12 mt-2">
                        <InputLabel labelText="Email" classes="form-label" htmlFor="cell"/>
                        <Input v-model="form.email" type="text" classes="form-control" id="email" @blur="isEmailUnique"/>
                        <span v-if="emailValidationError" class="text-danger">Email already exist.</span>
                        <InputError v-else-if="!emailValidationError" classes="input-errors" :errors="v$.email.$errors" message="Email is required" />
                      </Column>
                    
                        <Column class="col-12 mt-3">
                          <div class="color-picker-container">
                            <ColorPicker v-model="form.color" inline class="w-100" />
                            <InputError classes="input-errors" :errors="v$.color.$errors" message="Client color is required" />
                        </div>
                      </Column>
                        <span class="badge w-100" :style="`color: #fff; background-color: #${form.color}`">Sample Background</span>             

                    
                      <div class="ms-auto mt-6">
                        <Button @click="createClient" classes="w-100 btn maz-gradient-btn" type="button" 
                          :disabled="!isClientFormValid()">
                          <template #content>
                          {{ loading ? '' : 'Submit' }}
                          </template>									  
                          <Spinner v-if="loading" class="spinner-border spinner-border-sm" />
                        </Button>
                      </div>
                </div>
              </Column>
            </Row>
          </CardBody>
        </Card>
      </div>
    </div>
    <Dialog v-model:visible="visible" position="top" modal header="Edit Client" :style="{ width: '40rem' }">
             
      <Row class="g-3">

        <Column classes="col-md-12">
          <InputLabel labelText="Client Name" classes="form-label" htmlFor="name"/>
          <Input v-model="editForm.name" type="text" classes="form-control" id="name" placeholder="" />
          <InputError classes="input-errors" :errors="v$.name.$errors" message="Client Name is required" />
        </Column>

             
           
            <Row class="mt-3">
              <Column class="col-12">
                <div class="flex justify-center">
                  <ColorPicker v-model="editForm.color" inline />
                  <InputError classes="input-errors" :errors="v$.color.$errors" message="Client color is required" />
              </div>
            </Column>
              <span class="badge" :style="`color: #fff; background-color: #${editForm.color}`">Sample Background</span>
            </Row>

          
            <Row>
              <div class="ms-auto mt-6 w-100">
                <Button @click="updateClient" classes="w-100 btn maz-gradient-btn mt-2 mt-lg-0" type="button" :disabled="loading">
                  <template #content>
                  {{ loading ? 'Updating...' : 'Update' }}
                  </template>									  
                  <Spinner v-if="loading" class="spinner-border spinner-border-sm" />
                </Button>
              </div>
            </Row>
      </Row>

</Dialog>
  </Layout>
</template>

<style scoped>
.mt-6 {
  margin-top: 2rem;
}
.no-border-input {
  border: none;
  outline: none;
}

.table td, .table th {
    vertical-align: middle;
}


</style>
