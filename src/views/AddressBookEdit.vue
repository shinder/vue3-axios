<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
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
  <div>
    <Navbar />
    <el-container class="edit-container">
      <el-main>
        <!-- 載入狀態 -->
        <div v-if="loading" class="loading">
          <el-icon class="is-loading" :size="40">
            <Loading />
          </el-icon>
          <p>載入中...</p>
        </div>

        <!-- 表單卡片 -->
        <el-card v-else class="form-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <div class="header-left">
                <el-icon :size="24">
                  <Edit />
                </el-icon>
                <span class="header-text">編輯聯絡人</span>
              </div>
            </div>
          </template>

          <!-- 表單 -->
          <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px" label-position="right"
            size="large">
            <!-- 編號欄位（唯讀） -->
            <el-form-item label="編號">
              <el-input v-model="contactId" disabled placeholder="自動產生" />
            </el-form-item>

            <el-form-item label="姓名" prop="name">
              <el-input v-model="formData.name" placeholder="請輸入姓名" clearable :maxlength="50" show-word-limit />
            </el-form-item>

            <el-form-item label="手機" prop="mobile">
              <el-input v-model="formData.mobile" placeholder="請輸入手機號碼（例：0912345678）" clearable :maxlength="10" />
            </el-form-item>

            <el-form-item label="Email" prop="email">
              <el-input v-model="formData.email" type="email" placeholder="請輸入 Email" clearable />
            </el-form-item>

            <el-form-item label="生日" prop="birthday">
              <el-config-provider :locale="zhTw">
                <el-date-picker v-model="formData.birthday" type="date" placeholder="請選擇生日" style="width: 100%"
                  format="YYYY-MM-DD" value-format="YYYY-MM-DD" />
              </el-config-provider>
            </el-form-item>

            <el-form-item label="地址" prop="address">
              <el-input v-model="formData.address" type="textarea" placeholder="請輸入地址" :rows="3" clearable
                :maxlength="200" show-word-limit />
            </el-form-item>

            <!-- 按鈕群組 -->
            <el-form-item>
              <div class="button-group">
                <el-button type="primary" :loading="submitting" @click="handleSubmit">
                  <el-icon>
                    <Check />
                  </el-icon>
                  {{ submitting ? '更新中...' : '更新' }}
                </el-button>
                <el-button @click="handleReset" :disabled="submitting">
                  <el-icon>
                    <RefreshLeft />
                  </el-icon>
                  重設
                </el-button>
                <el-button @click="handleCancel" :disabled="submitting">
                  <el-icon>
                    <Close />
                  </el-icon>
                  取消
                </el-button>
              </div>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 提示卡片 -->
        <el-card v-if="!loading" class="hint-card" shadow="never">
          <template #header>
            <div class="card-header">
              <el-icon :size="20">
                <InfoFilled />
              </el-icon>
              <span class="header-text">填寫說明</span>
            </div>
          </template>
          <ul class="hint-list">
            <li><strong>姓名</strong>、<strong>手機</strong>、<strong>Email</strong> 為必填欄位</li>
            <li>手機號碼格式：09 開頭，共 10 碼（例：0912345678）</li>
            <li>Email 需符合正確的 Email 格式</li>
            <li>生日和地址為選填欄位</li>
          </ul>
        </el-card>
      </el-main>
    </el-container>
  </div>
</template>

<style scoped>
.edit-container {
  min-height: calc(100vh - 60px);
  background-color: #f5f7fa;
}

.el-main {
  padding: 40px;
  max-width: 800px;
  margin: 0 auto;
}

.form-card {
  margin-bottom: 30px;
}

.hint-card {
  background-color: #f0f9ff;
  border: 1px solid #91d5ff;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-text {
  font-size: 18px;
  font-weight: bold;
}

/* 載入狀態 */
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #909399;
}

.loading p {
  margin-top: 15px;
  font-size: 16px;
}

/* 表單樣式 */
:deep(.el-form) {
  padding: 20px;
}

:deep(.el-form-item__label) {
  font-weight: 600;
  color: #606266;
}

/* 按鈕群組 */
.button-group {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 20px;
}

.button-group .el-button {
  min-width: 120px;
}

/* 提示列表 */
.hint-list {
  margin: 0;
  padding-left: 20px;
  color: #606266;
  font-size: 14px;
  line-height: 2;
}

.hint-list li {
  margin-bottom: 8px;
}

.hint-list strong {
  color: #409eff;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .el-main {
    padding: 20px;
  }

  :deep(.el-form) {
    padding: 10px;
  }

  :deep(.el-form-item) {
    margin-bottom: 18px;
  }

  :deep(.el-form-item__label) {
    text-align: left !important;
  }

  .button-group {
    flex-direction: column;
    gap: 10px;
  }

  .button-group .el-button {
    width: 100%;
  }
}

/* 平板裝置 */
@media (min-width: 768px) and (max-width: 1024px) {
  .el-main {
    padding: 30px;
    max-width: 100%;
  }
}
</style>
