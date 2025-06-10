<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  page: Object,
});

const emit = defineEmits(['changePage']);

const totalPages = computed(() => props?.page?.totalPages);

const currentPage = ref(props?.page?.number + 1);

const goToPage = (pageNumber) => {
  if (pageNumber >= 1 && pageNumber <= totalPages.value) {
    currentPage.value = pageNumber;
    emit('changePage', pageNumber - 1); // Emitted event back to parent as i dont want this component to handle any server related stuff (adjust to 0-indexed)
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    goToPage(currentPage.value + 1);
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    goToPage(currentPage.value - 1);
  }
};
</script>

<template>
  <nav aria-label="Page navigation">
    <ul class="pagination pagination-sm">
      
      <li :class="['page-item', { disabled: currentPage === 1 }]">
        <button
          class="page-link"
          @click="prevPage"
          :disabled="currentPage === 1"
        >
          Previous
        </button>
      </li>

      
      <li v-for="(pageNumber, index) in totalPages" :key="pageNumber + index" :class="['page-item', { 'active': currentPage === pageNumber }]">
        <button class="page-link" @click="goToPage(pageNumber)">
          {{ pageNumber }}
        </button>
      </li>

      
      <li :class="['page-item', { disabled: currentPage === totalPages }]">
        <button
          class="page-link"
          @click="nextPage"
          :disabled="currentPage === totalPages"
        >
          Next
        </button>
      </li>
    </ul>
  </nav>
</template>
<style scoped>
.active>.page-link, .page-link.active {
    background: linear-gradient(to right, #9A3AB1, #117AD1);
	border: none !important;
	color: white;
  height: 1.96rem;
	transition: background 0.3s ease-in-out;
}
</style>