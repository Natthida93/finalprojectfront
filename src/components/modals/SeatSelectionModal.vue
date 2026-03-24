<template>
  <div v-if="show" class="modal-overlay">
    <div class="modal-content">
      <h2>Confirm Your Seat Selection</h2>

      <!-- Zone Selection with available seats -->
      <div class="zones">
        <button
          v-for="zone in zones"
          :key="zone.name"
          :style="{ backgroundColor: zone.color }"
          :class="{ selected: selectedZone && selectedZone.name === zone.name }"
          @click="selectZone(zone)"
        >
          {{ zone.name }} ({{ zone.available }} left)
        </button>
      </div>

      <!-- Seat Map -->
      <SeatMap
        v-if="selectedZone"
        :concert-id="event.id"
        :zone-name="selectedZone.name"
        @selectedSeats="updateSelectedSeats"
      />

      <!-- Selected Seats & Total -->
      <div v-if="selectedSeats.length">
        <ul>
          <li v-for="seat in selectedSeats" :key="seat.id">
            {{ seat.label }} - ${{ seat.price.toFixed(2) }}
          </li>
        </ul>
        <div class="total-price">Total: ${{ totalPrice.toFixed(2) }}</div>
      </div>

      <div v-else>
        <p>No seats selected yet.</p>
      </div>

      <!-- Actions -->
      <div class="modal-actions">
        <button
          @click="confirmBooking"
          :disabled="!selectedSeats.length"
        > Pay
        </button>
        <button @click="closeModal">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import SeatMap from './SeatMap.vue'
import axios from 'axios'

const props = defineProps({
  event: { type: Object, required: true },
  show: { type: Boolean, required: true }
})

const emit = defineEmits(['close', 'proceedToPayment'])

const zones = ref([
  { name: "VIP", color: "#ff6b6b", available: 0 },
  { name: "A", color: "#feca57", available: 0 },
  { name: "B", color: "#48dbfb", available: 0 },
  { name: "C", color: "#1dd1a1", available: 0 }
])

const selectedZone = ref(null)
const selectedSeats = ref([])

const totalPrice = computed(() =>
  selectedSeats.value.reduce((sum, seat) => sum + seat.price, 0)
)

// Initialize first zone
onMounted(() => {
  if (zones.value.length) selectedZone.value = zones.value[0]
  fetchAvailableSeats()
})

// Select zone
function selectZone(zone) {
  selectedZone.value = zone
  selectedSeats.value = []
}

// Update selected seats from SeatMap (local only)
function updateSelectedSeats(seats) {
  selectedSeats.value = seats
}

// Close modal
function closeModal() {
  emit('close')
}

// Confirm booking → lock seats & proceed to payment
async function confirmBooking() {
  if (!selectedSeats.value.length) return

  const userEmail = localStorage.getItem('userEmail') || 'test@example.com'
  const failedSeats = []

  for (const seat of [...selectedSeats.value]) {
    try {
      await axios.post('http://localhost:8081/api/seats/lock', null, {
        params: { seatId: seat.id, userEmail }
      })
    } catch (err) {
      if (err.response && err.response.status === 409) {
        failedSeats.push(seat.label)
        const index = selectedSeats.value.findIndex(s => s.id === seat.id)
        if (index >= 0) selectedSeats.value.splice(index, 1)
      } else {
        console.error('Unexpected booking error:', err)
      }
    }
  }

  if (failedSeats.length) {
    alert(`The following seats are reserved by others: ${failedSeats.join(', ')}.`)
    if (!selectedSeats.value.length) return
  }

  // Store selected seats in localStorage for payment page
  const seatsForPayment = selectedSeats.value.map(seat => ({
    id: seat.id,
    label: seat.label,
    price: seat.price
  }))
  localStorage.setItem('paymentSeats', JSON.stringify(seatsForPayment))
  localStorage.setItem('paymentConcertId', props.event.id)

  // Emit event to parent if needed
  emit('proceedToPayment', [...selectedSeats.value])
  closeModal()

  // Redirect to payment page
  window.location.href = '/payment'
}

// Fetch total available seats per zone
async function fetchAvailableSeats() {
  try {
    const res = await axios.get(`http://localhost:8081/api/concerts/${props.event.id}/available-seats`)
    const data = res.data
    zones.value.forEach(zone => {
      zone.available = data[zone.name] || 0
    })
  } catch (err) {
    console.error('Failed to fetch available seats:', err)
  }
}

// Auto-refresh every 10 seconds
let zoneInterval = null
onMounted(() => {
  zoneInterval = setInterval(fetchAvailableSeats, 10000)
})
onUnmounted(() => clearInterval(zoneInterval))
</script>

<style scoped>
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex; justify-content: center; align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.zones { display: flex; gap: 10px; margin-bottom: 12px; }
.zones button { padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; color: white; }
.zones button.selected { outline: 2px solid #576574; }

.modal-actions { display: flex; justify-content: space-between; margin-top: 20px; }
.modal-actions button { flex: 1; margin: 0 5px; padding: 10px 0; border-radius: 6px; cursor: pointer; border: none; }
.modal-actions button:first-child { background: #54a0ff; color: white; }
.modal-actions button:last-child { background: #ff6b6b; color: white; }
.modal-actions button:disabled { background: #ccc; cursor: not-allowed; }

.total-price { font-weight: bold; margin-top: 12px; }
</style>