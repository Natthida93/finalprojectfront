<template>
  <div class="booking-success-page">
    <div class="card">
      <h2>Booking Successful!</h2>

      <div v-if="loading" class="loading">Loading your booking details...</div>

      <div v-else-if="booking" class="booking-details">
        <h3 class="concert-title">{{ booking.concertName || "Concert" }}</h3>

        <p><strong>Date:</strong> {{ booking.concertDate ? formatDate(booking.concertDate) : "N/A" }}</p>

        <p><strong>Seats:</strong></p>
        <ul class="seat-list">
          <li v-for="seat in booking.seats || []" :key="seat.seatId">
            🎟 {{ seat.label || "Unknown" }} 
            <span class="seat-section">({{ seat.status || "General" }})</span>
          </li>
        </ul>

        <p><strong>Total Paid:</strong> ${{ booking.totalPrice }}</p>
        <p><strong>Delivery Method:</strong> 
          <!-- Show proper delivery method -->
          {{ booking.deliveryMethod === 'CONCERT' ? 'Receive at Concert' : booking.deliveryMethod || 'N/A' }}
        </p>
        <p><strong>Booked At:</strong> {{ booking.bookedAt || "N/A" }}</p>

        <div class="actions">
          <button @click="goHome"> Go Home</button>
          <button @click="viewHistory"> My Bookings</button>
        </div>
      </div>

      <div v-else class="no-booking">
        <p>❌ No booking found. Please try again later.</p>
        <button @click="goHome">Go Home</button>
      </div>
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

const paymentId = route.query.paymentId || localStorage.getItem("latestPaymentId")
const userEmail = localStorage.getItem("userEmail") || ""

// ---------------- COMPUTED ----------------
const totalPrice = computed(() => {
  return booking.value?.totalPrice || 0
})

// ---------------- UTILS ----------------
function formatDate(dateStr) {
  if (!dateStr) return "TBD"
  const d = new Date(dateStr)
  if (isNaN(d)) return "TBD"
  return d.toLocaleDateString() + " " + d.toLocaleTimeString()
}

// ---------------- NAVIGATION ----------------
function goHome() {
  console.log("[BookingSuccess] Navigating to home")
  router.push("/")
}

function viewHistory() {
  console.log("[BookingSuccess] Navigating to history")
  router.push("/history")
}

// ---------------- FETCH BOOKING ----------------
async function fetchBooking() {
  try {
    let rawBooking = null;

    if (paymentId) {
      const res = await axios.get(`http://localhost:8081/bookings/by-payment/${paymentId}`);
      console.log("[BookingSuccess] res.data:", res.data);  // Log the response data
      rawBooking = res.data.booking || res.data;
    }

    if (!rawBooking && userEmail) {
      const res = await axios.get(`http://localhost:8081/bookings/history/${userEmail}`);
      console.log("[BookingSuccess] History res.data:", res.data);  // Log the history response data
      rawBooking = res.data?.length ? res.data[res.data.length - 1] : null;
    }

    if (!rawBooking) {
      console.log("[BookingSuccess] No booking found");
      return;
    }

    console.log("[BookingSuccess] rawBooking:", rawBooking);  // Log the whole rawBooking to inspect the structure

    // Extract concert, payment, and seat data
    const concert = rawBooking.concert || {};
    const payment = rawBooking.payment || {};
    const seats = rawBooking.seats || [];

    console.log("[BookingSuccess] seats from rawBooking:", seats);  // Log seats data explicitly

    // Check if seats exist in the response
    if (!seats.length) {
      console.warn("[BookingSuccess] Warning: No seats data available in the response");
    }

    // Map the booking data properly
   booking.value = {
  concertName: concert.title || "Unknown Concert",
  concertDate: concert.startTime ? formatDate(concert.startTime) : "TBD",
  paymentStatus: payment.status || "PENDING",
  bookedAt: rawBooking.bookedAt ? formatDate(rawBooking.bookedAt) : "TBD",
  seatNumbers: seats.map(seat => seat.label || "Unknown Seat"),
  totalPrice: seats.reduce((sum, seat) => sum + (Number(seat.price) || 0), 0),

  deliveryMethod: rawBooking.deliveryMethod || "N/A",

  seats: seats
};

    console.log("[BookingSuccess] Booking mapped for template:", booking.value);

  } catch (err) {
    console.error("[BookingSuccess] Failed to fetch booking:", err)
  } finally {
    loading.value = false
    console.log("[BookingSuccess] Clearing temporary localStorage items")
    localStorage.removeItem("latestPaymentId")
    localStorage.removeItem("paymentSeats")
    localStorage.removeItem("paymentConcertId")
  }
}

// ---------------- INIT ----------------
onMounted(() => {
  console.log("[BookingSuccess] Component mounted")
  fetchBooking()
})
</script>


<style scoped>
.booking-success-page {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 50px 20px;
  min-height: 100vh;
  background: linear-gradient(135deg, #f0f3f8, #dff1ff);
  font-family: "Poppins", "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

.card {
  background: #ffffff;
  border-radius: 16px;
  padding: 40px 50px;
  max-width: 650px;
  width: 100%;
  box-shadow: 0 20px 40px rgba(0,0,0,0.08);
  text-align: center;
  transition: transform 0.2s, box-shadow 0.2s;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 25px 50px rgba(0,0,0,0.12);
}

h2 {
  color: #2e86de;
  font-weight: 700;
  font-size: 2rem;
  margin-bottom: 24px;
}

.concert-title {
  font-size: 1.75rem;
  margin-bottom: 16px;
  color: #2d3436;
}

.loading {
  color: #636e72;
  font-style: italic;
  margin-bottom: 18px;
}

.seat-list {
  list-style: none;
  padding: 0;
  margin: 12px 0 24px 0;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
}

.seat-list li {
  background: #f1f2f6;
  color: #2d3436;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 0.95rem;
  display: inline-flex;
  align-items: center;
}

.seat-section {
  color: #636e72;
  font-size: 0.85rem;
  margin-left: 4px;
}

p {
  margin: 10px 0;
  color: #636e72;
}

.actions {
  margin-top: 28px;
  display: flex;
  justify-content: center;
  gap: 18px;
  flex-wrap: wrap;
}

button {
  padding: 12px 22px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.95rem;
  transition: background 0.2s, transform 0.1s, box-shadow 0.1s;
}

button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 14px rgba(0,0,0,0.1);
}

button:first-child {
  background: #2e86de;
  color: white;
}

button:first-child:hover {
  background: #1b4f72;
}

button:last-child {
  background: #dfe6e9;
  color: #2d3436;
}

button:last-child:hover {
  background: #b2bec3;
}

.no-booking {
  color: #d63031;
  font-weight: 600;
  margin-top: 24px;
}
</style>