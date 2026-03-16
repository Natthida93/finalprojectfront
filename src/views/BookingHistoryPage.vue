<template>
  <div class="booking-history">
    <h2>Purchase History</h2>

    <div v-if="bookings.length">
      <div v-for="(b, index) in bookings" :key="index" class="history-item">
        <OrderSummary
          :concert="{ title: b.concertName, date: b.concertDate }"
          :selectedSeats="[ { seatNumber: b.seatNumber, price: b.totalPrice } ]"
          :totalPrice="b.totalPrice"
        />
        <p><strong>Status:</strong> {{ b.status }}</p>
        <hr />
      </div>
    </div>

    <div v-else>
      <p>No bookings found.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import OrderSummary from './OrderSummary.vue'

const userEmail = "testuser@gmail.com"
const bookings = ref([])

const fetchHistory = async () => {
  try {
    const res = await axios.get(`http://localhost:8081/bookings/history/${userEmail}`)
    bookings.value = res.data
  } catch (err) {
    console.error('Failed to fetch booking history:', err)
  }
}

onMounted(fetchHistory)
</script>

<style scoped>
.booking-history {
  max-width: 800px;
  margin: auto;
  padding: 20px;
}

.history-item {
  margin-bottom: 20px;
}
hr {
  border: 0;
  border-top: 1px solid #ccc;
  margin: 10px 0;
}
</style>