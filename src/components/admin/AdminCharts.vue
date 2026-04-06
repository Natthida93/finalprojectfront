<template>
  <div class="charts">
    <h3>📊 Analytics</h3>

    <div v-if="loading">Loading charts...</div>

    <template v-else>
      <div class="chart-box">
        <h4>Revenue Overview</h4>
        <BarChart v-if="revenueData.datasets.length" :chart-data="revenueData" :chart-options="barOptions" />
      </div>

      <div class="chart-box">
        <h4>Bookings per Concert</h4>
        <BarChart v-if="bookingData.datasets.length" :chart-data="bookingData" :chart-options="barOptions" />
      </div>

      <div class="chart-box">
        <h4>Payment Status</h4>
        <PieChart v-if="paymentData.datasets.length" :chart-data="paymentData" :chart-options="pieOptions" />
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
import { Chart as VueChart, defineChartComponent } from "vue-chartjs"

// Register Chart.js components
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement)

// ----------------- Reactive Chart Components -----------------
const BarChart = defineChartComponent(VueChart, "bar")
const PieChart = defineChartComponent(VueChart, "pie")

// ----------------- State -----------------
const revenueData = ref({ labels: [], datasets: [] })
const bookingData = ref({ labels: [], datasets: [] })
const paymentData = ref({ labels: [], datasets: [] })
const loading = ref(true)

// ----------------- Chart Options -----------------
const barOptions = {
  responsive: true,
  plugins: { legend: { position: "top" } },
  scales: { y: { beginAtZero: true } }
}
const pieOptions = { responsive: true, plugins: { legend: { position: "top" } } }

// ----------------- Fetch Analytics -----------------
async function fetchAnalytics() {
  try {
    const res = await fetch("https://thesisproject-pqtl.onrender.com/admin/analytics")
    const data = await res.json()

    const revenue = data.revenue || []
    const bookings = data.bookings || []
    const payments = data.payments || {}

    // -------- REVENUE --------
    revenueData.value = {
      labels: revenue.map(r => r.date || ""),
      datasets: [
        {
          label: "Revenue",
          data: revenue.map(r => Number(r.amount || 0)),
          backgroundColor: "rgba(75, 192, 192, 0.7)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1
        }
      ]
    }

    // -------- BOOKINGS --------
    bookingData.value = {
      labels: bookings.map(b => b.concert || ""),
      datasets: [
        {
          label: "Bookings",
          data: bookings.map(b => Number(b.count || 0)),
          backgroundColor: "rgba(54, 162, 235, 0.7)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1
        }
      ]
    }

    // -------- PAYMENTS --------
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
          ],
          borderColor: [
            "rgba(75, 192, 192, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(255, 99, 132, 1)"
          ],
          borderWidth: 1
        }
      ]
    }

    // Fallback dummy data if API returned empty arrays
    if (!revenueData.value.datasets[0].data.length) {
      revenueData.value = {
        labels: ["Day 1", "Day 2", "Day 3"],
        datasets: [{ label: "Revenue", data: [100, 200, 150], backgroundColor: "rgba(75, 192, 192, 0.7)" }]
      }
    }

    if (!bookingData.value.datasets[0].data.length) {
      bookingData.value = {
        labels: ["Concert A", "Concert B", "Concert C"],
        datasets: [{ label: "Bookings", data: [5, 3, 8], backgroundColor: "rgba(54, 162, 235, 0.7)" }]
      }
    }

    if (!paymentData.value.datasets[0].data.length) {
      paymentData.value = {
        labels: ["Completed", "Pending", "Failed"],
        datasets: [{ data: [7, 1, 0], backgroundColor: ["rgba(75,192,192,0.7)", "rgba(255,206,86,0.7)", "rgba(255,99,132,0.7)"] }]
      }
    }

  } catch (err) {
    console.error("Analytics fetch error:", err)
    // fallback dummy data if fetch fails
    revenueData.value = {
      labels: ["Day 1", "Day 2", "Day 3"],
      datasets: [{ label: "Revenue", data: [100, 200, 150], backgroundColor: "rgba(75, 192, 192, 0.7)" }]
    }
    bookingData.value = {
      labels: ["Concert A", "Concert B", "Concert C"],
      datasets: [{ label: "Bookings", data: [5, 3, 8], backgroundColor: "rgba(54, 162, 235, 0.7)" }]
    }
    paymentData.value = {
      labels: ["Completed", "Pending", "Failed"],
      datasets: [{ data: [7, 1, 0], backgroundColor: ["rgba(75,192,192,0.7)", "rgba(255,206,86,0.7)", "rgba(255,99,132,0.7)"] }]
    }
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