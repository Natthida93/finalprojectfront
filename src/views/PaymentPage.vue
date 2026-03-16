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

    <!-- Pay button -->
    <button
      @click="proceedToPayment"
      :disabled="timeLeft <= 0 || paymentProcessing || !selectedSeats.length"
    >
      <span v-if="paymentProcessing">Processing...</span>
      <span v-else>Pay with Alipay</span>
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue"
import { useRouter } from "vue-router"
import axios from "axios"
import OrderSummary from "../views/OrderSummary.vue"

const router = useRouter()

// ---------------- STATE ----------------
const concert = ref(null)
const selectedSeats = ref([])
const deliveryMethod = ref("CONCERT")
const userAddress = ref("")
const paymentProcessing = ref(false)
const userEmail = ref(localStorage.getItem("userEmail") || "")
const userId = Number(localStorage.getItem("userId"))

// Countdown
const timeLeft = ref(5 * 60)
let timer = null
let pollingInterval = null

const minutes = computed(() =>
  String(Math.floor(timeLeft.value / 60)).padStart(2, "0")
)

const seconds = computed(() =>
  String(timeLeft.value % 60).padStart(2, "0")
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
    console.log("[PaymentPage] User info:", res.data)
    userAddress.value = res.data.address || "Address not set"
  } catch (err) {
    console.error("[PaymentPage] Failed to fetch user info:", err)
    userAddress.value = "Address not available"
  }
}

async function releaseSeats() {
  console.log("[PaymentPage] Releasing seats...")

  clearInterval(timer)
  clearInterval(pollingInterval)

  try {
    await Promise.all(
      selectedSeats.value.map(seat =>
        axios.post("http://localhost:8081/api/seats/release", null, {
          params: { seatId: seat.id }
        })
      )
    )
  } catch (err) {
    console.error("[PaymentPage] Failed to release seats:", err)
  } finally {
    selectedSeats.value = []
    localStorage.removeItem("paymentSeats")
    localStorage.removeItem("paymentConcertId")
    localStorage.removeItem("latestPaymentId")
  }
}

async function proceedToPayment() {
  if (!concert.value || !selectedSeats.value.length) return
  if (timeLeft.value <= 0 || paymentProcessing.value) return

  paymentProcessing.value = true

  try {
    const seatIds = selectedSeats.value.map(s => s.id)

    const resPayment = await axios.post(
      "http://localhost:8081/payment/create",
      {
        concertId: concert.value.id,
        userId,
        seatIds,
        deliveryMethod: deliveryMethod.value
      },
      { responseType: "text" }
    )

    const parser = new DOMParser()
    const doc = parser.parseFromString(resPayment.data, "text/html")
    const form = doc.querySelector("form")

    if (!form) throw new Error("Payment form not found")

    const paymentInput = form.querySelector('input[name="paymentId"]')
    const paymentId = paymentInput ? paymentInput.value : null

    if (paymentId) {
      localStorage.setItem("latestPaymentId", paymentId)
      startPolling(paymentId)
    }

    // submit form
    const tempForm = document.createElement("form")
    tempForm.method = form.method || "POST"
    tempForm.action = form.action
    tempForm.target = "_self"

    Array.from(form.querySelectorAll("input")).forEach(input => {
      const hidden = document.createElement("input")
      hidden.type = "hidden"
      hidden.name = input.name
      hidden.value = input.value
      tempForm.appendChild(hidden)
    })

    document.body.appendChild(tempForm)
    tempForm.submit()

  } catch (err) {
    console.error("[PaymentPage] Payment error:", err)
    alert("Payment failed. Please try again.")
  } finally {
    paymentProcessing.value = false
  }
}

// ---------------- POLLING ----------------
function startPolling(paymentId) {
  if (!paymentId) return

  if (pollingInterval) clearInterval(pollingInterval)

  pollingInterval = setInterval(async () => {
    try {
      const res = await axios.get("http://localhost:8081/payment/pending", {
        params: {
          userId,
          concertId: concert.value?.id
        }
      })

      const completedPayment = res.data.find(
        p => p.id == paymentId && p.status === "COMPLETED"
      )

      if (completedPayment) {
        clearInterval(pollingInterval)
        router.push("/booking-success")
      }
    } catch (err) {
      console.error("[Polling] failed:", err)
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
      .catch(err => console.error("[PaymentPage] Failed to fetch concert:", err))
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
})
</script>

<style scoped>
.payment-page {
  max-width: 600px;
  margin: auto;
  padding: 20px;
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
  cursor: not-allowed;
}

.delivery-option {
  margin: 12px 0;
}

.delivery-option label {
  display: block;
  margin: 6px 0;
  font-weight: bold;
}
</style>