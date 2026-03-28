<template> 
  <div class="payment-page">
    <h2 v-if="concert?.title">Payment for {{ concert.title }}</h2>
    <h2 v-else>Loading concert info...</h2>

    <!-- Order Summary -->
    <OrderSummary
      v-if="concert && selectedSeats.length"
      :concert="concert"
      :selectedSeats="selectedSeats"
      :totalPrice="totalPrice"
      :deliveryMethod="deliveryMethod"
    />

    <!-- Ticket Delivery -->
    <div class="delivery-option">
      <h3>Ticket Delivery</h3>

      <!-- Receive at Concert Option -->
      <label>
        <input type="radio" value="CONCERT" v-model="deliveryMethod" />
        Receive at Concert
      </label>

      <!-- Ship to Address Option -->
      <label>
        <input type="radio" value="SHIPPED" v-model="deliveryMethod" />
        Ship to My Address
        <span v-if="userAddress && userAddress !== 'Address not set' && userAddress !== 'Address not available'">
          ({{ userAddress }})
        </span>
        <span v-else>(address not set)</span>
      </label>

      <!-- Show delivery fee when shipped -->
      <p v-if="deliveryMethod === 'SHIPPED'" class="delivery-fee">
        ⚡ Shipping Fee: ${{ deliveryFee }}
      </p>

      <!-- Show address input when 'SHIPPED' is selected -->
      <div v-if="deliveryMethod === 'SHIPPED'" class="shipping">
        <input 
          v-model="userAddress" 
          placeholder="Enter or edit your shipping address" 
        />
        <button class="save-btn" @click="saveAddress" :disabled="!userAddress">Save Address</button>
        <p v-if="showToast" class="save-message">Address saved!</p>
      </div>
    </div>

    <!-- Countdown -->
    <div class="countdown" v-if="timeLeft > 0">
      Time left to pay: {{ minutes }}:{{ seconds }}
    </div>

    <div v-else class="timeout">
      Payment time expired. Seats released.
    </div>

    <!-- QR SECTION -->
    <div v-if="qrCode" class="qr-section">
      <h3>Scan to Pay</h3>
      <canvas ref="qrCanvas"></canvas>
      <p>Use Alipay to scan this QR</p>

      <!-- QR Expiry -->
      <p class="qr-expire">
        QR expires in: {{ qrMinutes }}:{{ qrSeconds }}
      </p>
    </div>

    <!-- Pay button -->
    <button
      @click="proceedToPayment"
      :disabled="timeLeft <= 0 || paymentProcessing || !selectedSeats.length || qrCode || (deliveryMethod === 'SHIPPED' && !userAddress)"
    >
      <span v-if="paymentProcessing">Processing...</span>
      <span v-else>Pay with Alipay</span>
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import QRCode from "qrcode";
import OrderSummary from "../views/OrderSummary.vue";

const router = useRouter();

// ---------------- STATE ----------------
const concert = ref(null);
const selectedSeats = ref([]);
const deliveryMethod = ref("CONCERT");  // Default is 'CONCERT'
const userAddress = ref(""); // Store user's shipping address if applicable
const paymentProcessing = ref(false);
const userEmail = ref(localStorage.getItem("userEmail") || "");
const userId = Number(localStorage.getItem("userId"));

const qrCode = ref(null);
const qrCanvas = ref(null);
let paymentId = null;
const paymentStatus = ref(null);

const qrTimeLeft = ref(120);
let qrTimer = null;

const timeLeft = ref(5 * 60);
let timer = null;
let pollingInterval = null;

// ---------------- COMPUTED ----------------
const deliveryFee = computed(() => (deliveryMethod.value === "SHIPPED" ? 50 : 0));

const totalPrice = computed(() =>
  selectedSeats.value.reduce((sum, seat) => sum + (seat?.price || 0), 0) + deliveryFee.value
);

// ---------------- SAVE ADDRESS ----------------
const showToast = ref(false);

function saveAddress() {
  if (!userAddress.value) return;

  localStorage.setItem("userAddress", userAddress.value);

  showToast.value = true;

  setTimeout(() => {
    showToast.value = false;
  }, 2000);
}

// ---------------- CREATE OR REFRESH QR ----------------
async function createOrRefreshQR(isRefresh = false) {
  if (!concert.value || !selectedSeats.value.length) return;

  const payload = {
    concertId: concert.value.id,
    userId,
    price: totalPrice.value,
    seatIds: selectedSeats.value.map(s => s.id),
    deliveryMethod: deliveryMethod.value,
    shippingAddress: deliveryMethod.value === "SHIPPED" ? userAddress.value : null
  };

  const url = isRefresh
    ? `http://localhost:8081/payment/refresh/${paymentId}`
    : "http://localhost:8081/payment/create";

  try {
    const res = await axios.post(url, payload);
    qrCode.value = res.data.qrCode;
    paymentId = res.data.paymentId;
    paymentStatus.value = res.data.status;
    localStorage.setItem("latestPaymentId", paymentId);

    if (paymentStatus.value === "COMPLETED") {
      alert("Payment already completed!");
      router.push("/booking-success");
      return;
    }

    await nextTick();
    QRCode.toCanvas(qrCanvas.value, qrCode.value);

    if (!isRefresh) startPolling(paymentId);
    startQrTimer();
  } catch (err) {
    console.error("QR creation/refresh failed", err);
    alert("Failed to generate QR code. Please try again.");
  }
}

// ---------------- PAY ----------------
async function proceedToPayment() {
  if (!concert.value || !selectedSeats.value.length) return;
  if (timeLeft.value <= 0 || paymentProcessing.value) return;
  if (paymentStatus.value === "COMPLETED") return;

  paymentProcessing.value = true;

  try {
    await createOrRefreshQR(false);
  } catch (err) {
    console.error(err);
    alert("Payment initiation failed");
  } finally {
    paymentProcessing.value = false;
  }
}

// ---------------- QR TIMER ----------------
function startQrTimer() {
  qrTimeLeft.value = 120;
  if (qrTimer) clearInterval(qrTimer);

  qrTimer = setInterval(() => {
    qrTimeLeft.value--;
    if (qrTimeLeft.value <= 0) {
      clearInterval(qrTimer);
      refreshQR();
    }
  }, 1000);
}

// ---------------- REFRESH QR ----------------
async function refreshQR() {
  if (paymentStatus.value === "COMPLETED") return;
  try {
    await createOrRefreshQR(true);
  } catch (e) {
    console.error("QR refresh failed", e);
  }
}

// ---------------- POLLING PAYMENT STATUS ----------------
function startPolling(id) {
  if (pollingInterval) clearInterval(pollingInterval);
  let pollTimeout = 5 * 60;

  pollingInterval = setInterval(async () => {
    pollTimeout--;
    if (pollTimeout <= 0) {
      clearInterval(pollingInterval);
      alert("Payment timeout. Please try again.");
      return;
    }

    try {
      const res = await axios.get(`http://localhost:8081/payment/status/${id}`);
      paymentStatus.value = res.data;

      if (res.data === "COMPLETED") {
        clearInterval(pollingInterval);
        clearInterval(qrTimer);
        router.push("/booking-success");
      } else if (res.data === "FAILED") {
        clearInterval(pollingInterval);
        clearInterval(qrTimer);
        alert("Payment failed. Please try again.");
      }
    } catch (err) {
      console.error("Polling error", err);
    }
  }, 3000);
}

// ---------------- INITIALIZATION ----------------
onMounted(() => {
  selectedSeats.value = JSON.parse(localStorage.getItem("paymentSeats") || "[]");
  const concertId = JSON.parse(localStorage.getItem("paymentConcertId") || "null");

  if (concertId) {
    axios.get(`http://localhost:8081/api/concerts/${concertId}`)
      .then(res => (concert.value = res.data))
      .catch(err => console.error("Failed to fetch concert", err));
  }

  userAddress.value = localStorage.getItem("userAddress") || "";

  timer = setInterval(() => {
    if (timeLeft.value > 0) timeLeft.value--;
  }, 1000);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
  if (pollingInterval) clearInterval(pollingInterval);
  if (qrTimer) clearInterval(qrTimer);
});

// ---------------- COMPUTED MINUTES / SECONDS ----------------
const minutes = computed(() => String(Math.floor(timeLeft.value / 60)).padStart(2, "0"));
const seconds = computed(() => String(timeLeft.value % 60).padStart(2, "0"));

const qrMinutes = computed(() => String(Math.floor(qrTimeLeft.value / 60)).padStart(2, "0"));
const qrSeconds = computed(() => String(qrTimeLeft.value % 60).padStart(2, "0"));
</script>

<style scoped>
.payment-page {
  max-width: 600px;
  margin: auto;
  padding: 20px;
}

.qr-section {
  margin: 20px 0;
  text-align: center;
}

.qr-expire {
  margin-top: 10px;
  color: #ff6b6b;
  font-weight: bold;
}

.countdown {
  font-weight: bold;
  margin: 10px 0;
}

.timeout {
  color: red;
  font-weight: bold;
  margin: 10px 0;
}

button {
  padding: 10px 20px;
  background: #54a0ff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

button:disabled {
  background: #ccc;
}

.delivery-option {
  margin: 12px 0;
}

.shipping {
  margin-top: 8px;
}

.save-btn {
  margin-left: 8px;
  padding: 4px 12px;
  background-color: #2ecc71;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.delivery-fee {
  font-weight: bold;
  color: #e67e22;
  margin: 6px 0;
}

.toast {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: #2ecc71;
  color: white;
  padding: 10px 16px;
  border-radius: 8px;
}
</style>