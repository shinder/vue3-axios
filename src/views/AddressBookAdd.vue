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
  <div>
    <Navbar />
    <el-container class="add-container">
      <el-main>
        <!-- 表單卡片 -->
        <el-card class="form-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <div class="header-left">
                <el-icon :size="24">
                  <Plus />
                </el-icon>
                <span class="header-text">新增聯絡人</span>
              </div>
            </div>
          </template>

          <!-- 表單 -->
          <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px" label-position="right"
            size="large">
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
                  {{ submitting ? '送出中...' : '送出' }}
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
        <el-card class="hint-card" shadow="never">
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
.add-container {
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
