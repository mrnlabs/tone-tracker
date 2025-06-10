<template>
    <div class="page-breadcrumb d-none d-sm-flex  mb-3">
        <div class="breadcrumb-title d-flex align-items-center justify-content-center"><i class='maz-gradient-txt me-3' :class="icon"></i> {{ title }}</div>
    </div>
</template>
<script setup >
const props = defineProps({
    title: String,
    icon: String
})
</script>
<style >
.breadcrumb-title {
    border-right: 0px;
    font-size: 50px;
    font-weight: 700;
}

.maz-gradient-txt {
	background: -webkit-linear-gradient(#117AD1, #9A3AB1);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}
html.dark-theme .breadcrumb-title {
    border-right: 0px solid rgb(255 255 255 / 18%);
}

</style>