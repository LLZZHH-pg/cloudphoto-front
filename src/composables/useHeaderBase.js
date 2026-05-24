import { ref } from 'vue'

// 模块级别的响应式变量，所有导入者共享同一个实例
const isVisible = ref(false)

export function useHeaderBase() {
  const show = () => {
    isVisible.value = true
  }

  const hide = () => {
    isVisible.value = false
  }

  const toggle = () => {
    isVisible.value = !isVisible.value
  }

  return {
    isVisible,
    show,
    hide,
    toggle
  }
}