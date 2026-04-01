<template>
  <div class="charts">
    <h3>📊 Analytics</h3>

    <div v-if="loading">Loading charts...</div>

    <template v-else>
      <div class="chart-box">
        <h4>Revenue Overview</h4>
        <Bar v-if="revenueData.datasets.length" :data="revenueData" :options="options" />
      </div>

      <div class="chart-box">
        <h4>Bookings per Concert</h4>
        <Bar v-if="bookingData.datasets.length" :data="bookingData" :options="options" />
      </div>

      <div class="chart-box">
        <h4>Payment Status</h4>
        <Pie v-if="paymentData.datasets.length" :data="paymentData" />
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

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement
)

// ---------------- SAFE INITIAL STATE ----------------
const revenueData = ref({
  labels: [],
  datasets: []
})

const bookingData = ref({
  labels: [],
  datasets: []
})

const paymentData = ref({
  labels: [],
  datasets: []
})

const loading = ref(true)

// ---------------- OPTIONS ----------------
const options = {
  responsive: true,
  plugins: {
    legend: { position: "top" }
  }
}

// ---------------- FETCH ----------------
async function fetchAnalytics() {
  try {
    const res = await axios.get("https://thesisproject-pqtl.onrender.com/admin/analytics")
    const data = res.data || {}

    // ✅ SAFE FALLBACKS
    const revenue = data.revenue || []
    const bookings = data.bookings || []
    const payments = data.payments || {}

    // ---------------- REVENUE ----------------
    revenueData.value = {
      labels: revenue.map(r => r?.date || ""),
      datasets: [
        {
          label: "Revenue",
          data: revenue.map(r => r?.amount || 0)
        }
      ]
    }

    // ---------------- BOOKINGS ----------------
    bookingData.value = {
      labels: bookings.map(b => b?.concert || ""),
      datasets: [
        {
          label: "Bookings",
          data: bookings.map(b => b?.count || 0)
        }
      ]
    }

    // ---------------- PAYMENTS ----------------
    paymentData.value = {
      labels: ["Completed", "Pending", "Failed"],
      datasets: [
        {
          data: [
            payments.completed || 0,
            payments.pending || 0,
            payments.failed || 0
          ]
        }
      ]
    }

  } catch (err) {
    console.error("Analytics error:", err)
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