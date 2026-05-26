<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { getTimeline } from '../api/photo'
import { usePhotoSelection } from '../composables/usePhotoSelection'
import PhotoBox from '../components/PhotoBox.vue'
import CheckBox from '../components/CheckBox.vue'

// ===== 选择状态 =====
const {
  isSelecting,
  togglePhoto,
  toggleDateGroup,
  isSelected,
  isDateAllSelected
} = usePhotoSelection()

// ===== 时间线数据 =====
const timelineGroups = ref([])
const currentPage = ref(1)
const pageSize = 20
const loading = ref(false)
const noMore = ref(false)
const hoveredDate = ref(null)      // 当前鼠标悬浮的日期
const containerRef = ref(null)

/**
 * 将新一页数据合并到已有分组中
 * 解决同一日期跨分页被拆分的问题
 */
function mergeTimelineGroups(existing, newGroups) {
  if (!newGroups || newGroups.length === 0) return existing

  const merged = [...existing]
  const lastGroup = merged[merged.length - 1]
  const firstNewGroup = newGroups[0]

  // 最后一组日期与新页第一组日期相同 → 合并 pictures
  if (lastGroup && lastGroup.date === firstNewGroup.date) {
    merged[merged.length - 1] = {
      ...lastGroup,
      pictures: [...lastGroup.pictures, ...firstNewGroup.pictures]
    }
    // 追加新页其余组
    merged.push(...newGroups.slice(1))
  } else {
    merged.push(...newGroups)
  }

  return merged
}

/**
 * 加载下一页
 */
async function loadMore() {
  if (loading.value || noMore.value) return
  loading.value = true

  try {
    const data = await getTimeline(currentPage.value, pageSize)
    if (!data || data.length === 0) {
      noMore.value = true
    } else {
      timelineGroups.value = mergeTimelineGroups(timelineGroups.value, data)
      currentPage.value++

      // 如果返回数量少于 pageSize，说明已到最后一页
      if (data.reduce((sum, g) => sum + g.pictures.length, 0) < pageSize) {
        noMore.value = true
      }
    }
  } catch (e) {
    console.error('加载照片失败:', e)
  } finally {
    loading.value = false
  }
}

/**
 * 无限滚动检测
 */
function onScroll(e) {
  const { scrollTop, scrollHeight, clientHeight } = e.target
  // 距离底部 150px 时触发加载
  if (scrollHeight - scrollTop - clientHeight < 150) {
    loadMore()
  }
}

onMounted(() => {
  loadMore()
})
</script>

<template>
  <div
    ref="containerRef"
    class="photo-page"
    @scroll="onScroll"
  >
    <!-- 空状态 -->
    <div v-if="!loading && timelineGroups.length === 0" class="empty-state">
      <el-icon :size="60"><PictureFilled /></el-icon>
      <p>还没有照片，快去上传吧</p>
    </div>

    <!-- 时间线分组 -->
    <div
      v-for="group in timelineGroups"
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
          :model-value="isDateAllSelected(group.pictures.map(p => p.pictureid))"
          @update:model-value="toggleDateGroup(group.pictures.map(p => p.pictureid))"
        />
        <span class="date-text">{{ group.date }}</span>
        <span class="date-count">{{ group.pictures.length }} 张</span>
      </div>

      <!-- 照片网格 -->
      <div class="photo-grid">
        <PhotoBox
          v-for="picture in group.pictures"
          :key="picture.pictureid"
          :picture="picture"
          :selected="isSelected(picture.pictureid)"
          :force-show-checkbox="isSelecting"
          @toggle="togglePhoto(picture.pictureid)"
        />
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <el-icon class="is-loading" :size="24"><Loading /></el-icon>
      <span>加载中...</span>
    </div>

    <!-- 没有更多 -->
    <div v-if="noMore && timelineGroups.length > 0" class="no-more">
      — 没有更多了 —
    </div>
  </div>
</template>

<style scoped>
.photo-page {
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
  gap: 16px;
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

/* ===== 加载 & 无更多 ===== */
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 24px 0;
  color: #909399;
  font-size: 14px;
}

.no-more {
  text-align: center;
  padding: 24px 0;
  color: #c0c4cc;
  font-size: 13px;
}
</style>