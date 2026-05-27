# Tinymce 使用说明

## 1. TinyMCE 静态资源

`Tinymce` 会自动加载 TinyMCE 主脚本、主题、插件和编辑器内容样式，接入项目不需要在 `index.html` 里手写 `<script>`。

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
import Tinymce from "@2kog/pkg-editor/src/components/Tinymce.vue";
</script>
<template>
    <Tinymce v-model="content" :height="800" :upload="tinymceUploadFn" />
</template>
```

## 3. 属性

| 字段         | 含义                     | 类型       | 默认值     | 必填 | 备注                                                   |
| ------------ | ------------------------ | ---------- | ---------- | ---- | ------------------------------------------------------ |
| `modelValue` | 内容                     | `String`   | `""`       | 否   | 通常配合 `v-model` 使用                                |
| `height`     | 默认高度                 | `Number`   | `800`      | 否   | 指 px                                                  |
| `upload`     | Tinymce 右键粘贴上传函数 | `Function` | `() => {}` | 否   | 用于右键上传或图片上传插件，默认上限30M |
| `showTips`   | 是否显示编辑器底部使用提示   | `Boolean`  | `true`     | 否   |                                                        |

## 4. 样式

如果修改了编辑器内容样式，需要在本仓库手动执行：

```bash
npm run build
```

该命令会重新生成 `tinymce/skins/content/default/content.min.css`。

## 5. 定义部署 Workflow

项目需要把本仓库的 `tinymce/` 子目录部署到 CDN 对应目录。
当前仓库示例见 `.github/workflows/tinymce.yml`，核心逻辑是上传整个 `tinymce/` 目录：

## 6. 特殊情况刷新 CDN

版本迭代后，如果发现编辑器脚本、样式或插件没有生效，优先刷新 CDN 缓存：

```text
$path-to/static/tinymce/tinymce.min.js
$path-to/static/tinymce/skins/content/default/content.min.css
```
