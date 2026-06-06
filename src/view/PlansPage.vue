<script setup>
import { ref, onMounted } from 'vue'
import { getPlansList, subscribePlan } from '../api/user'
import { ElMessage } from 'element-plus'

const plans = ref([])
const loading = ref(false)
const subscribingId = ref(null)

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

async function loadPlans() {
  loading.value = true
  try {
    const data = await getPlansList()
    plans.value = data || []
  } catch (e) {
    console.error('加载套餐失败:', e)
  } finally {
    loading.value = false
  }
}

async function handleSubscribe(plan) {
  subscribingId.value = plan.planid
  try {
    await subscribePlan(plan.planid)
    ElMessage.success(`成功订阅「${plan.name}」套餐`)
  } catch (e) {
    // 错误已在 request 拦截器中处理
  } finally {
    subscribingId.value = null
  }
}

onMounted(() => {
  loadPlans()
})
</script>

<template>
  <div class="plans-page">
    <h1 class="page-title">套餐订阅</h1>

    <div v-if="loading" class="loading-state">
      <el-icon class="is-loading" :size="24"><Loading /></el-icon>
      <span>加载中...</span>
    </div>

    <div v-else class="plans-grid">
      <div
        v-for="plan in plans"
        :key="plan.planid"
        class="plan-card"
        :class="{ 'plan-disabled': plan.statues !== 'enable' }"
      >
        <h2 class="plan-name">{{ plan.name }}</h2>

        <div class="plan-price">
          <span class="price-num">{{ plan.price }}</span>
          <span class="price-unit">元/月</span>
        </div>

        <div class="plan-features">
          <div class="feature-item">
            <el-icon :size="16"><Check /></el-icon>
            <span>存储空间：{{ formatBytes(plan.storage) }}</span>
          </div>
          <div class="feature-item">
            <el-icon :size="16"><Check /></el-icon>
            <span>回收站保留：{{ plan.recycle }} 天</span>
          </div>
        </div>

        <el-button
          type="primary"
          :loading="subscribingId === plan.planid"
          :disabled="plan.statues !== 'enable'"
          style="width: 100%"
          @click="handleSubscribe(plan)"
        >
          {{ plan.statues === 'enable' ? '立即订阅' : '暂不可用' }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.plans-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 20px;
}

.page-title {
  text-align: center;
  font-size: 24px;
  margin-bottom: 32px;
  color: var(--el-text-color-primary);
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 60px 0;
  color: var(--el-text-color-secondary);
}

.plans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
}

.plan-card {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 12px;
  padding: 28px 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  transition: box-shadow 0.2s;
}

.plan-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.plan-disabled {
  opacity: 0.5;
}

.plan-name {
  text-align: center;
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: var(--el-text-color-primary);
}

.plan-price {
  text-align: center;
}

.price-num {
  font-size: 36px;
  font-weight: 700;
  color: var(--el-color-primary);
}

.price-unit {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin-left: 4px;
}

.plan-features {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--el-text-color-regular);
}

.feature-item .el-icon {
  color: var(--el-color-success);
}
</style>