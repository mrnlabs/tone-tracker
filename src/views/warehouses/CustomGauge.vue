<template>
  <div>
    <!-- Ensure the chart has a height and width -->
    <div id="main" style="width: 400px; height: 500px;"></div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, watch } from 'vue';
import * as echarts from 'echarts';

const capacity = ref(null);
const series = ref(0);

const props = defineProps({
  viewedUnit: Object
});

// Watch for changes in props.viewedUnit and update capacity
watch(() => props.viewedUnit, (newVal) => {
  capacity.value = newVal?.capacity || 0;
  series.value = capacity.value;
}, { immediate: true });

let myChart = null;

onMounted(() => {
  // Get the DOM element after it's mounted
  var chartDom = document.getElementById('main');
  
  // Initialize the chart
  myChart = echarts.init(chartDom);

  // Define the initial chart options
  var option = {
    series: [
      {
        type: 'gauge',
        axisLine: {
          lineStyle: {
            width: 30,
            color: [
              [0.3, '#67e0e3'],
              [0.7, '#37a2da'],
              [1, '#fd666d']
            ]
          }
        },
        pointer: {
          itemStyle: {
            color: 'auto'
          }
        },
        axisTick: {
          distance: -30,
          length: 8,
          lineStyle: {
            color: '#fff',
            width: 2
          }
        },
        splitLine: {
          distance: -30,
          length: 30,
          lineStyle: {
            color: '#fff',
            width: 4
          }
        },
        axisLabel: {
          color: 'inherit',
          distance: 40,
          fontSize: 20
        },
        detail: {
          valueAnimation: true,
          formatter: '{value}%',
          color: 'inherit'
        },
        data: [
          {
            value: series.value
          }
        ]
      }
    ]
  };

  // Set the initial chart options
  myChart.setOption(option);

  // Watch for changes to the `series.value` and update the chart dynamically
  watch(series, (newVal) => {
    myChart.setOption({
      series: [
        {
          data: [
            {
              value: newVal
            }
          ]
        }
      ]
    });
  });

  // Resize the chart when the window is resized
  const handleResize = () => {
    if (myChart) {
      myChart.resize();
    }
  };
  window.addEventListener('resize', handleResize);

  // Cleanup when the component is unmounted
  onBeforeUnmount(() => {
    window.removeEventListener('resize', handleResize);
    if (myChart) {
      myChart.dispose();
    }
  });
});
</script>


<style>
/* Optional: You can also make the chart responsive by controlling its container's height */
#main {
  width: 100%;
  height: 400px; /* Adjust the height as needed */
}
</style>
