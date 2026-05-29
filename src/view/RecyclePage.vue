<script setup>
import { ref, onMounted, inject, watch } from 'vue'
import { getTrashList } from '../api/recycle'
import { useTrashSelection } from '../composables/useTrashSelection'
import TrashPhotoCard from '../components/TrashPhotoCard.vue'
import CheckBox from '../components/CheckBox.vue'

// ===== 选择状态 =====
const {
  isSelecting,
  selectedCount,
  togglePhoto,
  toggleDateGroup,
  isSelected,
  isDateAllSelected
} = useTrashSelection()

// ===== 数据状态 =====
const trashPhotos = ref([])
const dateGroups = ref([])
const loading = ref(true) // 初始为 true，避免空状态闪烁
const hoveredDate = ref(null)

const refreshKey = inject('refreshKey', ref(0))

/**
 * 按日期（shotTime）分组
 */
function groupByDate(photos) {
  if (!photos || photos.length === 0) return []

  // 格式与后端 TimelineVO 返回的 date 保持一致：yyyy-MM-dd
  function formatDate(dateStr) {
    const d = new Date(dateStr)
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  }

  const grouped = {}
  for (const photo of photos) {
    const shotDate = photo.shotTime
      ? formatDate(photo.shotTime)
      : '未知日期'

    if (!grouped[shotDate]) {
      grouped[shotDate] = []
    }
    grouped[shotDate].push(photo)
  }

  return Object.entries(grouped)
    .map(([date, pictures]) => ({ date, pictures }))
    .sort((a, b) => b.date.localeCompare(a.date))
}

/**
 * 加载回收站列表
 */
async function loadTrashList() {
  loading.value = true
  try {
    const data = await getTrashList()
    trashPhotos.value = data || []
    dateGroups.value = groupByDate(trashPhotos.value)
  } catch (e) {
    console.error('加载回收站失败:', e)
    trashPhotos.value = []
    dateGroups.value = []
  } finally {
    loading.value = false
  }
}

// 监听全局刷新信号
watch(refreshKey, () => {
  loadTrashList()
})

onMounted(() => {
  loadTrashList()
})
</script>

<template>
  <div class="recycle-page">
    <!-- 空状态 -->
    <div v-if="!loading && dateGroups.length === 0" class="empty-state">
      <el-icon :size="60"><DeleteFilled /></el-icon>
      <p>回收站为空</p>
      <p class="empty-hint">删除的照片会在这里保留 30 天</p>
    </div>

    <!-- 日期分组 -->
    <div
      v-for="group in dateGroups"
      :key="group.date"
      class="date-group"
    >
      <!-- 日期分割线 -->
      <div
        class="date-divider"
        @mouseenter="hoveredDate = group.date"
        @mouseleave="hoveredDate = null"
      >
        <CheckBox
          v-show="hoveredDate === group.date || isSelecting"
          class="date-checkbox"
          :model-value="isDateAllSelected(group.pictures)"
          @update:model-value="toggleDateGroup(group.pictures)"
        />
        <span class="date-text">{{ group.date }}</span>
        <span class="date-count">{{ group.pictures.length }} 张</span>
      </div>

      <!-- 照片网格 -->
      <div class="photo-grid">
        <TrashPhotoCard
          v-for="picture in group.pictures"
          :key="picture.pictureid"
          :picture="picture"
          :selected="isSelected(picture.pictureid)"
          :force-show-checkbox="isSelecting"
          @toggle="togglePhoto"
        />
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <el-icon class="is-loading" :size="24"><Loading /></el-icon>
      <span>加载中...</span>
    </div>
  </div>
</template>

<style scoped>
.recycle-page {
  height: 100%;
  overflow-y: auto;
  padding: 16px 20px;
  box-sizing: border-box;
}

/* ===== 空状态 ===== */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh;
  color: #999;
  gap: 8px;
}

.empty-state p {
  margin: 0;
  font-size: 15px;
}

.empty-hint {
  font-size: 13px !important;
  color: #c0c4cc;
}

/* ===== 日期组 ===== */
.date-group {
  margin-bottom: 28px;
}

/* ===== 日期分割线 ===== */
.date-divider {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0 12px 0;
  position: sticky;
  top: 0;
  background: var(--el-bg-color, #fff);
  z-index: 10;
  cursor: default;
}

.date-checkbox {
  flex-shrink: 0;
}

.date-text {
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-primary, #303133);
}

.date-count {
  font-size: 13px;
  color: var(--el-text-color-secondary, #909399);
}

/* ===== 照片网格 ===== */
.photo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 10px;
}

/* ===== 加载状态 ===== */
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 24px 0;
  color: #909399;
  font-size: 14px;
}
</style>
