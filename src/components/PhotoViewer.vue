<script setup>
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue'
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
const imgLoadDone = ref(false)

const collapsedSections = reactive({
  basic: false,   // 基本信息（默认展开）
  exif: true     // EXIF信息（默认关闭）
})
/** 折叠分组 */
function toggleSection(section) {
  collapsedSections[section] = !collapsedSections[section]
}

/** 翻译 EXIF 字段名，未匹配则返回原值 */
function translateExifKey(key) {
  return exifLabelMap[key] || key
}

// ===== EXIF字段名中英文对照 =====
const exifLabelMap = {
  // === 通用基础（PNG/JPEG 都有）===
  'Image Width': '图片宽度',
  'Image Height': '图片高度',
  'Bits Per Sample': '位深度',
  'Color Type': '颜色类型',
  'Compression Type': '压缩类型',
  'Interlace Method': '隔行扫描',
  'Filter Method': '滤波方式',

  // === 文件信息 ===
  'Detected File Type Name': '文件类型',
  'Detected File Type Long Name': '文件类型全称',
  'Detected MIME Type': 'MIME 类型',
  'Expected File Name Extension': '文件扩展名',

  // === 分辨率（metadata-extractor 的两种命名都覆盖）===
  'X Resolution': '水平分辨率',
  'Y Resolution': '垂直分辨率',
  'Resolution Unit': '分辨率单位',
  'Resolution Units': '分辨率单位',

  // === 色彩空间 ===
  'Color Space': '色彩空间',
  'Color space': '色彩空间',

  // === 相机 JPEG 专属 ===
  Make: '相机制造商',
  Model: '相机型号',
  Software: '软件',
  'Body Serial Number': '机身序列号',
  'Lens Model': '镜头型号',
  'Lens Serial Number': '镜头序列号',
  'Lens Specification': '镜头规格',

  // === 拍摄时间（metadata-extractor 真实 key）===
  'Date/Time Original': '原始拍摄时间',
  'Date/Time Digitized': '数字化时间',
  'Date/Time': '文件修改时间',
  'Date Created': '创建日期',
  'Time Created': '创建时间',

  // === 曝光 ===
  'Exposure Time': '曝光时间',
  'F-Number': '光圈值',
  FNumber: '光圈值',
  'Aperture Value': '光圈',
  'Max Aperture Value': '最大光圈',
  'Shutter Speed Value': '快门速度',
  'Exposure Program': '曝光程序',
  'Exposure Mode': '曝光模式',
  'Exposure Bias Value': '曝光补偿',
  'ISO Speed Ratings': 'ISO 感光度',

  // === 测光 / 对焦 / 闪光 ===
  'Metering Mode': '测光模式',
  'Focal Length': '焦距',
  Flash: '闪光灯',

  // === 白平衡 ===
  'White Balance Mode': '白平衡模式',
  WhiteBalance: '白平衡',

  // === 其他 EXIF ===
  'Scene Capture Type': '场景捕获类型',
  Contrast: '对比度',
  Saturation: '饱和度',
  Sharpness: '锐度',

  // === GPS ===
  'GPS Latitude': 'GPS 纬度',
  'GPS Longitude': 'GPS 经度',
  'GPS Altitude': 'GPS 海拔',
}

// 解析 fileExif
const exifEntries = computed(() => {
  const raw = photoDetail.value?.fileExif
  if (!raw) return []
  try {
    return Object.entries(JSON.parse(raw))
      .filter(([key]) => key in exifLabelMap)
  } catch {
    return []
  }
})


function openDetail() {
  detailVisible.value = true
}

/** 获取详情 */
async function fetchDetail() {
  const photo = currentPhoto.value
  if (!photo) {
    photoDetail.value = null
    return
  }
  // 清空旧数据
  photoDetail.value = null
  detailLoading.value = true
  imgLoadDone.value = false
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
    // 关闭时清空所有数据
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

const displayUrl = computed(() => photoDetail.value?.previewUrl || '')


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
          <div v-if="detailLoading || !imgLoadDone" class="viewer-image-loading">
            <el-icon class="is-loading" :size="36"><Loading /></el-icon>
          </div>
          <!-- 图片 -->
          <img
            v-show="displayUrl && imgLoadDone"
            :src="displayUrl"
            @load="imgLoadDone = true"
            :alt="`照片 ${currentPhoto?.pictureid}`"
            class="viewer-image"
          />
          <!-- 加载失败 -->
          <span v-if="!displayUrl && !detailLoading" class="viewer-image-error">图片加载失败</span>
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

        <!-- ========== 详细信息弹窗 ========== -->
        <el-dialog
          v-model="detailVisible"
          title="文件信息"
          width="450px"
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
              <h4 class="section-header" @click="toggleSection('basic')">
                <el-icon class="section-arrow" :class="{ collapsed: collapsedSections.basic }">
                  <ArrowRight v-if="collapsedSections.basic" />
                  <ArrowDown v-else />
                </el-icon>
                基本信息
              </h4>
              <div v-show="!collapsedSections.basic" class="section-body">
                <div class="detail-row">
                  <span class="detail-label">文件名</span>
                  <span class="detail-value">{{ photoDetail.fileName }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">拍摄时间</span>
                  <span class="detail-value">{{ photoDetail.shotTime?.replace('T', ' ') || '未知' }}</span>
                </div>
                <!-- category 字段 -->
                <div class="detail-row" v-if="photoDetail.category">
                  <span class="detail-label">分类</span>
                  <span class="detail-value">{{ photoDetail.category }}</span>
                </div>
                <div class="detail-row" v-if="photoDetail.deleteTime">
                  <span class="detail-label">删除时间</span>
                  <span class="detail-value">{{ photoDetail.deleteTime?.replace('T', ' ') || '未知' }}</span>
                </div>
              </div>
            </div>

            <!-- EXIF 信息 -->
            <div class="detail-section" v-if="exifEntries.length > 0">
              <h4 class="section-header" @click="toggleSection('exif')">
                <el-icon class="section-arrow" :class="{ collapsed: collapsedSections.exif }">
                  <ArrowRight v-if="collapsedSections.exif" />
                  <ArrowDown v-else />
                </el-icon>
                EXIF 信息
              </h4>
              <div v-show="!collapsedSections.exif" class="section-body">
                <div
                  class="detail-row"
                  v-for="[key, val] in exifEntries"
                  :key="key"
                >
                  <span class="detail-label">{{translateExifKey(key)}}</span>
                  <span class="detail-value">{{ val }}</span>
                </div>
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
  color: rgb(255, 255, 255);
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
/* 可折叠标题 */
.section-header {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  user-select: none;
  margin: 0 0 10px 0;
  padding-bottom: 6px;
  border-bottom: 1px solid #ebeef5;
  font-size: 15px;
  color: #303133;
}
.section-header:hover {
  color: #409eff;
}
.section-arrow {
  transition: transform 0.2s;
  font-size: 12px;
}
</style>