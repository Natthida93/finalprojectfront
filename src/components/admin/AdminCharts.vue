<template>
  <div class="charts">
    <h3>📊 Analytics</h3>

    <div v-if="loading">Loading charts...</div>

    <template v-else>
      <div class="chart-box">
        <h4>Revenue Overview</h4>
        <Bar v-if="revenueData.datasets.length" :data="revenueData" :options="barOptions" />
      </div>

      <div class="chart-box">
        <h4>Bookings per Concert</h4>
        <Bar v-if="bookingData.datasets.length" :data="bookingData" :options="barOptions" />
      </div>

      <div class="chart-box">
        <h4>Payment Status</h4>
        <Pie v-if="paymentData.datasets.length" :data="paymentData" :options="pieOptions" />
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"
import { Bar, Pie } from "vue-chartjs"
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

// Register Chart.js components
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement)

// ----------------- State -----------------
const revenueData = ref({ labels: [], datasets: [{ label: "Revenue", data: [], backgroundColor: "rgba(75, 192, 192, 0.7)" }] })
const bookingData = ref({ labels: [], datasets: [{ label: "Bookings", data: [], backgroundColor: "rgba(54, 162, 235, 0.7)" }] })
const paymentData = ref({ labels: [], datasets: [{ label: "Payments", data: [], backgroundColor: ["rgba(75,192,192,0.7)","rgba(255,206,86,0.7)","rgba(255,99,132,0.7)"] }] })

const loading = ref(true)

// ----------------- Options -----------------
const barOptions = { responsive: true, plugins: { legend: { position: "top" } }, scales: { y: { beginAtZero: true } } }
const pieOptions = { responsive: true, plugins: { legend: { position: "top" } } }

// ----------------- Fetch Analytics -----------------
async function fetchAnalytics() {
  try {
    const res = await fetch("https://thesisproject-pqtl.onrender.com/admin/analytics")
    const data = await res.json()

    const revenue = data.revenue || []
    const bookings = data.bookings || []
    const payments = data.payments || {}

    revenueData.value = {
      labels: revenue.map(r => r.date || ""),
      datasets: [
        {
          label: "Revenue",
          data: revenue.map(r => Number(r.amount || 0)),
          backgroundColor: "rgba(75, 192, 192, 0.7)"
        }
      ]
    }

    bookingData.value = {
      labels: bookings.map(b => b.concert || ""),
      datasets: [
        {
          label: "Bookings",
          data: bookings.map(b => Number(b.count || 0)),
          backgroundColor: "rgba(54, 162, 235, 0.7)"
        }
      ]
    }

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
          backgroundColor: [
            "rgba(75, 192, 192, 0.7)",
            "rgba(255, 206, 86, 0.7)",
            "rgba(255, 99, 132, 0.7)"
          ]
        }
      ]
    }
  } catch (err) {
    console.error("Analytics fetch error:", err)
  } finally {
    loading.value = false
  }
}

onMounted(fetchAnalytics)
</script>

<style scoped>
.charts { margin-top: 20px; }
.chart-box { margin: 20px 0; background: #f8f9fa; padding: 15px; border-radius: 10px; }
</style>