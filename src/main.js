import { createApp } from "vue";
import { createPinia } from "pinia";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";
import "./style.css";
import App from "./App.vue";
import router from "./router";
import "./api/interceptors"; // 引入 API 攔截器

const app = createApp(App);
const pinia = createPinia();

// 註冊所有 Element Plus 圖標
// 這樣可以在任何組件中直接使用圖標，如 `<el-icon><HomeFilled /></el-icon>`
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

app.use(pinia); // 註冊 Pinia
app.use(ElementPlus);
app.use(router); // 註冊 Vue Router
app.mount("#app");
