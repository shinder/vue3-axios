import axios from "axios";

// 建立 axios 實例
const service = axios.create({
  // API 基礎 URL
  baseURL: "http://localhost:8000",

  // 請求超時時間 (毫秒)
  timeout: 10000,

  // 請求 headers
  headers: {
    "Content-Type": "application/json",
  },

  // 跨域請求時是否需要憑證
  withCredentials: false,
});

export default service;
