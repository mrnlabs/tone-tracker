<template>
  <select 
    @change="$emit('update:modelValue', $event.target.value)"
    :value="modelValue" 
    :class="classes" 
    :id="id" 
    :placeholder="placeholder" 
    ref="selectRef" >
    <option :value="''" :selected="true" disabled>{{ placeholder }}</option>
		<option v-for="(data, index) in dataList" :key="data.value + index" :value="data.value">{{ data.label }}</option>
</select>
</template>

<script setup >
import { ref} from 'vue';


const props = defineProps({
  modelValue: {
    type: String,
    required: true,
  },
  dataList: {
    type: Array,//Lets allow an array of objects only
    default: []
  },
  classes: {
    type: [String, Array, Object],
    default: ''
  },
  id: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['update:modelValue']);

const selectRef = ref(null);


defineExpose({
  focus: () => selectRef.value?.focus()
});

</script>
