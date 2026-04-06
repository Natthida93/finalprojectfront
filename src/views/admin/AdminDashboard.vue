<template>
  <div class="admin-dashboard">
    <h1>📊 Admin Dashboard</h1>

    <!-- Loading indicator -->
    <div v-if="loading">Loading stats...</div>

    <!-- Stats cards -->
    <div v-else class="stats">
      <div class="card">👤 Users: {{ stats.users }}</div>
      <div class="card">📖 Bookings: {{ stats.bookings }}</div>
      <div class="card">💰 Revenue: ${{ stats.revenue }}</div>
      <div class="card">💳 Payments: {{ stats.payments }}</div>
    </div>

    <!-- Charts -->
    <AdminCharts v-if="!loading && stats" :stats="stats" />

    <h2>Manage</h2>

    <!-- Navigation cards -->
    <div class="cards">
      <div class="card nav" @click="go('/admin/bookings')">📖 Bookings</div>
      <div class="card nav" @click="go('/admin/users')">👤 Users</div>
      <div class="card nav" @click="go('/admin/payments')">💰 Payments</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"
import axios from "axios"
import { useRouter } from "vue-router"
import AdminCharts from "../../components/admin/AdminCharts.vue"

const router = useRouter()

const stats = ref({})
const loading = ref(true)

// ---------------- FETCH STATS ----------------
async function fetchStats() {
  try {
    const res = await axios.get("https://thesisproject-pqtl.onrender.com/admin/stats")
    stats.value = res.data || {}
  } catch (err) {
    console.error("[AdminStats] error:", err)
  } finally {
    loading.value = false
  }
}

// ---------------- NAVIGATION ----------------
function go(path) {
  router.push(path)
}

// ---------------- INIT ----------------
onMounted(() => {
  fetchStats()
})
</script>

<style scoped>
.admin-dashboard {
  padding: 20px;
}

.stats {
  display: flex;
  gap: 20px;
  margin: 20px 0;
  flex-wrap: wrap;
}

.cards {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.card {
  padding: 20px;
  background: #54a0ff;
  color: white;
  border-radius: 10px;
  min-width: 120px;
  text-align: center;
}

.nav {
  cursor: pointer;
  transition: background 0.2s;
}

.nav:hover {
  background: #2e86de;
}
</style>