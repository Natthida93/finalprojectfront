<script setup>
import { ref } from 'vue'
import SeatSelectionModal from '../modals/SeatSelectionModal.vue'

const props = defineProps({
  event: Object
})

const showModal = ref(false)
const selectedSeats = ref([])

const formatDate = (date) => {
  if (!date) return ""
  return new Date(date).toLocaleDateString()
}
</script>

<template>
  <div class="event-card">
    <h3>{{ event.title }}</h3>
    <p>{{ formatDate(event.date) }}</p>
    <p>{{ event.venue }}</p>
    <p>${{ event.price }}</p>

    <RouterLink :to="`/event/${event.id}`">
      View Details
    </RouterLink>

    <button @click="showModal = true">
      Buy Now
    </button>

    <SeatSelectionModal
      :event="event"
      :show="showModal"
      :selectedSeats="selectedSeats"
      @close="showModal = false"
    />
  </div>
</template>