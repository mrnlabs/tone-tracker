<template>
    <div class="card invisible">
      <h5>Data collected </h5>
      <div class="chart-container">
        <canvas ref="doughnutChart"></canvas>
      </div>
    </div>
  </template>
  
  <script setup>
  import { onMounted, ref } from 'vue';
  import { Chart, registerables } from 'chart.js';
  
  Chart.register(...registerables);
  
  const doughnutChart = ref(null);
  
  const createChart = () => {
    const ctx = doughnutChart.value.getContext('2d');
    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: [
          'Gauteng Central (GC)',
          'North Eastern Region (NER)',
          'Eastern Region (ER)',
          'Southern Region (SR)',
          'Western Region (WR)',
          'Central Region (CR)',
        ],
        datasets: [
          {
            data: [25, 15, 15, 20, 10, 15],
            backgroundColor: [
              '#23C56D', // GC
              '#FE9947', // NER
              '#019BFE', // ER
              '#A93ABA', // SR
              '#D1345B', // WR
              '#9DBE14', // CR
            ],
            // hoverOffset: 4,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true,
            position: 'right',
            labels: {
              color: '#fff',
              font: {
              size: 15,
            },
            },
          },
          tooltip: {
            callbacks: {
              label: function (tooltipItem) {
                return tooltipItem.label + ': ' + tooltipItem.raw + '%';
              },
            },
          },
        },
        layout: {
          padding: {
            right: 100,
          },
        },
      },
    });
  };
  
  onMounted(() => {
    createChart();
  });
  </script>
  
  <style scoped>
  .chart-container {
    max-width: 700px;
    margin-top: -8rem;
    
  }
  </style>
  