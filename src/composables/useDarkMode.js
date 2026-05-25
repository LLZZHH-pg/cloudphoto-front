import { ref, watchEffect } from 'vue'

const isDark = ref(false)

const saved = localStorage.getItem('darkMode')
if (saved !== null) {
  isDark.value = saved === 'true'
} else {
  isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
}

watchEffect(() => {
  document.documentElement.classList.toggle('dark', isDark.value)
})

const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
mediaQuery.addEventListener('change', (e) => {
  // 仅当用户未手动设置过时才跟随系统
  if (localStorage.getItem('darkMode') === null) {
    isDark.value = e.matches
  }
})

export function useDarkMode() {
  const toggle = () => {
    isDark.value = !isDark.value
    localStorage.setItem('darkMode', isDark.value)
  }
  return { isDark, toggle }
}