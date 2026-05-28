import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useHeaderBase } from './useHeaderBase'

// ===== 模块级共享状态 =====
const selectedMap = ref(new Map())
const isSelecting = ref(false)

const { isVisible, show: showHeader, hide: hideHeader } = useHeaderBase()

// ===== 模块级标志：确保路由监听只注册一次 =====
let _routeWatchInitialized = false

// ===== 工具函数：从 previewUrl 推导存储 URL =====
function deriveStorageUrl(previewUrl) {
  return previewUrl.replace(/-normal|-thumb/, '').split('?')[0]
}

// ===== 清除所有选择状态 =====
function clearSelection() {
  selectedMap.value = new Map()
  isSelecting.value = false
  hideHeader()
}

// ===== HeaderBase 关闭按钮 → 清除选择 =====
watch(isVisible, (newVal, oldVal) => {
  if (!newVal && oldVal) {
    selectedMap.value = new Map()
    isSelecting.value = false
  }
})

// ===== 导出 composable =====
export function usePhotoSelection() {
  // 路由切换时自动退出选择状态（只注册一次）
  if (!_routeWatchInitialized) {
    _routeWatchInitialized = true
    const route = useRoute()
    watch(() => route.name, () => {
      clearSelection()
    })
  }

  const selectedCount = computed(() => selectedMap.value.size)

  function togglePhoto(photo) {
    const newMap = new Map(selectedMap.value)
    if (newMap.has(photo.id)) {
      newMap.delete(photo.id)
    } else {
      newMap.set(photo.id, {
        id: photo.id,
        previewUrl: photo.previewUrl,
        storageUrl: deriveStorageUrl(photo.previewUrl)
      })
    }
    selectedMap.value = newMap

    if (newMap.size > 0 && !isSelecting.value) {
      isSelecting.value = true
      showHeader()
    }
  }

  function toggleDateGroup(photos) {
    const newMap = new Map(selectedMap.value)
    const ids = photos.map(p => p.id)
    const allSelected = ids.length > 0 && ids.every(id => newMap.has(id))

    if (allSelected) {
      ids.forEach(id => newMap.delete(id))
    } else {
      photos.forEach(p => {
        if (!newMap.has(p.id)) {
          newMap.set(p.id, {
            id: p.id,
            previewUrl: p.previewUrl,
            storageUrl: deriveStorageUrl(p.previewUrl)
          })
        }
      })
    }
    selectedMap.value = newMap

    if (newMap.size > 0 && !isSelecting.value) {
      isSelecting.value = true
      showHeader()
    }
  }

  function isSelected(id) {
    return selectedMap.value.has(id)
  }

  function isDateAllSelected(photos) {
    const ids = photos.map(p => p.id)
    return ids.length > 0 && ids.every(id => selectedMap.value.has(id))
  }

  function getSelectedPhotos() {
    return [...selectedMap.value.values()]
  }

  function getSelectedIds() {
    return [...selectedMap.value.keys()]
  }

  return {
    selectedMap,
    selectedCount,
    isSelecting,
    togglePhoto,
    toggleDateGroup,
    isSelected,
    isDateAllSelected,
    getSelectedPhotos,
    getSelectedIds
  }
}