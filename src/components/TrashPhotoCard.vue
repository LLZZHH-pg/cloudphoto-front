<script setup>
import { computed, ref } from 'vue'
import PhotoBox from './PhotoBox.vue'

const props = defineProps({
  picture: {
    type: Object,
    required: true
    // { pictureid, previewUrl, shotTime, deleteTime }
  },
  selected: {
    type: Boolean,
    default: false
  },
  forceShowCheckbox: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['toggle'])

const hover = ref(false)

function onToggle() {
  emit('toggle', props.picture)
}

/**
 * 计算距离 30 天自动清理的剩余时间
 * @param {string} deleteTime - ISO 时间字符串
 * @returns {{ text: string, urgent: boolean }}
 */
const countdown = computed(() => {
  if (!props.picture.deleteTime) {
    return { text: '', urgent: false }
  }

  const deleteDate = new Date(props.picture.deleteTime)
  const autoCleanDate = new Date(deleteDate.getTime() + 30 * 24 * 60 * 60 * 1000)
  const now = new Date()
  const diffMs = autoCleanDate.getTime() - now.getTime()

  if (diffMs <= 0) {
    return { text: '即将清理', urgent: true }
  }

  const totalHours = diffMs / (1000 * 60 * 60)

  if (totalHours < 24) {
    const hours = Math.max(1, Math.floor(totalHours))
    return { text: `剩余 ${hours} 小时`, urgent: true }
  }

  const days = Math.floor(totalHours / 24)
  return { text: `剩余 ${days} 天`, urgent: days <= 3 }
})
</script>

<template>
  <div
    class="trash-photo-card"
    @mouseenter="hover = true"
    @mouseleave="hover = false"
  >
    <PhotoBox
      :picture="{ pictureid: picture.pictureid, previewUrl: picture.previewUrl }"
      :selected="selected"
      :force-show-checkbox="forceShowCheckbox"
      @toggle="onToggle"
    />

    <!-- 倒计时叠加层 -->
    <div
      v-if="countdown.text"
      class="countdown-overlay"
      :class="{ 'countdown-urgent': countdown.urgent }"
    >
      <span class="countdown-text">{{ countdown.text }}</span>
    </div>

    <!-- 悬浮时显示删除时间 tooltip -->
    <div v-show="hover" class="delete-time-tip">
      {{ new Date(picture.deleteTime).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }) }} 删除
    </div>
  </div>
</template>

<style scoped>
.trash-photo-card {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
}

/* 倒计时叠加层 */
.countdown-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 4px 8px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.65));
  border-radius: 0 0 6px 6px;
  z-index: 2;
  pointer-events: none;
  display: flex;
  justify-content: center;
}

.countdown-text {
  color: #fff;
  font-size: 12px;
  font-weight: 500;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

/* 紧急状态：剩余 ≤ 3 天或 ≤ 24 小时 */
.countdown-urgent .countdown-text {
  color: #f56c6c;
  font-weight: 600;
}

/* 悬浮时显示删除时间 */
.delete-time-tip {
  position: absolute;
  top: 4px;
  left: 4px;
  z-index: 3;
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 3px;
  pointer-events: none;
  white-space: nowrap;
}
</style>
