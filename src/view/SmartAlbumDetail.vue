<script setup>
import { ref, computed, onMounted, watch, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, PictureFilled, VideoPlay } from '@element-plus/icons-vue'
import { getCategoryAllGroups } from '../api/photo'
import { usePhotoSelection } from '../composables/usePhotoSelection'
import PhotoBox from '../components/PhotoBox.vue'
import PhotoSlideshow from '../components/PhotoSlideshow.vue'
import CheckBox from '../components/CheckBox.vue'

const route = useRoute()
const router = useRouter()

const {
  isSelecting,
  togglePhoto,
  toggleDateGroup,
  isSelected,
  isDateAllSelected
} = usePhotoSelection()

const refreshKey = inject('refreshKey', ref(0))

const category = ref('')
const photos = ref([])
const dateGroups = ref([])
const loading = ref(true)
const hoveredDate = ref(null)

const slideshowVisible = ref(false)
const slideshowIndex = ref(0)

function groupByDate(photoList) {
  if (!photoList || photoList.length === 0) return []

  function formatDate(dateStr) {
    const d = new Date(dateStr)
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  }

  const grouped = {}
  for (const photo of photoList) {
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

async function loadPhotos() {
  const cat = route.params.category
  if (!cat) return

  category.value = decodeURIComponent(cat)
  loading.value = true

  try {
    const groups = await getCategoryAllGroups() || {}
    photos.value = groups[category.value] || []
    dateGroups.value = groupByDate(photos.value)
  } catch (e) {
    console.error('加载智能影集失败:', e)
    photos.value = []
    dateGroups.value = []
  } finally {
    loading.value = false
  }
}

const allPhotos = computed(() => photos.value)

function openSlideshow(pictureid) {
  const idx = allPhotos.value.findIndex(p => p.pictureid === pictureid)
  if (idx !== -1) {
    slideshowIndex.value = idx
    slideshowVisible.value = true
  }
}

function startSlideshow() {
  slideshowIndex.value = 0
  slideshowVisible.value = true
}

function goBack() {
  router.push({ name: 'album' })
}

watch(() => route.params.category, () => {
  loadPhotos()
})

watch(refreshKey, () => {
  loadPhotos()
})

onMounted(() => {
  loadPhotos()
})
</script>

<template>
  <div class="smart-detail-page">
    <!-- 加载中 -->
    <div v-if="loading" class="loading-state">
      <el-icon class="is-loading" :size="24"><Loading /></el-icon>
      <span>加载中...</span>
    </div>

    <template v-else>
      <!-- 顶部导航栏 -->
      <div class="detail-topbar">
        <div class="topbar-left">
          <el-button
            :icon="ArrowLeft"
            link
            class="back-btn"
            @click="goBack"
          />
          <span class="topbar-title">{{ category }}</span>
          <span class="topbar-count">{{ photos.length }} 张</span>
        </div>
        <div class="topbar-right">
          <el-button
            v-if="photos.length > 0"
            :icon="VideoPlay"
            link
            class="slideshow-btn"
            @click="startSlideshow"
          />
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="photos.length === 0" class="empty-state">
        <el-icon :size="60"><PictureFilled /></el-icon>
        <p>该分类下暂无照片</p>
      </div>

      <!-- 照片网格 -->
      <div v-else class="detail-photos">
        <div
          v-for="group in dateGroups"
          :key="group.date"
          class="date-group"
        >
          <div
            class="date-divider"
            @mouseenter="hoveredDate = group.date"
            @mouseleave="hoveredDate = null"
          >
            <CheckBox
              v-show="hoveredDate === group.date || isSelecting"
              class="date-checkbox"
              :model-value="isDateAllSelected(group.pictures.map(p => ({ id: p.pictureid, previewUrl: p.previewUrl })))"
              @update:model-value="toggleDateGroup(group.pictures.map(p => ({ id: p.pictureid, previewUrl: p.previewUrl })))"
            />
            <span class="date-text">{{ group.date }}</span>
            <span class="date-count">{{ group.pictures.length }} 张</span>
          </div>

          <div class="photo-grid">
            <PhotoBox
              v-for="picture in group.pictures"
              :key="picture.pictureid"
              :picture="picture"
              :selected="isSelected(picture.pictureid)"
              :force-show-checkbox="isSelecting"
              @toggle="togglePhoto({ id: picture.pictureid, previewUrl: picture.previewUrl })"
              @preview="openSlideshow"
            />
          </div>
        </div>
      </div>

      <PhotoSlideshow
        v-model="slideshowVisible"
        :photos="allPhotos"
        :initial-index="slideshowIndex"
      />
    </template>
  </div>
</template>

<style scoped>
.smart-detail-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ===== 顶部导航栏 ===== */
.detail-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  border-bottom: 1px solid var(--el-border-color-light, #ebeef5);
  flex-shrink: 0;
  background: var(--el-bg-color, #fff);
}
.topbar-left {
  display: flex;
  align-items: center;
  gap: 8px;
}
.topbar-right {
  display: flex;
  align-items: center;
  gap: 4px;
}
.back-btn {
  font-size: 20px;
  color: var(--el-text-color-regular);
  padding: 4px;
}
.topbar-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}
.topbar-count {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}
.slideshow-btn {
  font-size: 20px;
  color: var(--el-text-color-regular);
}

/* ===== 照片区域 ===== */
.detail-photos {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
  box-sizing: border-box;
}

/* ===== 日期组 ===== */
.date-group {
  margin-bottom: 28px;
}

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
  color: var(--el-text-color-primary);
}
.date-count {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

/* ===== 照片网格 ===== */
.photo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 10px;
}

/* ===== 空状态 ===== */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 50vh;
  color: #999;
  gap: 12px;
}
.empty-state p {
  margin: 0;
  font-size: 15px;
}

/* ===== 加载状态 ===== */
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 40px 0;
  color: #909399;
  font-size: 14px;
}
</style>
