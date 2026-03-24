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


<style scoped>
.header {
  display: flex;
  justify-content: space-between; /* logo left, buttons right */
  align-items: center;
  padding: 10px 20px;
  background-color: #000;
  color: white;
}

.right {
  display: flex;
  align-items: center;
  gap: 12px; /* spacing between language & buttons */
}

/* Buttons styling */
.right button {
  background: black;   /* black button */
  color: white;        /* white text */
  border: 2px solid white;
  border-radius: 6px;
  padding: 6px 14px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.right button:hover {
  background: white;   /* invert on hover */
  color: black;
  transform: scale(1.05);
}

/* Optional: router-link buttons remove underline */
.right a {
  text-decoration: none;
}
</style>