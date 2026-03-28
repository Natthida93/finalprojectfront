<template>
  <div class="admin-dashboard">
    <h1>📊 Admin Dashboard</h1>

    <div v-if="loading">Loading stats...</div>

    <div v-else class="stats">
      <div class="card">👤 Users: {{ stats.users }}</div>
      <div class="card">📖 Bookings: {{ stats.bookings }}</div>
      <div class="card">💰 Revenue: ${{ stats.revenue }}</div>
      <div class="card">💳 Payments: {{ stats.payments }}</div>
    </div>
    <AdminCharts v-if="!loading && stats" :stats="stats" />

    <h2>Manage</h2>

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

// ---------------- FETCH ----------------
async function fetchStats() {
  try {
    const res = await axios.get("http://localhost:8081/admin/stats")
    stats.value = res.data
  } catch (err) {
    console.error("[AdminStats] error:", err)
  } finally {
    loading.value = false
  }
}

// ---------------- NAV ----------------
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
}

.cards {
  display: flex;
  gap: 20px;
}

.card {
  padding: 20px;
  background: #54a0ff;
  color: white;
  border-radius: 10px;
}

.nav {
  cursor: pointer;
}

.nav:hover {
  background: #2e86de;
}
</style>