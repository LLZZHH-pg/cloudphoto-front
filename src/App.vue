<script setup>
    import { computed, ref } from 'vue'
    import { useRoute, useRouter } from 'vue-router'
    import HeaderBase from './components/HeaderBase.vue'

    const tabPosition = ref('left')
    const route = useRoute()
    const router = useRouter()

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
  <div class="common-layout">
    <el-container>
      <HeaderBase />
      <el-header height="5vh">Header</el-header>
      
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
</style>