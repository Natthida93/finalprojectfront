<template>
  <div class="seat-map">
    <h4>Zone: {{ zoneName }}</h4>

    <div class="zone-price" v-if="zonePrice">
      Price per seat: ${{ zonePrice.toFixed(2) }}
    </div>

    <div v-if="loading">Loading seats...</div>
    <div v-else-if="seats.length === 0">No seats found for this zone.</div>

    <!-- Seat grid -->
    <div class="rows" v-else>
      <div v-for="row in rows" :key="row.rowLabel" class="row">
        <span class="row-label">{{ row.rowLabel }}</span>
        <button
          v-for="seat in row.seats"
          :key="seat.id"
          class="seat"
          :class="seat.status.toLowerCase() + (isSelected(seat) ? ' selected' : '')"
          @click="seat.status === 'AVAILABLE' ? toggleSeat(seat) : null"
          :disabled="seat.status !== 'AVAILABLE'"
        >
          {{ seat.label }}
        </button>
      </div>
    </div>

    <!-- Selected seats & actions -->
    <div class="actions" v-if="selectedSeats.length">
      <div class="selected-list">
        Selected Seats: {{ selectedSeats.map(s => s.label).join(', ') }}
      </div>

      <div class="confirm-buttons">
        <button @click="confirmSelection" :disabled="seatsLocked">
          Confirm Booking
          <span class="selected-count">
            ({{ selectedSeats.length }} seat{{ selectedSeats.length > 1 ? 's' : '' }})
          </span>
        </button>
        <button @click="cancelSelection" :disabled="!selectedSeats.length">
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted, onUnmounted } from 'vue'
import axios from 'axios'

const props = defineProps({
  concertId: Number,
  zoneName: String
})
const emit = defineEmits(['selectedSeats', 'openModal'])

const seats = ref([])
const selectedSeats = ref([])
const rows = ref([])
const zonePrice = ref(null)
const loading = ref(false)
let seatInterval = null
const seatsLocked = ref(false) // track if seats are locked

function getUserId() {
  const id = localStorage.getItem('userId')
  if (!id) {
    alert('Please log in before selecting seats.')
    return null
  }
  return Number(id)
}

async function fetchSeats() {
  if (!props.concertId || !props.zoneName) return
  loading.value = true
  try {
    const res = await axios.get(
      `https://thesisproject-pqtl.onrender.com/api/seats/concert/${props.concertId}/zone`,
      { params: { zoneName: props.zoneName } }
    )
    seats.value = res.data.map(s => reactive({
      id: s.seatId,
      label: s.label,
      status: s.status,
      price: s.price
    }))
    if (seats.value.length) zonePrice.value = seats.value[0].price
    organizeRows()
  } catch (err) {
    console.error('Error fetching seats:', err)
  } finally {
    loading.value = false
  }
}

function organizeRows() {
  const rowMap = {}
  seats.value.forEach(seat => {
    const rowLetter = seat.label.charAt(0)
    if (!rowMap[rowLetter]) rowMap[rowLetter] = []
    rowMap[rowLetter].push(seat)
  })
  rows.value = Object.keys(rowMap).sort().map(rowLabel => ({
    rowLabel,
    seats: rowMap[rowLabel].sort((a,b) => parseInt(a.label.slice(1)) - parseInt(b.label.slice(1)))
  }))
}

function toggleSeat(seat) {
  if (seatsLocked.value) return // prevent changing after locking

  const index = selectedSeats.value.findIndex(s => s.id === seat.id)
  if (index >= 0) {
    selectedSeats.value.splice(index, 1)
  } else {
    selectedSeats.value.push(seat)
  }
  emitSelectedSeats()
}

// Confirm selection: lock seats and open payment
async function confirmSelection() {
  const userId = getUserId()
  if (!userId) return

  if (!selectedSeats.value.length) return

  try {
    for (const seat of selectedSeats.value) {
      await axios.post('https://thesisproject-pqtl.onrender.com/api/seats/lock', null, {
        params: { seatId: seat.id, userId }
      })
      seat.status = 'LOCKED'
    }
    seatsLocked.value = true
    emit('openModal', [...selectedSeats.value])
  } catch (err) {
    if (err.response?.status === 409) {
      alert('Some seats are already booked!')
      refreshSeatStatus()
    } else console.error('Failed to lock seats:', err)
  }
}

// Cancel selection or unlock if seats locked
async function cancelSelection() {
  const userId = getUserId()
  if (!userId) return

  if (seatsLocked.value) {
    // Unlock seats on backend
    for (const seat of selectedSeats.value) {
      try {
        await axios.post('https://thesisproject-pqtl.onrender.com/api/seats/unlock', null, {
          params: { seatId: seat.id, userId }
        })
        seat.status = 'AVAILABLE'
      } catch (err) {
        console.error('Failed to unlock seat:', err)
      }
    }
    seatsLocked.value = false
  }

  selectedSeats.value = []
  emitSelectedSeats()
}

function isSelected(seat) {
  return selectedSeats.value.some(s => s.id === seat.id)
}

function emitSelectedSeats() {
  const userId = getUserId()
  if (!userId) return
  const seatsWithInfo = selectedSeats.value.map(seat => ({
    id: seat.id,
    label: seat.label,
    price: seat.price,
    concertId: props.concertId,
    zoneName: props.zoneName,
    userId
  }))
  emit('selectedSeats', seatsWithInfo)
}

// Refresh seat status from backend
async function refreshSeatStatus() {
  try {
    const res = await axios.get(
      `https://thesisproject-pqtl.onrender.com/api/seats/concert/${props.concertId}/zone`,
      { params: { zoneName: props.zoneName } }
    )
    res.data.forEach(s => {
      const existing = seats.value.find(seat => seat.id === s.seatId)
      if (existing && !isSelected(existing)) existing.status = s.status
    })
    organizeRows()
  } catch (err) {
    console.error('Failed to refresh seat status:', err)
  }
}

onUnmounted(() => {
  if (seatInterval) clearInterval(seatInterval)
})

watch([() => props.concertId, () => props.zoneName], () => {
  fetchSeats()
  if (seatInterval) clearInterval(seatInterval)
  seatInterval = setInterval(refreshSeatStatus, 5000)
})

onMounted(() => {
  fetchSeats()
  seatInterval = setInterval(refreshSeatStatus, 5000)
  window.addEventListener('loginStateChanged', fetchSeats)
})
</script>

<style scoped>
.seat-map { display: flex; flex-direction: column; gap: 12px; }
.zone-price { font-weight: bold; margin-bottom: 8px; background: #f1f2f6; padding: 6px 12px; border-radius: 6px; }
.rows { display: flex; flex-direction: column; gap: 8px; }
.row { display: flex; align-items: center; gap: 6px; }
.row-label { width: 20px; font-weight: bold; }
.seat { width: 50px; height: 50px; border: 1px solid #ccc; border-radius: 6px; background-color: #e0e0e0; cursor: pointer; font-size: 12px; display: flex; justify-content: center; align-items: center; transition: transform 0.1s; }
.seat:hover:not(:disabled) { transform: scale(1.05); z-index: 1; }
.seat.available { background-color: #1dd1a1; color: white; }
.seat.locked { background-color: #feca57; cursor: not-allowed; }
.seat.booked { background-color: #ff6b6b; cursor: not-allowed; }
.seat.selected { border: 2px solid #576574; }
.actions { margin-top: 12px; display: flex; flex-direction: column; gap: 6px; }
.selected-list { font-weight: bold; }
.confirm-buttons { display: flex; gap: 8px; }
.actions button { padding: 10px 20px; background-color: #54a0ff; color: white; border: none; border-radius: 4px; cursor: pointer; }
.selected-count { margin-left: 8px; font-weight: bold; }
</style>