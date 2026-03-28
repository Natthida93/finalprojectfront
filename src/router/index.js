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
import AllEventsPage from '../views/AllEventsPage.vue' 
import AdminLoginPage from "../views/admin/AdminLoginPage.vue"
import AdminDashboard from "../views/admin/AdminDashboard.vue"
import AdminBookings from '../views/admin/AdminBookings.vue'
import AdminUsers from '../views/admin/AdminUsers.vue'
import AdminPayments from '../views/admin/AdminPayments.vue'

const routes = [
  { path: '/', name: 'LandingPage', component: LandingPage },
  { path: '/auth', component: AuthPage },
  { path: '/register', component: RegisterView },
  { path: '/login', component: LoginView },
  { path: '/booking/:id', name: 'booking', component: BookingPage },
  { path: '/payment', name: 'payment', component: PaymentPage },
  { path: '/history', name: 'history', component: BookingHistoryPage },
  { path: '/event/:id', name: 'eventDetail', component: EventDetail },
 { path: '/booking-success', name: 'BookingSuccess', component: BookingSuccessPage },

  {
  path: '/events',
  name: 'AllEvents',
  component: () => import('../views/AllEventsPage.vue')
},
 { path: '/admin/login', component: AdminLoginPage },
  { path: '/admin/dashboard', component: AdminDashboard },
  { path: '/admin/bookings', name: 'AdminBookings', component:AdminBookings },
  { path: '/admin/users', name: 'AdminUsers', component:AdminUsers },
  { path: '/admin/payments', name: 'AdminPayments', component: AdminPayments },
  
]

const router = createRouter({
  history: createWebHistory(),
  routes
})


router.beforeEach((to, from, next) => {
  const role = localStorage.getItem("role")

  //allow login page always
  if (to.path === "/admin/login") {
    return next()
  }

  // protect other admin pages
  if (to.path.startsWith("/admin") && role !== "ADMIN") {
    return next("/admin/login")
  }

  next()
})

export default router