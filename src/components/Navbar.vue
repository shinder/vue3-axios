<script setup>
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

/**
 * 處理登出
 */
async function handleLogout() {
  await authStore.logout()
  // 不主動跳轉，讓路由守衛決定是否需要跳轉到登入頁
  // 如果當前頁面不需要登入，會停留在原頁面
  // 如果當前頁面需要登入（requiresAuth: true），路由守衛會自動跳轉
}
</script>

<template>
  <div class="container">
    <nav class="navbar navbar-expand-lg bg-body-tertiary">
      <div class="container-fluid">
        <RouterLink class="navbar-brand" to="/">Navbar</RouterLink>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarSupportedContent">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            <li class="nav-item">
              <RouterLink class="nav-link" to="/">Home</RouterLink>
            </li>
            <li class="nav-item">
              <RouterLink class="nav-link" to="/about">About</RouterLink>
            </li>
            <li class="nav-item">
              <RouterLink class="nav-link" to="/contact">Contact</RouterLink>
            </li>
            <li class="nav-item">
              <RouterLink class="nav-link" to="/address-book">通訊錄列表</RouterLink>
            </li>
            <li class="nav-item">
              <RouterLink class="nav-link" to="/address-book/add">新增通訊錄</RouterLink>
            </li>
          </ul>
          <ul class="navbar-nav mb-2 mb-lg-0">
            <!-- 未登入時顯示登入連結 -->
            <li class="nav-item" v-if="!authStore.isLoggedIn">
              <RouterLink class="nav-link" to="/login">登入</RouterLink>
            </li>

            <!-- 已登入時顯示用戶資訊和登出按鈕 -->
            <template v-else>
              <li class="nav-item">
                <span class="nav-link">
                  <i class="fa-solid fa-user"></i>
                  {{ authStore.memberName }}
                </span>
              </li>
              <li class="nav-item">
                <button class="nav-link" @click="handleLogout">
                  <i class="fa-solid fa-right-from-bracket"></i>
                  登出
                </button>
              </li>
            </template>
          </ul>
        </div>
      </div>
    </nav>
  </div>
</template>

<style scoped>
.navbar-nav .router-link-exact-active {
  font-weight: bold;
  color: white;
  border-radius: 10px;
  background-color: #0d6efd;
}

/* 讓登出按鈕看起來像導航連結 */
.navbar-nav .btn-link {
  padding: 0;
  text-decoration: none;
  color: rgba(0, 0, 0, 0.55);
}

.navbar-nav .btn-link:hover {
  color: rgba(0, 0, 0, 0.7);
}

/* 用戶名稱樣式 */
.navbar-nav .nav-link i {
  margin-right: 0.25rem;
}
</style>