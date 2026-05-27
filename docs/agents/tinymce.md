# Tinymce

## 安装链路

`Tinymce.vue` 负责 Vue 组件封装，也负责 TinyMCE 本体、主题、插件和内容样式的加载。宿主页面不再需要在 `index.html` 中手写 `window.RX_TINYMCE_ROOT` 和 `tinymce.min.js`。

当前加载链条由三部分组成：

1. `config/global.js` 生成资源根路径。
2. `Tinymce.vue` 把根路径传给 `@tinymce/tinymce-vue` 和 TinyMCE init。
3. `tinymce/` 目录里的自定义插件基于 TinyMCE 传入的插件目录 URL 加载自己的资源。

### 环境变量

`config/global.js` 使用 `VUE_APP_*` 变量。注意这些变量来自当前构建项目：

+ 在本仓库运行 `npm run dev` 时，读取的是本仓库 `.env`。
+ 其它业务库通过 npm 依赖引入 `@2kog/pkg-editor` 时，读取的是业务库自己的 `.env`。
+ 业务库不会读取 `node_modules/@2kog/pkg-editor/.env`。

本仓库本地开发建议配置：

```env
VUE_APP_STATIC_ROOT=https://static.2kog.com/
VUE_APP_TINYMCE_PATH=/static/tinymce
VUE_APP_TINYMCE_DEV=true
VUE_APP_TINYMCE_PORT=5120
```

业务库本地开发通常不要配置 `VUE_APP_TINYMCE_DEV=true`。业务库即使处于 `NODE_ENV=development`，也会默认走线上静态资源：

```env
VUE_APP_STATIC_ROOT=https://static.2kog.com/
VUE_APP_TINYMCE_PATH=/static/tinymce
```

如果业务库使用自己的静态域名，只需要改 `VUE_APP_STATIC_ROOT` 和 `VUE_APP_TINYMCE_PATH`。

### 根路径生成

`config/global.js` 输出两个值：

```js
cdnRoot: process.env.VUE_APP_TINYMCE_DEV === "true"
    ? `http://localhost:${process.env.VUE_APP_TINYMCE_PORT || 5120}`
    : `${process.env.VUE_APP_STATIC_ROOT || "https://static.2kog.com/"}`,

tinymcePath: `${process.env.VUE_APP_TINYMCE_PATH || "/static/tinymce"}`
```

`Tinymce.vue` 中拼出：

```js
const tinymceRoot = GlobalConf.cdnRoot + GlobalConf.tinymcePath;
```

本仓库本地开发时，期望结果是：

```text
http://localhost:5120/static/tinymce
```

线上默认结果是：

```text
https://static.2kog.com/static/tinymce
```

如果 `cdnRoot` 末尾带 `/` 且 `tinymcePath` 开头带 `/`，URL 中可能出现双斜杠。浏览器通常可访问，但后续整理代码时可以统一做 URL normalize。

### TinyMCE 主体加载

`Tinymce.vue` 通过 `@tinymce/tinymce-vue` 的 `tinymceScriptSrc` 懒加载 TinyMCE 主脚本：

```vue
<editor
    :id="id"
    :tinymce-script-src="tinymce_script_src"
    v-model="data"
    :init="init"
/>
```

`tinymce_script_src` 指向：

```js
`${tinymceRoot}/tinymce.min.js`
```

`@tinymce/tinymce-vue` 会在组件挂载后检查 `window.tinymce`。如果不存在，则把这个脚本插入 `<head>`，并在脚本加载完成后初始化编辑器。

不要把 editor id 设成 `tinymce`。浏览器会把 `id="tinymce"` 的 DOM 暴露为 `window.tinymce`，导致 `@tinymce/tinymce-vue` 误判 TinyMCE 已加载，从而跳过脚本注入并报 `init is not a function`。当前固定使用：

```js
const id = "rx-tinymce-editor";
```

插入内容时通过这个 id 找编辑器实例：

```js
tinyMCE.editors[this.id].insertContent(html);
```

### TinyMCE 主题、插件和 CSS

只加载 `tinymce.min.js` 不够，TinyMCE 后续还会加载主题、插件、皮肤等资源。`Tinymce.vue` 必须在 `init` 中同时设置：

```js
base_url: tinymceRoot,
suffix: ".min",
content_css: `${tinymceRoot}/skins/content/default/content.min.css`,
```

含义：

+ `base_url`：告诉 TinyMCE 后续从哪里加载 `themes/`、`plugins/`、`skins/`。
+ `suffix: ".min"`：让 TinyMCE 请求 `theme.min.js`、`plugin.min.js`，匹配当前 `tinymce/` 目录里的压缩文件。
+ `content_css`：加载编辑器 iframe 内正文样式。

如果缺少 `base_url`，主题可能会错误请求宿主项目路径，例如 `/js/themes/silver/theme.js`。如果缺少 `suffix`，自定义插件可能会请求不存在的 `plugin.js`。

### 本地静态服务

`npm run dev:tinymce` 不再依赖全局安装 `serve`，而是运行：

```bash
node scripts/dev-tinymce.js
```

脚本流程：

1. 读取本仓库 `.env`。
2. 设置 `NODE_ENV=development`。
3. 加载 `config/global.js`，拿到 `cdnRoot` 和 `tinymcePath`。
4. 把本仓库 `tinymce/` 目录软链到临时静态根目录下的 `tinymcePath`。
5. 使用 `npx serve -l <port>` 启动静态服务。

因此本地开发时真实访问路径是：

```text
http://localhost:5120/static/tinymce/tinymce.min.js
http://localhost:5120/static/tinymce/plugins/latex/plugin.min.js
http://localhost:5120/static/tinymce/skins/content/default/content.min.css
```

### LaTeX 插件资源

`tinymce/plugins/latex/plugin.min.js` 不再依赖 `window.RX_TINYMCE_ROOT`。TinyMCE 注册插件时会把当前插件目录作为第二个参数传入：

```js
tinymce.PluginManager.add("latex", function (editor, url) {
    // url: http://localhost:5120/static/tinymce/plugins/latex
});
```

LaTeX 插件使用这个 `url` 打开弹窗：

```js
const dialogBase = `${url}/latex-dialog/`;

editor.windowManager.openUrl({
    title: "数学公式",
    url: `${dialogBase}index.html?dialogBase=${encodeURIComponent(dialogBase)}`,
    width: 1200,
    height: 800,
});
```

`latex-dialog/index.html` 读取 `dialogBase`，并用它加载同目录下的 CSS、JS、帮助内容：

```js
new URL("index.css", dialogBase).href
new URL("katex.min.js", dialogBase).href
new URL("usage-content.html", dialogBase).href
```

不要在 LaTeX dialog 里依赖 `./index.js`、`./usage-content.html` 这类裸相对路径。TinyMCE `openUrl` 的 iframe 环境可能影响相对路径解析，导致请求跑到 `plugins/latex/index.js` 或 `plugins/latex/usage-content`。

### 资源发布

仓库内的 `.github/workflows/tinymce.yml` 会在发布 tag 时把 `tinymce/` 目录上传到 OSS：

```bash
ossutil cp -rf tinymce oss://2kog/static/tinymce
```

也就是说，线上示例里的：

```text
https://static.2kog.com/static/tinymce/tinymce.min.js
```

对应的是仓库内：

```text
tinymce/tinymce.min.js
```

自定义插件、语言包、皮肤、内容样式也都在这个目录下发布。新增或更新插件时，通常是修改 `tinymce/plugins/` 下的目录；更新编辑器内容样式时，主要关注 `tinymce/skins/content/default/content.min.css`。

## 注意

版本迭代时，注意刷新 CDN 缓存，至少确认以下文件已经更新：

```text
$path-to/static/tinymce/tinymce.min.js
$path-to/static/tinymce/skins/content/default/content.min.css
```


## tinymce自带上传函数实现规范

### 上传入口

TinyMCE 本体有两类常见图片写入入口：

1. 工具栏里的图片上传能力，例如点击图片按钮选择本地图片。
2. 粘贴或拖拽图片能力，例如直接把剪切板里的图片粘贴到编辑器。

这两类入口最终都走 TinyMCE 的 `images_upload_handler`。`Tinymce.vue` 不直接写死后端 API，而是通过组件属性接收上传函数：

```vue
<Tinymce
    v-model="content"
    :upload="tinymceUploadFn"
/>
```

组件内部会把 TinyMCE 传入的 `blobInfo` 转成 `FormData`，字段名固定为 `file`：

```js
const formData = new FormData();
formData.append("file", blobInfo.blob(), blobInfo.filename());
```

然后调用外部传入的 `upload(formData)`，并从返回值里解析图片地址，最后交给 TinyMCE：

```js
success(url);
```

这个 `url` 会直接插入富文本内容中，因此必须是最终可访问的完整图片地址。

### 前后端契约

前端传入的 `upload` 函数通常应请求 `service-cms` 的 TinyMCE 上传接口：

```text
POST /admin/upload/tinymce
POST /user/upload/tinymce
```

真实路由文件：

```text
/Users/iruxu/Desktop/rx-planet/service-cms/app/routes/upload/tinymce.js
```

这两个路由只区分鉴权身份：

+ `/admin/upload/tinymce` 使用 `jwt_admin`
+ `/user/upload/tinymce` 使用 `jwt_user`

它们都复用同一个控制器：

```text
/Users/iruxu/Desktop/rx-planet/service-cms/app/controllers/upload/formdata.js
```

请求要求：

+ 请求方法：`POST`
+ 请求体：`multipart/form-data`
+ 文件字段：`file`
+ 默认 query：`bucket=iruxu`、`dist=upload`
+ 单次上传上限：`30MB`

控制器会读取 `request.payload.file`，按日期归档重命名后调用：

```js
UploadService.uploadToOSS(data, { bucket, dist });
```

底层上传实现位于：

```text
/Users/iruxu/Desktop/rx-planet/service-cms/app/service/upload/index.js
```

最终返回给前端的核心结构是：

```js
{
    location: DEFAULT_CDN_ROOT + "/" + result
}
```

其中 `DEFAULT_CDN_ROOT` 来自：

```text
/Users/iruxu/Desktop/rx-planet/service-cms/setting/global.js
```

所以前端 `Tinymce.vue` 优先读取 `res.data.location`，拿到完整 CDN 地址后插入编辑器。

### 返回值约束

`Tinymce.vue` 当前兼容几种返回结构，但标准返回建议固定为：

```js
{
    data: {
        location: "https://cdn.example.com/upload/2026/5/27/123456.png"
    }
}
```

如果外层请求库没有包 `data`，也可以直接返回：

```js
{
    location: "https://cdn.example.com/upload/2026/5/27/123456.png"
}
```

维护时不要把 TinyMCE 图片上传接口改成只返回 OSS object key。这里的 URL 会直接进入富文本内容，必须是渲染端可访问的 CDN 完整路径。

### 注意事项

+ TinyMCE 的 `images_upload_handler` 按单图上传理解；后端 `formdata` 控制器虽然底层支持数组，但编辑器图片链路应保持单文件返回 `{ location }`。
+ `upload` 属性必须返回 Promise 或普通对象；组件内部会用 `Promise.resolve()` 包裹。
+ 如果后端返回 `{ code, msg }` 且 `code` 为真，组件会视为上传失败并调用 TinyMCE 的 `failure()`。
+ 如果上传成功但没有解析出 `location/url/name`，组件会提示“上传成功但未返回图片地址”。
+ 富文本内容一旦保存，图片 URL 会跟随内容长期存在；CDN 域名、路径规则、对象迁移都要考虑历史内容兼容。
