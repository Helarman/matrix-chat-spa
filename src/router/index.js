import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '../views/LoginView.vue';
import RoomsView from '../views/RoomsView.vue';

const routes = [
  { path: '/', name: 'Login', component: LoginView },
  { path: '/rooms', name: 'Rooms', component: RoomsView },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
