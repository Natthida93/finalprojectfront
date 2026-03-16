<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const email = ref('')
const password = ref('')
const router = useRouter()

const handleLogin = async () => {
  if (!email.value.includes('@')) {
    alert('Please enter a valid email')
    return
  }

  try {
    const response = await axios.post('http://localhost:8081/users/login', {
      email: email.value,
      password: password.value
    })

    console.log('Login response:', response.data)

    if (response.data.status === 'USER_LOGIN_SUCCESS') {
      const user = response.data.user || {}
      const userId = user.id !== undefined && user.id !== null ? Number(user.id) : null
      const userEmail = user.email || email.value

      if (!userId) {
        console.warn('Login succeeded but userId is missing!')
        alert('Login succeeded but missing userId from server. Check backend!')
        return
      }

      // Save user info
      localStorage.setItem('token', 'dummy-token')
      localStorage.setItem('userEmail', userEmail)
      localStorage.setItem('userId', userId)

      // Dispatch event for other components
      window.dispatchEvent(new Event('loginStateChanged'))

      // Redirect to landing page
      router.push('/').then(() => {
        alert('Login successful!')
      })
    } else {
      alert(response.data.message || 'Login failed')
    }

  } catch (error) {
    console.error('Login failed:', error)
    alert('Login failed: ' + (error.response?.data?.message || error.message))
  }
}
</script>

<template>
  <div class="login-container">
    <h2>Login</h2>
    <input v-model="email" placeholder="Email" type="email" />
    <input v-model="password" placeholder="Password" type="password" />
    <button @click="handleLogin">Login</button>
  </div>
</template>

<style scoped>
.login-container {
  max-width: 400px;
  margin: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
}
.login-container h2 { text-align: center; margin-bottom: 20px; }
.login-container input { margin: 8px 0; padding: 10px; font-size: 16px; }
button { margin-top: 12px; padding: 10px 20px; background: #54a0ff; color: white; border-radius: 6px; border: none; cursor: pointer; }
</style>