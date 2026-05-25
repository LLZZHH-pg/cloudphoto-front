<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import HeaderBase from './components/HeaderBase.vue'
import UserMenu from './components/UserMenu.vue'
import logoUrl from './assets/logo.svg'

const tabPosition = ref('left')
const route = useRoute()
const router = useRouter()

const isFullScreen = computed(() => route.meta?.fullScreen)

const activeTab = computed({
  get: () => {
    if (route.path.startsWith('/photo')) return 'photo'
    if (route.path.startsWith('/album')) return 'album'
    if (route.path.startsWith('/recycle')) return 'recycle'
    return 'photo'
  },
  set: (name) => router.push({ name })
})
</script>

<template> 
  <router-view v-if="isFullScreen" />

  <div v-else class="common-layout">
    <el-container>

      <HeaderBase />

      <el-header height="5vh">
        <div class="header-content">
          <div class="header-left">
            <img :src="logoUrl" class="logo-img" alt="logo" />
            <span class="logo-text">照片云盘</span>
          </div>
          <div class="header-right">
            <UserMenu />
          </div>
        </div>
      </el-header>
      
      <el-tabs v-model="activeTab" :tab-position="tabPosition" style="height:95vh" class="main-tabs">
        <el-tab-pane name="photo">
          <template #label>
            <div class="tab-item">
              <el-icon :size="27"><Picture /></el-icon>
              <span>照片</span>
            </div>
          </template>
          <router-view />
        </el-tab-pane>
        <el-tab-pane name="album">
          <template #label>
            <div class="tab-item">
              <el-icon :size="27"><Collection /></el-icon>
              <span>影集</span>
            </div>
          </template>
          <router-view />
        </el-tab-pane>
        <el-tab-pane name="recycle">
          <template #label>
            <div class="tab-item">
              <el-icon :size="27"><Delete /></el-icon>
              <span>回收站</span>
            </div>
          </template>
          <router-view />
        </el-tab-pane>
      </el-tabs>


    </el-container>
  </div>
</template>

<style scoped>
.main-tabs :deep(.el-tabs__content) {
  overflow-y: auto;
  height: 100%;
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  width: 100%;
}

:deep(.el-tabs--left .el-tabs__item) {
  text-align: center;
  padding: 20px 15px 5px 15px;
  height: auto;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo-img {
  height: 3.5vh;
  width: auto;
}

.logo-text {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.header-right {
  display: flex;
  align-items: center;
}
</style>
<style>
html.dark .logo-img {
  filter: brightness(0) invert(1);
}
</style>