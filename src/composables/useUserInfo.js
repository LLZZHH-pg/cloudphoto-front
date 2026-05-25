import { ref, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

// 模块级共享状态，所有导入者共享
const userInfo = reactive({
  userId: null,
  nam: '',
  tel: '',
  eml: '',
  usedstorage: 0,
  totalstorage: 0
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
loadFromStorage()

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function useUserInfo() {
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

  // TODO: 后续对接后端刷新用户信息
  async function refreshUserInfo() {
    // const data = await getUserInfo()  // 调用后端接口
    // Object.assign(userInfo, data)
    // localStorage.setItem('userInfo', JSON.stringify(data))
    loadFromStorage()
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