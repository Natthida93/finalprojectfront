<template>
  <div class="charts">
    <h3>📊 Analytics</h3>

    <!-- Revenue -->
    <div class="chart-box">
      <h4>Revenue Overview</h4>
      <Bar
        v-if="revenueData.datasets.length"
        :chart-data="revenueData"
        :chart-options="barOptions"
      />
    </div>

    <!-- Bookings -->
    <div class="chart-box">
      <h4>Bookings Overview</h4>
      <Bar
        v-if="bookingData.datasets.length"
        :chart-data="bookingData"
        :chart-options="barOptions"
      />
    </div>

    <!-- Payments -->
    <div class="chart-box">
      <h4>Payment Status</h4>
      <Pie
        v-if="paymentData.datasets.length"
        :chart-data="paymentData"
        :chart-options="pieOptions"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue"
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement
} from "chart.js"
import { Bar, Pie } from "vue-chartjs"

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement)

const props = defineProps({
  stats: { type: Object, required: true }
})

// ---------------- OPTIONS ----------------
const barOptions = {
  responsive: true,
  plugins: { legend: { position: "top" } },
  scales: { y: { beginAtZero: true } }
}

const pieOptions = {
  responsive: true,
  plugins: { legend: { position: "top" } }
}

// ---------------- DATA ----------------
const revenueData = ref({ labels: [], datasets: [] })
const bookingData = ref({ labels: [], datasets: [] })
const paymentData = ref({ labels: [], datasets: [] })

// ---------------- HELPER: COLORS ----------------
function generateColors(length) {
  const baseColors = [
    "75, 192, 192",
    "54, 162, 235",
    "255, 206, 86",
    "255, 99, 132",
    "153, 102, 255",
    "255, 159, 64"
  ]
  return Array.from({ length }, (_, i) => `rgba(${baseColors[i % baseColors.length]}, 0.7)`)
}

function generateBorderColors(length) {
  return generateColors(length).map(c => c.replace("0.7", "1"))
}

// ---------------- WATCH STATS ----------------
watch(
  () => props.stats,
  (stats) => {
    if (!stats) return

    // Revenue - single bar
    revenueData.value = {
      labels: ["Revenue"],
      datasets: [
        {
          label: "Revenue",
          data: [Number(stats.revenue || 0)],
          backgroundColor: generateColors(1),
          borderColor: generateBorderColors(1),
          borderWidth: 1
        }
      ]
    }

    // Bookings - single bar
    bookingData.value = {
      labels: ["Bookings"],
      datasets: [
        {
          label: "Bookings",
          data: [Number(stats.bookings || 0)],
          backgroundColor: generateColors(1),
          borderColor: generateBorderColors(1),
          borderWidth: 1
        }
      ]
    }

    // Payments - pie chart
    const payments = stats.payments || {}
    paymentData.value = {
      labels: ["Completed", "Pending", "Failed"],
      datasets: [
        {
          label: "Payments",
          data: [
            Number(payments.completed || 0),
            Number(payments.pending || 0),
            Number(payments.failed || 0)
          ],
          backgroundColor: generateColors(3),
          borderColor: generateBorderColors(3),
          borderWidth: 1
        }
      ]
    }
  },
  { immediate: true }
)
</script>

<style scoped>
.charts {
  margin-top: 20px;
}

.chart-box {
  margin: 20px 0;
  background: #f8f9fa;
  padding: 15px;
  border-radius: 10px;
}

canvas {
  width: 100% !important;
  height: 300px !important;
}
</style>