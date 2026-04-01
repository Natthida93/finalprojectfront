<template>
  <div class="booking-history-page">
    <h2>Purchase History</h2>

    <div v-if="bookings.length">
      
      <div
        v-for="(b, index) in bookings"
        :key="index"
        class="history-item"
      >
        <h3>{{ b.concertName }} - {{ b.concertDate }}</h3>

        <!-- use seatNumbers -->
        <ul class="seat-list">
          <li v-for="seat in b.seatNumbers" :key="seat">
            Seat {{ seat }}
          </li>
        </ul>

        <p><strong>Total Price:</strong> ${{ b.totalPrice }}</p>
        <p><strong>Status:</strong> {{ b.paymentStatus }}</p>

        <!--  show expiry -->
        <p v-if="b.expiresAt && b.canContinuePayment">
          ⏳ Expires at: {{ formatTime(b.expiresAt) }}
        </p>

        <!--  allow continue payment -->
        <div v-if="b.canContinuePayment">
          <button @click="payWithAlipay(b)">
            Continue Payment
          </button>

          <div v-if="b.alipayQrUrl" class="alipay-qr">
            <p>Scan QR to pay:</p>
            <canvas :ref="el => setQrRef(el, b)"></canvas>
          </div>
        </div>

        <hr />
      </div>
    </div>

    <div v-else>
      <p>No bookings found.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"
import axios from "axios"
import QRCode from "qrcode"
import { nextTick } from "vue"


// ------------------
// USER 
// ------------------
const userId = ref(Number(localStorage.getItem("userId")))
const userEmail = ref(localStorage.getItem("userEmail") || "")

const bookings = ref([])
const qrRefs = new Map()

const setQrRef = (el, booking) => {
  if (el) {
    qrRefs.set(booking.paymentId, el)
  }
}
// ------------------
// FETCH HISTORY
// ------------------
const fetchBookingHistory = async () => {
  if (!userEmail.value) {
    console.error("No userEmail found")
    return
  }

  try {
    const res = await axios.get(
      `https://thesisproject-pqtl.onrender.com/bookings/history/${encodeURIComponent(
        userEmail.value
      )}`
    )

    console.log("Booking history:", res.data) 

    bookings.value = res.data.map((b) => ({
      ...b,
      alipayQrUrl: null,
      pollInterval: null,
    }))
  } catch (err) {
    console.error("Failed to fetch booking history:", err)
  }
}

// ------------------
// CONTINUE PAYMENT
// ------------------
const payWithAlipay = async (booking) => {
  // STOP if no seatIds (VERY IMPORTANT)
  if (!booking.seatIds || booking.seatIds.length === 0) {
    console.error("Missing seatIds for booking:", booking)
    alert("Cannot continue payment: missing seat info")
    return
  }

  try {
    const res = await axios.post("https://thesisproject-pqtl.onrender.com/payment/create", {
      userId: userId.value,
      concertId: booking.concertId,
      seatIds: booking.seatIds, 
      deliveryMethod: "CONCERT"
    })


    booking.alipayQrUrl = res.data.qrCode
    booking.paymentId = res.data.paymentId

    await nextTick()

    const canvas = qrRefs.get(booking.paymentId)
    if (canvas) {
      QRCode.toCanvas(canvas, booking.alipayQrUrl)
    }

    pollPaymentStatus(booking)

  } catch (err) {
    console.error("Payment failed:", err)
  }
}

// ------------------
// POLLING (UNCHANGED LOGIC)
// ------------------
const pollPaymentStatus = (booking) => {
  if (!booking.paymentId) return

  booking.pollInterval = setInterval(async () => {
    try {
      const res = await axios.get(
        `https://thesisproject-pqtl.onrender.com/payment/status/${booking.paymentId}`
      )

      if (res.data === "COMPLETED") {
        booking.paymentStatus = "COMPLETED"
        booking.alipayQrUrl = null
        clearInterval(booking.pollInterval)
      }
    } catch (err) {
      console.error("Polling error:", err)
    }
  }, 3000)
}

// ------------------
// FORMAT TIME
// ------------------
const formatTime = (time) => {
  return new Date(time).toLocaleString()
}

// ------------------
onMounted(fetchBookingHistory)
</script>

<style scoped>
.booking-history-page {
  max-width: 900px;
  margin: 40px auto;
  padding: 30px;
  background: #f9f9f9; /* soft light background */
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  font-family: "Segoe UI", Roboto, sans-serif;
}

.history-item {
  margin-bottom: 30px;
  padding: 20px;
  background: #ffffff;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s, box-shadow 0.2s;
}

.history-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.history-item h3 {
  margin-bottom: 12px;
  color: #1e2a78;
  font-size: 1.3rem;
}

.seat-list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.seat-list li {
  background: #e0e7ff;
  padding: 6px 12px;
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.95rem;
  color: #1e2a78;
}

.alipay-qr img {
  margin-top: 12px;
  width: 180px;
  height: 180px;
  border: 2px solid #1e2a78;
  border-radius: 12px;
}

button {
  padding: 10px 20px;
  background: #1e2a78; /* rich dark blue */
  color: #ffffff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s, transform 0.2s;
}

button:hover {
  background: #3b4bbf; /* lighter hover blue */
  transform: translateY(-2px);
}

/* Optional: subtle divider between items */
.history-item + .history-item {
  margin-top: 20px;
  border-top: 1px solid #e0e0e0;
}
</style>