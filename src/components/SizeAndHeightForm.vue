<template>
    <div class="row g-3 mt-3 mb-3">
      <div class="col-md-3">
        <label for="dress_size" class="form-label">Dress Size</label>
        <select v-model="form.dressSize" class="form-control" id="dress_size">
          <option v-for="size in sizes" :key="size" :value="size">{{ size }}</option>
        </select>
      </div>
      <div class="col-md-3">
        <label for="pantsSize" class="form-label">Pants Size</label>
        <input v-model="form.pantsSize" type="number" class="form-control" id="height">
      </div>
      <div class="col-md-3">
        <label for="top-size" class="form-label">Top Size</label>
        <select v-model="form.topSize" class="form-control" id="top-size">
          <option v-for="size in sizes" :key="size" :value="size">{{ size }}</option>
        </select>
      </div>
      <div class="col-md-3">
        <label for="height" class="form-label">Height</label>
        <input v-model="form.height" type="number" class="form-control" id="height">
      </div>
      <div class="col-md-12">
        <label for="bio" class="form-label">Bio</label>
        <textarea v-model="form.bio" class="form-control" id="bio" rows="4"></textarea>
    </div>
    </div>
  </template>
  
  <script setup>
  
  const props = defineProps({
    form: {
      type: Object,
      required: true
    },
    sizes: {
      type: Array,
      required: true
    }
  });
  </script>
  