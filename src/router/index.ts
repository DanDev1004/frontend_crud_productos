import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ProductsView from '../views/ProductsView.vue'
import CategoriesView from '../views/CategoriesView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView, meta: { title: 'Inicio' } },
    { path: '/products', name: 'products', component: ProductsView, meta: { title: 'Productos' } },
    { path: '/categories', name: 'categories', component: CategoriesView, meta: { title: 'Categorías' } },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

export default router
