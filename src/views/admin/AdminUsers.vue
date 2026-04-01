<template>
  <div class="admin-page">
    <h1>👤 All Users</h1>

    <div v-if="loading">Loading users...</div>

    <table v-else>
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Email</th>
          <th>Address</th>
          <th>Role</th>
          <th>Action</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="u in users" :key="u.id">
          <td>{{ u.id }}</td>
          <td>{{ u.fullName }}</td>
          <td>{{ u.email }}</td>
          <td>{{ u.address }}</td>
          <td>{{ u.role }}</td>

          <td>
            <button class="delete" @click="deleteUser(u.id)">
              ❌ Delete
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="!users.length && !loading">
      No users found.
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"
import axios from "axios"

const users = ref([])
const loading = ref(true)

// ---------------- FETCH ----------------
async function fetchUsers() {
  try {
    const res = await axios.get("https://thesisproject-pqtl.onrender.com/admin/users")
    users.value = res.data
  } catch (err) {
    console.error("[AdminUsers] error:", err)
  } finally {
    loading.value = false
  }
}

// ---------------- DELETE ----------------
async function deleteUser(id) {
  const confirmDelete = confirm("Delete this user?")
  if (!confirmDelete) return

  try {
    await axios.delete(`https://thesisproject-pqtl.onrender.com/admin/users/${id}`)

    users.value = users.value.filter(u => u.id !== id)

  } catch (err) {
    console.error("[Delete User] error:", err)
    alert("Delete failed")
  }
}

// ---------------- INIT ----------------
onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
.admin-page {
  padding: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

th, td {
  border: 1px solid #ddd;
  padding: 10px;
  text-align: center;
}

th {
  background: #34495e;
  color: white;
}

tr:nth-child(even) {
  background: #f9f9f9;
}

.delete {
  background: #ff6b6b;
  color: white;
  border: none;
  padding: 6px 10px;
  cursor: pointer;
  border-radius: 5px;
}

.delete:hover {
  background: #ee5253;
}
</style>