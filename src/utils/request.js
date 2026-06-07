import axios from 'axios'
import { ElMessage } from 'element-plus'

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 60000
})

// 请求拦截器 - 加 token（区分普通用户和管理员）
request.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  const adminToken = localStorage.getItem('adminToken')

  // 管理员接口使用 adminToken
  if (config.url.includes('/auth/') && adminToken) {
    config.headers.Authorization = `Bearer ${adminToken}`
  } else if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

// 响应拦截器 - 统一处理业务状态码
request.interceptors.response.use(
  (res) => {
    const { code, message, data } = res.data

    if (code === 200) {
      return data   // ★ 直接返回 data，页面调用时不用再 .data.data
    }

    // token 过期 / 未授权
    if (code === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('adminToken')
      window.location.href = '/login'
      return Promise.reject(new Error('登录已过期，请重新登录'))
    }

    return Promise.reject(new Error(message))
  },
  (err) => {
    // HTTP 层面的错误（网络断开、500 等）
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    const msg = err?.response?.data?.message || err.message || '请求失败'
    ElMessage.error(msg)
    return Promise.reject(new Error(msg))
  }
)

export default request