<template>
  <div class="logo-light"></div>
  <div class="shoes"></div>
  <div class="container-login">
    <div class="section-authentication-cover">
      <div class="login-cover">
        <div class="row g-0">
          <div class="col-12 col-xl-7 col-xxl-8 auth-cover-left align-items-center d-none d-xl-flex">
            <div class="card shadow-none bg-transparent shadow-none rounded-0 mb-0">
              <div class="card-body"></div>
            </div>
          </div>
          <div class="col-12 col-xl-5 col-xxl-4 auth-cover-right align-items-center justify-content-center">
            <div class="card rounded-0 m-3 shadow-none bg-transparent mb-0">
              <div class="card-body p-sm-5">
                <div class="">
                  <div class="form-body">
                    <h5 class="mb-3 text-default">Reset Password</h5>
                    <form @submit.prevent="onSubmit" class="row g-3">
                      <div class="mb-3 col-12">
                        <label for="inputPassword" class="form-label">New Password</label>
                        <div class="input-group" id="show_hide_password">
                          <input
                            v-model="password"
                            :type="passwordFieldType"
                            class="form-control border-start-0 border-top-0 border-end-0"
                            id="inputPassword"
                          />
                          <span v-if="password.length > 0" class="input-group-text" @click="togglePasswordVisibility">
                            <i :class="toggleIconClass"></i>
                          </span>
                        </div>
                        <div class="input-errors" v-for="error of v$.password.$errors" :key="error.$uid">
                          <div class="text-danger">{{ error.$message }}</div>
                        </div>
                      </div>
                      <div class="mb-3 col-12">
                        <label for="inputConfirmPassword" class="form-label">Confirm Password</label>
                        <div class="input-group" id="show_hide_confirm_password">
                          <input
                            v-model="confirmPassword"
                            :type="confirmPasswordFieldType"
                            class="form-control border-start-0 border-top-0 border-end-0"
                            id="inputConfirmPassword"
                          />
                          <span v-if="confirmPassword.length > 0" class="input-group-text" @click="toggleConfirmPasswordVisibility">
                            <i :class="toggleConfirmIconClass"></i>
                          </span>
                        </div>
                        <div class="input-errors" v-for="error of v$.confirmPassword.$errors" :key="error.$uid">
                          <div class="text-danger">{{ error.$message }}</div>
                        </div>
                      </div>
                      <div class="col-12">
                        <div class="d-grid">
                          <button type="submit" class="btn p-3 maz-gradient-btn text-white">
                            <div v-if="loading" class="spinner-border text-white" role="status">
                              <span class="visually-hidden">Loading...</span>
                            </div>
                            {{ loading ? 'Resetting...' : 'Reset Password' }}
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

<script>
import { RouterLink, RouterView, useRoute } from 'vue-router';
import { useVuelidate } from '@vuelidate/core';
import { required, minLength, sameAs } from '@vuelidate/validators';
import { ref, computed } from 'vue';
import router from '@/router';
import { useMonitorSize } from '@/composables/useMonitorSize';
import { useAuth } from '@/stores/auth';
import useToaster from '@/composables/useToaster';

export default {
  setup() {
    const loading = ref(false);
    const screenSizes = useMonitorSize();
    const auth = useAuth();
    const toaster = useToaster();
    const route = useRoute();

    const password = ref('');
    const confirmPassword = ref('');
    const token = ref(route.query.token || '');

    const rules = {
      password: { required, minLength: minLength(8) },
      confirmPassword: { sameAs: sameAs(password) },
      token: { required }
    };

    const v$ = useVuelidate(rules, { password, confirmPassword, token });

    const onSubmit = async () => {
      loading.value = true;
      const isFormCorrect = await v$.value.$validate();
      if (!isFormCorrect) {
        loading.value = false;
        return;
      }

      const data = {
        password: password.value,
        token: token.value
      };

      auth.resetPassword(data)
        .then(function (response) {
          console.log(response);
          toaster.success("Password updated successfully");
          setTimeout(() => {
            router.push('/');
          }, 2000);
        })
        .catch(function (error) {
          if (error.response.data == "Token has expired") {
            toaster.error("Token has expired");
            return;
          }
          toaster.error("Error resetting password");
          console.log(error);
        })
        .finally(function () {
          loading.value = false;
        });
    };

    // Password visibility toggle logic
    const showPassword = ref(false);
    const showConfirmPassword = ref(false);
    const passwordFieldType = computed(() => showPassword.value ? "text" : "password");
    const confirmPasswordFieldType = computed(() => showConfirmPassword.value ? "text" : "password");
    const toggleIconClass = computed(() => showPassword.value ? "bx bx-hide" : "bx bx-show");
    const toggleConfirmIconClass = computed(() => showConfirmPassword.value ? "bx bx-hide" : "bx bx-show");
    
    const togglePasswordVisibility = () => {
      showPassword.value = !showPassword.value;
    };
    
    const toggleConfirmPasswordVisibility = () => {
      showConfirmPassword.value = !showConfirmPassword.value;
    };

    return {
      password,
      confirmPassword,
      v$,
      onSubmit,
      screenSizes,
      loading,
      passwordFieldType,
      confirmPasswordFieldType,
      toggleIconClass,
      toggleConfirmIconClass,
      togglePasswordVisibility,
      toggleConfirmPasswordVisibility
    };
  }
};
</script>

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

input[type="password"],
input[type="text"] {
  border: none;
  border-bottom: 2px solid #fff;
  background-color: transparent;
  outline: 0;
}

input[type="password"]:focus,
input[type="text"]:focus {
  border: none;
  background-color: transparent;
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
  background: rgba(34, 36, 35, 0.7);
  border-left: 1px solid #707070;
}

.input-group-text {
  background-color: transparent;
  border: none;
  cursor: pointer;
}

.input-group-text i {
  font-size: 1.5rem;
  line-height: 1;
  color: #fff;
}

html.dark-theme .input-group-text {
  color: #d1d7de;
  background-color: transparent !important;
  border: none !important;
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