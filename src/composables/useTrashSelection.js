import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useHeaderBase } from './useHeaderBase'

// ===== 模块级 HeaderBase 控制 =====
const { isVisible: headerVisible, show: showHeader, hide: hideHeader } = useHeaderBase()

// ===== 模块级共享状态（回收站专用，与照片页完全隔离） =====
const selectedMap = ref(new Map())
const isSelecting = ref(false)

// ===== 工具函数：从 previewUrl 推导存储 URL =====
function deriveStorageUrl(previewUrl) {
  if (!previewUrl) return ''
  return previewUrl.replace(/-normal|-thumb/, '').split('?')[0]
}

// ===== 路由切换时自动清除选择 =====
let _routeWatchInitialized = false

function ensureRouteWatch() {
  if (_routeWatchInitialized) return
  _routeWatchInitialized = true
  const route = useRoute()
  watch(() => route.name, () => {
    clearSelection()
  })
}

// ===== HeaderBase 关闭按钮 → 清除选择 =====
watch(headerVisible, (newVal, oldVal) => {
  if (!newVal && oldVal) {
    clearSelection()
  }
})

// ===== 清除所有选择 =====
function clearSelection() {
  selectedMap.value = new Map()
  isSelecting.value = false
  hideHeader()
}

// ===== 导出 composable =====
export function useTrashSelection() {
  ensureRouteWatch()

  const selectedCount = computed(() => selectedMap.value.size)

  function _updateSelectingState() {
    const selecting = selectedMap.value.size > 0
    isSelecting.value = selecting
    if (selecting) {
      showHeader()
    } else {
      hideHeader()
    }
  }

  /**
   * 切换单张照片的选中状态
   * @param {Object} photo - { pictureid, previewUrl, deleteTime }
   */
  function togglePhoto(photo) {
    const newMap = new Map(selectedMap.value)
    if (newMap.has(photo.pictureid)) {
      newMap.delete(photo.pictureid)
    } else {
      newMap.set(photo.pictureid, {
        id: photo.pictureid,
        previewUrl: photo.previewUrl,
        storageUrl: deriveStorageUrl(photo.previewUrl),
        deleteTime: photo.deleteTime
      })
    }
    selectedMap.value = newMap
    _updateSelectingState()
  }

  /**
   * 切换整组（按日期）的选中状态
   * @param {Array} photos - [{ pictureid, previewUrl, deleteTime }]
   */
  function toggleDateGroup(photos) {
    const newMap = new Map(selectedMap.value)
    const ids = photos.map(p => p.pictureid)
    const allSelected = ids.length > 0 && ids.every(id => newMap.has(id))

    if (allSelected) {
      ids.forEach(id => newMap.delete(id))
    } else {
      photos.forEach(p => {
        if (!newMap.has(p.pictureid)) {
          newMap.set(p.pictureid, {
            id: p.pictureid,
            previewUrl: p.previewUrl,
            storageUrl: deriveStorageUrl(p.previewUrl),
            deleteTime: p.deleteTime
          })
        }
      })
    }
    selectedMap.value = newMap
    _updateSelectingState()
  }

  function isSelected(pictureid) {
    return selectedMap.value.has(pictureid)
  }

  function isDateAllSelected(photos) {
    const ids = photos.map(p => p.pictureid)
    return ids.length > 0 && ids.every(id => selectedMap.value.has(id))
  }

  function getSelectedIds() {
    return [...selectedMap.value.keys()]
  }

  function getSelectedPhotos() {
    return [...selectedMap.value.values()]
  }

  return {
    selectedMap,
    selectedCount,
    isSelecting,
    togglePhoto,
    toggleDateGroup,
    isSelected,
    isDateAllSelected,
    getSelectedIds,
    getSelectedPhotos,
    clearSelection
  }
}
