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
    const name = tab === 'register' ? 'register' : 'login'
    router.push({ name, query: { redirect: route.query.redirect } })
  }
})

const loading = ref(false)

const loginForm = reactive({ acc: '', pas: '' })
const loginRules = {
  acc: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  pas: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}
const loginFormRef = ref(null)

const registerForm = reactive({ nam: '', pas: '', tel: '', eml: '' })
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
    activeTab.value = 'login'
  } catch (e) {
    ElMessage.error(e.message)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-wrapper">
    <!-- 左侧装饰区 -->
    <div class="auth-side">
      <div class="side-content">
        <div class="brand-mark">
          <span class="brand-icon">✦</span>
        </div>
        <h1 class="side-title">欢迎回来</h1>
        <p class="side-subtitle">安全、简洁、高效的照片云存储平台</p>
        <div class="side-dots">
          <span></span><span></span><span></span>
        </div>
      </div>
      <div class="side-decoration">
        <div class="circle c1"></div>
        <div class="circle c2"></div>
        <div class="circle c3"></div>
      </div>
    </div>

    <!-- 右侧表单区 -->
    <div class="auth-main">
      <div class="auth-card">

        <!-- 登录区块 -->
        <transition name="tab-fade" mode="out-in">
          <div v-if="activeTab === 'login'" key="login" class="form-block">
            <div class="form-header">
              <h2 class="form-title">用户登录</h2>
              <p class="form-desc">请输入您的账号和密码</p>
            </div>
            <el-form
              ref="loginFormRef"
              :model="loginForm"
              :rules="loginRules"
              label-width="0"
              class="form"
            >
              <el-form-item prop="acc">
                <label class="field-label">账号</label>
                <el-input
                  v-model="loginForm.acc"
                  placeholder="请输入账号"
                  size="large"
                  class="custom-input"
                />
              </el-form-item>
              <el-form-item prop="pas">
                <label class="field-label">密码</label>
                <el-input
                  v-model="loginForm.pas"
                  type="password"
                  placeholder="请输入密码"
                  size="large"
                  show-password
                  class="custom-input"
                />
              </el-form-item>
              <el-form-item class="btn-item">
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
            <div class="form-footer">
              还没有账号？
              <span class="switch-link" @click="activeTab = 'register'">立即注册</span>
            </div>
          </div>

          <!-- 注册区块 -->
          <div v-else key="register" class="form-block">
            <div class="form-header">
              <h2 class="form-title">用户注册</h2>
              <p class="form-desc">创建您的账号，开始使用</p>
            </div>
            <el-form
              ref="registerFormRef"
              :model="registerForm"
              :rules="registerRules"
              label-width="0"
              class="form"
            >
              <el-form-item prop="tel">
                <label class="field-label">手机号 <span class="required">*</span></label>
                <el-input
                  v-model="registerForm.tel"
                  placeholder="请输入手机号"
                  size="large"
                  class="custom-input"
                />
              </el-form-item>
              <el-form-item prop="pas">
                <label class="field-label">密码 <span class="required">*</span></label>
                <el-input
                  v-model="registerForm.pas"
                  type="password"
                  placeholder="请设置密码"
                  size="large"
                  show-password
                  class="custom-input"
                />
              </el-form-item>
              <el-form-item prop="nam">
                <label class="field-label">用户名 <span class="optional">选填</span></label>
                <el-input
                  v-model="registerForm.nam"
                  placeholder="请输入用户名"
                  size="large"
                  class="custom-input"
                />
              </el-form-item>
              <el-form-item prop="eml">
                <label class="field-label">邮箱 <span class="optional">选填</span></label>
                <el-input
                  v-model="registerForm.eml"
                  placeholder="请输入邮箱地址"
                  size="large"
                  class="custom-input"
                />
              </el-form-item>
              <el-form-item class="btn-item">
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
            <div class="form-footer">
              已有账号？
              <span class="switch-link" @click="activeTab = 'login'">返回登录</span>
            </div>
          </div>
        </transition>

      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;700&family=Noto+Sans+SC:wght@300;400;500&display=swap');

/* ── 整体布局 ── */
.auth-wrapper {
  display: flex;
  min-height: 100vh;
  font-family: 'Noto Sans SC', sans-serif;
  background: linear-gradient(135deg, #e8f0fe 0%, #ede7f6 50%, #f3e8ff 100%);
}

/* ── 左侧装饰 ── */
.auth-side {
  position: relative;
  width: 42%;
  background: linear-gradient(160deg, #4f6ef7 0%, #7c5cbf 60%, #a78bdc 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
}

.side-content {
  position: relative;
  z-index: 2;
  text-align: center;
  color: #fff;
  padding: 40px;
}

.brand-mark {
  margin-bottom: 28px;
}

.brand-icon {
  font-size: 36px;
  color: rgba(255,255,255,0.9);
  display: inline-block;
  animation: spin-slow 8s linear infinite;
}

@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

.side-title {
  font-family: 'Noto Serif SC', serif;
  font-size: 32px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 12px;
  letter-spacing: 4px;
}

.side-subtitle {
  font-size: 14px;
  color: rgba(255,255,255,0.5);
  letter-spacing: 1.5px;
  margin: 0 0 36px;
}

.side-dots {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.side-dots span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(255,255,255,0.7);
  opacity: 0.5;
}
.side-dots span:first-child { opacity: 1; }

/* 装饰圆 */
.side-decoration { position: absolute; inset: 0; z-index: 1; }

.circle {
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.2);
}
.c1 { width: 380px; height: 380px; top: -120px; right: -140px; }
.c2 { width: 260px; height: 260px; bottom: -80px; left: -100px; }
.c3 {
  width: 160px; height: 160px;
  bottom: 80px; right: 40px;
  border-color: rgba(255,255,255,0.1);
  background: rgba(255,255,255,0.05);
}

/* ── 右侧表单 ── */
.auth-main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
}

.auth-card {
  width: 100%;
  max-width: 400px;
}

/* ── 表单区块 ── */
.form-block {
  animation: fadeUp 0.3s ease both;
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

.form-header {
  margin-bottom: 32px;
}

.form-title {
  font-family: 'Noto Serif SC', serif;
  font-size: 26px;
  font-weight: 700;
  color: #3d3580;
  margin: 0 0 8px;
  letter-spacing: 2px;
}

.form-desc {
  font-size: 13px;
  color: #999;
  margin: 0;
  letter-spacing: 0.5px;
}

/* ── 字段标签 ── */
.field-label {
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: #555;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
}

.required {
  color: #d96c6c;
  font-size: 11px;
}

.optional {
  color: #bbb;
  font-size: 11px;
  font-weight: 400;
  margin-left: 4px;
}

/* ── Element Plus 覆盖 ── */
.form :deep(.el-form-item) {
  margin-bottom: 20px;
  display: block;
}

.form :deep(.el-form-item__content) {
  display: block;
}

.form :deep(.el-input__wrapper) {
  border-radius: 6px;
  border: 1.5px solid #e2e2dd;
  box-shadow: none !important;
  background: #fafaf8;
  transition: border-color 0.2s, background 0.2s;
  padding: 0 14px;
}

.form :deep(.el-input__wrapper:hover) {
  border-color: #7c5cbf;
  background: #fff;
}

.form :deep(.el-input__wrapper.is-focus) {
  border-color: #4f6ef7;
  background: #fff;
}

.form :deep(.el-input__inner) {
  font-family: 'Noto Sans SC', sans-serif;
  font-size: 14px;
  color: #1a1a2e;
}

.form :deep(.el-input__inner::placeholder) {
  color: #c0bfbb;
}

/* ── 提交按钮 ── */
.btn-item {
  margin-top: 8px;
}

.submit-btn {
  width: 100%;
  height: 46px;
  border-radius: 6px;
  background: linear-gradient(90deg, #4f6ef7 0%, #7c5cbf 100%);
  border: none;
  font-family: 'Noto Sans SC', sans-serif;
  font-size: 15px;
  font-weight: 500;
  letter-spacing: 6px;
  color: #fff;
  transition: opacity 0.2s, transform 0.1s;
}

.submit-btn:hover {
  background: linear-gradient(90deg, #3a5be0 0%, #6a48ad 100%) !important;
  border-color: transparent !important;
  opacity: 0.92;
}

.submit-btn:active {
  transform: scale(0.99);
}

/* ── 底部切换 ── */
.form-footer {
  text-align: center;
  margin-top: 24px;
  font-size: 13px;
  color: #999;
}

.switch-link {
  color: #6c5ce7;
  font-weight: 500;
  cursor: pointer;
  margin-left: 4px;
  transition: color 0.2s;
}

.switch-link:hover {
  color: #4f6ef7;
}

/* ── 过渡动画 ── */
.tab-fade-enter-active,
.tab-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.tab-fade-enter-from {
  opacity: 0;
  transform: translateX(12px);
}
.tab-fade-leave-to {
  opacity: 0;
  transform: translateX(-12px);
}

/* ── 响应式 ── */
@media (max-width: 700px) {
  .auth-side { display: none; }
  .auth-main { padding: 32px 20px; }
}
</style>
