<template>
  <div class="container">

    <!-- Only show this if concert was NOT passed in URL -->
    <div v-if="!selectedShow">
      <h2>Select Concert</h2>
      <div v-for="show in showTimes" :key="show.id">
        <input type="radio" v-model="selectedShow" :value="show" />
        {{ show.title }} - {{ show.date }}
      </div>
    </div>

    <h2>Select Zone</h2>
    <div class="zones">
      <button
        v-for="zone in zones"
        :key="zone.name"
        :style="{ backgroundColor: zone.color }"
        @click="selectZone(zone)"
      >
        {{ zone.name }}
      </button>
    </div>

    <!-- SeatMap displayed for selected zone -->
   <SeatMap
      v-if="selectedShow && selectedZone"
      :key="seatMapKey"
      :concert-id="selectedShow.id"
      :zone-name="selectedZone.name"
      @selectedSeats="updateSelectedSeats"
    />

    <!-- Inline summary & Confirm / Cancel -->
    <div v-if="selectedSeats.length > 0" class="summary">
      <h3>Selected Seats:</h3>
      <p>
        {{ selectedSeats.map(s => s.label || s.seatNumber || s.id).join(', ') }}
      </p>
      <div class="modal-actions">
        <button @click="confirmBooking">Confirm</button>
        <button @click="clearSelection">Cancel</button>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRoute, useRouter } from 'vue-router'
import SeatMap from '../components/modals/SeatMap.vue'

const route = useRoute()
const router = useRouter()
const concertIdFromRoute = route.query.eventId

const showTimes = ref([])
const zones = ref([])
const selectedShow = ref(null)
const selectedZone = ref(null)
const selectedSeats = ref([])
const seatMapKey = ref(0) // Force SeatMap refresh

onMounted(async () => {
  try {
    const res = await axios.get("http://localhost:8081/api/concerts")
    showTimes.value = res.data

    if (concertIdFromRoute) {
      const foundConcert = showTimes.value.find(c => c.id == concertIdFromRoute)
      if (foundConcert) selectedShow.value = foundConcert
    }
  } catch (err) {
    console.error("Error fetching concerts:", err)
  }

  zones.value = [
    { name: "VIP", color: "#ff6b6b" },
    { name: "A", color: "#feca57" },
    { name: "B", color: "#48dbfb" },
    { name: "C", color: "#1dd1a1" }
  ]
})

function selectZone(zone) {
  selectedZone.value = zone
  selectedSeats.value = []
  seatMapKey.value++ // Refresh SeatMap when zone changes
}

function updateSelectedSeats(seats) {
  selectedSeats.value = seats
}

function clearSelection() {
  selectedSeats.value = []
}

async function confirmBooking() {
  if (!selectedSeats.value.length) return;

  const userId = localStorage.getItem('userId');
  if (!userId) {
    alert("Please log in first");
    return;
  }

  const lockedSeats = [];
  const failedSeats = [];

  for (const seat of selectedSeats.value) {
    try {
      const res = await axios.post(
        "http://localhost:8081/api/seats/lock",
        null,
        {
          params: {
            seatId: seat.id,
            userId: userId
          }
        }
      );

      lockedSeats.push({
        id: res.data.seatId,
        label: res.data.label,
        price: res.data.price
      });

    } catch (err) {

      if (err.response?.status === 409) {
        failedSeats.push(seat.label || seat.seatNumber);
      } else {
        console.error("Unexpected error locking seat:", err);
      }

    }
  }

  if (failedSeats.length) {
    alert(`These seats were already taken: ${failedSeats.join(", ")}`);
    if (!lockedSeats.length) return;
  }

  // Save seats for payment page
  localStorage.setItem("paymentSeats", JSON.stringify(lockedSeats));
  localStorage.setItem("paymentConcertId", JSON.stringify(selectedShow.value.id));

  seatMapKey.value++;

  router.push({ name: "payment" });
}
</script>

<style>
.container { padding: 20px; }
.zones button { margin: 6px; padding: 10px 20px; border-radius: 6px; border: none; cursor: pointer; }
.summary { margin-top: 20px; }
.modal-actions { display: flex; gap: 10px; margin-top: 10px; }
.modal-actions button { flex: 1; padding: 10px 0; border-radius: 6px; border: none; cursor: pointer; }
.modal-actions button:first-child { background-color: #54a0ff; color: white; }
.modal-actions button:last-child { background-color: #ff6b6b; color: white; }
</style>