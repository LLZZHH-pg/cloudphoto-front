<script setup>
defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

defineEmits(['update:modelValue'])
</script>

<template>
  <div
    class="check-box"
    :class="{ 'is-checked': modelValue }"
    @click.stop="$emit('update:modelValue', !modelValue)"
  >
    <svg v-if="modelValue" class="check-icon" viewBox="0 0 24 24" fill="currentColor">
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
    </svg>
  </div>
</template>

<style scoped>
.check-box {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.9);
  background: rgba(0, 0, 0, 0.35);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.check-box:hover {
  border-color: #fff;
  background: rgba(0, 0, 0, 0.5);
}

.check-box.is-checked {
  background: #409eff;
  border-color: #409eff;
}

.check-icon {
  width: 14px;
  height: 14px;
  color: #fff;
}
</style>