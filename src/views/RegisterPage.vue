<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { register } from '../services/authService'

const router = useRouter()

const fullName = ref('')
const email = ref('')
const password = ref('')
const idNumber = ref('')
const address = ref('')

const handleRegister = async () => {
  try {
    await register({
      fullName: fullName.value,
      email: email.value,
      password: password.value,
      idNumber: idNumber.value,
      address: address.value
    })

    alert("Registered successfully!")
    router.push('/')

  } catch (error) {
    console.error(error)
    alert("Registration failed")
  }
}
</script>

<template>
  <div class="register-container">
    <h2>Register</h2>

    <input v-model="fullName" placeholder="Full Name" />
    <input v-model="email" placeholder="Email" />
    <input v-model="password" type="password" placeholder="Password" />
    <input v-model="idNumber" placeholder="ID Number" />
    <input v-model="address" placeholder="Address" />

    <button @click="handleRegister">Register</button>
  </div>
</template>