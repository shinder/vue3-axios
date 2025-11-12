<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import zhTw from 'element-plus/es/locale/lang/zh-tw.mjs'
import Navbar from '@/components/Navbar.vue'
import { addressBookApi } from '@/api/modules/address_book'

const router = useRouter()

// 表單資料
const formData = reactive({
  name: '',
  mobile: '',
  email: '',
  birthday: '',
  address: ''
})

// 表單 ref
const formRef = ref(null)

// 提交狀態
const submitting = ref(false)

// 表單驗證規則
const rules = {
  name: [
    { required: true, message: '請輸入姓名', trigger: 'blur' },
    { min: 2, max: 50, message: '姓名長度應在 2 到 50 個字元之間', trigger: 'blur' }
  ],
  mobile: [
    { required: true, message: '請輸入手機號碼', trigger: 'blur' },
    { pattern: /^09\d{8}$/, message: '請輸入有效的手機號碼格式（例：0912345678）', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '請輸入 Email', trigger: 'blur' },
    { type: 'email', message: '請輸入正確的 Email 格式', trigger: 'blur' }
  ],
  birthday: [
    { type: 'date', message: '請選擇正確的日期', trigger: 'change' }
  ],
  address: [
    { max: 200, message: '地址長度不能超過 200 個字元', trigger: 'blur' }
  ]
}

/**
 * 送出表單
 */
async function handleSubmit() {
  if (!formRef.value) return

  try {
    // 驗證表單
    await formRef.value.validate()

    submitting.value = true

    // 呼叫 API
    const response = await addressBookApi.createAddressBookItem(formData)

    if (response.success) {
      ElMessage.success('新增聯絡人成功！')
      // 跳轉回列表頁面
      router.push('/address-book')
    } else {
      ElMessage.error(response.message || '新增聯絡人失敗')
    }
  } catch (error) {
    // 表單驗證失敗或 API 錯誤
    if (error.message) {
      ElMessage.error(error.message)
    } else {
      console.error('送出表單錯誤:', error)
    }
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

/**
 * 取消並返回上一頁
 */
function handleCancel() {
  // 使用瀏覽器的歷史記錄返回上一頁，保留列表的分頁狀態
  router.back()
}
</script>

<template>
  <Navbar />
  <div class="container">
    <div class="row mt-4">
      <div class="col-6 offset-3 mt-4">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">新增通訊錄</h5>
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
