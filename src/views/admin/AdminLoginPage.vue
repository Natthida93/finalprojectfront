<template>
  <div class="admin-login">
    <h2>🔐 Admin Login</h2>

    <input v-model="email" placeholder="Email" />
    <input v-model="password" type="password" placeholder="Password" />

    <button @click="login">Login</button>

    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref } from "vue"
import axios from "axios"
import { useRouter } from "vue-router"

const email = ref("")
const password = ref("")
const error = ref("")
const router = useRouter()

async function login() {
  try {
    const res = await axios.post("http://localhost:8081/admin/login", {
      email: email.value,
      password: password.value
    })

    if (res.data === "ADMIN_LOGIN_SUCCESS") {
      localStorage.setItem("role", "ADMIN")
      router.push("/admin/dashboard")
    }

  } catch (err) {
    error.value = "Invalid admin credentials"
  }
}
</script>

<style scoped>
.admin-login {
  max-width: 300px;
  margin: auto;
  text-align: center;
}

input {
  display: block;
  margin: 10px auto;
  padding: 8px;
}

button {
  padding: 10px;
}

.error {
  color: red;
}
</style>