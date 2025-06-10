<script setup>
import { onMounted, ref, reactive, watch } from 'vue';
import Layout from '@/views/shared/Layout.vue';
import BreadCrumb from '@/components/BreadCrumb.vue';
import Textarea from 'primevue/textarea';
import Dialog from 'primevue/dialog';
import { useVuelidate } from '@vuelidate/core';
import { email, required } from '@vuelidate/validators';
import useToaster from '@/composables/useToaster';
import { useSizes } from '@/stores/sizes';
import Paginator from '@/components/Paginator.vue';
import { useSupplier } from '@/stores/supplier';
import { useUserStore } from '@/stores/userStore';
import Button from '@/components/buttons/Button.vue';
import Spinner from '@/components/buttons/Spinner.vue';
import Row from '@/components/general/Row.vue';
import Column from '@/components/general/Column.vue';
import InputLabel from '@/components/form-components/InputLabel.vue';
import Input from '@/components/form-components/Input.vue';
import InputError from '@/components/form-components/InputError.vue';
import InputNumber from '@/components/form-components/InputNumber.vue';
import Card from '@/components/general/Card.vue';
import CardBody from '@/components/general/CardBody.vue';
import SupplierCard from '@/components/SupplierCard.vue';
import router from '@/router';
import SearchInput from '@/components/form-components/SearchInput.vue';
import debounce from 'lodash.debounce';
import ImportExcelModal from '@/components/file-imports/ImportExcelModal.vue';
import { generatePassword } from '@/utils';

const supplierStore = useSupplier();
const userStore = useUserStore();
const toaster = useToaster();
const sizeStore = useSizes();
const envPath = import.meta.env.VITE_AWS_S3_BUCKET;

const allData = ref([]); //for pagination

const phoneValidationError = ref(false);
const emailValidationError = ref(false);


let sizes = ref([]);
const promoters = ref([...supplierStore.allSuppliers]);
let showLoading = ref(false);
let searchInput = ref('');

const form = reactive({
  id: 0,
  firstName: null,
  lastName: null,
  name: null,
  phone: null,
  email: null,
  user: null,
  description: null,
  gender: null,
  role: "SUPPLIER",
  password: generatePassword(),

});

onMounted(() => {
  getSuppliers();
  getAllSizes();
});

const genders = ref([
  { name: 'Male', value: 'male' },
  { name: 'Female', value: 'female' },
  { name: 'Other', value: 'other' }
]);

const rules = {
  firstName: { required },
  lastName: { required },
  email: { required, email },
  phone: { required },
  // gender: { required },
};
const v$ = useVuelidate(rules, form);

const onSubmit = async () => {
  const isFormValid = await v$.value.$validate();
  if (!isFormValid) return; // Stop if the form is not valid
   showLoading.value = true;
  try {
    if (isEdit.value) {
      await userStore.updateUser(supplierId.value, form);
      toaster.success("Supplier updated successfully");
      showLoading.value = false;
      getSuppliers();
      visible.value = false;
    } else {
      supplierStore.submitSupplier(form).then(function (response) {
      getSuppliers();
      showLoading.value = false;
      visible.value = false;
      toaster.success("Supplier created successfully");

      }).catch(function (error) {
        showLoading.value = false;
        toaster.error("Error creating supplier");
        console.log(error);
      });
      
    }
  } catch (error) {
    toaster.error("Error processing supplier");
    console.error(error);
  }
};


watch(searchInput, () => {
    onInput();
 });


const onInput = debounce(() => {
	if(searchInput.value){ 
		const searchTerm = searchInput.value.toLowerCase();
    supplierStore.getAllSuppliers(null,searchTerm).then(response => {
      promoters.value = [...response.data.content];
      allData.value = response.data;	
    })
	 } else {
		promoters.value = [...supplierStore.allSuppliers];
		allData.page = supplierStore.allSuppliers
	 }
}, 500);


const getSuppliers = async () => {
  showLoading.value = true;
  supplierStore.getAllSuppliers().then(response => {
    showLoading.value = false;
    supplierStore.setAllSuppliers(response.data.content);
    allData.value = response.data;
    promoters.value = [...supplierStore.allSuppliers]; 
  }).catch(error => {
    toaster.error("Error fetching suppliers");
    console.log(error);
  }).finally(() => {
    showLoading.value = false;
  });
};


const getAllSizes = async () => {
  showLoading.value = true;
  sizeStore.getSizes().then(response => {
    sizes.value = response.data;
  }).catch(error => {
    console.log(error);
  }).finally(() => {
    showLoading.value = false;
  });
};

let user_id = ref(null);
const visible = ref(false);
let isEdit = ref(false);
let supplierId = ref(null);

const openPosition = (promoter) => {
  if (promoter) {
    form.id=promoter.id
    isEdit.value = true;
    supplierId.value = promoter.id;
    form.user = promoter.id;
    user_id.value = promoter.id;

    Object.assign(form, {
      firstName: promoter.firstName,
      lastName: promoter.lastName,
      email: promoter.email,
      phone: promoter.phone,
      bio: promoter.bio,
      role: promoter.role,
      name: promoter.name,
      description: promoter.description,
      id: promoter.id
    });
  } else {
    isEdit.value = false;
    Object.assign(form, {
      user: null,
      user_id: null,
      name: null,
      description: null,
    });
  }
  visible.value = true;
};


const toggleModal = () => {
  form.id = 0;
  isEdit.value = false; // Reset edit mode
  form.firstName = null;
  form.lastName = null;
  form.email = null;
  form.phone = null;
  form.description = null;
  visible.value = true; // Show modal
};

const handlePageChange = (newPage) => {
  supplierStore.getAllSuppliers(newPage).then(function (response) {
    supplierStore.setAllPromoters(response.data.content);
    promoters.value = [...supplierStore.allPromoters];
  });
};

const redirectToProfile = (user) => {
	if(!user) return
  router.push({
    path: `/supplier-profile/${user?.activeUserId}/${user?.id}`
  });
};

const isPhoneUnique = debounce(() => {
  userStore.isFieldUnique('phone', form.phone, form.id).then((response) => {
    phoneValidationError.value = response.data === true; // Set to true if the phone exists
  });
}, 500);


const isEmailUnique = debounce(() => {
  userStore.isFieldUnique('email', form.email,form.id).then((response) => {
    emailValidationError.value = response.data === true; // Set to true if the email exists
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
const isStaffFormValid = () => {
  return !phoneValidationError.value && !emailValidationError.value || showLoading.value == true;
};

const deleteSupplier = (supplier) => {
 if(!confirm("Are you sure you want to delete this supplier?")) return;
  userStore.deleteUser(supplier.id).then(response => {
    toaster.success("Supplier deleted successfully");
    getSuppliers();
  }).catch(error => {
    toaster.error("Error deleting supplier");
    console.log(error);
  });
};


const showImportModal = ref(false);
const excelHeaders = ref([
	"First Name",
	"Last Name",
	"Email",
  "Phone",
  "Company Name",
  "Company Description"
]);

const config = {
  headers: {
    "Content-Type": "multipart/form-data",
  },
}
const onExcelSubmit = (data, rowCount) => {
	if(rowCount === 0) return;
	showLoading.value = true;
	const formData = new FormData();
	formData.append('csvFile', data);
	supplierStore.importExcel(formData, config)
	.then((response) => {
		toaster.success("Suppliers imported successfully");
    getSuppliers();
		showLoading.value = false;
		showImportModal.value = false;
	}).catch(error => {
		showLoading.value = false;
		console.log(error)
	})
}

</script>

<template>
  <Layout>
    <div class="page-wrapper">
      <div class="page-content">
        <BreadCrumb title="Suppliers" icon="bx bxs-user-detail" />
        <div class="card">
          <div class="card-body">
            <div class="d-lg-flex align-items-center mb-4 gap-1">
              <div class="position-relative">
                <SearchInput 
                  placeholder="Search" 
                  id="searchInput"
                  v-model="searchInput" @input="onInput" classes="form-control ps-5" type="search">
                  <template #search>
                    <span class="position-absolute top-50 product-show translate-middle-y">
                      <i class="bx bx-search"></i>
                    </span>
                  </template>
								</SearchInput>
              </div>
              <div class="ms-auto d-flex">

                <div class="me-2">
                  <Button @click="showImportModal = true" classes="btn maz-gradient-btn mt-2 mt-lg-0" type="button">
                    <template #content>
                      Import Suppliers
                    </template>									  
                  </Button>
                </div>
                <div>
                  <Button @click="toggleModal" classes="btn maz-gradient-btn mt-2 mt-lg-0" type="button">
                    <template #content>
                      Add Supplier
                    </template>									  
                  </Button>
                </div>
              </div>
            </div>

            <div class="row row-cols-1 row-cols-lg-2 row-cols-xl-3 row-cols-xxl-4">

              <Column class="col" v-if="promoters?.length > 0" v-for="promoter in promoters" :key="promoter.id">
								<Card classes="radius-15">
									<CardBody class="text-center animate__animated animate__zoomIn">
							         <SupplierCard 
                          :promoter="promoter" 
                          classes="p-4 border radius-15" 
                          @gotToProfile="redirectToProfile" 
                          @edit="openPosition"
                          @delete="deleteSupplier"
                      />
                   </CardBody>
						       </Card>
							</Column>
            </div>

            <Paginator :page="allData?.page" @changePage="handlePageChange" v-if="!showLoading" />
          </div>
        </div>
      </div>
    </div>

    <Dialog v-model:visible="visible" position="top" modal :header="isEdit ? 'Edit Supplier' : 'Add Supplier'" :style="{ width: '50rem' }">
      <Row class="g-3">   

        <Column classes="col-md-6">
          <InputLabel labelText="First Name" classes="form-label" htmlFor="firstName"/>
          <Input v-model="form.firstName" type="text" classes="form-control" id="firstName" placeholder="" />
          <InputError classes="input-errors" :errors="v$.firstName.$errors" message="First Name is required" />
        </Column>

        <Column classes="col-md-6">
          <InputLabel labelText="Last Name" classes="form-label" htmlFor="lastName"/>
          <Input v-model="form.lastName" type="text" classes="form-control" id="lastName" placeholder="" />
          <InputError classes="input-errors" :errors="v$.lastName.$errors" message="Last Name is required" />
          </Column>

          <Column classes="col-md-6">
          <InputLabel labelText="Email" classes="form-label" htmlFor="email"/>
          <Input v-model="form.email" type="email" classes="form-control" id="email" placeholder="" />
          <span v-if="emailValidationError" class="text-danger">Email already exist.</span>
					<InputError v-else-if="!emailValidationError" classes="input-errors" :errors="v$.email.$errors" message="Email is required" />
          </Column>

          <Column classes="col-md-6">
          <InputLabel labelText="Phone Number" classes="form-label" htmlFor="cell"/>
          <InputNumber v-model="form.phone" classes="form-control" id="cell" placeholder="" />
          <span v-if="phoneValidationError" class="text-danger">Phone Number already exist.</span>
					<InputError v-else-if="!phoneValidationError" classes="input-errors" :errors="v$.phone.$errors" message="Phone Number is required" />
          </Column>

          <Column classes="col-md-12">
            <InputLabel labelText="Company Name" classes="form-label" htmlFor="name"/>
            <Input v-model="form.name" type="text" classes="form-control" id="name" placeholder="" />
          </Column>
       
        <Column class="col-md-12">
          <InputLabel labelText="Company Description" classes="form-label" htmlFor="description"/>
          <Textarea v-model="form.description" id="description" autoResize rows="5" cols="91"/>
        </Column>
         
      </Row>

      <Column class="col-12 mt-4">
        <div class="d-grid">
          <Button @click="onSubmit" classes="btn maz-gradient-btn" type="button" text="Submit" :disabled="!isStaffFormValid()">
            <template #content>
            {{ isEdit ? showLoading ? '' : 'Update' : showLoading ? '' : 'Submit' }}
            </template>									  
            <Spinner v-if="showLoading" class="spinner-border spinner-border-sm" />
          </Button>
        </div>
      </Column>
    </Dialog>
    <Dialog v-model:visible="showImportModal" position="top" modal header="Import Suppliers" style="width: 35rem">
      <ImportExcelModal 
           :excelHeaders="excelHeaders"
            @submit="onExcelSubmit"
            :loading="showLoading"
            :modelId="0"
          />
    </Dialog>
  </Layout>
</template>

<style scoped>
.mt-4 {
  margin-top: 1rem;
}

.p-dialog-mask {
  align-items: start !important;
}

.btn-outline-secondary {
  height: 2rem !important;
}

.p-button:not(:disabled):hover {
  background: transparent;
  border: 0;
}

.p-button {
  background: transparent;
  border: 0;
}

.p-popover.p-component {
  left: 50rem !important;
}

</style>
