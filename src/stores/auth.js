import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/api/modules/auth'
import { ElMessage } from 'element-plus'

/**
 * 認證狀態管理 Store
 * 使用 Composition API 風格 (Setup Stores)
 */
export const useAuthStore = defineStore('auth', () => {
  // ========== State ==========

  /** JWT Access Token */
  const accessToken = ref(localStorage.getItem('access_token') || null)

  /** JWT Refresh Token */
  const refreshToken = ref(localStorage.getItem('refresh_token') || null)

  /** 會員資訊 */
  const member = ref(null)

  // 初始化時從 localStorage 讀取會員資訊
  const memberStr = localStorage.getItem('member')
  if (memberStr) {
    try {
      member.value = JSON.parse(memberStr)
    } catch (e) {
      console.error('解析會員資訊失敗:', e)
      localStorage.removeItem('member')
    }
  }

  // ========== Getters ==========

  /** 是否已登入 */
  const isLoggedIn = computed(() => !!accessToken.value)

  /** 會員名稱（暱稱或 Email） */
  const memberName = computed(() => {
    if (!member.value) return ''
    return member.value.nickname || member.value.email || '使用者'
  })

  /** 會員 Email */
  const memberEmail = computed(() => member.value?.email || '')

  /** 會員 ID */
  const memberId = computed(() => member.value?.member_id || null)

  // ========== Actions ==========

  /**
   * 設定 Token 和會員資訊
   * @param {Object} loginResponse - 登入 API 回應
   */
  function setAuth(loginResponse) {
    const { access_token, refresh_token, member: memberData } = loginResponse

    // 更新 state
    accessToken.value = access_token
    refreshToken.value = refresh_token
    member.value = memberData

    // 同步到 localStorage
    localStorage.setItem('access_token', access_token)
    localStorage.setItem('refresh_token', refresh_token)
    if (memberData) {
      localStorage.setItem('member', JSON.stringify(memberData))
    }

    console.log('✅ 認證狀態已設定:', {
      memberId: memberData?.member_id,
      email: memberData?.email,
      hasToken: !!access_token
    })
  }

  /**
   * 清除認證狀態
   */
  function clearAuth() {
    // 清除 state
    accessToken.value = null
    refreshToken.value = null
    member.value = null

    // 清除 localStorage
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('member')

    console.log('✅ 認證狀態已清除')
  }

  /**
   * 會員登入
   * @param {Object} credentials - 登入憑證
   * @param {string} credentials.username - Email (OAuth2 使用 username)
   * @param {string} credentials.password - 密碼
   * @returns {Promise<Object>} 登入回應
   */
  async function login(credentials) {
    try {
      const response = await authApi.login(credentials)

      // 設定認證狀態
      setAuth(response)

      ElMessage.success('登入成功！')
      return response
    } catch (error) {
      console.error('登入失敗:', error)

      // 處理錯誤訊息
      if (error.response) {
        const status = error.response.status
        const message = error.response.data?.detail || '登入失敗'

        if (status === 401) {
          ElMessage.error('帳號或密碼錯誤')
        } else {
          ElMessage.error(message)
        }
      } else {
        ElMessage.error('網路錯誤，請稍後再試')
      }

      throw error
    }
  }

  /**
   * 會員登出
   */
  async function logout() {
    try {
      // 呼叫登出 API（可選，JWT 本身是無狀態的）
      await authApi.logout()
    } catch (error) {
      console.error('登出 API 錯誤:', error)
      // 即使 API 失敗也要清除本地狀態
    } finally {
      // 清除認證狀態
      clearAuth()
      ElMessage.success('登出成功')
    }
  }

  /**
   * 刷新 Token
   * @returns {Promise<boolean>} 是否刷新成功
   */
  async function refreshAccessToken() {
    if (!refreshToken.value) {
      return false
    }

    try {
      const response = await authApi.refreshToken(refreshToken.value)

      // 更新 tokens
      accessToken.value = response.access_token
      refreshToken.value = response.refresh_token

      localStorage.setItem('access_token', response.access_token)
      localStorage.setItem('refresh_token', response.refresh_token)

      console.log('✅ Token 已刷新')
      return true
    } catch (error) {
      console.error('刷新 Token 失敗:', error)
      // Token 刷新失敗，清除認證狀態
      clearAuth()
      return false
    }
  }

  /**
   * 取得當前會員資訊（從 API）
   */
  async function fetchCurrentMember() {
    try {
      const response = await authApi.getCurrentMember()
      member.value = response
      localStorage.setItem('member', JSON.stringify(response))
      return response
    } catch (error) {
      console.error('取得會員資訊失敗:', error)
      throw error
    }
  }

  /**
   * 檢查是否已登入（驗證 Token 是否有效）
   * @returns {Promise<boolean>} 是否已登入
   */
  async function checkAuth() {
    if (!accessToken.value) {
      return false
    }

    try {
      // 嘗試取得會員資訊來驗證 Token
      await fetchCurrentMember()
      return true
    } catch (error) {
      // Token 無效，清除狀態
      clearAuth()
      return false
    }
  }

  // ========== 返回 Store API ==========
  return {
    // State
    accessToken,
    refreshToken,
    member,

    // Getters
    isLoggedIn,
    memberName,
    memberEmail,
    memberId,

    // Actions
    login,
    logout,
    setAuth,
    clearAuth,
    refreshAccessToken,
    fetchCurrentMember,
    checkAuth,
  }
})
