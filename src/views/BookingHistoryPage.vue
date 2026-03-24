<template>
  <div class="booking-history-page">
    <h2>Your Booking History</h2>

    <div v-if="bookings.length">
      <div v-for="(b, index) in bookings" :key="index" class="history-item">
        <h3>{{ b.concertName }} - {{ b.concertDate }}</h3>

        <ul class="seat-list">
          <li v-for="seat in b.seats" :key="seat.seatNumber">
            {{ seat.section }} - Seat {{ seat.seatNumber }} - ${{ seat.price }}
          </li>
        </ul>

        <p><strong>Total Price:</strong> ${{ b.totalPrice }}</p>
        <p><strong>Status:</strong> {{ b.paymentStatus }}</p>

        <!-- Alipay button & QR code -->
        <div v-if="b.paymentStatus === 'PENDING'">
          <button @click="payWithAlipay(b)">Pay with Alipay Sandbox</button>
          <div v-if="b.alipayQrUrl" class="alipay-qr">
            <p>Scan QR to pay:</p>
            <img :src="b.alipayQrUrl" alt="Alipay QR Code" />
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
import { ref, onMounted } from "vue";
import axios from "axios";

// ------------------
// ✅ Logged-in user
// ------------------
const storedUser = JSON.parse(localStorage.getItem("loggedInUser")) || {};
const userId = ref(storedUser.id || null);
const userEmail = ref(storedUser.email || "");

console.log("Logged-in user:", storedUser);

const bookings = ref([]);

// ------------------
// Fetch booking history
// ------------------
const fetchBookingHistory = async () => {
  console.log("Fetching booking history for:", userEmail.value);
  if (!userEmail.value) {
    console.error("No logged-in user found");
    return;
  }

  try {
    const res = await axios.get(
      `http://localhost:8081/bookings/history/${encodeURIComponent(
        userEmail.value
      )}`
    );

    console.log("Booking history response:", res.data);

    bookings.value = res.data.map((b) => ({
      ...b,
      alipayQrUrl: null, // QR code URL
      pollInterval: null, // Poll interval reference
    }));
  } catch (err) {
    console.error("Failed to fetch booking history:", err);
  }
};

// ------------------
// Initiate Alipay payment
// ------------------
const payWithAlipay = async (booking) => {
  if (!booking.concertId || !userId.value) {
    console.error("Missing concertId or userId:", booking, userId.value);
    return;
  }

  try {
    console.log("Initiating Alipay payment for booking:", booking);
    const res = await axios.post("http://localhost:8081/bookings/alipay", {
      userId: userId.value,
      concertId: booking.concertId,
      price: booking.totalPrice,
    });

    console.log("Alipay response:", res.data);

    booking.alipayQrUrl = res.data.qrCodeUrl;
    booking.paymentId = res.data.paymentId;

    pollPaymentStatus(booking);
  } catch (err) {
    console.error("Failed to initiate Alipay payment:", err);
  }
};

// ------------------
// Poll payment status
// ------------------
const pollPaymentStatus = async (booking) => {
  if (!booking.paymentId) {
    console.error("Cannot poll payment status, missing paymentId:", booking);
    return;
  }

  console.log("Starting payment poll for paymentId:", booking.paymentId);

  booking.pollInterval = setInterval(async () => {
    try {
      console.log("Polling payment status for:", booking.paymentId);
      const res = await axios.get(
        `http://localhost:8081/bookings/by-payment/${booking.paymentId}`
      );

      console.log("Poll response:", res.data);

      if (res.data?.payment?.status === "COMPLETED") {
        booking.paymentStatus = "COMPLETED";
        booking.alipayQrUrl = null;
        clearInterval(booking.pollInterval);
        console.log("Payment completed for:", booking.paymentId);
      }
    } catch (err) {
      console.error("Error checking payment status:", err);
    }
  }, 3000);
};

onMounted(fetchBookingHistory);
</script>

<style scoped>
.booking-history-page {
  max-width: 900px;
  margin: auto;
  padding: 20px;
}

.history-item {
  margin-bottom: 30px;
}

.seat-list {
  list-style: none;
  padding: 0;
}

.seat-list li {
  margin: 2px 0;
}

.alipay-qr img {
  margin-top: 10px;
  width: 200px;
  height: 200px;
}
</style>