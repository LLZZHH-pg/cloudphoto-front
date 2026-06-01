<script setup>
import { ref, computed, onMounted, inject, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Edit, WarningFilled, PictureFilled } from '@element-plus/icons-vue'
import { getAlbumDetail } from '../api/album'
import { useAlbumSelection } from '../composables/useAlbumSelection'
import PhotoBox from '../components/PhotoBox.vue'
import PhotoViewer from '../components/PhotoViewer.vue'
import CheckBox from '../components/CheckBox.vue'
import AlbumCreateEdit from '../components/AlbumCreateEdit.vue'

const route = useRoute()
const router = useRouter()

// ===== 选择状态（影集详情页专用） =====
const {
  setAlbumId,
  isSelecting,
  togglePhoto,
  toggleDateGroup,
  isSelected,
  isDateAllSelected
} = useAlbumSelection()

// ===== 数据状态 =====
const album = ref(null)        // { id, name, description, coverUrl, photoCount, ... }
const photos = ref([])         // 所有照片
const dateGroups = ref([])     // 按日期分组
const loading = ref(true)
const notFound = ref(false)
const hoveredDate = ref(null)

const refreshKey = inject('refreshKey', ref(0))

// ===== 编辑弹窗 =====
const editDialogVisible = ref(false)

// ===== 预览器 =====
const viewerVisible = ref(false)
const viewerIndex = ref(0)

/**
 * 按 shotTime 分组
 */
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

/**
 * 加载影集详情
 */
async function loadDetail() {
  loading.value = true
  notFound.value = false

  const id = Number(route.params.id)
  if (!id || isNaN(id)) {
    notFound.value = true
    loading.value = false
    return
  }

  try {
    const data = await getAlbumDetail(id)
    album.value = data
    photos.value = data.photos || []
    dateGroups.value = groupByDate(photos.value)
    setAlbumId(id)
  } catch (e) {
    console.error('加载影集详情失败:', e)
    // 404 等错误 → 显示"影集不存在"
    if (e.message?.includes('404') || e.message?.includes('不存在')) {
      notFound.value = true
    } else {
      notFound.value = true  // 通用错误也显示不存在
    }
  } finally {
    loading.value = false
  }
}

/** 将所有照片展平为一个数组，供 PhotoViewer 翻页 */
const allPhotos = computed(() => photos.value)

/** 点击 PhotoBox 非复选框区域 → 打开预览器 */
function openViewer(pictureid) {
  const idx = allPhotos.value.findIndex(p => p.pictureid === pictureid)
  if (idx !== -1) {
    viewerIndex.value = idx
    viewerVisible.value = true
  }
}

/** 返回影集列表 */
function goBack() {
  router.push({ name: 'album' })
}

/** 编辑成功后刷新 */
function onEditSuccess() {
  loadDetail()
}

// 路由参数变化时重新加载
watch(() => route.params.id, () => {
  loadDetail()
})

// 监听全局刷新信号（移动/复制/移出等操作触发）
watch(refreshKey, () => {
  loadDetail()
})

onMounted(() => {
  loadDetail()
})
</script>

<template>
  <div class="album-detail-page">
    <!-- ===== 加载中 ===== -->
    <div v-if="loading" class="loading-state">
      <el-icon class="is-loading" :size="24"><Loading /></el-icon>
      <span>加载中...</span>
    </div>

    <!-- ===== 影集不存在 ===== -->
    <div v-else-if="notFound" class="not-found-state">
      <el-icon :size="60"><WarningFilled /></el-icon>
      <p>影集不存在</p>
      <p class="not-found-hint">可能已被删除或链接无效</p>
      <el-button @click="goBack">返回影集列表</el-button>
    </div>

    <!-- ===== 正常内容 ===== -->
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
          <span class="topbar-title">{{ album?.name }}</span>
          <span v-if="album" class="topbar-count">{{ album.photoCount ?? photos.length }} 张</span>
        </div>
        <div class="topbar-right">
          <el-button
            :icon="Edit"
            link
            class="edit-btn"
            @click="editDialogVisible = true"
          />
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="photos.length === 0" class="empty-state">
        <el-icon :size="60"><PictureFilled /></el-icon>
        <p>影集还是空的，去添加照片吧</p>
        <el-button type="primary" @click="router.push({ name: 'photo' })">
          去添加
        </el-button>
      </div>

      <!-- 照片时间线 / 网格 -->
      <div v-else class="detail-photos" @scroll.passive>
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
              :model-value="isDateAllSelected(group.pictures.map(p => ({ id: p.pictureid, previewUrl: p.previewUrl })))"
              @update:model-value="toggleDateGroup(group.pictures.map(p => ({ id: p.pictureid, previewUrl: p.previewUrl })))"
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
              @toggle="togglePhoto({ id: picture.pictureid, previewUrl: picture.previewUrl })"
              @preview="openViewer"
            />
          </div>
        </div>
      </div>

      <!-- 照片预览器（复用） -->
      <PhotoViewer
        v-model="viewerVisible"
        :photos="allPhotos"
        :initial-index="viewerIndex"
      />

      <!-- 编辑影集弹窗（复用） -->
      <AlbumCreateEdit
        v-model="editDialogVisible"
        :album="album"
        @success="onEditSuccess"
      />
    </template>
  </div>
</template>

<style scoped>
.album-detail-page {
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
.edit-btn {
  font-size: 18px;
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

/* ===== 照片网格（与照片页一致） ===== */
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

/* ===== 影集不存在 ===== */
.not-found-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh;
  color: #999;
  gap: 12px;
}
.not-found-state p {
  margin: 0;
  font-size: 15px;
}
.not-found-hint {
  font-size: 13px !important;
  color: #c0c4cc;
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
