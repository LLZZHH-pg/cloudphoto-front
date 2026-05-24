import { createRouter, createWebHistory } from 'vue-router'
import PhotoPage from '../view/PhotoPage.vue'
import AlbumPage from '../view/AlbumPage.vue'
import RecyclePage from '../view/RecyclePage.vue'
import LoginRegister from '../view/LoginRegister.vue'

const routes = [
  { path: '/', redirect: '/photo' },
  { path: '/photo', name: 'photo', component: PhotoPage, meta: { requiresAuth: true } },
  { path: '/album', name: 'album', component: AlbumPage, meta: { requiresAuth: true } },
  { path: '/recycle', name: 'recycle', component: RecyclePage, meta: { requiresAuth: true } },
  // 白名单路由
  { path: '/login', name: 'login', component: LoginRegister },
  { path: '/register', name: 'register', component: LoginRegister }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// ===== 全局前置守卫 =====
const WHITE_LIST = ['login', 'register']  // 白名单路由的 name

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')

  // 1. 有 token → 已登录，允许访问任何路由
  if (token) {
    // 如果已登录还去 login/register，重定向到首页
    if (to.name === 'login' || to.name === 'register') {
      return next({ name: 'photo' })
    }
    return next()
  }

  // 2. 无 token → 未登录
  // 如果目标在白名单中，允许访问
  if (WHITE_LIST.includes(to.name)) {
    return next()
  }

  // 3. 否则重定向到登录页
  // 可以携带 redirect 参数，登录后跳回原页面
  next({ name: 'login', query: { redirect: to.fullPath } })
})

export default router