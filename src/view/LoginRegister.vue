<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { login, register } from '../api/user'

const router = useRouter()
const route = useRoute()

const activeTab = computed({
  get: () => route.name === 'register' ? 'register' : 'login',
  set: (tab) => {
    // tab 切换时同步更新 URL
    const name = tab === 'register' ? 'register' : 'login'
    router.push({ name, query: { redirect: route.query.redirect } })
  }
})

const loading = ref(false)

// 登录表单
const loginForm = reactive({
  acc: '',
  pas: ''
})

const loginRules = {
  acc: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  pas: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const loginFormRef = ref(null)

// 注册表单
const registerForm = reactive({
  nam: '',
  pas: '',
  tel: '',
  eml: ''
})

const registerRules = {
  tel: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
  pas: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  nam: [{ required: false }],
  eml: [{ required: false }]
}

const registerFormRef = ref(null)

async function handleLogin() {
  const valid = await loginFormRef.value.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    const data = await login({ acc: loginForm.acc, pas: loginForm.pas })
    localStorage.setItem('token', data.token)
    localStorage.setItem('userInfo', JSON.stringify(data.userInfo))
    ElMessage.success('登录成功')
    const redirect = route.query.redirect || '/photo'
    router.push(redirect)
  } catch (e) {
    ElMessage.error(e.message)
  } finally {
    loading.value = false
  }
}

async function handleRegister() {
  const valid = await registerFormRef.value.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    const msg = await register({
      nam: registerForm.nam,
      pas: registerForm.pas,
      tel: registerForm.tel,
      eml: registerForm.eml
    })
    ElMessage.success(msg || '注册成功')
    // 注册成功切换到登录页
    activeTab.value = 'login'
  } catch (e) {
    ElMessage.error(e.message)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-container">
    <div class="login-card">
      <el-tabs v-model="activeTab" stretch>
        <!-- 登录 -->
        <el-tab-pane label="登录" name="login">
          <el-form
            ref="loginFormRef"
            :model="loginForm"
            :rules="loginRules"
            label-width="0"
            class="form"
          >
            <el-form-item prop="acc">
                <el-input v-model="loginForm.acc" placeholder="账号" :prefix-icon="'User'" size="large" />
            </el-form-item>
            <el-form-item prop="pas">
                <el-input v-model="loginForm.pas" type="password" placeholder="密码" :prefix-icon="'Lock'" size="large" show-password />
            </el-form-item>
            <el-form-item>
                <el-button
                type="primary"
                size="large"
                :loading="loading"
                class="submit-btn"
                @click="handleLogin"
                >
                登 录
                </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <!-- 注册 -->
        <el-tab-pane label="注册" name="register">
          <el-form
            ref="registerFormRef"
            :model="registerForm"
            :rules="registerRules"
            label-width="0"
            class="form"
          >
            <el-form-item prop="tel">
              <el-input
                v-model="registerForm.tel"
                placeholder="手机号"
                :prefix-icon="'Phone'"
                size="large"
              />
            </el-form-item>
            <el-form-item prop="pas">
              <el-input
                v-model="registerForm.pas"
                type="password"
                placeholder="密码"
                :prefix-icon="'Lock'"
                size="large"
                show-password
              />
            </el-form-item>
            <el-form-item prop="nam">
              <el-input
                v-model="registerForm.nam"
                placeholder="用户名（选填）"
                :prefix-icon="'User'"
                size="large"
              />
            </el-form-item>
            <el-form-item prop="eml">
              <el-input
                v-model="registerForm.eml"
                placeholder="邮箱（选填）"
                :prefix-icon="'Message'"
                size="large"
              />
            </el-form-item>
            <el-form-item>
              <el-button
                type="primary"
                size="large"
                :loading="loading"
                class="submit-btn"
                @click="handleRegister"
              >
                注 册
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
.login-card {
  width: 400px;
  padding: 30px 40px 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
}
.form {
  margin-top: 10px;
}
.submit-btn {
  width: 100%; 
}
</style>