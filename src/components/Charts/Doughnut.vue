<script setup>
import { useHomeStore } from "@/stores/home/Home";
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";
import { computed, onMounted, ref } from "vue";
import { Doughnut } from "vue-chartjs";
const store = useHomeStore();
const { HomeList } = storeToRefs(store);

ChartJS.register(ArcElement, Tooltip, Legend);

const productsByWarehouses = computed(() =>
  Array.isArray(HomeList.value.productsByWarehouses)
    ? HomeList.value.productsByWarehouses
    : []
);

const chartData = ref({
  labels: productsByWarehouses.value.map((w) => w.warehouseName),
  datasets: [
    {
      data: productsByWarehouses.value.map((w) => w.ratio * 100), // تحويل القيم إلى نسبة مئوية
      backgroundColor: [
        "#28C76F",
        "#28C790",
        "#28C350",
        "#28C266",
        "#28C21F",
        "#28C7A3",
        "#28C88E",
        "#28C774",
        "#28C1A0",
      ],
    },
  ],
});

const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  cutout: "70%",

  plugins: {
    legend: {
      position: "bottom",
      labels: {
        boxWidth: 10,
        padding: 15,
      },
    },
  },
});

const updateGradients = (chart) => {
  if (!chart || !chart.ctx) return;
  const ctx = chart.ctx;
  const width = chart.width;
  const height = chart.height;

  const getGradient = (opacity) => {
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "#28C76F");
    gradient.addColorStop(1, `rgba(255, 255, 255, ${opacity})`);
    return gradient;
  };

  chartData.value.datasets[0].backgroundColor = [
    getGradient(0.2),
    getGradient(0.4),
    getGradient(0.6),
    getGradient(0.8),
    "#28C76F",
  ];
  chart.update();
};

onMounted(() => {
  if (chartInstance.value) {
    setTimeout(() => {
      updateGradients(chartInstance.value);
    }, 500);
  }
});
const selectedPercentage = ref(null);

// عندما يتم النقر على قطاع من الدونات
const onSegmentClick = (event) => {
  const activeElement = chartInstance.value.chart.getElementsAtEventForMode(
    event,
    "nearest",
    { intersect: true },
    false
  );

  if (activeElement.length) {
    const index = activeElement[0].index;
    const selectedValue = chartData.value.datasets[0].data[index];
    selectedPercentage.value = `${selectedValue.toFixed(3)}%`;
  }
};

const chartInstance = ref(null);
store.GetMainHome();
</script>

<template>
  <div style="min-width: 300px; margin: auto">
    <Doughnut
      :data="chartData"
      :options="chartOptions"
      ref="chartInstance"
      @click="onSegmentClick"
    />
  </div>
  <div
    style="
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 18px;
      font-weight: bold;
      color: green;
    "
    v-if="selectedPercentage"
  >
    {{ selectedPercentage }}
  </div>
</template>
