<script setup lang="ts">
import TabNav from '@/components/general/TabNav.vue';
import ActivationDetails from './ActivationDetails.vue';
import ActivationReport from './ActivationReport.vue';
import ActivationImagesComponent from './ActivationImagesComponent.vue';

const props = defineProps({
    activation: Object,
    regions: Array
})
</script>

<template>
    <div class="card-body">
        <ul class="nav nav-tabs nav-primary" role="tablist">
            <TabNav 
            tabId="details"
            icon="bx bx-home"
            title="Activation Details"
            active="active"
            />
            <TabNav
                tabId="report"
                icon="bx bx-report"
                title="Report"
                active=""
            />
            <TabNav 
            tabId="images"
            icon="bx bx-images"
            title="Activation Images"
            active=""
            />
        </ul>
        <div class="tab-content py-3">
            <div class="tab-pane fade show active " id="details" role="tabpanel">
                <ActivationDetails :activation="activation" :regions="regions" />
            </div>
            <div class="tab-pane fade show active " id="report" role="tabpanel">
              <ActivationReport :activation="activation" :regions="regions" />
            </div>
            <div class="tab-pane fade" id="images" role="tabpanel">
                <ActivationImagesComponent :activation="activation"/>
            </div>
        </div>
    </div>
</template>