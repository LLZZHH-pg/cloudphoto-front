<script setup>
import { computed } from 'vue'
import { Download } from '@element-plus/icons-vue'
import { usePhotoSelection } from '../composables/usePhotoSelection'
import { useAlbumSelection } from '../composables/useAlbumSelection'
import { batchDownloadUrl } from '../api/photo'
import { ElMessage } from 'element-plus'

const props = defineProps({
  sourceAlbumId: { type: Number, default: -1 }
})

const photoSelection = usePhotoSelection()
const albumSelection = useAlbumSelection()

const isPhotoPage = computed(() => props.sourceAlbumId === -1)

const selectedCount = computed(() =>
  isPhotoPage.value ? photoSelection.selectedCount.value : albumSelection.selectedCount.value
)

function getSelectedPhotos() {
  return isPhotoPage.value ? photoSelection.getSelectedPhotos() : albumSelection.getSelectedPhotos()
}

async function downloadSelected() {
  if (selectedCount.value === 0) {
    ElMessage.warning('请先选择要下载的照片')
    return
  }

  const photos = getSelectedPhotos()
  const ids = photos.map(p => p.id)

  try {
    // 后端返回的是数组 ["url1", "url2", ...] — request 拦截器已解 data
    const urlList = await batchDownloadUrl(ids)

    let successCount = 0
    for (const downloadUrl of urlList) {
      try {
        const urlObj = new URL(downloadUrl)
        const filename = urlObj.searchParams.get('attname') || `photo_${Date.now()}.jpg`

        const response = await fetch(downloadUrl)
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const blob = await response.blob()
        const blobUrl = URL.createObjectURL(blob)

        const a = document.createElement('a')
        a.href = blobUrl
        a.download = filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(blobUrl)

        successCount++
      } catch {
        // 单张失败继续下一张
      }
    }

    if (successCount === urlList.length) {
      ElMessage.success(`成功下载 ${successCount} 张照片`)
    } else if (successCount > 0) {
      ElMessage.warning(`下载完成 ${successCount}/${urlList.length}，部分失败`)
    } else {
      ElMessage.error('下载失败，请重试')
    }
  } catch {
    ElMessage.error('获取下载地址失败，请重试')
  }
}
</script>

<template>
  <div class="download-btn" @click="downloadSelected">
    <el-icon :size="20">
      <Download />
    </el-icon>
  </div>
</template>

<style scoped>
.download-btn {
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
.download-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
}
</style>