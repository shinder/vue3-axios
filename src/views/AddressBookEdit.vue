<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'
import zhTw from 'element-plus/es/locale/lang/zh-tw.mjs'
import Navbar from '@/components/Navbar.vue'
import { addressBookApi } from '@/api/modules/address_book'

const router = useRouter()
const route = useRoute()

// 取得 URL 參數中的 ID
const contactId = ref(route.params.id)

// 表單資料
const formData = reactive({
  name: '',
  mobile: '',
  email: '',
  birthday: '',
  address: ''
})

// 原始資料（用於重設）
const originalData = reactive({})

// 表單 ref
const formRef = ref(null)

// 載入和提交狀態
const loading = ref(false)
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
 * 載入聯絡人資料
 */
async function fetchContactData() {
  loading.value = true

  try {
    const response = await addressBookApi.getAddressBookById(contactId.value)

    if (response.success) {
      const data = response.data

      // 填充表單資料
      formData.name = data.name || ''
      formData.mobile = data.mobile || ''
      formData.email = data.email || ''
      formData.birthday = data.birthday || ''
      formData.address = data.address || ''

      // 保存原始資料
      Object.assign(originalData, {
        name: data.name || '',
        mobile: data.mobile || '',
        email: data.email || '',
        birthday: data.birthday || '',
        address: data.address || ''
      })
    } else {
      ElMessage.error(response.message || '載入聯絡人資料失敗')
      router.push('/address-book')
    }
  } catch (error) {
    console.error('載入聯絡人資料錯誤:', error)
    ElMessage.error('載入聯絡人資料失敗')
    router.push('/address-book')
  } finally {
    loading.value = false
  }
}

/**
 * 送出表單
 */
async function handleSubmit() {
  if (!formRef.value) return

  try {
    // 驗證表單
    await formRef.value.validate()
    if (formData.birthday === '') formData.birthday = null
    submitting.value = true

    // 呼叫更新 API
    const response = await addressBookApi.updateAddressBookItem(contactId.value, formData)

    if (response.success) {
      ElMessage.success('更新聯絡人成功！')
      // 更新成功後重新載入資料（保持在當前頁面）
      await fetchContactData()
    } else {
      ElMessage.error(response.message || '更新聯絡人失敗')
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
 * 重設表單（恢復到原始載入的資料）
 */
function handleReset() {
  if (!formRef.value) return

  // 恢復到原始資料
  Object.assign(formData, originalData)

  // 清除驗證錯誤
  formRef.value.clearValidate()

  ElMessage.info('已恢復到原始資料')
}

/**
 * 取消並返回上一頁
 */
function handleCancel() {
  // 使用瀏覽器的歷史記錄返回上一頁，保留列表的分頁狀態
  router.back()
}

// 組件掛載時載入資料
onMounted(() => {
  fetchContactData()
})
</script>

<template>
  <Navbar />
  <div class="container">
    <div class="row mt-4">
      <div class="col-8 offset-2">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title mb-4">編輯聯絡人 #{{ contactId }}</h5>

            <!-- 載入中狀態 -->
            <div v-if="loading" class="text-center py-5">
              <el-icon class="is-loading" :size="40">
                <Loading />
              </el-icon>
              <p class="mt-3 text-muted">載入資料中...</p>
            </div>

            <!-- 表單內容 -->
            <el-config-provider v-else :locale="zhTw">
              <el-form
                ref="formRef"
                :model="formData"
                :rules="rules"
                label-width="100px"
                label-position="left"
                v-loading="submitting"
              >
                <!-- 姓名 (必填) -->
                <el-form-item label="姓名" prop="name">
                  <el-input
                    v-model="formData.name"
                    placeholder="請輸入姓名"
                    :disabled="submitting || loading"
                    clearable
                  />
                </el-form-item>

                <!-- Email (必填) -->
                <el-form-item label="Email" prop="email">
                  <el-input
                    v-model="formData.email"
                    type="email"
                    placeholder="請輸入 Email"
                    :disabled="submitting || loading"
                    clearable
                  />
                </el-form-item>

                <!-- 手機 (必填) -->
                <el-form-item label="手機" prop="mobile">
                  <el-input
                    v-model="formData.mobile"
                    placeholder="請輸入手機號碼（例：0912345678）"
                    :disabled="submitting || loading"
                    clearable
                  />
                </el-form-item>

                <!-- 生日 (選填) -->
                <el-form-item label="生日" prop="birthday">
                  <el-date-picker
                    v-model="formData.birthday"
                    type="date"
                    placeholder="請選擇生日"
                    :disabled="submitting || loading"
                    style="width: 100%"
                    format="YYYY-MM-DD"
                    value-format="YYYY-MM-DD"
                  />
                </el-form-item>

                <!-- 地址 (選填) -->
                <el-form-item label="地址" prop="address">
                  <el-input
                    v-model="formData.address"
                    type="textarea"
                    :rows="3"
                    placeholder="請輸入地址"
                    :disabled="submitting || loading"
                    clearable
                  />
                </el-form-item>

                <!-- 按鈕群組 -->
                <el-form-item>
                  <el-button
                    type="primary"
                    @click="handleSubmit"
                    :loading="submitting"
                    :disabled="loading"
                  >
                    {{ submitting ? '更新中...' : '更新' }}
                  </el-button>
                  <el-button @click="handleReset" :disabled="submitting || loading">
                    重設
                  </el-button>
                  <el-button @click="handleCancel" :disabled="submitting || loading">
                    取消
                  </el-button>
                </el-form-item>
              </el-form>
            </el-config-provider>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
