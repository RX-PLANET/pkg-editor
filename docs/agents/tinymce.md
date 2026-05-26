# Tinymce

## 安装链路

`Tinymce.vue` 只负责 Vue 组件封装，TinyMCE 本体和自定义插件资源需要由宿主页面提前加载。宿主页面需要在 `<head>` 中先定义 `window.RX_TINYMCE_ROOT`，再加载同一目录下的 `tinymce.min.js`。

### A.本地开发
通常使用仓库里的 `npm run dev` 启动 `tinymce/` 静态服务：
```html
<!-- A. 使用本地 tinymce -->
<script>
    window.RX_TINYMCE_ROOT = "http://localhost:5120";
</script>
<script src="http://localhost:5120/tinymce.min.js"></script>
```

### B.线上项目
通常改成自己的 CDN 域名，路径需要指向已经部署好的 `static/tinymce` 目录：
```html
<!-- B. 使用线上部署 tinymce -->
<script>
    window.RX_TINYMCE_ROOT = "https://static.2kog.com/static/tinymce";
</script>
<script src="https://static.2kog.com/static/tinymce/tinymce.min.js"></script>
```

### 全局变量用途
`window.RX_TINYMCE_ROOT` 末尾不要带斜杠。

1、组件内部会用这个值作为资源根路径，自动加载编辑器内容样式：
```js
`${window.RX_TINYMCE_ROOT}/skins/content/default/content.min.css`
```
2、部分自定义插件也依赖同一个变量，例如 `latex` 插件会用它定位弹窗页面、脚本和样式资源。

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
