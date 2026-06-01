import { ref, computed, watch } from 'vue'
import { useHeaderBase } from './useHeaderBase'

// ===== 模块级共享状态（影集详情页专用，与照片页/回收站页完全隔离） =====
const selectedMap = ref(new Map())
const isSelecting = ref(false)
const albumId = ref(null)

const { isVisible, show: showHeader, hide: hideHeader } = useHeaderBase()


// ===== 工具函数：从 previewUrl 推导存储 URL =====
function deriveStorageUrl(previewUrl) {
  if (!previewUrl) return ''
  return previewUrl.replace(/-normal|-thumb/, '').split('?')[0]
}

// ===== HeaderBase 关闭按钮 → 清除选择 =====
watch(isVisible, (newVal, oldVal) => {
  if (!newVal && oldVal) {
    selectedMap.value = new Map()
    isSelecting.value = false
  }
})

// ===== 清除所有选择状态 =====
function clearSelection() {
  selectedMap.value = new Map()
  isSelecting.value = false
  hideHeader()
}

// ===== 导出 composable =====
export function useAlbumSelection() {

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
   * 设置当前影集 ID（由 AlbumDetail 在加载时调用）
   */
  function setAlbumId(id) {
    albumId.value = id
  }

  /**
   * 切换单张照片的选中状态
   * @param {Object} photo - { id: pictureid, previewUrl }
   */
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
    _updateSelectingState()
  }

  /**
   * 切换整组（按日期）的选中状态
   * @param {Array} photos - [{ id: pictureid, previewUrl }]
   */
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
    _updateSelectingState()
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
    albumId,
    setAlbumId,
    selectedMap,
    selectedCount,
    isSelecting,
    togglePhoto,
    toggleDateGroup,
    isSelected,
    isDateAllSelected,
    getSelectedPhotos,
    getSelectedIds,
    clearSelection
  }
}
