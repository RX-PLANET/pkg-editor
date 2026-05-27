# Editor 使用说明

`Editor` 是组合编辑器组件，内部复用 `Tinymce.vue` 和 `Upload.vue`：

+ `Tinymce` 负责正文编辑、图片粘贴上传和最终内容维护。
+ `Upload` 作为 `prepend` 插槽插入到编辑器顶部，点击“插入”后会把上传组件生成的 HTML 交给 Tinymce 插入正文。

## 1. TinyMCE 静态资源

`Editor` 内部复用 `Tinymce`，会自动加载 TinyMCE 主脚本、主题、插件和编辑器内容样式。接入项目不需要在 `index.html` 中手写 `<script>`。

默认使用线上静态资源：

```env
VUE_APP_STATIC_ROOT=https://static.2kog.com/
VUE_APP_CDN_ROOT=https://cdn.2kog.com/
VUE_APP_TINYMCE_PATH=/static/tinymce
```

最终会加载：

```text
https://static.2kog.com/static/tinymce/tinymce.min.js
```

+ 第三方业务项目通过 npm 包引入时，读取的是业务项目自己的 `.env`，不会读取本仓库 `.env`。
+ `VUE_APP_STATIC_ROOT` 只用于 TinyMCE 的 JS、CSS、插件和皮肤等代码资源。
+ `VUE_APP_CDN_ROOT` 用于上传文件、正文图片等业务资源的相对路径补全。
+ 如果业务项目使用自己的域名，需要在业务项目 `.env` 覆盖 `VUE_APP_STATIC_ROOT`、`VUE_APP_CDN_ROOT` 和 `VUE_APP_TINYMCE_PATH`。
+ 不要在业务项目本地开发环境配置 `VUE_APP_TINYMCE_DEV=true`，除非它自己也启动了对应的本地 TinyMCE 静态服务。

本仓库开发调试 TinyMCE 资源时使用：

```env
VUE_APP_TINYMCE_DEV=true
VUE_APP_TINYMCE_PORT=5120
VUE_APP_STATIC_ROOT=https://static.2kog.com/
VUE_APP_CDN_ROOT=https://cdn.2kog.com/
VUE_APP_TINYMCE_PATH=/static/tinymce
```

配合：

```bash
npm run dev:tinymce
```

本地资源会服务在：

```text
http://localhost:5120/static/tinymce/tinymce.min.js
```

## 2. 前端组件引用

```vue
<script>
import Editor from "@2kog/pkg-editor/src/components/Editor.vue";

export default {
    components: {
        Editor,
    },
    data: function () {
        return {
            content: "",
        };
    },
    methods: {
        upload: function (file) {
            const formData = file instanceof FormData ? file : new FormData();
            if (!(file instanceof FormData)) formData.append("file", file);

            return this.$http.post("/api/upload", formData);
        },
    },
};
</script>

<template>
    <Editor v-model="content" :upload="upload" />
</template>
```

`upload(file)` 同时服务两类上传：

+ Tinymce 图片粘贴、拖拽、图片插件上传：传入值是 `FormData`。
+ 顶部 Upload 附件上传：传入值是原始 `File` 对象。

如果业务侧上传接口只接收 `FormData`，按上面的示例统一转换即可。

## 3. 属性

| 字段 | 含义 | 类型 | 默认值 | 必填 | 备注 |
| --- | --- | --- | --- | --- | --- |
| `modelValue` | 编辑器内容 | `String` | `""` | 否 | 通常配合 `v-model` 使用 |
| `content` | 编辑器内容旧写法 | `String` | `""` | 否 | 兼容 `v-model:content` / `:content` |
| `height` | 编辑器高度 | `Number` | `800` | 否 | 单位 px |
| `upload` | 上传函数 | `Function` | `() => {}` | 否 | 推荐统一使用这个字段 |
| `showTips` | 是否显示底部使用提示 | `Boolean` | `true` | 否 |  |
| `attachmentEnable` | 是否显示顶部上传组件 | `Boolean` | `true` | 否 | 关闭后只保留 Tinymce |
| `uploadText` | 上传按钮文字 | `String` | `上传附件` | 否 |  |
| `uploadDesc` | 上传提示 | `String` | 自动生成 | 否 | 透传给 `Upload.desc` |
| `uploadMax` | 单次最大文件数 | `Number` | `10` | 否 | 透传给 `Upload.max` |
| `uploadSizeLimit` | 单文件大小限制 | `Number` | `200` | 否 | 单位 MB |
| `uploadAccept` | 允许选择的文件类型 | `String` | `*` | 否 | 透传给 `Upload.accept` |

兼容旧字段：

| 字段 | 当前映射 |
| --- | --- |
| `tinymceUploadFn` | 等同于 `upload` |
| `attachmentUploadFn` | 等同于 `upload` |
| `attachmentText` | 等同于 `uploadText` |
| `attachmentDesc` | 等同于 `uploadDesc` |
| `attachmentMax` | 等同于 `uploadMax` |
| `attachmentSizeLimit` | 等同于 `uploadSizeLimit` |
| `attachmentAccept` | 等同于 `uploadAccept` |

## 4. 事件

| 事件 | 触发时机 | 参数 |
| --- | --- | --- |
| `update:modelValue` | 编辑器内容变化 | `html` |
| `update:content` | 编辑器内容变化 | `html` |
| `update` | 编辑器内容变化 | `html` |
| `insert` | Upload 点击插入后 | `{ list, html }` |
| `uploadUpdate` | Upload 文件列表变化 | `fileList` |
| `uploadHtmlUpdate` | Upload 插入 HTML 变化 | `html` |

`insert` 事件触发时，`Editor` 已经把 `payload.html` 插入到 Tinymce 正文中。业务侧通常只需要监听该事件做日志、埋点或额外状态同步。

## 5. 关闭顶部上传

如果只需要富文本编辑器，不需要附件上传按钮：

```vue
<Editor v-model="content" :upload="upload" :attachmentEnable="false" />
```

关闭后不影响 Tinymce 自身的图片粘贴、拖拽或图片插件上传能力，这部分仍然使用 `upload` 函数。

## 6. 手动插入内容

可以通过组件实例调用 `insertResource(html)` 手动插入 HTML：

```vue
<template>
    <Editor ref="editor" v-model="content" :upload="upload" />
</template>
```

```js
this.$refs.editor.insertResource('<p>手动插入内容</p>');
```
