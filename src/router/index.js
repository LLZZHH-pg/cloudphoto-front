import { createRouter, createWebHistory } from 'vue-router'
import PhotoPage from '../view/PhotoPage.vue'
import AlbumPage from '../view/AlbumPage.vue'
import RecyclePage from '../view/RecyclePage.vue'

const routes = [
  { path: '/', redirect: '/photo' },
  { path: '/photo', name: 'photo', component: PhotoPage },
  { path: '/album', name: 'album', component: AlbumPage },
  { path: '/recycle', name: 'recycle', component: RecyclePage }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router