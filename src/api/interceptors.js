import service from "./index";
import { ElMessage } from "element-plus";
import router from "@/router";
import { useAuthStore } from "@/stores/auth";

/**
 * 請求攔截器
 * 在請求發送前統一處理
 */
service.interceptors.request.use(
  (config) => {
    // 1. 添加 JWT token 到請求標頭
    const authStore = useAuthStore();
    if (authStore.accessToken) {
      config.headers["Authorization"] = `Bearer ${authStore.accessToken}`;
    }

    // 2. 添加請求時間戳 (防止快取)
    if (config.method === "get") {
      config.params = {
        ...config.params,
        _t: Date.now(),
      };
    }

    // 3. 處理特殊的請求 headers
    // 例如：檔案上傳時自動設定 Content-Type
    if (config.data instanceof FormData) {
      config.headers["Content-Type"] = "multipart/form-data";
    }
    // 4. 顯示載入狀態
    // useLoadingStore().startLoading()

    return config;
  },
  (error) => {
    // 請求錯誤處理
    console.error("❌ [Request Error]", error);
    ElMessage.error("請求設定錯誤");
    return Promise.reject(error);
  }
);

/**
 * 回應攔截器
 * 統一處理回應資料和錯誤
 */
service.interceptors.response.use(
  (response) => {
    // 隱藏載入狀態
    // useLoadingStore().endLoading()

    // 1. 根據後端 API 格式統一處理
    const res = response.data;

    // 假設後端返回格式為: { code: 200, data: {}, message: '' }
    if (res.code !== undefined) {
      if (res.code === 200) {
        // 成功：返回資料部分
        return res.data;
      } else {
        // 業務錯誤：顯示錯誤訊息
        ElMessage.error(res.message || "請求失敗");
        return Promise.reject(new Error(res.message || "請求失敗"));
      }
    }

    // 2. 如果後端直接返回資料，不包裝
    return res;
  },
  (error) => {
    // 隱藏載入狀態
    // useLoadingStore().endLoading()

    console.error("❌ [Response Error]", error);

    // 1. 處理網路錯誤
    if (!error.response) {
      ElMessage.error("網路錯誤，請檢查網路連線");
      return Promise.reject(error);
    }

    // 2. 處理 HTTP 錯誤狀態碼
    const { status, data } = error.response;

    switch (status) {
      case 400:
        ElMessage.error(data.message || "請求參數錯誤");
        break;

      case 401:
        // 未授權：清除 token 並跳轉登入頁
        ElMessage.error("登入已過期，請重新登入");
        const authStore = useAuthStore();
        authStore.clearAuth();
        router.push({
          path: '/login',
          query: { redirect: router.currentRoute.value.fullPath }
        });
        break;

      case 403:
        ElMessage.error("無權限訪問");
        break;

      case 404:
        ElMessage.error("請求的資源不存在");
        break;

      case 422:
        // 表單驗證錯誤
        if (data.errors) {
          const errors = Object.values(data.errors).flat();
          ElMessage.error(errors[0] || "驗證失敗");
        } else {
          ElMessage.error(data.message || "驗證失敗");
        }
        break;

      case 429:
        ElMessage.error("請求過於頻繁，請稍後再試");
        break;

      case 500:
        ElMessage.error("伺服器錯誤，請稍後再試");
        break;

      case 502:
      case 503:
      case 504:
        ElMessage.error("服務暫時不可用，請稍後再試");
        break;

      default:
        ElMessage.error(data.message || `請求失敗 (${status})`);
    }

    return Promise.reject(error);
  }
);

export default service;
