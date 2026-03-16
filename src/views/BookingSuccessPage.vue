<template>
  <div class="booking-success-page">
    <h2>Booking Successful!</h2>

    <div v-if="loading">Loading your booking details...</div>

    <div v-else-if="booking">
      <h3>Concert: {{ booking.concert.title }}</h3>
      <p>Date: {{ formatDate(booking.concert.date) }}</p>
      <p>Seats:</p>
      <ul>
        <li v-for="seat in booking.seats" :key="seat.id">
          {{ seat.seatNumber }} ({{ seat.section.name }})
        </li>
      </ul>
      <p>Total Paid: ${{ totalPrice }}</p>
      <p>Delivery Method: {{ booking.payment.deliveryMethod }}</p>
      <p>Booked At: {{ formatDate(booking.bookedAt) }}</p>
    </div>

    <div v-else>
      <p>No booking found.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'

const booking = ref(null)
const loading = ref(true)
const paymentId = localStorage.getItem('latestPaymentId')
const userEmail = localStorage.getItem('userEmail') || ''

const totalPrice = computed(() => {
  if (!booking.value) return 0
  return booking.value.seats.reduce((sum, seat) => sum + (seat.price || 0), 0)
})

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString()
}

async function fetchBooking() {
  try {
    if (paymentId) {
      const res = await axios.get(`http://localhost:8081/bookings/by-payment/${paymentId}`)
      if (res.data) booking.value = res.data
    } else if (userEmail) {
      const res = await axios.get(`http://localhost:8081/bookings/history/${userEmail}`)
      if (res.data && res.data.length > 0) booking.value = res.data[res.data.length - 1]
    }
  } catch (err) {
    console.error('[BookingSuccessPage] Failed to fetch booking:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchBooking()
})
</script>

<style scoped>
.booking-success-page { max-width: 600px; margin: auto; padding: 20px; }
ul { list-style: none; padding: 0; }
li { margin: 4px 0; }
h2, h3 { margin-bottom: 12px; }
</style>