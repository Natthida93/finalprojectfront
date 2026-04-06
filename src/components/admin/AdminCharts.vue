<template>
  <div class="charts">
    <h3>📊 Analytics</h3>
    <div v-if="loading">Loading charts...</div>

    <template v-else>
      <!-- Revenue Chart -->
      <div class="chart-box" v-if="revenueData.labels.length && revenueData.datasets.length">
        <h4>Revenue Overview</h4>
        <Bar :chart-data="revenueData" :chart-options="options" />
      </div>

      <!-- Bookings Chart -->
      <div class="chart-box" v-if="bookingData.labels.length && bookingData.datasets.length">
        <h4>Bookings per Concert</h4>
        <Bar :chart-data="bookingData" :chart-options="options" />
      </div>

      <!-- Payments Chart -->
      <div class="chart-box" v-if="paymentData.labels.length && paymentData.datasets.length">
        <h4>Payment Status</h4>
        <Pie :chart-data="paymentData" :chart-options="pieOptions" />
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"
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

// ---------------- STATE ----------------
const revenueData = ref({ labels: [], datasets: [{ label: "Revenue", data: [], backgroundColor: [], borderColor: [], borderWidth: 1 }] })
const bookingData = ref({ labels: [], datasets: [{ label: "Bookings", data: [], backgroundColor: [], borderColor: [], borderWidth: 1 }] })
const paymentData = ref({ labels: ["Completed", "Pending", "Failed"], datasets: [{ label: "Payments", data: [0, 0, 0], backgroundColor: [], borderColor: [], borderWidth: 1 }] })
const loading = ref(true)

// ---------------- OPTIONS ----------------
const options = { responsive: true, plugins: { legend: { position: "top" } }, scales: { y: { beginAtZero: true } } }
const pieOptions = { responsive: true, plugins: { legend: { position: "top" } } }

// ---------------- HELPERS ----------------
function generateColors(length) {
  const baseColors = ["75, 192, 192","54, 162, 235","255, 206, 86","255, 99, 132","153, 102, 255","255, 159, 64"]
  return Array.from({ length }, (_, i) => `rgba(${baseColors[i % baseColors.length]}, 0.7)`)
}
function generateBorderColors(length) { return generateColors(length).map(c => c.replace("0.7", "1")) }

// ---------------- FETCH ANALYTICS ----------------
async function fetchAnalytics() {
  try {
    const res = await fetch("https://thesisproject-pqtl.onrender.com/admin/analytics")
    const data = await res.json()

    const revenue = data.revenue || []
    const bookings = data.bookings || []
    const payments = data.payments || {}

    // Revenue Chart
    revenueData.value = {
      labels: revenue.map(r => r.date || ""),
      datasets: [{
        label: "Revenue",
        data: revenue.map(r => Number(r.amount || 0)),
        backgroundColor: generateColors(revenue.length),
        borderColor: generateBorderColors(revenue.length),
        borderWidth: 1
      }]
    }

    // Bookings Chart
    bookingData.value = {
      labels: bookings.map(b => b.concert || ""),
      datasets: [{
        label: "Bookings",
        data: bookings.map(b => Number(b.count || 0)),
        backgroundColor: generateColors(bookings.length),
        borderColor: generateBorderColors(bookings.length),
        borderWidth: 1
      }]
    }

    // Payments Chart
    paymentData.value = {
      labels: ["Completed", "Pending", "Failed"],
      datasets: [{
        label: "Payments",
        data: [
          Number(payments.completed || 0),
          Number(payments.pending || 0),
          Number(payments.failed || 0)
        ],
        backgroundColor: generateColors(3),
        borderColor: generateBorderColors(3),
        borderWidth: 1
      }]
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
canvas { width: 100% !important; height: 300px !important; }
</style>