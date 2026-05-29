<script setup>
import { inject } from 'vue'
import { Delete } from '@element-plus/icons-vue'
import { usePhotoSelection } from '../composables/usePhotoSelection'
import { softDeletePhotos } from '../api/photo'
import { ElMessage, ElMessageBox } from 'element-plus'

const { getSelectedIds, selectedCount } = usePhotoSelection()
const refreshKey = inject('refreshKey') 

async function handleSoftDelete() {
  if (selectedCount.value === 0) {
    ElMessage.warning('请先选择要删除的照片')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedCount.value} 张照片吗？删除后可在回收站恢复。`,
      '确认删除',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
  } catch {
    return
  }

  const ids = getSelectedIds()

  try {
    await softDeletePhotos(ids)
    ElMessage.success(`已成功删除 ${ids.length} 张照片`)
    refreshKey.value++ 
  } catch {
    ElMessage.error('删除失败，请重试')
  }
}
</script>

<template>
  <div class="soft-delete-btn" @click="handleSoftDelete">
    <el-icon :size="20">
      <Delete />
    </el-icon>
  </div>
</template>

<style scoped>
.soft-delete-btn {
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
.soft-delete-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
}
</style>