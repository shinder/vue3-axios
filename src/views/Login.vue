<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// 表單資料
const formData = reactive({
  username: '', // OAuth2 使用 username 欄位傳遞 email
  password: ''
})

// 表單 ref
const formRef = ref(null)

// 提交狀態
const submitting = ref(false)

// 表單驗證規則
const rules = {
  username: [
    { required: true, message: '請輸入帳號 (Email)', trigger: 'blur' },
    { type: 'email', message: '請輸入正確的 Email 格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '請輸入密碼', trigger: 'blur' },
    { min: 6, message: '密碼長度至少 6 個字元', trigger: 'blur' }
  ]
}

/**
 * 送出登入表單
 */
async function handleLogin() {
  if (!formRef.value) return

  try {
    // 驗證表單
    await formRef.value.validate()

    submitting.value = true

    // 使用 auth store 的 login action
    await authStore.login(formData)

    // 登入成功，跳轉到原本要訪問的頁面，或首頁
    const redirectPath = route.query.redirect || '/'
    router.push(redirectPath)

  } catch (error) {
    // 錯誤訊息已在 store 中處理
    console.error('登入錯誤:', error)
  } finally {
    submitting.value = false
  }
}

/**
 * 重設表單
 */
function handleReset() {
  if (!formRef.value) return
  formRef.value.resetFields()
}
</script>

<template>
  <div class="login-container">
    <div class="login-card-wrapper">
      <el-card class="login-card" shadow="always">
        <template #header>
          <div class="card-header">
            <el-icon :size="32" color="#409eff">
              <UserFilled />
            </el-icon>
            <span class="header-text">會員登入</span>
          </div>
        </template>

        <!-- 登入表單 -->
        <el-form ref="formRef" :model="formData" :rules="rules" label-width="80px" label-position="top" size="large">
          <el-form-item label="帳號" prop="username">
            <el-input v-model="formData.username" placeholder="請輸入 Email" clearable :prefix-icon="Message">
              <template #prefix>
                <el-icon>
                  <Message />
                </el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item label="密碼" prop="password">
            <el-input v-model="formData.password" type="password" placeholder="請輸入密碼" show-password clearable
              @keyup.enter="handleLogin">
              <template #prefix>
                <el-icon>
                  <Lock />
                </el-icon>
              </template>
            </el-input>
          </el-form-item>

          <!-- 按鈕群組 -->
          <el-form-item>
            <div class="button-group">
              <el-button type="primary" :loading="submitting" @click="handleLogin" style="width: 100%">
                <el-icon v-if="!submitting">
                  <Check />
                </el-icon>
                {{ submitting ? '登入中...' : '登入' }}
              </el-button>
            </div>
          </el-form-item>
        </el-form>

        <!-- 額外資訊 -->
        <div class="extra-info">
          <p>還沒有帳號？請聯繫管理員註冊</p>
          <el-button link type="primary" @click="router.push('/')">
            <el-icon>
              <HomeFilled />
            </el-icon>
            返回首頁
          </el-button>
        </div>
      </el-card>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-card-wrapper {
  width: 100%;
  max-width: 450px;
}

.login-card {
  border-radius: 10px;
  overflow: hidden;
}

.card-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  padding: 20px 0;
}

.header-text {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

/* 表單樣式 */
:deep(.el-form) {
  padding: 20px;
}

:deep(.el-form-item__label) {
  font-weight: 600;
  color: #606266;
  padding-bottom: 8px;
}

:deep(.el-input__wrapper) {
  box-shadow: 0 0 0 1px #dcdfe6 inset;
  transition: all 0.3s;
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #c0c4cc inset;
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #409eff inset;
}

/* 按鈕群組 */
.button-group {
  width: 100%;
  margin-top: 10px;
}

.button-group .el-button {
  height: 45px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
}

/* 額外資訊 */
.extra-info {
  text-align: center;
  padding: 10px 20px 20px;
  color: #909399;
  font-size: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.extra-info p {
  margin: 0;
}

.extra-info .el-button {
  font-size: 14px;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .login-container {
    padding: 15px;
  }

  .login-card-wrapper {
    max-width: 100%;
  }

  :deep(.el-form) {
    padding: 15px;
  }

  .header-text {
    font-size: 20px;
  }
}

/* 動畫效果 */
.login-card {
  animation: slideUp 0.5s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
