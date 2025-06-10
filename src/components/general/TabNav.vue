<template>
    <li class="nav-item" role="presentation">
        <a class="nav-link" :class="active" data-bs-toggle="tab" :href="`#${tabId}`" role="tab" aria-selected="true">
            <div class="d-flex align-items-center">
                <div class="tab-icon">
                    <i :class="icon" class='fs-4 me-1'></i>
                </div>
                <div class="tab-title">{{ title }}</div>
            </div>
        </a>
    </li>
</template>
<script setup >

const props = defineProps({
    title:{
        type: String,
        default: ''
    },
    tabId: {
        type: String,
        default: ''
    },
    classes: {
        type: [String, Array, Object],
        default: ''
    },
    active: {
        type: String,
        default: ''
    },
    icon: {
        type: String,
        default: ''
    }
})
</script>