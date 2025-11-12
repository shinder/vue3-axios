<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'
import Navbar from "@/components/Navbar.vue"

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// 表單資料
const formData = reactive({
  username: '', // OAuth2 使用 username 欄位傳遞 email
  password: ''
})

// 追蹤欄位是否被觸碰過（用於顯示錯誤訊息）
const touched = reactive({
  username: false,
  password: false
})

// 提交狀態
const submitting = ref(false)

// Email 格式驗證正則表達式
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// 欄位驗證錯誤訊息（computed）
const errors = computed(() => ({
  username: (() => {
    if (!touched.username) return ''
    if (!formData.username) return '請輸入帳號 (Email)'
    if (!emailRegex.test(formData.username)) return '請輸入正確的 Email 格式'
    return ''
  })(),
  password: (() => {
    if (!touched.password) return ''
    if (!formData.password) return '請輸入密碼'
    if (formData.password.length < 6) return '密碼長度至少 6 個字元'
    return ''
  })()
}))

// 表單是否有效
const isFormValid = computed(() => {
  return formData.username &&
    emailRegex.test(formData.username) &&
    formData.password &&
    formData.password.length >= 6
})

/**
 * 標記欄位為已觸碰
 */
function markAsTouched(field) {
  touched[field] = true
}

/**
 * 送出登入表單
 */
async function handleLogin(event) {
  event.preventDefault()

  // 標記所有欄位為已觸碰（顯示所有錯誤訊息）
  touched.username = true
  touched.password = true

  // 驗證表單
  if (!isFormValid.value) {
    ElMessage.error('請修正表單錯誤')
    return
  }

  try {
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
  formData.username = ''
  formData.password = ''
  touched.username = false
  touched.password = false
}
</script>

<template>
  <Navbar />
  <div class="container">
    <div class="row">
      <div class="col-6 offset-3 mt-4">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">會員登入</h5>
            <form @submit="handleLogin">
              <div class="mb-3">
                <label for="username" class="form-label">帳號 (Email)</label>
                <input type="email" class="form-control" :class="{ 'is-invalid': errors.username }" name="username"
                  id="username" v-model="formData.username" @blur="markAsTouched('username')" :disabled="submitting" />
                <div class="invalid-feedback" v-if="errors.username">
                  {{ errors.username }}
                </div>
              </div>
              <div class="mb-3">
                <label for="password" class="form-label">密碼</label>
                <input type="password" class="form-control" :class="{ 'is-invalid': errors.password }" name="password"
                  id="password" v-model="formData.password" @blur="markAsTouched('password')" :disabled="submitting" />
                <div class="invalid-feedback" v-if="errors.password">
                  {{ errors.password }}
                </div>
              </div>
              <button type="submit" class="btn btn-primary" :disabled="submitting">
                {{ submitting ? '登入中...' : '登入' }}
              </button>
              <button type="button" class="btn btn-secondary ms-2" @click="handleReset" :disabled="submitting">
                重設
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
