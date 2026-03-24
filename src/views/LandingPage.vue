<script setup>
import { ref, onMounted } from 'vue'
import MainLayout from '../components/layouts/MainLayOut.vue'
import RecommendSection from '../components/sections/RecommendSection.vue'
import ConcertFestivalSection from '../components/sections/ConcertFestivalSection.vue'
import BookingModal from '../views/BookingPage.vue'
import Hero from '../components/Hero.vue'
// Events
const events = ref([])

// Modal state
const showBookingModal = ref(false)
const selectedEvent = ref(null)

// Fetch events
onMounted(async () => {
  try {
    const response = await fetch('http://localhost:8081/api/concerts')
    const data = await response.json()
    events.value = data
  } catch (error) {
    console.error("FETCH ERROR:", error)
  }
})

// Open modal with event
function openBooking(event) {
  selectedEvent.value = event
  showBookingModal.value = true
}

// Close modal
function closeBooking() {
  showBookingModal.value = false
  selectedEvent.value = null
}
</script>

<template>
 <MainLayout>
  <!-- Hero Section -->
  <Hero />

  <!-- Sections -->
  <RecommendSection 
    :events="events"
    @buyNow="openBooking"
    @viewDetails="openBooking"
  />
  <ConcertFestivalSection 
    :events="events"
    @buyNow="openBooking"
    @viewDetails="openBooking"
  />

  <!-- Booking Modal -->
  <BookingModal
    v-if="showBookingModal"
    :event="selectedEvent"
    :show="showBookingModal"
    @close="closeBooking"
    @proceedToPayment="closeBooking"
  />
</MainLayout>
</template>


