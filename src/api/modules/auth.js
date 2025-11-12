import request from "../index";

/**
 * 認證相關 API
 */
export const authApi = {
  /**
   * 會員登入
   * @param {Object} credentials - 登入憑證
   * @param {string} credentials.username - Email (OAuth2 表單使用 username 欄位)
   * @param {string} credentials.password - 密碼
   */
  login(credentials) {
    // 使用 URLSearchParams 建立 application/x-www-form-urlencoded 格式
    // FastAPI 的 OAuth2PasswordRequestForm 要求這種格式
    const params = new URLSearchParams();
    params.append("username", credentials.username);
    params.append("password", credentials.password);

    return request({
      url: "/jwt/login",
      method: "post",
      data: params,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
  },

  /**
   * 會員登出
   */
  logout() {
    return request({
      url: "/jwt/logout",
      method: "post",
    });
  },

  /**
   * 會員註冊
   * @param {Object} memberData - 會員註冊資料
   * @param {string} memberData.email - Email
   * @param {string} memberData.password - 密碼
   * @param {string} memberData.nickname - 暱稱
   */
  register(memberData) {
    return request({
      url: "/jwt/register",
      method: "post",
      data: memberData,
    });
  },

  /**
   * 刷新 Token
   * @param {string} refreshToken - Refresh Token
   */
  refreshToken(refreshToken) {
    return request({
      url: "/jwt/refresh",
      method: "post",
      data: { refresh_token: refreshToken },
    });
  },

  /**
   * 取得當前登入會員資料
   */
  getCurrentMember() {
    return request({
      url: "/jwt/me",
      method: "get",
    });
  },
};

// 也可以導出單個函數
export const login = authApi.login;
export const logout = authApi.logout;
export const register = authApi.register;
export const refreshToken = authApi.refreshToken;
export const getCurrentMember = authApi.getCurrentMember;
