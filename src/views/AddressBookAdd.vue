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
    if (formData.birthday === '') formData.birthday = null
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
      <div class="col-8 offset-2">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title mb-4">新增連絡人</h5>

            <el-config-provider :locale="zhTw">
              <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px" label-position="left">
                <!-- 姓名 (必填) -->
                <el-form-item label="姓名" prop="name">
                  <el-input v-model="formData.name" placeholder="請輸入姓名" :disabled="submitting" clearable />
                </el-form-item>

                <!-- Email (必填) -->
                <el-form-item label="Email" prop="email">
                  <el-input v-model="formData.email" type="email" placeholder="請輸入 Email" :disabled="submitting"
                    clearable />
                </el-form-item>

                <!-- 手機 (必填) -->
                <el-form-item label="手機" prop="mobile">
                  <el-input v-model="formData.mobile" placeholder="請輸入手機號碼（例：0912345678）" :disabled="submitting"
                    clearable />
                </el-form-item>

                <!-- 生日 (選填) -->
                <el-form-item label="生日" prop="birthday">
                  <el-date-picker v-model="formData.birthday" type="date" placeholder="請選擇生日" :disabled="submitting"
                    style="width: 100%" format="YYYY-MM-DD" value-format="YYYY-MM-DD" />
                </el-form-item>

                <!-- 地址 (選填) -->
                <el-form-item label="地址" prop="address">
                  <el-input v-model="formData.address" type="textarea" :rows="3" placeholder="請輸入地址"
                    :disabled="submitting" clearable />
                </el-form-item>

                <!-- 按鈕群組 -->
                <el-form-item>
                  <el-button type="primary" @click="handleSubmit" :loading="submitting">
                    {{ submitting ? '新增中...' : '新增' }}
                  </el-button>
                  <el-button @click="handleReset" :disabled="submitting">
                    重設
                  </el-button>
                  <el-button @click="handleCancel" :disabled="submitting">
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
