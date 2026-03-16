<template>
  <div class="order-summary">
    <h3>Order Summary</h3>

    <!-- Concert info -->
    <div v-if="concert">
      <p><strong>Concert:</strong> {{ concert.title }}</p>
      <p><strong>Date:</strong> {{ formatDate(concert.date) }}</p>
      <p><strong>Venue:</strong> {{ concert.venue }}</p>
    </div>
    <div v-else>
      <p>Concert info not available</p>
    </div>

    <!-- Seats info -->
    <div v-if="selectedSeats?.length">
      <p><strong>Selected Seats:</strong></p>
      <ul>
        <li v-for="seat in selectedSeats" :key="seat?.id">
          {{ seat?.label || seat?.seatNumber || seat?.id }} - 
          {{ seat?.price != null ? formatPrice(seat.price) : 'Price not set' }}
        </li>
      </ul>
    </div>
    <div v-else>
      <p>No seats selected</p>
    </div>

  
 

    <!-- Total Price -->
    <div class="total">
      <p><strong>Total Price:</strong> {{ totalPrice != null ? formatPrice(totalPrice) : '$0.00' }}</p>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'

const props = defineProps({
  concert: { type: Object, default: null },
  selectedSeats: { type: Array, default: () => [] },
  totalPrice: { type: Number, default: 0 },
  deliveryMethod: { type: String, default: 'e-ticket' } // 'e-ticket' or 'physical'
})

// Format currency
function formatPrice(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
}

// Format date
function formatDate(date) {
  if (!date) return 'N/A'
  // Ensure it's a raw JS date string (Proxy issue fixed)
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString()
}
</script>

<style scoped>
.order-summary {
  border: 1px solid #ddd;
  padding: 12px 20px;
  border-radius: 6px;
  margin-bottom: 20px;
  background: #f9f9f9;
}
.order-summary h3 {
  margin-bottom: 10px;
}
.order-summary ul {
  list-style: none;
  padding-left: 0;
}
.order-summary li {
  margin-bottom: 4px;
}
.total {
  margin-top: 10px;
  font-weight: bold;
}
</style>