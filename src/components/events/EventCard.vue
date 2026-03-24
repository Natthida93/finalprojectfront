<script setup>
import { ref } from 'vue'

const props = defineProps({
  event: Object
})

const emit = defineEmits(['buyNow','viewDetails'])

// Format date
const formatDate = (date) => {
  if (!date) return ""
  return new Date(date).toLocaleDateString()
}

// Handle broken image safely
const handleImgError = (e) => {
  e.target.src = 'https://dummyimage.com/300x200'
}
</script>

<template>
  <div class="event-card">

    <!-- IMAGE -->
    <div class="image-wrapper">
      <img 
        :src="event?.image"
        class="event-image"
        @error="handleImgError"
      />

      <!-- SOLD OUT badge -->
      <div v-if="event?.availableSeats === 0" class="badge">
        SOLD OUT
      </div>
    </div>

    <!-- CONTENT -->
    <div class="event-info">
      <h3>{{ event?.title }}</h3>
      <p>{{ formatDate(event?.date) }}</p>
      <p>{{ event?.venue }}</p>
      <p class="price">${{ event?.price }}</p>

      <RouterLink :to="`/event/${event?.id}`" class="details-link">
        View Details
      </RouterLink>

      <!-- Emit event instead of rendering modal -->
      <button class="buy-btn" @click="$emit('buyNow', event)">
        Buy Now
      </button>
    </div>

  </div>
</template>

<style scoped>
.event-card {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 6px 16px rgba(0,0,0,0.1);
  transition: 0.3s;
  background: white;
}

.event-card:hover {
  transform: translateY(-8px);
}

.image-wrapper {
  position: relative;
}

.event-image {
  width: 100%;
  height: 180px;
  object-fit: cover;
}

/* SOLD OUT badge */
.badge {
  position: absolute;
  top: 10px;
  left: 10px;
  background: red;
  color: white;
  padding: 4px 8px;
  font-size: 12px;
  border-radius: 6px;
}

.event-info {
  padding: 12px;
}

.price {
  font-weight: bold;
  margin: 8px 0;
}

.details-link {
  display: block;
  margin: 6px 0;
  color: #555;
  font-size: 14px;
  text-decoration: none;
}

.details-link:hover {
  text-decoration: underline;
}

.buy-btn {
  width: 100%;
  padding: 10px;
  border: none;
  background: black;
  color: white;
  border-radius: 10px;
  cursor: pointer;
}

.buy-btn:hover {
  opacity: 0.85;
}
</style>