import { createRouter, createWebHistory } from 'vue-router'
import LandingPage from "../views/LandingPage.vue"
import AuthPage from "../views/AuthPage.vue"
import RegisterView from "../views/RegisterPage.vue"
import LoginView from "../views/LoginPage.vue"
import BookingPage from "../views/BookingPage.vue"
import PaymentPage from "../views/PaymentPage.vue"
import BookingHistoryPage from "../views/BookingHistoryPage.vue"
import EventDetail from '../components/events/EventDetail.vue'
import BookingSuccessPage from '../views/BookingSuccessPage.vue' 

const routes = [
  { path: '/', name: 'LandingPage', component: LandingPage },
  { path: '/auth', component: AuthPage },
  { path: '/register', component: RegisterView },
  { path: '/login', component: LoginView },
  { path: '/booking/:id', name: 'booking', component: BookingPage },
  { path: '/payment', name: 'payment', component: PaymentPage },
  { path: '/history', name: 'history', component: BookingHistoryPage },
  { path: '/event/:id', name: 'eventDetail', component: EventDetail },
  { path: '/booking-success/:concertId', name: 'BookingSuccess', component: BookingSuccessPage } // <-- New route
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router