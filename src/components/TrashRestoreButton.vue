<script setup>
import { inject, ref } from 'vue'
import { RefreshLeft } from '@element-plus/icons-vue'
import { useTrashSelection } from '../composables/useTrashSelection'
import { restoreTrash } from '../api/recycle'
import { ElMessage, ElMessageBox } from 'element-plus'

const { getSelectedIds, selectedCount } = useTrashSelection()
const refreshKey = inject('refreshKey')

const restoring = ref(false)

async function handleRestore() {
  if (selectedCount.value === 0) {
    ElMessage.warning('请先选择要恢复的照片')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确认恢复选中的 ${selectedCount.value} 张照片？恢复后将回到照片列表。`,
      '撤回删除',
      {
        confirmButtonText: '确认恢复',
        cancelButtonText: '取消',
        type: 'info'
      }
    )
  } catch {
    return
  }

  restoring.value = true
  try {
    const ids = getSelectedIds()
    await restoreTrash(ids)
    ElMessage.success(`成功恢复 ${ids.length} 张照片`)
    refreshKey.value++
  } catch (e) {
    ElMessage.error(e.message || '恢复失败，请重试')
  } finally {
    restoring.value = false
  }
}
</script>

<template>
  <div class="trash-restore-btn" @click="handleRestore">
    <el-icon :size="20" :class="{ 'is-loading': restoring }">
      <RefreshLeft />
    </el-icon>
  </div>
</template>

<style scoped>
.trash-restore-btn {
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
.trash-restore-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
}
</style>
