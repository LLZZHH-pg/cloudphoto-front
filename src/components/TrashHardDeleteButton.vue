<script setup>
import { inject, ref } from 'vue'
import { Delete } from '@element-plus/icons-vue'
import { useTrashSelection } from '../composables/useTrashSelection'
import { cleanTrash } from '../api/recycle'
import { ElMessage, ElMessageBox } from 'element-plus'

const { getSelectedIds, selectedCount } = useTrashSelection()
const refreshKey = inject('refreshKey')

const deleting = ref(false)

async function handleHardDelete() {
  if (selectedCount.value === 0) {
    ElMessage.warning('请先选择要删除的照片')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要彻底删除选中的 ${selectedCount.value} 张照片吗？此操作不可撤销。`,
      '彻底删除',
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

  deleting.value = true
  try {
    const ids = getSelectedIds()
    await cleanTrash(ids)
    ElMessage.success(`已彻底删除 ${ids.length} 张照片`)
    refreshKey.value++
  } catch (e) {
    ElMessage.error(e.message || '删除失败，请重试')
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <div class="trash-hard-delete-btn" @click="handleHardDelete">
    <el-icon :size="20" :class="{ 'is-loading': deleting }">
      <Delete />
    </el-icon>
  </div>
</template>

<style scoped>
.trash-hard-delete-btn {
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
.trash-hard-delete-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
}
</style>
