// 第三方UI组件
import { createApp } from "vue";
// import ElementPlus from "element-plus";
// import "element-plus/dist/index.css";
// import zhCn from "element-plus/dist/locale/zh-cn.mjs";
// app.use(ElementPlus, {
//     locale: zhCn,
// });

import App from "./article.vue";
const app = createApp(App);
app.mount("#app");
