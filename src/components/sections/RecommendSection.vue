<script setup>
import { computed } from 'vue'
import EventCard from '../events/EventCard.vue'

const props = defineProps({
  events: Array
})

const emit = defineEmits(['buyNow','viewDetails'])

const recommendedEvents = computed(() =>
  [...props.events]
    .sort(() => 0.5 - Math.random())
    .slice(0, 3)
)
</script>

<template>
  <section>
    <h2>Recommend</h2>
    <div class="grid">
      <EventCard
        v-for="event in recommendedEvents"
        :key="event.id"
        :event="event"
        @buyNow="$emit('buyNow', event)"
        @viewDetails="$emit('viewDetails', event)"
      />
    </div>
  </section>
</template>