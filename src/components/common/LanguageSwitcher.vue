<script setup>
const changeLanguage = (lang) => {
  console.log("language:", lang)
}
</script>

<template>
  <select @change="changeLanguage($event.target.value)">
    <option value="en">EN</option>
    <option value="th">TH</option>
    <option value="cn">CN</option>
  </select>
</template>