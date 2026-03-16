<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Logo from '../common/Logo.vue'
import LanguageSwitcher from '../common/LanguageSwitcher.vue'

const router = useRouter()
const isLoggedIn = ref(!!localStorage.getItem('token'))

// Function to update login state
const checkLogin = () => {
  isLoggedIn.value = !!localStorage.getItem('token')
}

// Watch storage changes (other tabs or login/logout events)
window.addEventListener('storage', () => {
  checkLogin()
})

// Optional: custom event for same-tab login/logout
window.addEventListener('loginStateChanged', () => {
  checkLogin()
})

// Logout function
const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('userEmail')
  checkLogin()
  router.push('/')
}
</script>

<template>
  <div class="header">
    <Logo />

    <div class="right">
      <LanguageSwitcher />

      <div v-if="!isLoggedIn">
        <router-link to="/login">
          <button>Login</button>
        </router-link>

        <router-link to="/register">
          <button>Register</button>
        </router-link>
      </div>

      <div v-else>
        <button @click="logout">Logout</button>
      </div>
    </div>
  </div>
</template>