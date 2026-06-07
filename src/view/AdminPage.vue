<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import {
  getAuthPlanList,
  saveAuthPlan,
  deleteAuthPlan,
  updateUserStatus
} from '../api/auth'

const router = useRouter()

// ========== 用户状态管理 ==========
const userStatusForm = reactive({ userId: '', status: '' })
const userStatusLoading = ref(false)

const statusOptions = [
  { label: '正常', value: 'enable' },
  { label: '封禁', value: 'disable' },
  { label: '管理员', value: 'auth' }
]

async function handleUpdateUserStatus() {
  if (!userStatusForm.userId || !userStatusForm.status) {
    ElMessage.warning('用户ID和状态不能为空')
    return
  }
  userStatusLoading.value = true
  try {
    const msg = await updateUserStatus({
      userId: Number(userStatusForm.userId),
      status: userStatusForm.status
    })
    ElMessage.success(msg || '状态修改成功')
  } catch (e) {
    ElMessage.error(e.message)
  } finally {
    userStatusLoading.value = false
  }
}

// ========== 套餐管理 ==========
const planList = ref([])
const planLoading = ref(false)

async function fetchPlanList() {
  planLoading.value = true
  try {
    const data = await getAuthPlanList()
    planList.value = (data || []).map(p => ({
      ...p,
      _editing: false
    }))
  } catch (e) {
    ElMessage.error(e.message)
  } finally {
    planLoading.value = false
  }
}

async function handleSavePlan(plan) {
  planLoading.value = true
  try {
    await saveAuthPlan({
      planid: plan.planid,
      name: plan.name || '',
      storage: String(plan.storage || ''),
      recycle: String(plan.recycle || ''),
      price: String(plan.price || ''),
      statues: plan.statues || 'enable'
    })
    ElMessage.success('保存成功')
    fetchPlanList()
  } catch (e) {
    ElMessage.error(e.message)
  } finally {
    planLoading.value = false
  }
}

async function handleDeletePlan(plan) {
  try {
    await ElMessageBox.confirm(`确定要删除套餐「${plan.name}」吗？`, '确认删除', {
      type: 'warning'
    })
  } catch {
    return
  }
  planLoading.value = true
  try {
    await deleteAuthPlan(plan.planid)
    ElMessage.success('删除成功')
    fetchPlanList()
  } catch (e) {
    ElMessage.error(e.message)
  } finally {
    planLoading.value = false
  }
}

// 新增套餐表单
const newPlanForm = reactive({
  name: '',
  storage: '',
  recycle: '',
  price: '',
  statues: 'enable'
})
const newPlanLoading = ref(false)

async function handleAddPlan() {
  if (!newPlanForm.name || !newPlanForm.storage || !newPlanForm.recycle || !newPlanForm.price || !newPlanForm.statues) {
    ElMessage.warning('所有字段均不能为空')
    return
  }
  newPlanLoading.value = true
  try {
    await saveAuthPlan({
      name: newPlanForm.name,
      storage: newPlanForm.storage,
      recycle: newPlanForm.recycle,
      price: newPlanForm.price,
      statues: newPlanForm.statues
    })
    ElMessage.success('新增成功')
    Object.assign(newPlanForm, { name: '', storage: '', recycle: '', price: '', statues: 'enable' })
    fetchPlanList()
  } catch (e) {
    ElMessage.error(e.message)
  } finally {
    newPlanLoading.value = false
  }
}

function handleLogout() {
  localStorage.removeItem('adminToken')
  localStorage.removeItem('adminInfo')
  router.push({ name: 'login' })
}

onMounted(() => {
  fetchPlanList()
})
</script>

<template>
  <div class="admin-page">
    <div class="admin-header">
      <h2 class="admin-title">管理员控制台</h2>
      <el-button type="danger" @click="handleLogout">退出登录</el-button>
    </div>

    <div class="admin-content">
      <!-- 用户状态管理 -->
      <el-card class="admin-card">
        <template #header>
          <span class="card-title">修改用户账户状态</span>
        </template>
        <el-form :inline="true" :model="userStatusForm">
          <el-form-item label="用户ID">
            <el-input
              v-model="userStatusForm.userId"
              placeholder="请输入用户ID"
              style="width: 180px"
            />
          </el-form-item>
          <el-form-item label="状态">
            <el-select
              v-model="userStatusForm.status"
              placeholder="请选择状态"
              style="width: 140px"
            >
              <el-option
                v-for="opt in statusOptions"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              :loading="userStatusLoading"
              @click="handleUpdateUserStatus"
            >
              提交
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 套餐管理 -->
      <el-card class="admin-card">
        <template #header>
          <span class="card-title">套餐管理</span>
        </template>

        <div v-loading="planLoading">
          <!-- 已有套餐列表 -->
          <div
            v-for="plan in planList"
            :key="plan.planid"
            class="plan-row"
          >
            <div class="plan-row-fields">
              <el-input v-model="plan.name" placeholder="名称" style="width: 120px" size="default" />
              <el-input v-model="plan.storage" placeholder="存储(字节)" style="width: 160px" size="default" />
              <el-input v-model="plan.recycle" placeholder="回收站(天)" style="width: 130px" size="default" />
              <el-input v-model="plan.price" placeholder="价格" style="width: 100px" size="default" />
              <el-select v-model="plan.statues" style="width: 110px" size="default">
                <el-option label="启用" value="enable" />
                <el-option label="禁用" value="disable" />
              </el-select>
            </div>
            <div class="plan-row-actions">
              <el-button type="primary" size="default" @click="handleSavePlan(plan)">提交</el-button>
              <el-button type="danger" size="default" @click="handleDeletePlan(plan)">删除</el-button>
            </div>
          </div>

          <!-- 新增套餐 -->
          <el-divider />
          <div class="plan-row new-plan-row">
            <div class="plan-row-fields">
              <el-input v-model="newPlanForm.name" placeholder="名称 *" style="width: 120px" size="default" />
              <el-input v-model="newPlanForm.storage" placeholder="存储(字节) *" style="width: 160px" size="default" />
              <el-input v-model="newPlanForm.recycle" placeholder="回收站(天) *" style="width: 130px" size="default" />
              <el-input v-model="newPlanForm.price" placeholder="价格 *" style="width: 100px" size="default" />
              <el-select v-model="newPlanForm.statues" style="width: 110px" size="default">
                <el-option label="启用" value="enable" />
                <el-option label="禁用" value="disable" />
              </el-select>
            </div>
            <div class="plan-row-actions">
              <el-button type="success" size="default" :loading="newPlanLoading" @click="handleAddPlan">
                新增
              </el-button>
            </div>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<style scoped>
.admin-page {
  min-height: 100vh;
  background: var(--el-bg-color-page, #f2f3f5);
  padding: 0;
}

.admin-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background: var(--el-bg-color, #fff);
  border-bottom: 1px solid var(--el-border-color-light, #e4e7ed);
}

.admin-title {
  margin: 0;
  font-size: 20px;
  color: var(--el-text-color-primary);
}

.admin-content {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.admin-card {
  border-radius: 6px;
}

.card-title {
  font-weight: 600;
  font-size: 15px;
  color: var(--el-text-color-primary);
}

/* ── 套餐行 ── */
.plan-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: nowrap;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--el-border-color-lighter, #ebeef5);
  overflow-x: auto;
}

.plan-row:last-of-type {
  border-bottom: none;
}

.plan-row-fields {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: nowrap;
}

.plan-row-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.new-plan-row {
  border-bottom: none;
  padding-top: 4px;
}

/* ── 暗色模式：文字和图标白色 ── */
:global(.dark) .admin-title,
:global(.dark) .card-title {
  color: #fff;
}
</style>