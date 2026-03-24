<template>
  <section class="section">
    
    <!-- Header -->
    <div class="section-header">
      <h2>Recommend</h2>

      <div class="nav-buttons">
        <button @click="prevSlide">‹</button>
        <button @click="nextSlide">›</button>
      </div>
    </div>

    <!-- 🔥 Slider -->
    <div 
      class="slider"
      @mouseenter="isHovered = true"
      @mouseleave="isHovered = false"
    >
      <div
        class="slider-track"
        :style="{ transform: `translateX(-${currentIndex * 100}%)` }"
      >
        <div
          v-for="event in recommendedEvents"
          :key="event.id"
          class="slide"
        >
          <EventCard
            :event="event"
            @buyNow="openModal"
            @viewDetails="emit('viewDetails', event)"
          />
        </div>
      </div>

      <!-- 🔥 DOTS -->
      <div class="dots">
        <span
          v-for="(event, index) in recommendedEvents"
          :key="index"
          :class="['dot', { active: index === currentIndex }]"
          @click="goToSlide(index)"
        ></span>
      </div>
    </div>

    <!-- Full-screen modal -->
    <SeatSelectionModal
      v-if="showModal"
      :event="selectedEvent"
      :show="showModal"
      :selectedSeats="selectedSeats"
      @close="closeModal"
    />
  </section>
</template>

<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import EventCard from '../events/EventCard.vue'
import SeatSelectionModal from '../modals/SeatSelectionModal.vue'

const props = defineProps({ events: Array })
const emit = defineEmits(['viewDetails'])

const currentIndex = ref(0)
const isHovered = ref(false)
let interval = null

// Modal state
const showModal = ref(false)
const selectedEvent = ref(null)
const selectedSeats = ref([])

// Random 3 events
const recommendedEvents = computed(() => {
  return [...props.events]
    .sort(() => 0.5 - Math.random())
    .slice(0, 3)
})

// Auto slide
function startAutoSlide() {
  interval = setInterval(() => { if(!isHovered.value) nextSlide() }, 3000)
}

onMounted(() => startAutoSlide())
onBeforeUnmount(() => clearInterval(interval))

function nextSlide() {
  if (!recommendedEvents.value.length) return
  currentIndex.value = (currentIndex.value + 1) % recommendedEvents.value.length
}

function prevSlide() {
  if (!recommendedEvents.value.length) return
  currentIndex.value = (currentIndex.value - 1 + recommendedEvents.value.length) % recommendedEvents.value.length
}

function goToSlide(index) { currentIndex.value = index }

function openModal(event) {
  selectedEvent.value = event
  selectedSeats.value = []
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  selectedEvent.value = null
  selectedSeats.value = []
}
</script>

<style scoped>
.section {
  margin: 40px 0;
}

/* Header */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

/* Clean arrows */
.nav-buttons button {
  background: transparent;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: black;
  transition: 0.2s;
}
.nav-buttons button:hover { transform: scale(1.2); }

/* Slider */
.slider {
  overflow: hidden;
  position: relative;
  width: 100vw; /* full width of viewport */
  margin: 0 auto;
}

/* Track */
.slider-track {
  display: flex;
  transition: transform 0.6s ease-in-out;
}

/* Slide */
.slide {
  min-width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* EventCard size */
.slide EventCard {
  width: 80%;
  max-width: 400px; /* adjust card size */
}

/* Dots */
.dots {
  display: flex;
  justify-content: center;
  margin-top: 8px;
  gap: 6px;
}

.dot {
  width: 8px;
  height: 8px;
  background: #ccc;
  border-radius: 50%;
  cursor: pointer;
  transition: 0.3s;
}

.dot.active {
  background: black;
  transform: scale(1.2);
}
</style>