<script setup>
import { inject, ref } from 'vue'
import { Remove } from '@element-plus/icons-vue'
import { useAlbumSelection } from '../composables/useAlbumSelection'
import { removePhotosFromAlbum } from '../api/album'
import { ElMessage, ElMessageBox } from 'element-plus'

const { getSelectedIds, selectedCount, albumId } = useAlbumSelection()
const refreshKey = inject('refreshKey')

const removing = ref(false)

async function handleRemove() {
  if (selectedCount.value === 0) {
    ElMessage.warning('请先选择要移出的照片')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确认将选中的 ${selectedCount.value} 张照片从本影集移出？照片仍保留在照片库中。`,
      '移出影集',
      {
        confirmButtonText: '确认移出',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
  } catch {
    return
  }

  removing.value = true
  try {
    const ids = getSelectedIds()
    await removePhotosFromAlbum({
      sourceAlbumId: albumId.value,
      albumId: albumId.value,
      photoIds: ids
    })
    ElMessage.success(`已将 ${ids.length} 张照片移出影集`)
    refreshKey.value++
  } catch (e) {
    ElMessage.error(e.message || '移出失败，请重试')
  } finally {
    removing.value = false
  }
}
</script>

<template>
  <div class="remove-from-album-btn" @click="handleRemove">
    <el-icon :size="20" :class="{ 'is-loading': removing }">
      <Remove />
    </el-icon>
  </div>
</template>

<style scoped>
.remove-from-album-btn {
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
.remove-from-album-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
}
</style>
