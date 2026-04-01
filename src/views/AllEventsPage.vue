<script setup>
import { ref, onMounted, computed } from 'vue'
import EventCard from '../components/events/EventCard.vue'

// State
const events = ref([])
const searchQuery = ref('')
const selectedCategory = ref('All')

// Fetch all events
onMounted(async () => {
  try {
    const res = await fetch('https://thesisproject-pqtl.onrender.com/api/concerts')
    events.value = await res.json()
  } catch (err) {
    console.error('Failed to fetch events:', err)
  }
})

// Filter + search
const filteredEvents = computed(() => {
  let list = [...events.value]

  if (selectedCategory.value !== 'All') {
    list = list.filter(e => e.category === selectedCategory.value)
  }

  if (searchQuery.value) {
    list = list.filter(e =>
      e.title.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  return list
})
</script>

<template>
  <div class="page">

    <h1>All Events</h1>

    <!-- 🔍 Controls -->
    <div class="controls">
      <input 
        v-model="searchQuery"
        placeholder="Search events..."
      />

      <select v-model="selectedCategory">
        <option value="All">All</option>
        <option value="Concert">Concert</option>
        <option value="Festival">Festival</option>
      </select>
    </div>

    <!-- 🔥 Grid layout -->
    <div class="grid">
      <EventCard
        v-for="event in filteredEvents"
        :key="event.id"
        :event="event"
      />
    </div>

    <!-- Empty state -->
    <p v-if="filteredEvents.length === 0">
      No events found.
    </p>

  </div>
</template>

<style scoped>
.page {
  padding: 20px;
}

/* Controls */
.controls {
  display: flex;
  gap: 10px;
  margin: 20px 0;
}

.controls input,
.controls select {
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #ccc;
}

/* 🔥 Grid */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
}
</style>