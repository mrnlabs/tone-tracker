<template>
    <input
      ref="autocompleteInput"
      type="text"
      :placeholder="placeholder"
      @input="handleInput"
    />
  </template>
  
  <script setup>
  import { ref, onMounted, watch } from 'vue';
  
  const props = defineProps({
    placeholder: {
      type: String,
      default: 'Enter an address'
    },
    modelValue: String
  });
  
  const emit = defineEmits(['update:modelValue', 'place-changed']);
  
  const autocompleteInput = ref(null);
  let autocomplete = null;
  
  onMounted(() => {
    autocomplete = new google.maps.places.Autocomplete(autocompleteInput.value, {
      types: ['address']
    });
  
    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      emit('place-changed', place);
      emit('update:modelValue', place.formatted_address);
    });
  });
  
  const handleInput = (event) => {
    emit('update:modelValue', event.target.value);
  };
  
  watch(() => props.modelValue, (newValue) => {
    if (newValue !== autocompleteInput.value.value) {
      autocompleteInput.value.value = newValue;
    }
  });
  </script>