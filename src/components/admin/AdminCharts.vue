<template>
  <div class="charts">
    <h3>📊 Analytics</h3>

    <div v-if="loading">Loading charts...</div>

    <template v-else>
      <div class="chart-box">
        <h4>Revenue Overview</h4>
        <Bar
          v-if="revenueData.labels.length && revenueData.datasets.length"
          :chart-data="revenueData"
          :chart-options="barOptions"
        />
      </div>

      <div class="chart-box">
        <h4>Bookings per Concert</h4>
        <Bar
          v-if="bookingData.labels.length && bookingData.datasets.length"
          :chart-data="bookingData"
          :chart-options="barOptions"
        />
      </div>

      <div class="chart-box">
        <h4>Payment Status</h4>
        <Pie
          v-if="paymentData.labels.length && paymentData.datasets.length"
          :chart-data="paymentData"
          :chart-options="pieOptions"
        />
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"
import axios from "axios"

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

// Register Chart.js components
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement)

// -------------------- State --------------------
const loading = ref(true)

const revenueData = ref({
  labels: [],
  datasets: [
    {
      label: "Revenue",
      data: [],
      backgroundColor: "rgba(75, 192, 192, 0.7)",
      borderColor: "rgba(75, 192, 192, 1)",
      borderWidth: 1
    }
  ]
})

const bookingData = ref({
  labels: [],
  datasets: [
    {
      label: "Bookings",
      data: [],
      backgroundColor: "rgba(54, 162, 235, 0.7)",
      borderColor: "rgba(54, 162, 235, 1)",
      borderWidth: 1
    }
  ]
})

const paymentData = ref({
  labels: ["Completed", "Pending", "Failed"],
  datasets: [
    {
      label: "Payments",
      data: [0, 0, 0],
      backgroundColor: [
        "rgba(75, 192, 192, 0.7)",
        "rgba(255, 206, 86, 0.7)",
        "rgba(255, 99, 132, 0.7)"
      ],
      borderColor: [
        "rgba(75, 192, 192, 1)",
        "rgba(255, 206, 86, 1)",
        "rgba(255, 99, 132, 1)"
      ],
      borderWidth: 1
    }
  ]
})

// -------------------- Options --------------------
const barOptions = {
  responsive: true,
  plugins: { legend: { position: "top" } },
  scales: { y: { beginAtZero: true } }
}

const pieOptions = {
  responsive: true,
  plugins: { legend: { position: "top" } }
}

// -------------------- Fetch Analytics --------------------
async function fetchAnalytics() {
  try {
    const res = await axios.get("https://thesisproject-pqtl.onrender.com/admin/analytics")
    const data = res.data || {}

    const revenue = data.revenue || []
    const bookings = data.bookings || []
    const payments = data.payments || {}

    // Update revenue chart
    revenueData.value.labels = revenue.map(r => r.date || "")
    revenueData.value.datasets[0].data = revenue.map(r => Number(r.amount || 0))

    // Update booking chart
    bookingData.value.labels = bookings.map(b => b.concert || "")
    bookingData.value.datasets[0].data = bookings.map(b => Number(b.count || 0))

    // Update payment chart
    paymentData.value.datasets[0].data = [
      Number(payments.completed || 0),
      Number(payments.pending || 0),
      Number(payments.failed || 0)
    ]
  } catch (err) {
    console.error("Analytics fetch error:", err)
  } finally {
    loading.value = false
  }
}

onMounted(fetchAnalytics)
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
</style>