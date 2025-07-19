<template>
  <div class="stock-adjustments">
    <h1>Stock Adjustments</h1>
    <p>This page is under construction. Please use the Stock Movements page to record adjustments.</p>
    <BaseButton variant="primary" @click="$router.push('/warehouses/stock/movements')">
      Go to Stock Movements
    </BaseButton>
  </div>
</template>

<script setup>
import { BaseButton } from '@/components'
</script>

<style scoped>
.stock-adjustments {
  padding: 2rem;
  text-align: center;
}
</style>