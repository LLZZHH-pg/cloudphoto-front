import { ref, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getUserInfo } from '../api/user'

export const userInfo = reactive({
  userId: null,
  nam: '',
  tel: '',
  eml: '',
  usedstorage: 0,
  totalstorage: 0,
  recycledays: 30
})

// 初始化：从 localStorage 读取
function loadFromStorage() {
  const stored = localStorage.getItem('userInfo')
  if (stored) {
    try {
      const parsed = JSON.parse(stored)
      Object.assign(userInfo, parsed)
    } catch (e) {
      console.error('解析用户信息失败', e)
    }
  }
}

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function useUserInfo() {
  loadFromStorage()

  const router = useRouter()

  const username = computed(() => userInfo.nam || '未知用户')

  const storagePercent = computed(() => {
    if (!userInfo.totalstorage || userInfo.totalstorage === 0) return 0
    return Math.round((userInfo.usedstorage / userInfo.totalstorage) * 100)
  })

  const storageText = computed(() => {
    const used = formatBytes(userInfo.usedstorage)
    const total = formatBytes(userInfo.totalstorage)
    return `${used} / ${total}`
  })

async function refreshUserInfo() {
    const token = localStorage.getItem('token')
    if (!token || !userInfo.userId) {
      loadFromStorage()
      return
    }
    try {
      const data = await getUserInfo()
      Object.assign(userInfo, data)
      localStorage.setItem('userInfo', JSON.stringify(data))
    } catch (e) {
      // 静默失败
      console.error('刷新用户信息失败', e)
    }
}

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    ElMessage.success('已退出登录')
    router.push('/login')
  }

  return {
    userInfo,
    username,
    storagePercent,
    storageText,
    refreshUserInfo,
    logout
  }
}