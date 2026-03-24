<template>
  <div class="logo">
    <router-link to="/">
      <h1>Concert Ticketing System</h1>
    </router-link>
  </div>
</template>

<style scoped>
.logo a {
  text-decoration: none; /* remove underline */
  color: white;        
}

.logo h1 {
  cursor: pointer;
  font-size: 20px;
  margin: 0;
}
</style>