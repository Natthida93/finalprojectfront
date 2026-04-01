<script setup>
import AllEventsPage from '../../views/AllEventsPage.vue';
</script>

<template>
  <nav class="navbar">
    <router-link to="/">Home</router-link>
    <router-link to="/events">Concerts</router-link>
    <router-link to="/history">Purchase history</router-link>
  </nav>
</template>

<style scoped>
.navbar {
  display: flex;
  justify-content: center; 
  gap: 40px;          
  padding: 10px 0;
  background: #222;
}

.navbar a {
  color: white;            
  text-decoration: none;   
  font-weight: 500;
  transition: color 0.2s;
}

.navbar a:hover {
  color: #ff6b6b;          
}
</style>
