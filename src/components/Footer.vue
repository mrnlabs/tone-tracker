<template>
    <footer class="page-footer ">
        <p class="mb-0">Copyright © {{ new Date().getFullYear() }}. All right reserved.
    </p>
    <!-- <span @click="logout" class=" btn text-white  maz-gradient-btn ml-4 float-end cursor-pointer">Logout</span> -->
    <div class=" d-none justify-content-center">
        <Toast position="bottom-center" group="bc" @close="onClose">
            <template #message="slotProps">
                <div class="alert alert-warning border-0 bg-warning alert-dismissible fade show py-2">
                    <div class="d-flex align-items-center">
                        <div class="font-35 text-dark"><i class='bx bx-wifi-off'></i>
                        </div>
                        <div class="ms-3">
                            <div class="text-dark">{{ slotProps.message.summary }}</div>
                        </div>
                    </div>
                </div>
            </template>
        </Toast>
    </div>
    </footer>
</template>
<script setup>
import { useOnline } from "@vueuse/core";
import Toast from "primevue/toast";
import { useToast } from "primevue/usetoast";
import { ref, watch } from "vue";

const toast = useToast();
const visible = ref(false);

const online = useOnline();

// Watch the `online` reactive value
watch(online, (newVal) => {
    if (!newVal) {
        showTemplate();
    }else{
        onClose();
    }
    console.log('newVal',newVal);
});

const showTemplate = () => {
   //if user is online close toast
    if (visible.value) {
        onClose();
    }
    if (!visible.value) {
        toast.add({ 
            severity: 'danger', 
            summary: 'You`re offline. Please check your internet connection.', 
            group: 'bc' 
        });
        visible.value = true;
    }else{
        onClose();
    }
};

const onClose = () => {
    visible.value = false;
};
</script>
