<template>
  <div class="stock-transfers">
    <h1>Stock Transfers</h1>
    <p>This page is under construction. Please use the Stock Movements page to record transfers.</p>
    <BaseButton variant="primary" @click="$router.push('/warehouses/stock/movements')">
      Go to Stock Movements
    </BaseButton>
  </div>
</template>

<script setup>
import { BaseButton } from '@/components'
</script>

<style scoped>
.stock-transfers {
  padding: 2rem;
  text-align: center;
}
</style>