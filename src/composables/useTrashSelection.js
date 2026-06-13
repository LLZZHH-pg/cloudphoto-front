import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useHeaderBase } from './useHeaderBase'

const { isVisible: headerVisible, show: showHeader, hide: hideHeader } = useHeaderBase()

// ===== 模块级共享状态 =====
const selectedMap = ref(new Map())
const isSelecting = ref(false)

// ===== 从 previewUrl 推导存储 URL =====
function deriveStorageUrl(previewUrl) {
  if (!previewUrl) return ''
  return previewUrl.replace(/-normal|-thumb/, '').split('?')[0]
}

watch(headerVisible, (newVal, oldVal) => {
  if (!newVal && oldVal) {
    clearSelection()
  }
})

function clearSelection() {
  selectedMap.value = new Map()
  isSelecting.value = false
  hideHeader()
}

export function useTrashSelection() {

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
