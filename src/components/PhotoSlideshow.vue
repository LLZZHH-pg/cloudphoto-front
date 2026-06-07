<script setup>
import { ref, computed, watch, onMounted, onUnmounted, reactive } from 'vue'
import { Close, ArrowLeft, ArrowRight, VideoPlay, VideoPause, Refresh } from '@element-plus/icons-vue'
import { getPhotoDetail } from '../api/photo'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  photos: { type: Array, default: () => [] },
  initialIndex: { type: Number, default: 0 }
})

const emit = defineEmits(['update:modelValue'])

const currentIndex = ref(0)
const isPlaying = ref(false)
const intervalSeconds = ref(3)
const imgLoading = ref(true)
const currentUrl = ref('')
const controlsVisible = ref(true)
let timer = null
let hideTimer = null

const detailCache = reactive({})

const currentPhoto = computed(() => props.photos[currentIndex.value] ?? null)
const hasPrev = computed(() => currentIndex.value > 0)
const hasNext = computed(() => currentIndex.value < props.photos.length - 1)
const intervalOptions = [3, 5, 10]

function showControls() {
  controlsVisible.value = true
  clearTimeout(hideTimer)
  if (isPlaying.value) {
    hideTimer = setTimeout(() => {
      controlsVisible.value = false
    }, 4000)
  }
}

function onMouseMove() {
  showControls()
}

async function loadPhotoUrl(photo) {
  if (!photo) return
  imgLoading.value = true
  const id = photo.pictureid
  if (detailCache[id]) {
    currentUrl.value = detailCache[id]
    imgLoading.value = false
    return
  }
  try {
    const detail = await getPhotoDetail(id)
    const url = detail?.previewUrl || photo.previewUrl || ''
    detailCache[id] = url
    currentUrl.value = url
  } catch {
    currentUrl.value = photo.previewUrl || ''
  }
  imgLoading.value = false
}

async function prefetchNext(n = 3) {
  for (let i = 1; i <= n; i++) {
    const idx = currentIndex.value + i
    if (idx >= props.photos.length) break
    const photo = props.photos[idx]
    if (photo && !detailCache[photo.pictureid]) {
      try {
        const detail = await getPhotoDetail(photo.pictureid)
        detailCache[photo.pictureid] = detail?.previewUrl || photo.previewUrl
      } catch { /* ignore */ }
    }
  }
}

function clearTimer() {
  if (timer) { clearInterval(timer); timer = null }
}

function startTimer() {
  clearTimer()
  timer = setInterval(() => {
    if (hasNext.value) {
      currentIndex.value++
    } else {
      pause()
    }
  }, intervalSeconds.value * 1000)
}

function play() {
  if (isPlaying.value || props.photos.length <= 1) return
  isPlaying.value = true
  if (currentIndex.value >= props.photos.length - 1) {
    currentIndex.value = 0
  }
  startTimer()
  hideTimer = setTimeout(() => { controlsVisible.value = false }, 4000)
}

function pause() {
  isPlaying.value = false
  clearTimer()
  controlsVisible.value = true
  clearTimeout(hideTimer)
}

function togglePlay() {
  isPlaying.value ? pause() : play()
}

function prev() {
  if (hasPrev.value) {
    currentIndex.value--
    if (isPlaying.value) startTimer()
    showControls()
  }
}

function next() {
  if (hasNext.value) {
    currentIndex.value++
    if (isPlaying.value) startTimer()
    showControls()
  }
}

function replay() {
  currentIndex.value = 0
  play()
}

function setIntervalSeconds(n) {
  intervalSeconds.value = n
  if (isPlaying.value) startTimer()
  showControls()
}

function close() {
  pause()
  emit('update:modelValue', false)
}

watch(() => props.modelValue, (val) => {
  if (val) {
    currentIndex.value = props.initialIndex
    controlsVisible.value = true
    play()
  } else {
    pause()
    controlsVisible.value = true
  }
})

watch(currentIndex, async () => {
  await loadPhotoUrl(currentPhoto.value)
  prefetchNext(3)
})

function onKeydown(e) {
  if (!props.modelValue) return
  if (e.key === 'Escape') close()
  if (e.key === 'ArrowLeft') prev()
  if (e.key === 'ArrowRight') next()
  if (e.key === ' ') { e.preventDefault(); togglePlay() }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  clearTimer()
  clearTimeout(hideTimer)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="slideshow-fade">
      <div
        v-if="modelValue"
        class="slideshow-overlay"
        @mousemove="onMouseMove"
      >
        <!-- 顶部栏 -->
        <div class="slideshow-topbar" :class="{ hidden: !controlsVisible }">
          <span class="slideshow-counter">{{ currentIndex + 1 }} / {{ photos.length }}</span>
          <div class="topbar-right">
            <div class="interval-group">
              <button
                v-for="n in intervalOptions"
                :key="n"
                class="interval-chip"
                :class="{ active: intervalSeconds === n }"
                @click="setIntervalSeconds(n)"
              >{{ n }}s</button>
            </div>
            <div class="slideshow-close" @click="close">
              <el-icon :size="22"><Close /></el-icon>
            </div>
          </div>
        </div>

        <!-- 图片区域 -->
        <div class="slideshow-image-area" @click="togglePlay">
          <div v-if="imgLoading" class="slideshow-loading">
            <el-icon class="is-loading" :size="36"><Loading /></el-icon>
          </div>
          <img
            v-show="!imgLoading && currentUrl"
            :src="currentUrl"
            class="slideshow-image"
          />
        </div>

        <!-- 左右箭头 -->
        <button
          class="side-arrow left-arrow"
          :class="{ hidden: !controlsVisible || !hasPrev }"
          :disabled="!hasPrev"
          @click="prev"
        >
          <el-icon :size="32"><ArrowLeft /></el-icon>
        </button>
        <button
          class="side-arrow right-arrow"
          :class="{ hidden: !controlsVisible || !hasNext }"
          :disabled="!hasNext"
          @click="next"
        >
          <el-icon :size="32"><ArrowRight /></el-icon>
        </button>

        <!-- 底部控制栏 -->
        <div class="slideshow-controls" :class="{ hidden: !controlsVisible }">
          <button class="ctrl-btn" @click="replay" title="重播">
            <el-icon :size="18"><Refresh /></el-icon>
          </button>
          <button class="ctrl-btn" :disabled="!hasPrev" @click="prev" title="上一张">
            <el-icon :size="20"><ArrowLeft /></el-icon>
          </button>
          <button class="ctrl-btn play-pause-btn" @click="togglePlay" title="播放/暂停">
            <el-icon :size="28">
              <VideoPause v-if="isPlaying" />
              <VideoPlay v-else />
            </el-icon>
          </button>
          <button class="ctrl-btn" :disabled="!hasNext" @click="next" title="下一张">
            <el-icon :size="20"><ArrowRight /></el-icon>
          </button>
          <div class="ctrl-spacer" />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.slideshow-overlay {
  position: fixed;
  inset: 0;
  z-index: 3000;
  background: #000;
  user-select: none;
  -webkit-user-select: none;
}

/* ===== 顶部栏 ===== */
.slideshow-topbar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  z-index: 10;
  background: linear-gradient(rgba(0,0,0,0.5), transparent);
  transition: opacity 0.3s;
}
.slideshow-topbar.hidden {
  opacity: 0;
  pointer-events: none;
}
.slideshow-counter {
  color: rgba(255, 255, 255, 0.8);
  font-size: 13px;
  font-weight: 500;
}
.topbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.interval-group {
  display: flex;
  gap: 2px;
  background: rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  padding: 2px;
}
.interval-chip {
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
}
.interval-chip:hover {
  color: rgba(255, 255, 255, 0.9);
}
.interval-chip.active {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
}

.slideshow-close {
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.15s;
}
.slideshow-close:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.15);
}

/* ===== 图片区域 ===== */
.slideshow-image-area {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 80px 70px;
  cursor: pointer;
}
.slideshow-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  -webkit-user-drag: none;
}
.slideshow-loading {
  color: rgba(255, 255, 255, 0.4);
}

/* ===== 左右箭头 ===== */
.side-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  backdrop-filter: blur(4px);
}
.side-arrow:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.25);
  color: #fff;
}
.side-arrow:disabled {
  opacity: 0;
  pointer-events: none;
}
.side-arrow.hidden {
  opacity: 0;
  pointer-events: none;
}
.left-arrow { left: 16px; }
.right-arrow { right: 16px; }

/* ===== 底部控制栏 ===== */
.slideshow-controls {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px 24px 20px;
  z-index: 10;
  background: linear-gradient(transparent, rgba(0,0,0,0.5));
  transition: opacity 0.3s;
}
.slideshow-controls.hidden {
  opacity: 0;
  pointer-events: none;
}

.ctrl-btn {
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s;
  backdrop-filter: blur(4px);
}
.ctrl-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.25);
  color: #fff;
}
.ctrl-btn:disabled {
  opacity: 0.25;
  pointer-events: none;
}
.play-pause-btn {
  width: 52px;
  height: 52px;
  background: rgba(255, 255, 255, 0.2);
}
.play-pause-btn:hover {
  background: rgba(255, 255, 255, 0.35) !important;
}
.ctrl-spacer {
  width: 40px;
}

/* ===== 过渡动画 ===== */
.slideshow-fade-enter-active,
.slideshow-fade-leave-active {
  transition: opacity 0.3s ease;
}
.slideshow-fade-enter-from,
.slideshow-fade-leave-to {
  opacity: 0;
}
</style>
