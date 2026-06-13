<script setup>
import { ref, onMounted, inject, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, Folder } from '@element-plus/icons-vue'
import { getAlbumList, deleteAlbum } from '../api/album'
import { getCategoryAllGroups } from '../api/album'
import AlbumCard from '../components/AlbumCard.vue'
import AlbumCreateEdit from '../components/AlbumCreateEdit.vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()

// ===== 数据状态 =====
const albums = ref([])
const loading = ref(true)

const refreshKey = inject('refreshKey', ref(0))

// ===== 智能影集 =====
const smartAlbums = ref([])      // [{ category, coverUrl, count }]
const smartLoading = ref(true)

async function loadSmartAlbums() {
  smartLoading.value = true
  try {
    const groups = await getCategoryAllGroups() || {}
    smartAlbums.value = Object.entries(groups).map(([category, photos]) => ({
      category,
      coverUrl: (photos && photos.length > 0) ? photos[0].previewUrl : '',
      count: Array.isArray(photos) ? photos.length : 0
    }))
  } catch {
    smartAlbums.value = []
  } finally {
    smartLoading.value = false
  }
}

function goSmartAlbum(category) {
  router.push({ name: 'smart-album', params: { category } })
}

// ===== 创建/编辑弹窗 =====
const dialogVisible = ref(false)
const editingAlbum = ref(null)   // null = 创建模式，有值 = 编辑模式

async function loadAlbums() {
  loading.value = true
  try {
    albums.value = await getAlbumList() || []
  } catch (e) {
    console.error('加载影集列表失败:', e)
    albums.value = []
  } finally {
    loading.value = false
  }
}

// ===== 打开创建弹窗 =====
function openCreate() {
  editingAlbum.value = null
  dialogVisible.value = true
}

// ===== 打开编辑弹窗 =====
function handleEdit(album) {
  editingAlbum.value = album
  dialogVisible.value = true
}

// ===== 删除影集 =====
async function handleDelete(album) {
  const hasPhotos = (album.photoCount ?? 0) > 0
  const message = hasPhotos
    ? `影集「${album.name}」中还有 ${album.photoCount} 张照片，删除后照片不会从照片库中删除。确认删除？`
    : `确认删除影集「${album.name}」？`

  try {
    await ElMessageBox.confirm(
      message,
      '删除影集',
      {
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      }
    )
  } catch {
    return
  }

  try {
    await deleteAlbum(album.id)
    ElMessage.success('影集已删除')
    loadAlbums()
  } catch (e) {
    ElMessage.error(e.message || '删除失败，请重试')
  }
}

// ===== 创建/编辑成功后刷新 =====
function onDialogSuccess() {
  loadAlbums()
}

// 监听全局刷新信号（从照片页"添加到影集"后触发）
watch(refreshKey, () => {
  loadAlbums()
  loadSmartAlbums()
})

onMounted(() => {
  loadAlbums()
  loadSmartAlbums()
})
</script>

<template>
  <div class="album-list-page">
    <!-- 空状态（智能影集和普通影集都没有时） -->
    <div v-if="!loading && !smartLoading && smartAlbums.length === 0 && albums.length === 0" class="empty-state">
      <el-icon :size="60"><Folder /></el-icon>
      <p>还没有影集，点击创建吧</p>
      <el-button type="primary" @click="openCreate">创建影集</el-button>
    </div>

    <!-- 有内容时 -->
    <template v-else>
      <!-- 智能影集区域 -->
      <div v-if="smartAlbums.length > 0" class="smart-section">
        <div class="section-header">
          <el-icon :size="18"><MagicStick /></el-icon>
          <span>智能影集</span>
          <span class="section-hint">按照片分类自动生成</span>
        </div>
        <div class="smart-album-grid">
          <div
            v-for="sa in smartAlbums"
            :key="sa.category"
            class="smart-album-card"
            @click="goSmartAlbum(sa.category)"
          >
            <div class="smart-cover-wrapper">
              <img
                v-if="sa.coverUrl"
                :src="sa.coverUrl"
                :alt="sa.category"
                class="smart-cover-img"
                loading="lazy"
              />
              <div v-else class="smart-cover-placeholder">
                <el-icon :size="36"><Picture /></el-icon>
              </div>
              <div class="smart-cover-gradient" />
              <span class="smart-category-name">{{ sa.category }}</span>
            </div>
            <span class="smart-count-badge">{{ sa.count }}张</span>
          </div>
        </div>
      </div>

      <!-- 我的影集区域 -->
      <div class="section-header">
        <el-icon :size="18"><Folder /></el-icon>
        <span>我的影集</span>
      </div>

      <!-- 影集网格 -->
      <div class="album-grid">
        <!-- 新建影集卡片 -->
        <div class="album-create-card" @click="openCreate">
          <div class="create-card-inner">
            <el-icon :size="36"><Plus /></el-icon>
            <span>新建影集</span>
          </div>
        </div>

        <!-- 影集卡片 -->
        <AlbumCard
          v-for="album in albums"
          :key="album.id"
          :album="album"
          @edit="handleEdit"
          @delete="handleDelete"
        />
      </div>
    </template>

    <!-- 加载状态 -->
    <div v-if="loading || smartLoading" class="loading-state">
      <el-icon class="is-loading" :size="24"><Loading /></el-icon>
      <span>加载中...</span>
    </div>

    <!-- 创建/编辑弹窗 -->
    <AlbumCreateEdit
      v-model="dialogVisible"
      :album="editingAlbum"
      @success="onDialogSuccess"
    />
  </div>
</template>

<style scoped>
.album-list-page {
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
  gap: 12px;
}
.empty-state p {
  margin: 0;
  font-size: 15px;
}

/* ===== 网格布局 ===== */
.album-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 10px;
}

/* ===== 新建影集卡片 ===== */
.album-create-card {
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 10px;
  border: 2px dashed #dcdfe6;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s, transform 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.album-create-card:hover {
  border-color: #409eff;
  background: rgba(64, 158, 255, 0.04);
  transform: scale(1.02);
}
.create-card-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #909399;
  transition: color 0.2s;
}
.album-create-card:hover .create-card-inner {
  color: #409eff;
}
.create-card-inner span {
  font-size: 14px;
}

/* ===== 分区标题 ===== */
.section-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 0 12px 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.section-hint {
  font-size: 12px;
  font-weight: 400;
  color: var(--el-text-color-placeholder);
  margin-left: 4px;
}

/* ===== 智能影集网格 ===== */
.smart-section {
  margin-bottom: 20px;
}

.smart-album-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 10px;
}

/* ===== 智能影集卡片 ===== */
.smart-album-card {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  background: #f5f5f5;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.smart-album-card:hover {
  transform: scale(1.03);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.smart-cover-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.smart-cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.smart-cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  color: rgba(255, 255, 255, 0.5);
}

.smart-cover-gradient {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50%;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  pointer-events: none;
  border-radius: 0 0 10px 10px;
}

.smart-category-name {
  position: absolute;
  bottom: 10px;
  left: 12px;
  right: 12px;
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  pointer-events: none;
}

.smart-count-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
  pointer-events: none;
  z-index: 2;
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
