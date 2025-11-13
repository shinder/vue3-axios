<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Navbar from "@/components/Navbar.vue"

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
  <Navbar />
  <div class="container">
    <div class="row">
      <div class="col-6 offset-3 mt-4">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title mb-4">會員登入</h5>

            <el-form
              ref="formRef"
              :model="formData"
              :rules="rules"
              label-width="100px"
              label-position="left"
              @submit.prevent="handleLogin"
            >
              <!-- 帳號 (Email) -->
              <el-form-item label="帳號" prop="username">
                <el-input
                  v-model="formData.username"
                  type="email"
                  placeholder="請輸入 Email"
                  :disabled="submitting"
                  clearable
                />
              </el-form-item>

              <!-- 密碼 -->
              <el-form-item label="密碼" prop="password">
                <el-input
                  v-model="formData.password"
                  type="password"
                  placeholder="請輸入密碼"
                  :disabled="submitting"
                  show-password
                  clearable
                />
              </el-form-item>

              <!-- 按鈕群組 -->
              <el-form-item>
                <el-button type="primary" @click="handleLogin" :loading="submitting">
                  {{ submitting ? '登入中...' : '登入' }}
                </el-button>
                <el-button @click="handleReset" :disabled="submitting">
                  重設
                </el-button>
              </el-form-item>
            </el-form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
