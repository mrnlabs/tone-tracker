<template>

    <div :class="classes">
      <img @click="showMore($event, promoter)" v-if="promoter.userDetails.path" :src="`${envPath}${promoter.userDetails.path}`" width="110" height="110" class="cursor-pointer trounded-circle shadow" alt="">
      <img  @click="showMore($event, promoter)" v-else src="https://tonetrackerfrontend.s3.af-south-1.amazonaws.com/do_not_delete/placeholder.png" width="110" height="110" class="cursor-pointer rounded-circle shadow" alt="">
      <h5 class="mb-0 mt-3">{{ promoter.userDetails.firstName }} {{ promoter.userDetails.lastName }}</h5>
      <p class="mb-3">{{ promoter.userDetails.email }}</p>
      <div class="list-inline contacts-social mt-3 mb-3"> 
        <a v-tooltip.left="'Edit'" @click="edit(promoter)" href="javascript:;" class="list-inline-item maz-gradient-btn text-white border-0">
          <i class="bx bxs-edit"></i>
        </a>
        <a v-tooltip.right="'Delete'" @click="deletePromoter(promoter)" href="javascript:;" class="list-inline-item bg-danger text-white border-0">
          <i class="bx bx-trash"></i>
        </a>
      </div>
      <div class="d-grid"> 
        <Button @click="redirectToProfile(promoter)" classes="btn btn-outline-primary radius-15" type="button" text="Submit">
          <template #content>
              View Profile
          </template>									  
        </Button>
      </div>
    </div>
    
    <Popover ref="op">
    <div v-if="selectedPromoter" class="popover">
      <div class="card radius-10">
        <div class="card-body">
          <div class="d-flex align-items-center">
            <img @click="showMore($event, promoter)" v-if="promoter.userDetails.path" :src="`${envPath}${promoter.userDetails.path}`" class="rounded-circle p-1 border" width="90" height="90" alt="...">
            <img @click="showMore($event, promoter)" v-else src="https://tonetrackerfrontend.s3.af-south-1.amazonaws.com/do_not_delete/placeholder.png" class="rounded-circle p-1 border" width="90" height="90" alt="...">
            
            <div class="flex-grow-1 ms-3">
              <h5 class="mt-0">{{ selectedPromoter.userDetails.firstName }} {{ selectedPromoter.userDetails.lastName }}</h5>
              <p class="mb-0 text-white">{{ selectedPromoter.bio }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    </Popover>
    
      
</template>
<script setup>
import Popover from 'primevue/popover';
import Button from './buttons/Button.vue';
import { nextTick, ref } from 'vue';
import Tag from 'primevue/tag';

const emit = defineEmits(['gotToProfile', 'edit','delete']);

const op = ref();
const selectedPromoter = ref();

const showMore = (event, promParam) => {
    op.value.hide();

    if (selectedPromoter.value?.id === promParam.id) {
        selectedPromoter.value = null;
    } else {
        selectedPromoter.value = promParam;

        nextTick(() => {
            op.value.show(event);
        });
    }
}

const hidePopover = () => {
    op.value.hide();
}

    const envPath = import.meta.env.VITE_AWS_S3_BUCKET;

    const modelValue = defineProps({
      promoter: {
        type: Object,
        default: {},
        required: true,
      },
      classes: {
        type: [String, Array, Object],
        default: ''
      },
      isMyProfile: {
        type: Function,
        default: () => false
      },
      isStaff: {
        type: Boolean,
        default: false
      },
    })
  const redirectToProfile = (user) => {
    emit('gotToProfile', user)
  }

  const edit = (user) => {
    emit('edit', user)
  }

  const deletePromoter = (user) => {
    emit('delete', user)
  }
</script>

<style>

.p-popover {
  background: #12181a !important;
}
.popover{
  background: #12181a !important;
}
/**background: #12181a !important;*/

</style>