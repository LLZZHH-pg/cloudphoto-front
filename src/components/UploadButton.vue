<script setup>
import { ref } from 'vue'
import { Upload } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { uploadPhotos } from '../api/photo'

const fileInput = ref(null)
const uploading = ref(false)
const emit = defineEmits(['upload-success'])

function handleClick() {
  fileInput.value?.click()
}

async function handleFileChange(e) {
  const files = e.target.files
  if (!files || files.length === 0) return

  // 常见图片格式过滤（额外保险，accept 属性已限制）
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp", "image/bmp", "image/svg+xml", "image/tiff", "image/avif"]
  const validFiles = []
  for (const file of files) {
    if (allowedTypes.includes(file.type)) {
      validFiles.push(file)
    } else {
      ElMessage.warning(`"${file.name}" 不是支持的图片格式，已跳过`)
    }
  }

  if (validFiles.length === 0) {
    ElMessage.warning('没有可上传的图片文件')
    return
  }

  uploading.value = true
  try {
    await uploadPhotos(validFiles)
    ElMessage.success(`成功上传 ${validFiles.length} 张照片`)
    emit('upload-success')
    // 重置 input 以便重复选择同一文件
    fileInput.value.value = ''
  } catch {
    ElMessage.error('上传失败，请重试')
  } finally {
    uploading.value = false
  }
}
</script>

<template>
  <div class="upload-btn" @click="handleClick">
    <el-icon :size="20">
      <Upload />
    </el-icon>
    <input
      ref="fileInput"
      type="file"
      multiple
      accept="image/*"
      style="display: none"
      @change="handleFileChange"
    />
  </div>
</template>

<style scoped>
.upload-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  cursor: pointer;
  transition: background-color 0.2s;
  color: var(--el-text-color-secondary);
}

.upload-btn:hover {
  background-color: var(--el-fill-color-light);
}

/* 暗色模式适配 */
html.dark .upload-btn {
  color: var(--el-text-color-placeholder);
}

html.dark .upload-btn:hover {
  background-color: var(--el-fill-color);
}
</style>