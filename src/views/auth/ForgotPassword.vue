<script>
import { RouterLink, RouterView } from 'vue-router';
import { useVuelidate } from '@vuelidate/core';
import { required, email } from '@vuelidate/validators';
import { reactive, ref } from 'vue';
import router from '@/router';
import { useMonitorSize } from '@/composables/useMonitorSize';
import { useAuth } from '@/stores/auth';
import useToaster from '@/composables/useToaster';
import { useStorage } from '@vueuse/core'

export default {
  setup() {
    const loading = ref(false);

    const screenSizes = useMonitorSize();
    const auth = useAuth();
    const toaster = useToaster();

    const form = reactive({
      email: '',
    });

    const rules = {
      email: { required, email }
    }
    const v$ = useVuelidate(rules, form)

    const onSubmit = async () => {
      loading.value = true;
      const isFormCorrect = await v$.value.$validate();
      if (!isFormCorrect) {
        loading.value = false;
        return;
      }
      auth.sendEmailPassword(form.email)
        .then(function (response) {
          toaster.success("Password reset instructions sent to your email");
          // setTimeout(() => {
          //   router.push('/');
          // }, 1000)
        }).catch(function (error) {

          if (error.response.data == "Email does not exist.") {
            // Token has expired
            toaster.error("Email does not exist");
            return;
          }
          toaster.error("Error sending reset instructions");
          console.log(error);
        }).finally(function () {
          loading.value = false;
        });
    }

    return {
      form, v$, onSubmit, screenSizes, loading
    }
  }
}
</script>

<template>
  <div class="logo-light"></div>
  <div class="shoes"></div> 
  <div class="container-login">
    <div class="section-authentication-cover">
      <div class="login-cover">
        <div class="row g-0">
          <div class="col-12 col-xl-7 col-xxl-8 auth-cover-left align-items-center d-none d-xl-flex">
            <div class="card shadow-none bg-transparent shadow-none rounded-0 mb-0">
              <div class="card-body">
              </div>
            </div>
          </div>

          <div class="col-12 col-xl-5 col-xxl-4 auth-cover-right align-items-center justify-content-center">
            <div class="card rounded-0 m-3 shadow-none bg-transparent mb-0">
              <div class="card-body p-sm-5">
                <div class="">
                  <div class="form-body">
                    <h5 class="mb-3 text-default">Forgot Password</h5>
                    <form @submit.prevent="onSubmit" class="row g-3">
                      <div class="mb-3 col-12">
                        <label for="inputEmailAddress" class="form-label">Email Address</label>
                        <input v-model="form.email" type="email" class="form-control custom-input" id="inputEmailAddress" autofocus>
                        <div class="input-errors" v-for="error of v$.email.$errors" :key="error.$uid">
                          <div class="text-danger">{{ error.$message }}</div>
                        </div>
                      </div>
                      <div class="col-12">
                        <div class="d-grid">
                          <button type="submit" 
                            class="btn p-3 maz-gradient-btn text-white d-flex justify-content-center align-items-center">
                            <div v-if="loading" class="spinner-border text-white " role="status">
                              <span class="visually-hidden">Loading...</span>
                            </div>
                            {{ loading ? '' : 'Send Reset Instructions' }}
                          </button>
                        </div>
                      </div>
                      <div class="mt-3 text-center">
                        <router-link to="/">Back to Login</router-link>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <RouterView />
</template>

<style scoped>
.text-default {
  font-size: 40px;
  font-weight: 200;
  color: #fff
}

.form-label {
  font-size: 20px;
  font-weight: 200;
  margin-bottom: 0;
  color: #fff;
}

input[type=email] {
  border: none;
  border-bottom: 2px solid #fff;
  background-color: none;
  outline: 0;
}

input[type=email]:focus {
  border: none;
  background-color: none;
}

.section-authentication-cover {
  background: url("../../assets/images/login-images/login-cover.png");
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
}

.auth-cover-left {
  position: relative;
  background-color: transparent;
}

.logo-light {
  position: absolute;
  height: 69px;
  width: 315px;
  background-image: url("../../assets/images/logo/white-logo.png");
  top: 20px;
  left: 40px;
}

.shoes {
  position: absolute;
  height: 108px;
  width: 105px;
  background-image: url("../../assets/images/login-images/Shoes.png");
  background-repeat: no-repeat;
  bottom: 20px;
  left: 40px
}

.form-control {
  border-radius: 0;
  background-color: transparent !important;
  padding: 0;
}

.form-control:hover {
  border: none;
  box-shadow: none;
  border-bottom: 2px solid #fff;
}

.auth-cover-right {
  background: rgb(34, 36, 35, 0.7);
  border-left: 1px solid #707070;
}

@media (max-width: 768px) {
  .shoes {
    display: none;
  }
}

@media (max-width: 575.98px) {
  .shoes {
    display: none;
  }
}
</style>