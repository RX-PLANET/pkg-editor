# Upload 组件维护说明

本文记录 `src/components/Upload.vue` 的内部数据流，后续改上传组件时优先按这里的语义保持兼容。

## 组件定位

`Upload.vue` 只负责上传 UI、文件状态维护和插入 HTML 构建，不内置接口请求。真实上传函数由业务侧通过 `upload` prop 传入。

默认上传限制来自 `config/global.js`：

```js
uploadMax: 10
uploadSizeLimit: 200
uploadAccept: "*"
cdnRoot: "https://cdn.2kog.com/"
```

`cdnRoot` 来自 `VUE_APP_CDN_ROOT`，只用于上传文件、正文图片等业务资源的相对路径补全。TinyMCE 的 JS、CSS、插件和皮肤等代码资源使用 `staticRoot`，也就是 `VUE_APP_STATIC_ROOT` 或本地 `VUE_APP_TINYMCE_DEV` 服务。

`uploadAccept: "*"` 表示前端选择器不限制文件类型。其它值直接透传给原生 `accept`，例如 `image/*,video/*,.pdf,.zip`。

## 选择与上传流程

1. 用户点击上传按钮，打开 Element Plus `el-dialog`。
2. 用户选择文件后触发 `el-upload` 的 `on-change`。
3. 组件先检查单文件大小，超过 `sizeLimit` 会移除该文件并提示。
4. 组件设置当前文件 `status = "uploading"`，然后调用外部 `upload(file.raw)`。
5. 上传成功后，组件从返回值里解析线上地址，并写回 `fileList`。
6. 上传失败、上传成功但没有地址、超出大小限制时，组件会把该文件从列表移除。

`el-upload` 的 `auto-upload` 是 `false`，所以不要把上传请求写回 Element Plus 默认 action；本组件的上传入口只有 `upload(file.raw)`。

组件内部使用 `Promise.resolve(upload(file.raw))` 包装上传结果，因此业务侧可以返回 Promise，也可以直接返回同步对象或字符串。

## 上传返回值

组件会按顺序读取这些字段作为文件地址：

```text
location / path / key / name / data / data.location / data.path / data.key / data.name / url
```

同时兼容顶层数组和 `data` 数组，数组会取第一项作为文件地址。

ali-oss 的 STS 直传通常会返回 `{ name, url }`。其中 `name` 是对象路径，`url` 是 OSS bucket 原站地址；如果 bucket 不允许直接访问，必须使用 `name` 拼接 `GlobalConf.cdnRoot` 后通过 CDN 回源访问。因此 `url` 只作为最后兜底字段，不应优先于 `name`。

地址处理规则：

- `http://` 或 `https://` 开头：直接使用。
- `data:`、`blob:`、`//cdn.example.com/a.png` 等带 scheme 或协议相对地址：直接使用。
- `/uploads/a.png` 或 `uploads/a.png`：拼接 `GlobalConf.cdnRoot`。

## fileList

`fileList` 是组件内部维护的文件对象列表，不是纯原始 `File[]`。它以 Element Plus 文件对象为基础，并在上传成功后补充业务字段：

```js
{
    name: "demo.png",
    size: 1024,
    uid: 123,
    raw: File,
    url: "https://cdn.example.com/demo.png",
    status: "success",
    selected: true,
    is_img: true,
    is_video: false
}
```

关键字段语义：

- `raw`：用户本地选择的原始 `File` 对象。
- `url`：上传完成后解析出的线上地址。
- `status`：当前上传状态，组件主要使用 `uploading` 和 `success`。
- `selected`：是否选中用于本次插入；上传成功默认选中，点击文件卡片会切换，点击插入后会全部重置为未选中。
- `is_img` / `is_video`：根据 MIME 判断，`image/*` 作为图片，`video/*` 作为视频。

组件不会维护单独的 URL 数组。如果业务侧需要地址序列，从 `fileList` 计算：

```js
const urls = fileList.map((file) => file.url).filter(Boolean);
const selectedUrls = fileList.filter((file) => file.selected).map((file) => file.url).filter(Boolean);
```

## insertHtml

`insertHtml` 是内部缓存的 HTML 字符串，只在点击“插入”时通过 `buildHTML()` 根据当前选中文件生成。上传成功、选择文件、切换选中状态本身不会立刻构建最终 HTML。

生成规则：

```html
<img src="https://cdn.example.com/a.png" />
<video src="https://cdn.example.com/a.mp4" controls />
<a target="_blank" href="https://cdn.example.com/a.pdf">a.pdf</a>
```

图片和视频判断基于 MIME：

- `image/*` -> `<img />`
- `video/*` -> `<video controls />`
- 其它 -> `<a target="_blank" />`

## 事件语义

`update`

内部 `fileList` 变化时触发，参数是完整 `fileList`。它不是上传成功事件；删除、清空、切换选中状态也会触发。

`htmlUpdate`

内部 `insertHtml` 变化时触发，参数是 HTML 字符串。正常情况下点击“插入”会生成 HTML 并触发；`clear()` 会清空 HTML 并触发空字符串。

`insert`

用户点击“插入”且存在选中文件时触发，参数是：

```js
{
    list: fileList,
    html: insertHtml
}
```

编辑器类消费方通常监听这个事件，把 `html` 插入正文。

## 交互补充

- 对话框小于 `@ipad-y` 断点时全屏显示，样式在 `src/assets/css/upload.less` 的 `.c-large-dialog.el-dialog`。
- 图片文件使用缩略图展示并支持预览；非图片文件使用 `src/assets/img/files/*.svg` 的后缀图标，找不到时使用 `file.svg`。
- 关闭弹窗会清空 `fileList`，因此父级会收到一次空列表 `update`。
