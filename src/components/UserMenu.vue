<script setup>
import { useUserInfo } from '../composables/useUserInfo'
import { useDarkMode } from '../composables/useDarkMode'

const { username, storagePercent, storageText, logout } = useUserInfo()
const { isDark } = useDarkMode()

function handleDarkChange(val) {
  isDark.value = val
  localStorage.setItem('darkMode', val)
}
</script>

<template>
  <el-popover
    placement="bottom-end"
    :width="260"
    trigger="click"
    :show-arrow="false"
    popper-class="user-menu-popover"
  >
    <!-- 触发器：圆角矩形用户名按钮 -->
    <template #reference>
      <div class="user-trigger">
        <el-icon :size="18"><User /></el-icon>
        <span class="user-name">{{ username }}</span>
      </div>
    </template>

    <div class="menu-content">
      <!-- 1. 存储空间进度条 -->
      <div class="menu-section">
        <span class="section-label">存储空间</span>
        <el-progress
          :percentage="storagePercent"
          :stroke-width="8"
          :show-text="false"
        />
        <span class="storage-detail">{{ storageText }}</span>
      </div>

      <el-divider style="margin: 8px 0" />

      <!-- 2. 亮/暗模式切换 -->
      <div class="menu-section switch-row">
        <span class="section-label">
          <el-icon :size="16">
            <Sunny v-if="!isDark" />
            <Moon v-else />
          </el-icon>
          {{ isDark ? '暗色模式' : '亮色模式' }}
        </span>
        <el-switch
          :model-value="isDark"
          @update:model-value="handleDarkChange"
          size="small"
        />
      </div>

      <el-divider style="margin: 8px 0" />

      <!-- 3. 修改信息按钮 -->
      <div class="menu-section">
        <el-button text style="width: 100%; justify-content: flex-start;">
          <el-icon :size="16"><Edit /></el-icon>
          <span>修改信息</span>
        </el-button>
      </div>

      <!-- 4. 退出登录按钮 -->
      <div class="menu-section">
        <el-button
          text
          type="danger"
          style="width: 100%; justify-content: flex-start;"
          @click="logout"
        >
          <el-icon :size="16"><SwitchButton /></el-icon>
          <span>退出登录</span>
        </el-button>
      </div>
    </div>
  </el-popover>
</template>

<style scoped>
.user-trigger {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--el-fill-color-light);
  border-radius: 20px;
  padding: 6px 14px;
  cursor: pointer;
  transition: background 0.2s;
  user-select: none;
}

.user-trigger:hover {
  background: var(--el-fill-color);
}

.user-name {
  font-size: 14px;
  color: var(--el-text-color-primary);
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.menu-content {
  padding: 4px 0;
}

.menu-section {
  padding: 6px 10px;
}

.section-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--el-text-color-regular);
  margin-bottom: 6px;
}

.storage-detail {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 4px;
}

.switch-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.switch-row .section-label {
  margin-bottom: 0;
}
</style>