<script setup>
import { computed, ref } from 'vue'
import { FolderAdd } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { usePhotoSelection } from '../composables/usePhotoSelection'
import { useAlbumSelection } from '../composables/useAlbumSelection'
import {
  getAlbumList,
  addPhotosToAlbum,
  movePhotosToAlbum,
  copyPhotosToAlbum
} from '../api/album'

// ===== Props =====
const props = defineProps({
  /**
   * 源影集 ID
   * - 照片页使用时传 -1（或不传，默认值）
   * - 影集页使用时传当前打开的影集 ID
   */
  sourceAlbumId: {
    type: Number,
    default: -1
  }
})

const emit = defineEmits(['success'])

// ===== 选择状态（根据 context 自动选用正确的 composable） =====
const photoSelection = usePhotoSelection()
const albumSelection = useAlbumSelection()

const isPhotoPage = computed(() => props.sourceAlbumId === -1)

const selectedCount = computed(() =>
  isPhotoPage.value ? photoSelection.selectedCount.value : albumSelection.selectedCount.value
)

function getSelectedIds() {
  return isPhotoPage.value ? photoSelection.getSelectedIds() : albumSelection.getSelectedIds()
}

// ===== 影集列表 =====
const albumList = ref([])
const loadingAlbums = ref(false)

// ===== 下拉可见状态 =====
const dropdownVisible = ref(false)

// ===== 移动/复制 弹窗状态（仅影集页使用） =====
const actionDialogVisible = ref(false)
const targetAlbum = ref(null)

// ===== 获取影集列表 =====
async function fetchAlbums() {
  loadingAlbums.value = true
  try {
    const data = await getAlbumList()
    if (props.sourceAlbumId !== -1) {
      // 影集页：排除当前影集
      albumList.value = (data || []).filter(a => a.id !== props.sourceAlbumId)
    } else {
      // 照片页：不过滤
      albumList.value = data || []
    }
  } catch {
    ElMessage.error('获取影集列表失败')
  } finally {
    loadingAlbums.value = false
  }
}

// ===== 下拉显示/隐藏 =====
function handleDropdownVisibleChange(visible) {
  dropdownVisible.value = visible
  if (visible) fetchAlbums()
}

// ===== 点击某个影集 =====
function handleAlbumClick(album) {
  // 校验选中照片
  if (selectedCount.value === 0) {
    ElMessage.warning('请先选择照片')
    return
  }
  // 不能选自己
  if (props.sourceAlbumId === album.id) {
    ElMessage.warning('目标影集与当前影集相同')
    return
  }

  if (props.sourceAlbumId === -1) {
    // ── 照片页模式：直接添加 ──
    doAddPhotos(album.id)
  } else {
    // ── 影集页模式：弹出移动/复制选择 ──
    targetAlbum.value = album
    actionDialogVisible.value = true
  }
}

// ===== 添加照片 =====
async function doAddPhotos(albumId) {
  const photoIds = getSelectedIds()
  try {
    await addPhotosToAlbum({
      sourceAlbumId: props.sourceAlbumId,
      albumId,
      photoIds
    })
    ElMessage.success(`已将 ${photoIds.length} 张照片添加到影集`)
    emit('success')
  } catch {
    ElMessage.error('操作失败，请重试')
  }
}

// ===== 移动照片 =====
async function handleMove() {
  const albumId = targetAlbum.value.id
  const photoIds = getSelectedIds()
  try {
    await movePhotosToAlbum({
      sourceAlbumId: props.sourceAlbumId,
      albumId,
      photoIds
    })
    ElMessage.success(`已将 ${photoIds.length} 张照片移动到影集「${targetAlbum.value.name}」`)
    actionDialogVisible.value = false
    targetAlbum.value = null
    emit('success')
  } catch {
    ElMessage.error('移动失败，请重试')
  }
}

// ===== 复制照片 =====
async function handleCopy() {
  const albumId = targetAlbum.value.id
  const photoIds = getSelectedIds()
  try {
    await copyPhotosToAlbum({
      sourceAlbumId: props.sourceAlbumId,
      albumId,
      photoIds
    })
    ElMessage.success(`已将 ${photoIds.length} 张照片复制到影集「${targetAlbum.value.name}」`)
    actionDialogVisible.value = false
    targetAlbum.value = null
    emit('success')
  } catch {
    ElMessage.error('复制失败，请重试')
  }
}
</script>

<template>
  <!-- ===== 下拉按钮 ===== -->
  <el-dropdown
    trigger="click"
    :hide-on-click="false"
    @visible-change="handleDropdownVisibleChange"
  >
    <div class="add-to-album-btn">
      <el-icon :size="20">
        <FolderAdd />
      </el-icon>
    </div>

    <template #dropdown>
      <el-dropdown-menu>
        <!-- 加载中 -->
        <div v-if="loadingAlbums" class="dropdown-loading">
          <el-icon class="is-loading" :size="16"><Loading /></el-icon>
          <span>加载中...</span>
        </div>

        <!-- 空列表 -->
        <div v-else-if="albumList.length === 0" class="dropdown-empty">
          暂无影集
        </div>

        <!-- 影集列表 -->
        <el-dropdown-item
          v-for="album in albumList"
          :key="album.id"
          :disabled="album.id === sourceAlbumId"
          @click="handleAlbumClick(album)"
        >
          {{ album.name }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>

  <!-- ===== 移动/复制弹窗（仅影集页） ===== -->
  <el-dialog
    v-model="actionDialogVisible"
    title="选择操作"
    width="360px"
    :close-on-click-modal="false"
  >
    <div class="dialog-body">
      <p>
        将选中的 <strong>{{ selectedCount }}</strong> 张照片添加到影集
        <strong>「{{ targetAlbum?.name }}」</strong>
      </p>
    </div>

    <template #footer>
      <el-button @click="actionDialogVisible = false">取消</el-button>
      <el-button type="warning" @click="handleMove">
        移动（从当前影集移除）
      </el-button>
      <el-button type="primary" @click="handleCopy">
        复制（保留在当前影集）
      </el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
/* ── 按钮样式，与 DownloadButton / SoftDeleteButton 一致 ── */
.add-to-album-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  cursor: pointer;
  transition: background-color 0.2s;
  color: #fff;
}

.add-to-album-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

/* ── 下拉加载/空状态 ── */
.dropdown-loading,
.dropdown-empty {
  padding: 12px 16px;
  color: #999;
  font-size: 13px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

/* ── 弹窗内容 ── */
.dialog-body {
  font-size: 14px;
  line-height: 1.6;
}
</style>