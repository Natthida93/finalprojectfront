<script setup>
import { ref, computed } from 'vue'
import EventCard from '../events/EventCard.vue'
import SeatSelectionModal from '../modals/SeatSelectionModal.vue'
import { useRouter } from 'vue-router'

const router = useRouter()
function goToAll() {
  router.push('/events')
}

// Props & emits
const props = defineProps({
  events: {
    type: Array,
    default: () => []
  }
})
const emit = defineEmits(['viewDetails'])

// Scroll & controls
const scrollContainer = ref(null)
const searchQuery = ref('')
const selectedCategory = ref('All')

// Modal state
const showModal = ref(false)
const selectedEvent = ref(null)
const selectedSeats = ref([])

// Filter + search + sort
const filteredEvents = computed(() => {
  let list = [...props.events]

  if (selectedCategory.value !== 'All') {
    list = list.filter(e => e.category === selectedCategory.value)
  }

  if (searchQuery.value) {
    list = list.filter(e =>
      e.title.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  return list.sort((a, b) => new Date(b.date) - new Date(a.date))
})

// Scroll
function scrollLeft() {
  scrollContainer.value.scrollBy({ left: -400, behavior: 'smooth' })
}
function scrollRight() {
  scrollContainer.value.scrollBy({ left: 400, behavior: 'smooth' })
}

// Open modal centrally
function openModal(event) {
  selectedEvent.value = event
  selectedSeats.value = []
  showModal.value = true
}

// Close modal
function closeModal() {
  showModal.value = false
  selectedEvent.value = null
  selectedSeats.value = []
}
</script>

<template>
  <section class="section">
    <!-- Header -->
    <div class="section-header">
      <h2>Concert & Festivals</h2>
      <div class="nav-buttons">
        <button @click="scrollLeft">‹</button>
        <button @click="scrollRight">›</button>
      </div>
    </div>

    <!-- Controls -->
    <div class="controls">
      <input v-model="searchQuery" type="text" placeholder="Search events..." />
      <select v-model="selectedCategory">
        <option value="All">All</option>
        <option value="Concert">Concert</option>
        <option value="Festival">Festival</option>
      </select>
      <button class="view-all" @click="goToAll">View All</button>
    </div>

    <!-- 2-row horizontal grid -->
    <div class="events-row" ref="scrollContainer">
      <div v-for="event in filteredEvents" :key="event.id" class="card-wrapper">
        <EventCard
          :event="event"
          @buyNow="openModal"
          @viewDetails="emit('viewDetails', event)"
        />
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

<style scoped>
.section { margin: 40px 0; }
.section-header { display: flex; justify-content: space-between; align-items: center; }
.nav-buttons button { background: transparent; border: none; font-size: 26px; cursor: pointer; transition: 0.2s; }
.nav-buttons button:hover { transform: scale(1.2); }

.controls {
  display: flex;
  gap: 12px;
  margin: 15px 0;
}
.controls input,
.controls select {
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid #ccc;
}
.view-all {
  margin-left: auto;
  padding: 6px 12px;
  border: none;
  background: black;
  color: white;
  border-radius: 6px;
  cursor: pointer;
}

/* 2-row horizontal grid */
.events-row {
  display: grid;
  grid-auto-flow: column;
  grid-template-rows: repeat(2, auto);
  gap: 16px;
  overflow-x: auto;
  padding: 20px 0;
  scroll-behavior: smooth;
}
.events-row::-webkit-scrollbar { display: none; }

.card-wrapper {
  width: 260px;
  transition: transform 0.3s ease;
}
.card-wrapper:hover { transform: translateY(-6px) scale(1.02); }
</style>