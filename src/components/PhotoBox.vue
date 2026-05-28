<script setup>
import { ref } from 'vue'
import CheckBox from './CheckBox.vue'

const props = defineProps({
  picture: {
    type: Object,
    required: true
  },
  selected: {
    type: Boolean,
    default: false
  },
  // 选择模式下强制显示复选框（不依赖 hover）
  forceShowCheckbox: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['toggle', 'preview'])

const hover = ref(false)

function onToggle() {
  emit('toggle', props.picture.pictureid)
}

function onClickPhoto() {
  emit('preview', props.picture.pictureid)
}
</script>

<template>
  <div
    class="photo-box"
    @mouseenter="hover = true"
    @mouseleave="hover = false"
    @click="onClickPhoto" 
  >
    <img
      :src="picture.previewUrl"
      :alt="`照片 ${picture.pictureid}`"
      class="photo-img"
      loading="lazy"
    />

    <!-- 复选框覆盖层：hover 或选择模式下显示 -->
    <div
      v-show="hover || forceShowCheckbox"
      class="photo-check-overlay"
      @click.stop 
    >
      <CheckBox
        :model-value="selected"
        @update:model-value="onToggle"
      />
    </div>

    <!-- 选中时的边框高亮 -->
    <div v-if="selected" class="photo-selected-border" />
  </div>
</template>

<style scoped>
.photo-box {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  border-radius: 6px;
  cursor: pointer;
  background: #f0f0f0;
  transition: transform 0.15s ease;
}

.photo-box:hover {
  transform: scale(1.02);
}

.photo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* 复选框覆盖层 */
.photo-check-overlay {
  position: absolute;
  top: 6px;
  right: 6px;
  z-index: 2;
}

/* 选中状态边框 */
.photo-selected-border {
  position: absolute;
  inset: 0;
  border: 3px solid #409eff;
  border-radius: 6px;
  pointer-events: none;
  z-index: 1;
}
</style>