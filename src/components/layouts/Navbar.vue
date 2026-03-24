<script setup>
import AllEventsPage from '../../views/AllEventsPage.vue';
</script>

<template>
  <nav class="navbar">
    <a href="/">Home</a>
    <a href="/events">Concerts</a>
    <a href="/history">Purchase history</a>
  </nav>
</template>

<style scoped>
.navbar {
  display: flex;
  justify-content: center; /* centers items horizontally */
  gap: 40px;               /* space between links */
  padding: 10px 0;
  background: #222;
}

.navbar a {
  color: white;            /* make links white */
  text-decoration: none;   /* remove underline */
  font-weight: 500;
  transition: color 0.2s;
}

.navbar a:hover {
  color: #ff6b6b;          /* optional hover color for effect */
}
</style>
