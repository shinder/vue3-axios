<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute, RouterLink, onBeforeRouteUpdate } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'
// import zhTw from 'element-plus/es/locale/lang/zh-tw.mjs'
import Navbar from '@/components/Navbar.vue'
import { addressBookApi } from '@/api/modules/address_book'

const router = useRouter()
const route = useRoute()

// 響應式資料
const addressBookList = ref([])
const loading = ref(false)
const error = ref(null)

// 分頁參數
const currentPage = ref(1)
const pageSize = ref(20)
const totalItems = ref(0)
const totalPages = ref(0)

/**
 * 取得通訊錄列表
 */
async function fetchAddressBookList() {
  loading.value = true
  error.value = null

  try {
    const result = await addressBookApi.getAddressBookList({
      page: currentPage.value,
      page_size: pageSize.value,
    })

    console.log('API result:', result)

    // 根據 API 回應格式處理資料
    if (result.success) {
      addressBookList.value = result.data

      // 處理分頁資訊
      if (result.pagination) {
        totalItems.value = result.pagination.total_rows
        totalPages.value = result.pagination.total_pages
        console.log('分頁資訊:', {
          totalItems: totalItems.value,
          totalPages: totalPages.value,
          currentPage: currentPage.value,
          pageSize: pageSize.value
        })
      } else {
        console.warn('API 回應中沒有 pagination 資訊')
      }
    } else {
      error.value = result.message || '載入通訊錄列表失敗'
      ElMessage.error(error.value)
    }
  } catch (err) {
    error.value = '載入通訊錄列表失敗'
    console.error('取得通訊錄列表錯誤:', err)
    ElMessage.error(error.value)
  } finally {
    loading.value = false
  }
}

/**
 * 變更頁碼
 */
function handlePageChange(page) {
  currentPage.value = page
  // 更新 URL query string
  router.push({
    path: '/address-book',
    query: { page }
  })
}

/**
 * 編輯通訊錄
 */
function handleEdit(row) {
  router.push(`/address-book/edit/${row.ab_id}`)
}

/**
 * 刪除通訊錄
 */
async function handleDelete(row) {
  try {
    await ElMessageBox.confirm(
      `確定要刪除「${row.name}」嗎？此操作無法復原。`,
      '警告',
      {
        confirmButtonText: '確定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    loading.value = true

    try {
      const result = await addressBookApi.deleteAddressBookItem(row.ab_id)

      if (result.success) {
        ElMessage.success('刪除成功')
        // 重新載入列表
        await fetchAddressBookList()
      } else {
        ElMessage.error(result.message || '刪除失敗')
      }
    } catch (err) {
      console.error('刪除錯誤:', err)
      ElMessage.error('刪除失敗')
    } finally {
      loading.value = false
    }
  } catch (error) {
    // 使用者取消刪除
    if (error !== 'cancel') {
      console.error('刪除錯誤:', error)
    }
  }
}

/**
 * 新增聯絡人
 */
function handleAdd() {
  router.push('/address-book/add')
}

const paginationData = computed(() => {
  const ar = [];
  for (let i = 0; i < 11; i++) {
    const p = currentPage.value - 5 + i;
    if (p >= 1 && p <= totalPages.value) {
      ar.push(p)
    }
  }
  return ar;
})

// 組件掛載時載入資料
onMounted(() => {
  // 從 URL query string 讀取頁碼
  const pageFromQuery = parseInt(route.query.page) || 1
  currentPage.value = pageFromQuery
  fetchAddressBookList()
})

// 監聽路由更新（包含瀏覽器上一頁/下一頁）
onBeforeRouteUpdate((to, from) => {
  const pageNumber = parseInt(to.query.page) || 1
  currentPage.value = pageNumber
  fetchAddressBookList()
})
</script>

<template>
  <Navbar />
  <div class="container">
    <!-- 載入中狀態 -->
    <div v-if="loading" class="text-center py-5 mt-4">
      <el-icon class="is-loading" :size="40">
        <Loading />
      </el-icon>
      <p class="mt-3 text-muted">載入資料中...</p>
    </div>

    <!-- 列表內容 -->
    <div v-else-if="addressBookList.length">
      <div class="row mt-4">
        <div class="col">
          <nav aria-label="Page navigation example">
            <ul class="pagination">
              <li class="page-item" v-for="p in paginationData" :key="p">
                <span v-if="p == currentPage" class="page-link active">{{ p }}</span>
                <button v-else class="page-link" @click="handlePageChange(p)">{{ p }}</button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
      <div class="row">
        <div class="col">
          <table class="table table-bordered table-striped">
            <thead>
              <tr>
                <th>編號</th>
                <th>姓名</th>
                <th>電郵</th>
                <th>手機</th>
                <th>生日</th>
                <th>地址</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in addressBookList" :key="item.ab_id">
                <td>{{ item.ab_id }}</td>
                <td>{{ item.name }}</td>
                <td>{{ item.email }}</td>
                <td>{{ item.mobile }}</td>
                <td>{{ item.birthday }}</td>
                <td>{{ item.address }}</td>
                <td>
                  <button class="btn btn-sm btn-warning" @click="handleEdit(item)">
                    <i class="fa-solid fa-pen-to-square"></i>
                  </button>
                  {{ " " }}
                  <button class="btn btn-sm btn-danger" @click="handleDelete(item)">
                    <i class="fa-solid fa-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- 空資料狀態 -->
    <div v-else class="text-center py-5 mt-4">
      <p class="text-muted">目前沒有任何聯絡人資料</p>
      <button class="btn btn-primary mt-3" @click="handleAdd">
        <i class="fa-solid fa-plus"></i>
        新增聯絡人
      </button>
    </div>
  </div>
</template>

<style scoped></style>
