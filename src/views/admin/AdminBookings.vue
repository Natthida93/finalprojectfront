<template>
  <div class="admin-page">
    <h1>📖 All Bookings</h1>

    <div v-if="loading">Loading bookings...</div>

    <table v-else>
      <thead>
        <tr>
          <th>ID</th>
          <th>User</th>
          <th>Concert</th>
          <th>Seats</th>
          <th>Total</th>
          <th>Date</th>
          <th>Action</th>
        </tr>
      </thead>

     <tbody>
  <tr v-for="b in bookings" :key="b.id">
    <td>{{ b.id }}</td>

    <!-- ✅ USER -->
    <td>{{ b.userEmail }}</td>

    <!-- ✅ CONCERT -->
    <td>🎤 {{ b.concertTitle }}</td>

    <!-- ✅ SEATS -->
    <td>
      <span v-for="(seat, i) in b.seats" :key="i">
        🎟 {{ seat }}
      </span>
    </td>

    <!-- ✅ TOTAL -->
    <td>${{ b.totalPrice }}</td>

    <!-- ✅ DATE -->
    <td>{{ formatDate(b.bookedAt) }}</td>

    <!-- ✅ ACTION -->
    <td>
      <button class="delete" @click="deleteBooking(b.id)">
        ❌ Delete
      </button>
    </td>
  </tr>
</tbody>
    </table>

    <div v-if="!bookings.length && !loading">
      No bookings found.
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"
import axios from "axios"

const bookings = ref([])
const loading = ref(true)

// ---------------- FETCH ----------------
async function fetchBookings() {
  try {
    const res = await axios.get("http://localhost:8081/admin/bookings")
    bookings.value = res.data
  } catch (err) {
    console.error("[AdminBookings] error:", err)
  } finally {
    loading.value = false
  }

  console.log(bookings.value)
}

// ---------------- DELETE ----------------
async function deleteBooking(id) {
  const confirmDelete = confirm("Delete this booking?")
  if (!confirmDelete) return

  try {
    await axios.delete(`http://localhost:8081/admin/bookings/${id}`)

    // remove from UI
    bookings.value = bookings.value.filter(b => b.id !== id)

  } catch (err) {
    console.error("[Delete] error:", err)
    alert("Delete failed")
  }
}

// ---------------- UTILS ----------------
function calculateTotal(seats) {
  if (!seats) return 0
  return seats.reduce((sum, s) => sum + (s.price || 0), 0)
}

function formatDate(dateStr) {
  if (!dateStr) return ""
  const d = new Date(dateStr)
  return d.toLocaleString()
}

// ---------------- INIT ----------------
onMounted(() => {
  fetchBookings()
})
</script>

<style scoped>
.admin-page {
  padding: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

th, td {
  border: 1px solid #ddd;
  padding: 10px;
  text-align: center;
}

th {
  background: #2c3e50;
  color: white;
}

tr:nth-child(even) {
  background: #f9f9f9;
}

.delete {
  background: #ff6b6b;
  color: white;
  border: none;
  padding: 6px 10px;
  cursor: pointer;
  border-radius: 5px;
}

.delete:hover {
  background: #ee5253;
}
</style>