
// 設定基礎 URL
axios.defaults.baseURL = 'http://localhost:8000';

// 設定通用 headers
// axios.defaults.headers.common['Authorization'] = 'Bearer token';

// 設定 POST 請求的 Content-Type
axios.defaults.headers.post['Content-Type'] = 'application/json';

// 設定超時時間
axios.defaults.timeout = 5000;

const api = axios.create();
