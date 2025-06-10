<script setup>
import Image from 'primevue/image';

const envPath= import.meta.env.VITE_AWS_S3_BUCKET;

const props= defineProps({
    canUpdate: Boolean,
    images: Array,
});
</script>
<template>

    <div class="row row-cols-auto g-3">
        <div class="col" v-for="image in images" :key="image.id">
            <Image :src="`${envPath}${image.path}`" alt="Image" width="250" preview style="min-height: 250px;" class="animate__animated animate__zoomIn" />
        </div>
    </div>
</template>