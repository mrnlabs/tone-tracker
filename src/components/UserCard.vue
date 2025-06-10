<template>
    <div :class="classes">
    <img v-if="user.path" :src="`${envPath}${user.path}`" width="110" height="110" class="rounded-circle shadow" alt="">
    <img v-else src="https://tonetrackerfrontend.s3.af-south-1.amazonaws.com/do_not_delete/placeholder.png" width="110" height="110" class="rounded-circle shadow" alt="">
    <h5 class="mb-0 mt-3">{{ user.firstName }} {{ user.lastName }} {{ isStaff ? isMyProfile(user) ? '(You)' : '' : ''}}</h5>
    <p class="mb-3">{{ formatSingleRole(user.role) }}</p>
    <div class="list-inline contacts-social mt-3 mb-3"> 
        <a v-tooltip.left="'Edit'" @click="edit(user)" href="javascript:;" class="list-inline-item maz-gradient-btn text-white border-0">
        <i class="bx bxs-edit"></i>
       </a>
       <a v-tooltip.right="'Delete'" @click="deleteUser(user)" href="javascript:;" class="list-inline-item bg-danger text-white border-0">
        <i class="bx bx-trash"></i>
       </a>
    </div>
    <div class="d-grid"> 
        <Button @click="redirectToProfile(user)" classes="btn btn-outline-primary radius-15" type="button" text="Submit">
            <template #content>
                View Profile
            </template>									  
          </Button>
    </div>
    </div>
      
</template>
<script setup>
import isMyProfile from '@/utils/isMyProfile';
import Button from './buttons/Button.vue';
import { formatSingleRole } from '@/utils';

const emit = defineEmits(['gotToProfile', 'edit','delete']);

    const envPath = import.meta.env.VITE_AWS_S3_BUCKET;

    const modelValue = defineProps({
      user: {
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

  const deleteUser = (user) => {
    emit('delete', user)
  }
</script>