<script setup>
import { useHeaderBase } from '../composables/useHeaderBase'
import { Close } from '@element-plus/icons-vue'
const { isVisible, hide } = useHeaderBase()
</script>

<template>
  <!-- v-show + isVisible 控制显示/隐藏 -->
  <div v-show="isVisible" class="header-base">
    <div class="header-base-left">
      <!--
        预留插槽，供未来的独立功能组件插入
        例如：<UploadTool />、<FilterTool />、<ShareTool />
      -->
      <slot name="tools" />
    </div>

    <div class="header-base-right">
      <el-button
        color="#626aef"
        :icon="Close"
        link
        @click="hide"
      />
    </div>
  </div>
</template>

<style scoped>
.header-base {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 5vh;
  z-index: 9999;
  background-color: #409eff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  box-sizing: border-box;
}

.header-base-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-base-right {
  display: flex;
  align-items: center;
}


</style>