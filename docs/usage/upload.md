# Upload 使用说明

## 1. 前端组件引用

```vue
<script>
import Upload from "@2kog/pkg-editor/src/components/Upload.vue";
</script>

<template>
    <Upload :upload="upload" @insert="处理上传的文件"/>
</template>
```

## 2. 属性

| 字段 | 含义 | 类型 | 默认值 | 必填 | 备注 |
| --- | --- | --- | --- | --- | --- |
| `upload` | 上传函数 | `Function` | — | 是 | 接收原始 `File` 对象 |
| `text` | 按钮文字 | `String` | `上传附件` | 否 |  |
| `desc` | 上传提示 | `String` | 自动生成 | 否 | 不传时根据 `max` 与 `sizeLimit` 生成 |
| `max` | 单次最大文件数 | `Number` | `GlobalConf.uploadMax` | 否 |  |
| `sizeLimit` | 单文件大小限制，单位 MB | `Number` | `GlobalConf.uploadSizeLimit` | 否 |  |
| `accept` | 允许选择的文件类型 | `String` | `GlobalConf.uploadAccept` | 否 | `*` 表示不限制 |

`upload(file)` 可以返回 Promise，也可以直接返回同步结果。返回值里需要能解析出文件地址，支持 `url`、`location`、`name`、`data`、数组第一项等常见结构；相对路径会自动拼接 `GlobalConf.cdnRoot`。

`GlobalConf.cdnRoot` 来自 `VUE_APP_CDN_ROOT`，默认是 `https://cdn.2kog.com/`。它只用于上传文件、正文图片等业务资源；TinyMCE 的 JS、CSS、插件和皮肤等代码资源使用 `VUE_APP_STATIC_ROOT`。


## 3. 事件与对象

| 事件 | 触发时机 | 参数 |
| --- | --- | --- |
| `insert` | 点击插入且存在选中文件 | `{ list, html }` |
| `update` | 文件列表变化 | `fileList` |
| `htmlUpdate` | 插入 HTML 变化 | `html` |

### 3.1 fileList

`fileList` 是组件内部维护的上传文件对象列表。它不是纯原始 `File` 数组，每一项会保留 Element Plus 文件对象信息，并在上传成功后补充业务字段。

```js
{
    name: "demo.png",
    size: 1024,
    uid: 123,
    raw: File,              // 原始 File 对象
    url: "https://...",     // 上传完成后的线上地址
    status: "success",      // uploading / success
    selected: true,         // 是否选中用于插入
    is_img: true,           // MIME 为 image/*
    is_video: false         // MIME 为 video/*
}
```

组件不会额外维护单独的 URL 数组。业务侧如果只需要线上地址，可以从 `fileList` 中取：

```js
const urls = fileList.map((file) => file.url).filter(Boolean);
const selectedUrls = fileList.filter((file) => file.selected).map((file) => file.url).filter(Boolean);
```

### 3.2 insertHtml

`insertHtml` 是组件内部根据选中文件拼接出的 HTML 字符串，对外通过 `insert` 事件的 `html` 字段和 `htmlUpdate` 事件暴露。

图片、视频和普通附件分别会生成：

```html
<img src="https://cdn.example.com/a.png" />
<video src="https://cdn.example.com/a.mp4" controls />
<a target="_blank" href="https://cdn.example.com/a.pdf">a.pdf</a>
```

点击“插入”时，`insert` 事件会返回完整文件列表和本次 HTML：

```js
{
    list: fileList,
    html: insertHtml
}
```
