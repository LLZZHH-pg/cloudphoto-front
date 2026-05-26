import { ref, computed, watch } from 'vue'
import { useHeaderBase } from './useHeaderBase'

// ===== 模块级共享状态 =====
const selectedIds = ref(new Set())
const isSelecting = ref(false)

const { isVisible, show: showHeader, hide: hideHeader } = useHeaderBase()

// 当用户点击 HeaderBase 的关闭按钮 → isVisible 变 false → 清除所有选择状态
watch(isVisible, (newVal, oldVal) => {
  if (!newVal && oldVal) {
    selectedIds.value = new Set()
    isSelecting.value = false
  }
})

// ===== 导出 composable =====
export function usePhotoSelection() {
  const selectedCount = computed(() => selectedIds.value.size)

  /**
   * 切换单张照片的选中状态
   */
  function togglePhoto(id) {
    const newSet = new Set(selectedIds.value)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    selectedIds.value = newSet

    // 首次选中时进入选择模式 & 显示 HeaderBase
    if (newSet.size > 0 && !isSelecting.value) {
      isSelecting.value = true
      showHeader()
    }
    // 全部取消时不关闭 HeaderBase，保持选择模式
  }

  /**
   * 切换某个日期组下所有照片的选中状态
   * @param {number[]} ids - 该日期组内所有照片的 id
   */
  function toggleDateGroup(ids) {
    const newSet = new Set(selectedIds.value)
    const allSelected = ids.length > 0 && ids.every(id => newSet.has(id))

    if (allSelected) {
      ids.forEach(id => newSet.delete(id))
    } else {
      ids.forEach(id => newSet.add(id))
    }
    selectedIds.value = newSet

    if (newSet.size > 0 && !isSelecting.value) {
      isSelecting.value = true
      showHeader()
    }
  }

  /**
   * 检查某张照片是否被选中
   */
  function isSelected(id) {
    return selectedIds.value.has(id)
  }

  /**
   * 检查某个日期组是否全部被选中
   */
  function isDateAllSelected(ids) {
    return ids.length > 0 && ids.every(id => selectedIds.value.has(id))
  }

  /**
   * 获取当前选中的照片 ID 列表（用于批量操作）
   */
  function getSelectedIds() {
    return [...selectedIds.value]
  }

  return {
    selectedIds,
    selectedCount,
    isSelecting,
    togglePhoto,
    toggleDateGroup,
    isSelected,
    isDateAllSelected,
    getSelectedIds
  }
}