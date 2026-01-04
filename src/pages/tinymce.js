// 第三方UI组件
import { createApp } from "vue";
// import ElementPlus from "element-plus";
// import "element-plus/dist/index.css";
// import zhCn from "element-plus/dist/locale/zh-cn.mjs";
// app.use(ElementPlus, {
//     locale: zhCn,
// });
import T from "./tinymce.vue";
const app = createApp(T);
app.mount("#app");
