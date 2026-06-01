<script setup>
import { ref, onMounted, inject, watch } from 'vue'
import { Plus, Folder } from '@element-plus/icons-vue'
import { getAlbumList, deleteAlbum } from '../api/album'
import AlbumCard from '../components/AlbumCard.vue'
import AlbumCreateEdit from '../components/AlbumCreateEdit.vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// ===== 数据状态 =====
const albums = ref([])
const loading = ref(true)

const refreshKey = inject('refreshKey', ref(0))

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
})

onMounted(() => {
  loadAlbums()
})
</script>

<template>
  <div class="album-list-page">
    <!-- 空状态 -->
    <div v-if="!loading && albums.length === 0" class="empty-state">
      <el-icon :size="60"><Folder /></el-icon>
      <p>还没有影集，点击创建吧</p>
      <el-button type="primary" @click="openCreate">创建影集</el-button>
    </div>

    <!-- 影集网格 -->
    <div v-else class="album-grid">
      <!-- 新建影集卡片（永远在第一位） -->
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

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
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
