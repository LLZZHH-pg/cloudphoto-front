<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getUserInfo, updateUserInfo } from '../api/user'

const router = useRouter()

const loading = ref(false)
const formRef = ref(null)

const form = reactive({
  nam: '',
  tel: '',
  eml: '',
  pas: ''   // 密码保持空，填了才更新
})

const rules = {
  tel: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
  nam: [{ required: false }],
  eml: [{ required: false }]
}

// 页面加载时从后端拉取最新数据预填
onMounted(async () => {
  try {
    const data = await getUserInfo()
    form.nam = data.nam || ''
    form.tel = data.tel || ''
    form.eml = data.eml || ''
  } catch (e) {
    ElMessage.error('获取用户信息失败')
  }
})

async function handleSubmit() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    await updateUserInfo({
      nam: form.nam,
      pas: form.pas,
      tel: form.tel,
      eml: form.eml
    })
    ElMessage.success('信息更新成功，请重新登录')
    // ★ 清除登录信息
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    // ★ 跳转到登录页
    router.push('/login')
  } catch (e) {
    ElMessage.error(e.message)
  } finally {
    loading.value = false
  }
}

function goBack() {
  router.push('/photo')
}
</script>

<template>
  <div class="reregister-container">
    <div class="reregister-card">
      <h2 class="title">修改信息</h2>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="0"
        class="form"
      >
        <el-form-item prop="tel">
          <el-input
            v-model="form.tel"
            placeholder="手机号"
            :prefix-icon="'Phone'"
            size="large"
          />
        </el-form-item>

        <el-form-item prop="nam">
          <el-input
            v-model="form.nam"
            placeholder="用户名（选填）"
            :prefix-icon="'User'"
            size="large"
          />
        </el-form-item>

        <el-form-item prop="eml">
          <el-input
            v-model="form.eml"
            placeholder="邮箱（选填）"
            :prefix-icon="'Message'"
            size="large"
          />
        </el-form-item>

        <el-form-item prop="pas">
          <el-input
            v-model="form.pas"
            type="password"
            placeholder="新密码（不填则不修改）"
            :prefix-icon="'Lock'"
            size="large"
            show-password
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            class="submit-btn"
            @click="handleSubmit"
          >
            保存修改
          </el-button>
        </el-form-item>

        <el-form-item>
          <el-button
            size="large"
            class="submit-btn"
            @click="goBack"
          >
            返回
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<style scoped>
.reregister-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
.reregister-card {
  width: 400px;
  padding: 30px 40px 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
}
.title {
  text-align: center;
  margin-bottom: 16px;
  font-size: 20px;
  color: #333;
}
.form {
  margin-top: 10px;
}
.submit-btn {
  width: 100%;
}
</style>