<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { getPhotoDetail } from '../api/photo'
import { Close, ArrowLeft, ArrowRight, InfoFilled } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  photos: { type: Array, default: () => [] },
  initialIndex: { type: Number, default: 0 }
})

const emit = defineEmits(['update:modelValue'])

// ===== 当前索引 =====
const currentIndex = ref(0)

// ===== 当前照片 =====
const currentPhoto = computed(() => props.photos[currentIndex.value] ?? null)

// ===== 导航 =====
const hasPrev = computed(() => currentIndex.value > 0)
const hasNext = computed(() => currentIndex.value < props.photos.length - 1)

function prev() { if (hasPrev.value) currentIndex.value-- }
function next() { if (hasNext.value) currentIndex.value++ }
function close() { emit('update:modelValue', false) }

// ===== 详细信息 =====
const detailVisible = ref(false)
const photoDetail = ref(null)
const detailLoading = ref(false)

/** 统一获取详情 */
async function fetchDetail() {
  const photo = currentPhoto.value
  if (!photo) {
    photoDetail.value = null
    return
  }
  // ★ 清空旧数据，避免闪现上一张的图
  photoDetail.value = null
  detailLoading.value = true
  try {
    const data = await getPhotoDetail(photo.pictureid)
    photoDetail.value = data
  } catch (e) {
    console.error('获取照片详情失败:', e)
  } finally {
    detailLoading.value = false
  }
}

// 打开查看器
watch(() => props.modelValue, (val) => {
  if (val) {
    const oldIdx = currentIndex.value
    currentIndex.value = props.initialIndex
    detailVisible.value = false
    if (oldIdx === props.initialIndex) {
      fetchDetail()
    }
  } else {
    // ★ 关闭时清空所有数据
    photoDetail.value = null
    detailLoading.value = false
  }
})

// 切换图片
watch(currentIndex, (newIdx, oldIdx) => {
  if (props.modelValue && newIdx !== oldIdx) {
    fetchDetail()
  }
})

// ★ 只用详情接口的 URL，不降级到缩略图
const displayUrl = computed(() => photoDetail.value?.previewUrl || '')

/** 打开详细信息弹窗 */
function openDetail() {
  detailVisible.value = true
}

// 解析 fileExif
const exifEntries = computed(() => {
  const raw = photoDetail.value?.fileExif
  if (!raw) return []
  try {
    return Object.entries(JSON.parse(raw))
  } catch {
    return []
  }
})

// ===== 键盘事件 =====
function onKeydown(e) {
  if (!props.modelValue) return
  if (e.key === 'Escape') {
    if (detailVisible.value) {
      detailVisible.value = false
    } else {
      close()
    }
  }
  if (e.key === 'ArrowLeft') prev()
  if (e.key === 'ArrowRight') next()
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <!-- ========== 全屏遮罩 ========== -->
  <Teleport to="body">
    <Transition name="viewer-fade">
      <div v-if="modelValue" class="viewer-overlay" @click.self="close">
        <!-- 右上角关闭按钮 -->
        <div class="viewer-close" @click="close">
          <el-icon :size="28"><Close /></el-icon>
        </div>

        <!-- 图片区域 -->
        <div class="viewer-image-area">
          <!-- 加载中 -->
          <div v-if="detailLoading" class="viewer-image-loading">
            <el-icon class="is-loading" :size="36"><Loading /></el-icon>
          </div>
          <!-- 图片 -->
          <img
            v-else-if="displayUrl"
            :src="displayUrl"
            :alt="`照片 ${currentPhoto?.pictureid}`"
            class="viewer-image"
          />
          <!-- 加载失败 -->
          <span v-else class="viewer-image-error">图片加载失败</span>
        </div>

        <!-- 底部控制栏 -->
        <div class="viewer-controls">
          <el-button
            :icon="ArrowLeft"
            :disabled="!hasPrev"
            @click="prev"
            round
          >
            上一张
          </el-button>
          <span class="viewer-counter">
            {{ currentIndex + 1 }} / {{ photos.length }}
          </span>
          <el-button
            :icon="ArrowRight"
            :disabled="!hasNext"
            @click="next"
            round
          >
            下一张
          </el-button>
          <el-button
            :icon="InfoFilled"
            @click="openDetail"
            round
            type="info"
            plain
          >
            详细信息
          </el-button>
        </div>

        <!-- ========== 详细信息弹窗（Element Plus Dialog） ========== -->
        <el-dialog
          v-model="detailVisible"
          title="文件信息"
          width="520px"
          :close-on-click-modal="false"
          append-to-body
          destroy-on-close
        >
          <!-- 加载中 -->
          <div v-if="detailLoading" class="detail-loading">
            <el-icon class="is-loading" :size="24"><Loading /></el-icon>
            <span>加载中...</span>
          </div>

          <!-- 基本信息 -->
          <template v-else-if="photoDetail">
            <div class="detail-section">
              <h4>基本信息</h4>
              <div class="detail-row">
                <span class="detail-label">文件名</span>
                <span class="detail-value">{{ photoDetail.fileName }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">拍摄时间</span>
                <span class="detail-value">{{ photoDetail.shotTime || '未知' }}</span>
              </div>
              <div class="detail-row" v-if="photoDetail.deleteTime">
                <span class="detail-label">删除时间</span>
                <span class="detail-value">{{ photoDetail.deleteTime }}</span>
              </div>
            </div>

            <!-- EXIF 信息 -->
            <div class="detail-section" v-if="exifEntries.length > 0">
              <h4>EXIF 信息</h4>
              <div
                class="detail-row"
                v-for="[key, val] in exifEntries"
                :key="key"
              >
                <span class="detail-label">{{ key }}</span>
                <span class="detail-value">{{ val }}</span>
              </div>
            </div>
          </template>
        </el-dialog>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* ===== 全屏遮罩 ===== */
.viewer-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  background: rgba(0, 0, 0, 0.88);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* ===== 关闭按钮 ===== */
.viewer-close {
  position: absolute;
  top: 16px;
  right: 20px;
  z-index: 2010;
  color: rgba(255, 255, 255, 0.85);
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}
.viewer-close:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.15);
}

/* ===== 图片区域 ===== */
.viewer-image-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 20px 20px;
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
}
.viewer-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  user-select: none;
  -webkit-user-drag: none;
}
.viewer-image-loading {
  color: rgba(255, 255, 255, 0.5);
}
.viewer-image-error {
  color: rgba(255, 255, 255, 0.4);
  font-size: 14px;
}

/* ===== 底部控制栏 ===== */
.viewer-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 16px 20px 24px;
  flex-shrink: 0;
}
.viewer-counter {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  min-width: 80px;
  text-align: center;
  user-select: none;
}

/* ===== 过渡动画 ===== */
.viewer-fade-enter-active,
.viewer-fade-leave-active {
  transition: opacity 0.25s ease;
}
.viewer-fade-enter-from,
.viewer-fade-leave-to {
  opacity: 0;
}

/* ===== 详情面板 ===== */
.detail-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 40px 0;
  color: #999;
}
.detail-section {
  margin-bottom: 16px;
}
.detail-section h4 {
  margin: 0 0 10px 0;
  padding-bottom: 6px;
  border-bottom: 1px solid #ebeef5;
  font-size: 15px;
  color: #303133;
}
.detail-row {
  display: flex;
  align-items: flex-start;
  padding: 5px 0;
  font-size: 13px;
  line-height: 1.6;
}
.detail-label {
  flex-shrink: 0;
  width: 130px;
  color: #909399;
}
.detail-value {
  color: #303133;
  word-break: break-all;
}
</style>