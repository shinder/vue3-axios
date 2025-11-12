import { createRouter, createWebHistory } from "vue-router";
import { ElMessage } from "element-plus";
import { useAuthStore } from "@/stores/auth";
import Home from "../views/Home.vue";
import About from "../views/About.vue";
import Contact from "../views/Contact.vue";
import AddressBookList from "../views/AddressBookList.vue";
import AddressBookAdd from "../views/AddressBookAdd.vue";
import AddressBookEdit from "../views/AddressBookEdit.vue";
import Login from "../views/Login.vue";

const routes = [
  {
    path: "/login",
    name: "Login",
    component: Login,
    meta: { requiresAuth: false, title: "會員登入" },
  },
  {
    path: "/",
    name: "Home",
    component: Home,
    meta: { requiresAuth: false, title: "首頁" },
  },
  {
    path: "/about",
    name: "About",
    component: About,
    meta: { requiresAuth: false, title: "關於我們" },
  },
  {
    path: "/contact",
    name: "Contact",
    component: Contact,
    meta: { requiresAuth: false, title: "聯絡我們" },
  },
  {
    path: "/address-book",
    name: "AddressBookList",
    component: AddressBookList,
    meta: { requiresAuth: false, title: "通訊錄列表" },
  },
  {
    path: "/address-book/add",
    name: "AddressBookAdd",
    component: AddressBookAdd,
    meta: { requiresAuth: true, title: "新增聯絡人" },
  },
  {
    path: "/address-book/edit/:id",
    name: "AddressBookEdit",
    component: AddressBookEdit,
    meta: { requiresAuth: true, title: "編輯聯絡人" },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

/**
 * 全域前置守衛 (Navigation Guards)
 * 在每次路由切換前執行
 */
router.beforeEach((to, from, next) => {
  // 取得 auth store（必須在 router 建立後才能使用）
  const authStore = useAuthStore();

  // 設定頁面標題
  if (to.meta.title) {
    document.title = `${to.meta.title} | Vue.js 練習專案`;
  }

  // 檢查路由是否需要登入
  const requiresAuth = to.meta.requiresAuth;

  if (requiresAuth) {
    // 需要登入的路由
    if (!authStore.isLoggedIn) {
      // 未登入，跳轉到登入頁
      ElMessage.warning("請先登入");
      next({
        path: "/login",
        query: { redirect: to.fullPath }, // 記錄原本要去的頁面
      });
    } else {
      // 已登入，允許訪問
      next();
    }
  } else {
    // 不需要登入的路由
    if (to.path === "/login" && authStore.isLoggedIn) {
      // 已登入但訪問登入頁，跳轉到首頁
      next("/");
    } else {
      // 允許訪問
      next();
    }
  }
});

/**
 * 全域後置鉤子
 * 在路由切換完成後執行
 */
router.afterEach((to, from) => {
  // 可以在這裡添加頁面訪問記錄、統計等功能
  console.log(`從 ${from.path} 導航到 ${to.path}`);
});

export default router;
