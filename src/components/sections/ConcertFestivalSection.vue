<script setup>
import { computed } from 'vue'
import EventCard from '../events/EventCard.vue'

const props = defineProps({
  events: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['buyNow','viewDetails'])

const recentEvents = computed(() => {
  return [...props.events].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  )
})
</script>

<template>
  <section>
    <h2>Concert & Festivals</h2>

    <div class="grid">
      <EventCard
        v-for="event in recentEvents"
        :key="event.id"
        :event="event"
        @buyNow="$emit('buyNow', event)"
        @viewDetails="$emit('viewDetails', event)"
      />
    </div>
  </section>
</template>