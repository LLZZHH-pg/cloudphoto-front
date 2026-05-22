<script setup>
    import { computed, ref } from 'vue'
    import { useRoute, useRouter } from 'vue-router'

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
      <el-header height="5vh">Header</el-header>

      <el-tabs v-model="activeTab" :tab-position="tabPosition" style="height:95vh" class="main-tabs">
        <el-tab-pane name="photo">
          <template #label>
            <div class="tab-item">
              <el-icon :size="25"><Picture /></el-icon>
              <span>照片</span>
            </div>
          </template>
          <router-view />
        </el-tab-pane>
        <el-tab-pane name="album">
          <template #label>
            <div class="tab-item">
              <el-icon :size="25"><Collection /></el-icon>
              <span>影集</span>
            </div>
          </template>
          <router-view />
        </el-tab-pane>
        <el-tab-pane name="recycle">
          <template #label>
            <div class="tab-item">
              <el-icon :size="25"><Delete /></el-icon>
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

/* 让插槽内容水平垂直居中 */
.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px; /* 图标和文字的间距 */
  width: 100%;
}

/* 覆盖 Element Plus 默认的左对齐样式（针对左侧标签栏） */
:deep(.el-tabs--left .el-tabs__item) {
  text-align: center;
  padding: 12px 10px; /* 增加上下间距，让侧边栏看起来更开阔 */
  height: auto;
}
</style>