<script setup>
import Card from '@/components/general/Card.vue';
import CardBody from '@/components/general/CardBody.vue';
import Row from '@/components/general/Row.vue';
import useToaster from '@/composables/useToaster';
import { useUserStore } from '@/stores/userStore';
import useVuelidate from '@vuelidate/core';
import { required, sameAs } from '@vuelidate/validators';
import ProgressSpinner from 'primevue/progressspinner';
import { ref } from 'vue';

const props = defineProps({
    canUpdate: Boolean,
    user: Object
});

const toaster = useToaster();
const userStore = useUserStore();


const password = ref('');
const showPasswordLoading = ref(false);
const confirmPassword = ref('');

const paswordRules = {
  password: { required },
  confirmPassword: { sameAs: sameAs(password) }
}
 const vv$ = useVuelidate(paswordRules, { password, confirmPassword });
const updatePassword = async () => {
    const isFormCorrect = await vv$.value.$validate();
      if (!isFormCorrect) {
        showPasswordLoading.value = false;
        return;
      }
    showPasswordLoading.value = true;
    userStore.updatePassword(props.user.id,password.value).then(function (response) {
        showPasswordLoading.value = false;
        toaster.success('Password updated successfully');
        password.value = '';
        confirmPassword.value = '';
        vv$.value.$reset();
        vv$.$errors = [];
    }).catch(function (error) {
        showPasswordLoading.value = false;
        toaster.error('Something went wrong')
        console.log(error)
    }).finally(() => {
        showPasswordLoading.value = false
    })
}


</script>
<template>

    <div class="col-xl-7 mx-auto" v-if="canUpdate">						
        <Card>
            <CardBody classes="p-4">
                <Row classes=" mb-3 mt-2">
                    <label for="password" class="col-sm-3 col-form-label">New Password</label>
                    <div class="col-sm-9">
                        <div class="position-relative input-icon">
                            <input type="text" class="form-control" id="password" placeholder="New Password" v-model="password">
                            <span class="position-absolute top-50 translate-middle-y"><i class='bx bx-lock-alt'></i></span>
                        </div>
                        <div
                        class="input-errors"
                        v-for="error of vv$.password.$errors"
                        :key="error.$uid">
                        <div class="text-danger">Password is required</div>
                        </div>
                    </div>
                </Row>
                <Row classes=" mb-3">
                    <label for="password-confirm" class="col-sm-3 col-form-label">Confirm Password</label>
                    
                    <div class="col-sm-9">
                        <div class="position-relative input-icon">
                            <input type="text" class="form-control" id="password-confirm" placeholder="Confirm Password" v-model="confirmPassword">
                            <span class="position-absolute top-50 translate-middle-y"><i class='bx bx-lock-alt'></i></span>
                        </div>
                        <div
                        class="input-errors"
                        v-for="error of vv$.confirmPassword.$errors"
                        :key="error.$uid">
                        <div class="text-danger">Please confirm your password</div>
                        </div>
                    </div>
                </Row>
                <Row>
                    <label class="col-sm-3 col-form-label"></label>
                    <div class="col-sm-9">
                        <div class="d-md-flex justify-content-center align-items-center d-grid align-items-center gap-3">
                            <button v-if="!showPasswordLoading" @click="updatePassword" type="button" class="btn maz-gradient-btn w-100 px-4">
                                Update Password
                            </button>
                            <td v-if="showPasswordLoading" class="text-center">
                                <ProgressSpinner style="width: 30px; height: 30px" strokeWidth="8" fill="transparent" animationDuration=".5s" aria-label="Custom ProgressSpinner" />
                               </td>
                        </div>
                    </div>
                </Row>
            </CardBody>
        </Card>

    </div>
</template>