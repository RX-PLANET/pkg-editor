# Tinymce 使用说明

## 1. index.html
在html页面 `<head>` 中先定义 TinyMCE 静态资源根路径。
```html
<script>
    window.RX_TINYMCE_ROOT = "https://static.2kog.com/static/tinymce";
</script>
<script src="https://static.2kog.com/static/tinymce/tinymce.min.js"></script>
```

+ 接入其它项目时，把 `https://static.2kog.com/static/tinymce` 换成当前项目自己的 CDN 地址即可。
+ `window.RX_TINYMCE_ROOT` 末尾不要带斜杠。

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
| `upload`     | Tinymce 右键粘贴上传函数 | `Function` | `() => {}` | 否   | 用于右键上传或图片上传插件 |
| `showTips`   | 是否显示编辑器底部使用提示   | `Boolean`  | `true`     | 否   |                                                        |

## 4. 定义部署 Workflow

项目需要把本仓库的 `tinymce/` 子目录部署到 CDN 对应目录。
当前仓库示例见 `.github/workflows/tinymce.yml`，核心逻辑是上传整个 `tinymce/` 目录：

## 5. 特殊情况刷新 CDN

版本迭代后，如果发现编辑器脚本、样式或插件没有生效，优先刷新 CDN 缓存：

```text
$path-to/static/tinymce/tinymce.min.js
$path-to/static/tinymce/skins/content/default/content.min.css
```
