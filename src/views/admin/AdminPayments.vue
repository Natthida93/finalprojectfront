<template>
  <div class="admin-page">
    <h1>💳 All Payments</h1>

    <div v-if="loading">Loading payments...</div>

   <table v-else>
  <thead>
    <tr>
      <th>ID</th>
      <th>User</th>
      <th>Concert</th>
      <th>Amount</th>
      <th>Status</th>
      <th>Method</th>
      <th>Created</th>
      <th>Action</th>
    </tr>
  </thead>

  <tbody>
    <tr v-for="p in payments" :key="p.id">
      <td>{{ p.id }}</td>

      <!-- ✅ USER -->
      <td>
        {{ p.userName }} <br />
        <small>{{ p.userEmail }}</small>
      </td>

      <!-- ✅ CONCERT -->
      <td>
        🎤 {{ p.concertTitle }}
      </td>

      <!-- ❗ FIX: price (NOT totalPrice) -->
      <td>${{ p.price }}</td>

      <!-- ❗ FIX: status (NOT paymentStatus) -->
      <td>
        <span :class="statusClass(p.status)">
          {{ p.status }}
        </span>
      </td>

      <!-- ✅ METHOD -->
      <td>{{ p.deliveryMethod || "-" }}</td>

      <!-- ❗ FIX: createdAt (NOT bookedAt) -->
      <td>{{ formatDate(p.createdAt) }}</td>

      <!-- ACTION -->
      <td>
        <button class="delete" @click="deletePayment(p.id)">
          ❌ Delete
        </button>
      </td>
    </tr>
  </tbody>
</table>

    <div v-if="!payments.length && !loading">
      No payments found.
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"
import axios from "axios"

const payments = ref([])
const loading = ref(true)

// ---------------- FETCH ----------------
async function fetchPayments() {
  try {
    const res = await axios.get("https://thesisproject-pqtl.onrender.com/admin/payments")
    payments.value = res.data
  } catch (err) {
    console.error("[AdminPayments] error:", err)
  } finally {
    loading.value = false
  }
}

// ---------------- DELETE ----------------
async function deletePayment(id) {
  const confirmDelete = confirm("Delete this payment?")
  if (!confirmDelete) return

  try {
    await axios.delete(`https://thesisproject-pqtl.onrender.com/admin/payments/${id}`)
    payments.value = payments.value.filter(p => p.id !== id)
  } catch (err) {
    console.error("[Delete] error:", err)
    alert("Delete failed")
  }
}

// ---------------- STYLE ----------------
function statusClass(status) {
  if (status === "COMPLETED") return "completed"
  if (status === "PENDING") return "pending"
  return "failed"
}

// ---------------- UTILS ----------------
function formatDate(dateStr) {
  if (!dateStr) return ""
  return new Date(dateStr).toLocaleString()
}

// ---------------- INIT ----------------
onMounted(() => {
  fetchPayments()
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

.completed {
  color: green;
  font-weight: bold;
}

.pending {
  color: orange;
}

.failed {
  color: red;
}
</style>