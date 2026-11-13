import { createRouter, createWebHashHistory } from 'vue-router'
import Landing from './views/Landing.vue'
import SignIn from './views/SignIn.vue'
import SignUp from './views/SignUp.vue'
import Dashboard from './views/Dashboard.vue'

const routes = [
  { path: '/', name: 'Landing', component: Landing },
  { path: '/signin', name: 'SignIn', component: SignIn },
  { path: '/signup', name: 'SignUp', component: SignUp },
  { path: '/dashboard', name: 'Dashboard', component: Dashboard, meta: { requiresAuth: true } },
  { path: '/:catchAll(.*)', redirect: '/' }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
