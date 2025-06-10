<template>
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
                <div class="form-body">
                  <h5 class="mb-3 text-default">Log in</h5>
                  <form @submit.prevent="onSubmit" class="row g-3">
                    <div class="mb-3 col-12">
                      <label for="inputEmailAddress" class="form-label">User</label>
                      <input
                        v-model="form.email"
                        autofocus
                        type="email"
                        class="form-control custom-input"
                        id="inputEmailAddress"
                      />
                      <div class="input-errors" v-for="error of v$.email.$errors" :key="error.$uid">
                        <div class="text-danger">Email is required</div>
                      </div>
                    </div>

                    <div class="mb-5 col-12">
                      <label for="inputChoosePassword" class="form-label">Password</label>
                      <div class="input-group" id="show_hide_password">
                        <input
                          v-model="form.password"
                          :type="passwordFieldType"
                          class="form-control border-start-0 border-top-0 border-end-0"
                          id="inputChoosePassword"
                        />
                        <span v-if="form.password.length > 0" class="input-group-text" @click="togglePasswordVisibility">
                          <i :class="toggleIconClass"></i>
                        </span>
                      </div>
                      <div class="input-errors" v-for="error of v$.password.$errors" :key="error.$uid">
                        <div class="text-danger">Password is required</div>
                      </div>
                    </div>

                    <div class="col-12">
                      <div class="d-grid">
                        <button
                          type="submit"
                          class="btn p-3 maz-gradient-btn text-white d-flex justify-content-center align-items-center"
                        >
                          <div v-if="loading" class="spinner-border text-white" role="status">
                            <span class="visually-hidden">Loading...</span>
                          </div>
                          {{ loading ? "" : "Continue" }}
                        </button>
                      </div>
                    </div>

                    <div class="mt-3 text-center">
                      <router-link to="/forgot-password">Forgot Password?</router-link>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!--end row-->
      </div>
    </div>
  </div>
  <RouterView />
</template>

<script>
import { useVuelidate } from "@vuelidate/core";
import { required, email } from "@vuelidate/validators";
import { reactive, ref, onMounted, computed } from "vue";
import router from "@/router";
import { useMonitorSize } from "@/composables/useMonitorSize";
import { useAuth } from "@/stores/auth";
import useToaster from "@/composables/useToaster";
import { useStorage } from "@vueuse/core";
import { useClientStore } from "@/stores/useClient";

export default {
  setup() {
    const loading = ref(false);
    const screenSizes = useMonitorSize();
    const auth = useAuth();
    const toaster = useToaster();

    onMounted(() => {
      if (localStorage.getItem("token") && localStorage.getItem("user")) {
        redirect(JSON.parse(localStorage.getItem("user")));
      }
    });

    const redirect = (user) => {
      if (user.role == "TTG_SUPER_ADMIN") {
        router.push("/clients");
      } else if (
        user.role == "TTG_ACTIVATION_MANAGER" ||
        user.role == "TTG_REGIONAL_MANAGER"
      ) {
        router.push("/admin-activations");
        // router.push("/activations-dashboard");
      } else if (user.role == "CLIENT") {
        getCampaignsByClientId(user.activeUserId);
        router.push("/client-campaigns");
      } else if (user.role == "TTG_TALENT") {
        router.push("/talent");
      } else if (user.role == "SUPPLIER") {
        router.push("/supplier-dashboard");
      } else {
        //just return
        return;
        // router.push("dashboard");
      }
    };

    const form = reactive({
      email: "",
      password: "",
    });

    const rules = {
      password: { required },
      email: { required, email },
    };
    const v$ = useVuelidate(rules, form);

    const clientStore = useClientStore();

    const getCampaignsByClientId = (clientId) => {
      clientStore.getClientByClientId(clientId).then((response) => {
        const client = {
          name: response.data.name,
          id: response.data.id,
          color: response.data.color
        }
        localStorage.setItem("client", JSON.stringify(client));
      });
    };

    const onSubmit = async () => {
      loading.value = true;
      const isFormCorrect = await v$.value.$validate();
      if (!isFormCorrect) {
        loading.value = false;
        return;
      }
      auth
        .attempt(form)
        .then(function (response) {
          useStorage("token", response.data.accessToken);
          useStorage("user", response.data.user);
          toaster.success("Welcome back");
          setTimeout(() => {
            redirect(response.data.user);
          }, 1000);
        })
        .catch(function (error) {
          toaster.error("Invalid credentials");
          console.log(error);
        })
        .finally(function () {
          loading.value = false;
        });
    };

    // Password visibility toggle logic
    const showPassword = ref(false);
    const passwordFieldType = computed(() =>
      showPassword.value ? "text" : "password"
    );
    const toggleIconClass = computed(() =>
      showPassword.value ? "bx bx-hide" : "bx bx-show"
    );
    const togglePasswordVisibility = () => {
      showPassword.value = !showPassword.value;
    };

    return {
      form,
      v$,
      onSubmit,
      screenSizes,
      loading,
      showPassword,
      passwordFieldType,
      toggleIconClass,
      togglePasswordVisibility,
    };
  },
};
</script>

<style scoped>
.text-default {
  font-size: 40px;
  font-weight: 200;
  color: #fff;
}

.form-label {
  font-size: 20px;
  font-weight: 200;
  margin-bottom: 0;
  color: #fff;
}

input[type="email"],
input[type="password"] {
  border: none;
  border-bottom: 2px solid #fff;
  background-color: transparent;
  outline: 0;
}

input[type="email"]:focus,
input[type="password"]:focus {
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
  left: 40px;
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
  background-color: transparent;
  border: none !important;
}

html.dark-theme .form-control {
  color: #c0c8d1;
  background-color: transparent;
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