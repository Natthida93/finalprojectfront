<template>
  <div class="booking-success-page">
    <h2>Booking Successful!</h2>

    <div v-if="loading">Loading your booking details...</div>

    <div v-else-if="booking">
      <h3>🎤 {{ booking.concert?.title }}</h3>

      <p><strong>Date:</strong> {{ formatDate(booking.concert?.date) }}</p>

      <p><strong>Seats:</strong></p>
      <ul>
        <li v-for="seat in booking.seats" :key="seat.id">
          🎟 {{ seat.seatNumber }} ({{ seat.section?.name }})
        </li>
      </ul>

      <p><strong>Total Paid:</strong> ${{ totalPrice }}</p>
      <p><strong>Delivery Method:</strong> {{ booking.payment?.deliveryMethod }}</p>
      <p><strong>Booked At:</strong> {{ formatDate(booking.bookedAt) }}</p>

      <!-- 🎉 Extra UX -->
      <div class="actions">
        <button @click="goHome">🏠 Go Home</button>
        <button @click="viewHistory">📜 My Bookings</button>
      </div>
    </div>

    <div v-else>
      <p>❌ No booking found.</p>
      <button @click="goHome">Go Home</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue"
import axios from "axios"
import { useRoute, useRouter } from "vue-router"

// ---------------- ROUTER ----------------
const route = useRoute()
const router = useRouter()

// ---------------- STATE ----------------
const booking = ref(null)
const loading = ref(true)

// ✅ PRIORITY: from URL → fallback to localStorage
const paymentId =
  route.query.paymentId || localStorage.getItem("latestPaymentId")

const userEmail = localStorage.getItem("userEmail") || ""

// ---------------- COMPUTED ----------------
const totalPrice = computed(() => {
  if (!booking.value || !booking.value.seats) return 0
  return booking.value.seats.reduce(
    (sum, seat) => sum + (seat.price || 0),
    0
  )
})

// ---------------- UTILS ----------------
function formatDate(dateStr) {
  if (!dateStr) return ""
  const d = new Date(dateStr)
  return d.toLocaleDateString() + " " + d.toLocaleTimeString()
}

// ---------------- NAVIGATION ----------------
function goHome() {
  router.push("/")
}

function viewHistory() {
  router.push("/booking-history")
}

// ---------------- FETCH BOOKING ----------------
async function fetchBooking() {
  try {
    console.log("[BookingSuccess] paymentId:", paymentId)

 
    if (paymentId) {
      const res = await axios.get(
        `http://localhost:8081/bookings/by-payment/${paymentId}`
      )

      console.log("[BookingSuccess] API response:", res.data)

      if (res.data && res.data.id) {
        booking.value = res.data
        return
      }
    }

    
    if (userEmail) {
      const res = await axios.get(
        `http://localhost:8081/bookings/history/${userEmail}`
      )

      if (res.data && res.data.length > 0) {
        booking.value = res.data[res.data.length - 1]
      }
    }
  } catch (err) {
    console.error("[BookingSuccessPage] Failed:", err)
  } finally {
    loading.value = false

    
    localStorage.removeItem("latestPaymentId")
    localStorage.removeItem("paymentSeats")
    localStorage.removeItem("paymentConcertId")
  }
}

// ---------------- INIT ----------------
onMounted(() => {
  fetchBooking()
})
</script>

<style scoped>
.booking-success-page {
  max-width: 600px;
  margin: auto;
  padding: 20px;
  text-align: center;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  margin: 6px 0;
}

h2 {
  margin-bottom: 16px;
  color: #2ecc71;
}

h3 {
  margin-bottom: 12px;
}

.actions {
  margin-top: 20px;
}

button {
  margin: 8px;
  padding: 10px 16px;
  background: #54a0ff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

button:hover {
  background: #2e86de;
}
</style>