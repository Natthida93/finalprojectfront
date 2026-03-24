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
    <div class="delivery-option" v-if="userAddress">
      <h3>Ticket Delivery</h3>

      <label>
        <input type="radio" value="CONCERT" v-model="deliveryMethod" />
        Receive at Concert
      </label>

      <label>
        <input type="radio" value="SHIPPED" v-model="deliveryMethod" />
        Ship to My Address ({{ userAddress }})
      </label>
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

      <!-- ✅ NEW: QR Expiry -->
      <p class="qr-expire">
        QR expires in: {{ qrMinutes }}:{{ qrSeconds }}
      </p>
    </div>

    <!-- Pay button -->
    <button
      @click="proceedToPayment"
      :disabled="timeLeft <= 0 || paymentProcessing || !selectedSeats.length || qrCode"
    >
      <span v-if="paymentProcessing">Processing...</span>
      <span v-else>Pay with Alipay</span>
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from "vue"
import { useRouter } from "vue-router"
import axios from "axios"
import OrderSummary from "../views/OrderSummary.vue"
import QRCode from "qrcode"

const router = useRouter()

// ---------------- STATE ----------------
const concert = ref(null)
const selectedSeats = ref([])
const deliveryMethod = ref("CONCERT")
const userAddress = ref("")
const paymentProcessing = ref(false)
const userEmail = ref(localStorage.getItem("userEmail") || "")
const userId = Number(localStorage.getItem("userId"))

const qrCode = ref(null)
const qrCanvas = ref(null)
let paymentId = null

// ⏱ QR expiry timer (NEW)
const qrTimeLeft = ref(120)
let qrTimer = null

// Seat countdown
const timeLeft = ref(5 * 60)
let timer = null
let pollingInterval = null

const minutes = computed(() =>
  String(Math.floor(timeLeft.value / 60)).padStart(2, "0")
)

const seconds = computed(() =>
  String(timeLeft.value % 60).padStart(2, "0")
)

const qrMinutes = computed(() =>
  String(Math.floor(qrTimeLeft.value / 60)).padStart(2, "0")
)

const qrSeconds = computed(() =>
  String(qrTimeLeft.value % 60).padStart(2, "0")
)

const totalPrice = computed(() =>
  selectedSeats.value.reduce((sum, seat) => sum + (seat?.price || 0), 0)
)

// ---------------- FUNCTIONS ----------------
async function fetchUserInfo() {
  if (!userEmail.value) return
  try {
    const res = await axios.get("http://localhost:8081/users/info", {
      params: { email: userEmail.value }
    })
    userAddress.value = res.data.address || "Address not set"
  } catch {
    userAddress.value = "Address not available"
  }
}

async function releaseSeats() {
  clearInterval(timer)
  clearInterval(pollingInterval)
  clearInterval(qrTimer)

  try {
    await Promise.all(
      selectedSeats.value.map(seat =>
        axios.post("http://localhost:8081/api/seats/release", null, {
          params: { seatId: seat.id }
        })
      )
    )
  } finally {
    selectedSeats.value = []
    localStorage.removeItem("paymentSeats")
    localStorage.removeItem("paymentConcertId")
    localStorage.removeItem("latestPaymentId")
  }
}

// ---------------- CREATE QR ----------------
async function createQR() {
  const seatIds = selectedSeats.value.map(s => s.id)

  const res = await axios.post("http://localhost:8081/payment/create", {
    concertId: concert.value.id,
    userId,
    seatIds,
    deliveryMethod: deliveryMethod.value
  })

  qrCode.value = res.data.qrCode
  paymentId = res.data.paymentId

  localStorage.setItem("latestPaymentId", paymentId)

  await nextTick()
  QRCode.toCanvas(qrCanvas.value, qrCode.value)

  startPolling(paymentId)
  startQrTimer()
}

// ---------------- PAY ----------------
async function proceedToPayment() {
  if (!concert.value || !selectedSeats.value.length) return
  if (timeLeft.value <= 0 || paymentProcessing.value) return

  paymentProcessing.value = true

  try {
    await createQR()
  } catch (err) {
    console.error("[PaymentPage] Payment error:", err)
    alert("Payment failed.")
  } finally {
    paymentProcessing.value = false
  }
}

// ---------------- QR TIMER ----------------
function startQrTimer() {
  qrTimeLeft.value = 120

  if (qrTimer) clearInterval(qrTimer)

  qrTimer = setInterval(() => {
    qrTimeLeft.value--

    if (qrTimeLeft.value <= 0) {
      clearInterval(qrTimer)
      console.log("[QR] expired → refreshing...")
      refreshQR()
    }
  }, 1000)
}

// ---------------- REFRESH QR ----------------
async function refreshQR() {
  try {
    await createQR()
  } catch (err) {
    console.error("[QR] refresh failed:", err)
  }
}

// ---------------- POLLING ----------------
function startPolling(id) {
  if (!id) return

  if (pollingInterval) clearInterval(pollingInterval)

  pollingInterval = setInterval(async () => {
    try {
      const res = await axios.get(`http://localhost:8081/payment/status/${id}`)

      if (res.data === "COMPLETED") {
        clearInterval(pollingInterval)
        clearInterval(qrTimer)
        router.push("/booking-success")
      }
    } catch (err) {
      console.error("[Polling] error:", err)
    }
  }, 3000)
}

// ---------------- ON MOUNT ----------------
onMounted(() => {
  const seatsFromStorage = JSON.parse(localStorage.getItem("paymentSeats") || "[]")
  selectedSeats.value = seatsFromStorage

  const concertIdStored = JSON.parse(localStorage.getItem("paymentConcertId") || "null")

  if (concertIdStored) {
    axios
      .get(`http://localhost:8081/api/concerts/${concertIdStored}`)
      .then(res => (concert.value = res.data))
  }

  fetchUserInfo()

  timer = setInterval(() => {
    if (timeLeft.value > 0) timeLeft.value--
    else releaseSeats()
  }, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
  if (pollingInterval) clearInterval(pollingInterval)
  if (qrTimer) clearInterval(qrTimer)
})
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
</style>