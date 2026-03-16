<script setup>
import Header from './Header.vue'
import Navbar from './Navbar.vue'
</script>

<template>
  <div>
    <Header />
    <Navbar />
    <slot />
  </div>
</template>
