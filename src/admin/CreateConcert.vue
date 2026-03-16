<script setup>
import { ref } from 'vue'
import axios from 'axios'

const title = ref('')
const date = ref('')
const venue = ref('')
const price = ref('')
const totalSeats = ref('')

const createConcert = async () => {

  await axios.post("http://localhost:8081/api/concerts", {
    title: title.value,
    date: date.value,
    venue: venue.value,
    price: price.value,
    totalSeats: totalSeats.value
  })

  alert("Concert created")
}
</script>