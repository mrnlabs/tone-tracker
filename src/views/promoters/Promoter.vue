<script setup>
import { onMounted, ref, reactive, watch } from 'vue';
import Layout from '@/views/shared/Layout.vue';
import BreadCrumb from '@/components/BreadCrumb.vue';
import Textarea from 'primevue/textarea';
import Dialog from 'primevue/dialog';
import { useVuelidate } from '@vuelidate/core';
import { email, required } from '@vuelidate/validators';
import { usePromoter } from '@/stores/promoter';
import useToaster from '@/composables/useToaster';
import { useSizes } from '@/stores/sizes';
import Paginator from '@/components/Paginator.vue';
import { useAuth } from '@/stores/auth';
import Row from '@/components/general/Row.vue';
import InputLabel from '@/components/form-components/InputLabel.vue';
import Input from '@/components/form-components/Input.vue';
import InputError from '@/components/form-components/InputError.vue';
import InputNumber from '@/components/form-components/InputNumber.vue';
import Column from '@/components/general/Column.vue';
import SelectDropdown from '@/components/form-components/SelectDropdown.vue';
import Button from '@/components/buttons/Button.vue';
import SearchInput from '@/components/form-components/SearchInput.vue';
import Spinner from '@/components/buttons/Spinner.vue';
import CardBody from '@/components/general/CardBody.vue';
import router from '@/router';
import PromoterCard from '@/components/PromoterCard.vue';
import Card from '@/components/general/Card.vue';
import debounce from 'lodash.debounce';
import { useUserStore } from '@/stores/userStore';
import ImportExcelModal from '@/components/file-imports/ImportExcelModal.vue';

const promoterStore = usePromoter();
const toaster = useToaster();
const userStore = useUserStore();
const sizeStore = useSizes();
const auth = useAuth();

const phoneValidationError = ref(false);
const emailValidationError = ref(false);

const allData = ref([]); //for pagination


const uploader = JSON.parse(auth.user);

let sizes = ref([]);
const promoters = ref([...promoterStore.allPromoters]);
let paginatedPromoters = ref([]);
let showLoading = ref(false);
let searchInput = ref('');

onMounted(() => {
  getAllPromoters();
  getAllSizes();
});

const generateRandomPassword = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const passwordLength = 8;
  let password = '';
  for (let i = 0; i < passwordLength; i++) {
    password += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return password;
} 

const form = reactive({
  id: 0,
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  role: "TTG_TALENT",
  dressSize: '',
  pantsSize: '',
  topSize: "",
  height: '',
  bio: '',
  gender: null,
  password: generateRandomPassword()
});



const rules = {
  firstName: { required },
  lastName: { required },
  email: { required, email },
  phone: { required },
  dressSize: { required },
  pantsSize: { required },
  height: { required },
  topSize: { required },
  bio: { required },
  gender: { required },
  role: { required }
};

const v$ = useVuelidate(rules, form);

const onSubmit = async () => {
  const isFormValid = await v$.value.$validate();
  if (!isFormValid) return;
  
  showLoading.value = true;
  if (isEdit.value) {
    promoterStore.updatePromoter(promoterId.value, form).then(function (response) {
      toaster.success("Promoter updated successfully");
      visible.value = false;
      getAllPromoters();
      v$.value.$reset();
      v$.value.$errors = [];
    }).catch(function (error) {
      toaster.error("Error updating promoter");
      console.log(error);
    }).finally(() => {
      showLoading.value = false;
    });
  } else {
    promoterStore.submitUser(form).then(function (response) {
      toaster.success("Promoter created successfully");
      visible.value = false;
      getAllPromoters();
    }).catch(function (error) {
      toaster.error("Error creating promoter");
      console.log(error);
    }).finally(() => {
      showLoading.value = false;
    });
  }
};

const selectedGender = ref('');
const searchTerm = ref('');

const onGenderChange = (event) => {
   selectedGender.value = event.target.value;
  
  if (selectedGender.value === 'all') {
    promoters.value = [...promoterStore.allPromoters];
  } else {
    promoterStore.getPromoters(null,searchTerm.value, selectedGender.value).then(response => {//null is for page(pagination)
      promoters.value = [...response.data.content];
      allData.value = response.data;	
    })
  }
  
};


 watch(searchInput, () => {
    onInput();
 });
 watch(selectedGender, () => {
    onInput();
 });


const onInput = debounce(() => {
	if(searchInput.value){ 
		searchTerm.value = searchInput.value.toLowerCase();
    promoterStore.getPromoters(null,searchTerm.value, selectedGender.value).then(response => {//null is for page(pagination)
      promoters.value = [...response.data.content];
      allData.value = response.data;	
    })
	 } else {
		promoters.value = [...promoterStore.allPromoters];
		allData.page = promoterStore.allPromoters
	 }
}, 500);


const getAllPromoters = async () => {
  showLoading.value = true;
  promoterStore.getPromoters().then(response => {
    promoterStore.setAllPromoters(response.data.content);
    promoters.value = [...promoterStore.allPromoters];
    allData.value = response.data;
    showLoading.value = false;
  }).catch(error => {
    showLoading.value = false;
    toaster.error("Error fetching promoters");
    console.log(error);
  }).finally(() => {
    showLoading.value = false;
  });
};

const originalSizes = ref([]);
const getAllSizes = async () => {
  showLoading.value = true;
  sizeStore.getSizes().then(response => {
    sizeStore.setAllSizes(response.data);
    sizes.value = sizeStore.allSizes;
    originalSizes.value = sizeStore.allSizes;
    sizes.value = sizeStore.allSizes.map(size => ({
    value: size.toUpperCase(),
    label: size.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())
  }));
  }).catch(error => {
    console.log(error);
  }).finally(() => {
    showLoading.value = false;
  });
};

const deletePromoter = (promoter) => {
 if(!confirm("Are you sure you want to delete this promoter?")) return;
  promoterStore.deletePromoter(promoter.user).then(response => {
    toaster.success("Promoter deleted successfully");
    getAllPromoters();
  }).catch(error => {
    toaster.error("Error deleting promoter");
    console.log(error);
  });
};


let isEdit = ref(false);
let promoterId = ref(null);

const visible = ref(false);
const toggleModal = () => {
  form.id = 0;
  isEdit.value = false;
  visible.value = true;
  Object.assign(form, {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: "TTG_TALENT",
    dressSize: null,
    pantsSize: '',
    topSize: null,
    height: '',
    bio: '',
    gender: null
  });
};

const openPosition = (promoter) => {
  if (promoter) {
    form.id = promoter.userDetails?.id;
    isEdit.value = true;
    promoterId.value = promoter.userDetails?.id;
    Object.assign(form, {
      firstName: promoter.userDetails.firstName,
      lastName: promoter.userDetails?.lastName,
      email: promoter.userDetails?.email,
      dressSize: promoter.dressSize,
      phone: promoter.userDetails?.phone,
      pantsSize: promoter.pantsSize,
      topSize: promoter.topSize,
      height: promoter.height,
      bio: promoter.bio,
      gender: promoter.gender
    });
  } else {
    toggleModal();
  }
  visible.value = true;
};

const genders = ref([
  { value: 'MALE', label: 'MALE' },
  { value: 'FEMALE', label: 'FEMALE' },
]);
const handlePageChange = (newPage) => {
  promoterStore.getPromoters(newPage).then(function (response) {
    promoterStore.setAllPromoters(response.data.content);
    promoters.value = [...promoterStore.allPromoters];
  });
};

const redirectToProfile = (user) => {
  // path: `/profile/${promoter.userDetails?.id}/${promoter?.id}`, 
	if(!user) return
  router.push({
    path: `/profile/${user.userDetails?.id}/${user?.id}`,
    query: { uploader: uploader?.id },
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

const showImportModal = ref(false);
const excelHeaders = ref([
	"Name",
	"Lastname",
	"Email",
  "Phone",
  "Height",
  "Top Size",
  "Pant Size",
  "Dress Size",
  "Bio",
  "Gender"
]);

const config = {
  headers: {
    'Content-Type': 'multipart/form-data'
  }
}

const onExcelSubmit = (data, rowCount) => {
	if(rowCount === 0) return;
	showLoading.value = true;
	const formData = new FormData();
	formData.append('csvFile', data);
	promoterStore.importExcel(formData, config)
	.then((response) => {
		toaster.success("Promoters imported successfully");
    getAllPromoters();
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
        <BreadCrumb title="Promoters" icon="bx bxs-user-badge" />
        <Card>
          <CardBody>
            <div class="d-lg-flex align-items-center mb-4 gap-3">
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
              <Row class="row">
                <Column class="col-lg-3 col-md-6">
                  <select @change="onGenderChange" class="form-select form-select-sm bg-maz-light">
                    <option selected disabled>Filter by sex</option>
                    <option value="all">All</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                  </select>
                </Column>
              </Row>
              <div class="ms-auto d-flex ">

                <div class="me-2">
                  <Button @click="showImportModal = true" classes="btn maz-gradient-btn mt-2 mt-lg-0" type="button">
                    <template #content>
                      Import Promoters
                    </template>									  
                  </Button>
                </div>
                <div>
                  <Button @click="toggleModal" classes="btn maz-gradient-btn mt-2 mt-lg-0" type="button">
                    <template #content>
                      Add Promoter
                    </template>									  
                  </Button>
                </div>
              </div>
            </div>
            
            <Row class=" row-cols-1 row-cols-lg-2 row-cols-xl-3 row-cols-xxl-4">
              <Column class="col" v-if="promoters?.length > 0" v-for="promoter in promoters" :key="promoter.id">
								<Card classes="radius-15">
									<CardBody class="text-center animate__animated animate__zoomIn">
							         <PromoterCard 
                      :promoter="promoter" 
                      classes="p-4 border radius-15" 
                      @gotToProfile="redirectToProfile" 
                      @edit="openPosition"
                      @delete="deletePromoter"
                      />
                   </CardBody>
						       </Card>
							</Column>
            </Row>
            <Paginator v-if="promoters?.length > 0" :page="allData?.page" @changePage="handlePageChange" />
          </CardBody>
        </Card>
      </div>
    </div>
    <Dialog v-model:visible="showImportModal" position="top" modal header="Import Promoters" style="width: 35rem">
      <ImportExcelModal 
           :excelHeaders="excelHeaders"
            @submit="onExcelSubmit"
            :loading="showLoading"
            :modelId="0"
          />
    </Dialog>

    <Dialog v-model:visible="visible" position="top" modal :header="isEdit ? 'Edit Promoter' : 'Add Promoter'" :style="{ width: '50rem' }">
      <Row classes="g-3">
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
        
        <div class="d-flex justify-content-between gap-1">
          <Column classes="col-md-2">
            <InputLabel labelText="Gender" classes="form-label me-2" htmlFor="gender"/>
            <SelectDropdown v-model="form.gender" classes="form-control cursor-pointer" id="dressSize" :dataList="genders" placeholder="Select" />
            <InputError classes="input-errors" :errors="v$.gender.$errors" message="Gender is required" />
          </Column>
          <Column classes="col-md-2">
            <InputLabel labelText="Dress Size" classes="form-label" htmlFor="dressSize"/>
            <SelectDropdown v-model="form.dressSize" classes="form-control cursor-pointer" id="dressSize" :dataList="sizes" placeholder="Dress Size" />
          </Column>

        <Column classes="col-md-2">
          <InputLabel labelText="Pants Size" classes="form-label" htmlFor="pantsSize"/>
          <InputNumber v-model="form.pantsSize" classes="form-control" id="pantsSize" placeholder="" />
          <InputError classes="input-errors" :errors="v$.pantsSize.$errors" message="Pants Size is required" />
        </Column>
        <Column classes="col-md-2">
          <InputLabel labelText="Top Size" classes="form-label" htmlFor="topSize"/>
          <SelectDropdown v-model="form.topSize" classes="form-control cursor-pointer" id="topSize" :dataList="sizes" placeholder="Top Size" />
        </Column>
        <Column classes="col-md-2">
          <InputLabel labelText="Height" classes="form-label" htmlFor="height"/>
          <InputNumber v-model="form.height" classes="form-control" id="height" placeholder="Height (cm)" />
          <InputError classes="input-errors" :errors="v$.height.$errors" message="Height is required" />
        </Column>
        </div>
       
        <Column classes="col-12">
          <InputLabel labelText="Bio" classes="form-label" htmlFor="bio"/>
          <Textarea v-model="form.bio" autoResize rows="5" cols="30" class="w-100" />
          <InputError classes="input-errors" :errors="v$.bio.$errors" message="Bio is required" />
        </Column>
      </Row>

      <Column class="col-12 mt-4">
        <div class="d-grid">
          <Button @click="onSubmit" classes="btn maz-gradient-btn" type="button" :disabled="!isStaffFormValid()">
            <template #content>
            {{ isEdit ? showLoading ? '' : 'Update' : showLoading ? '' : 'Submit' }}
            </template>									  
            <Spinner v-if="showLoading" class="spinner-border spinner-border-sm" />
          </Button>
          
        </div>
      </Column>
    </Dialog>
  </Layout>
</template>



<style scoped>

.p-select {
  min-width: 8rem !important;
}
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
