<script setup>
import { useRoute, useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'

const route = useRoute()
const router = useRouter()

const event = ref(null)

const formatDate = (date) => {
  if (!date) return ""
  return new Date(date).toLocaleDateString()
}

// Fetch the concert detail
onMounted(async () => {
  try {
    const response = await fetch(
      `https://thesisproject-pqtl.onrender.com/api/concerts/${route.params.id}`
    )
    if (!response.ok) throw new Error("Failed to fetch concert")
    event.value = await response.json()
  } catch (err) {
    console.error("Error fetching concert:", err)
  }
})

// Push to booking page with query parameter
const buyNow = () => {
  if (!event.value) return

  router.push({
    name: 'booking',         // booking page route name
    query: { eventId: event.value.id }  // pass concert id via query
  })
}
</script>

<template>
  <div v-if="event">
    <h1>{{ event.title }}</h1>
    <p>{{ event.venue }}</p>
    <p>{{ formatDate(event.date) }}</p>
    <p>Price: ${{ event.price }}</p>
    <p>Available Seats: {{ event.availableSeats }}</p>

    <button class="buy-btn" @click="buyNow">
      Buy Now
    </button>
  </div>

  <div v-else>
    <p>Loading concert details...</p>
  </div>
</template>

<style scoped>
.buy-btn {
  padding: 10px 20px;
  background-color: #54a0ff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 12px;
}
</style>