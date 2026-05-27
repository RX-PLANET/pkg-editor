# Article 使用说明

`Article` 用于渲染 Tinymce 产出的 HTML 内容。组件会在渲染前做安全与资源处理，在渲染后初始化目录、代码高亮、折叠块、LaTeX 和图片预览。

## 1. 前端组件引用

```vue
<template>
    <div class="m-article-layout">
        <aside id="directory"></aside>

        <Article
            :content="content"
            :linkWhitelist="linkWhitelist"
            :iframeWhitelist="iframeWhitelist"
            directorybox="#directory"
            @contentLoaded="afterContentLoaded"
            @contentRendered="afterContentRendered"
            @directoryRendered="afterDirectoryRendered"
        />
    </div>
</template>

<script>
import Article from "@2kog/pkg-editor/src/components/Article.vue";
export default {
    components: {
        Article,
    },
    data: function () {
        return {
            content: "<h1>标题</h1><p>正文内容</p>",
            linkWhitelist: ["example.com", "*.example.com"],
            iframeWhitelist: ["player.bilibili.com"],
        };
    },
    methods: {
        afterContentLoaded: function () {
            console.log("HTML 已写入页面");
        },
        afterContentRendered: function () {
            console.log("DOM 增强已完成");
        },
        afterDirectoryRendered: function (directory) {
            console.log("目录已生成", directory);
        },
    },
};
</script>

```

## 2. 属性

| 字段 | 含义 | 类型 | 默认值 | 必填 | 备注 |
| --- | --- | --- | --- | --- | --- |
| `content` | 待渲染 HTML | `String` | `""` | 否 | 通常传 Tinymce 保存后的正文 |
| `linkWhitelist` | 链接白名单 | `Array` | `[]` | 否 | 配置后处理非白名单链接 |
| `linkStrict` | 链接强制白名单模式 | `Boolean` | `false` | 否 | 开启后非白名单链接 `href` 会被置空 |
| `iframeWhitelist` | iframe 白名单 | `Array` | `[]` | 否 | 配置后处理非白名单 iframe |
| `directorybox` | 目录容器选择器 | `String` | — | 否 | 例如 `#directory` / `.directory` |
| `pageable` | 是否启用分页 | `Boolean` | `true` | 否 | 按正文里的分页标记拆分内容 |

## 3. 事件

| 事件 | 触发时机 | 参数 |
| --- | --- | --- |
| `contentLoaded` | HTML 写入组件 DOM 后 | — |
| `contentRendered` | 折叠块、代码、LaTeX、图片预览等 DOM 增强完成后 | — |
| `directoryRendered` | 目录生成完成后 | `directory` |

常见用法：

+ 需要读取文章 DOM 时，用 `contentRendered`。
+ 需要同步右侧目录时，用 `directoryRendered`。
+ 只关心正文已经挂载到页面时，用 `contentLoaded`。

## 4. 渲染流程

每次 `content` 变化后，组件会重新执行完整渲染流程：

1. 按分页规则拆分正文。
2. 对每个分页块执行 XSS 过滤。
3. 处理 iframe 白名单。
4. 处理图片懒加载与相对路径 CDN 拼接。
5. 处理链接白名单。
6. 把 HTML 写入页面。
7. 初始化折叠块、代码高亮、LaTeX 和图片预览。
8. 根据当前页或全文生成目录。

## 5. 图片 CDN 规则

正文里的相对图片路径会统一使用 `config/global.js` 的 `cdnRoot` 拼接，不需要在 `Article` 上额外传属性。

```js
module.exports = {
    cdnRoot: "https://cdn.example.com/",
};
```

`cdnRoot` 来自 `VUE_APP_CDN_ROOT`，默认是 `https://cdn.2kog.com/`。它只用于上传文件、正文图片等业务资源；TinyMCE 的 JS、CSS、插件和皮肤等代码资源使用 `VUE_APP_STATIC_ROOT`。

如果正文中有相对图片地址，渲染时会按 `cdnRoot` 拼成完整地址。`cdnRoot` 需要带协议。

如果正文已经保存的是完整 URL，则不会再拼接 `cdnRoot`。

## 6. 链接白名单

`linkWhitelist` 按 URL 的 `hostname` 做域名匹配，支持两种写法：

+ `example.com`：只匹配根域 `example.com`。
+ `*.example.com`：只匹配子域，例如 `a.example.com`、`a.b.example.com`，不匹配根域 `example.com`。

如果要同时放行根域和所有子域，需要同时配置：

```js
["example.com", "*.example.com"];
```

白名单项可以带 `http://` 或 `https://` 协议，组件会取 hostname 参与匹配：

```js
["https://docs.example.com"];
```

`linkWhitelist` 为空时，不启用外链白名单处理。配置白名单后：

+ 默认模式：非白名单链接会按外链处理，强制新窗口打开。
+ `linkStrict=true`：非白名单链接的 `href` 会被置空，不允许跳转。

```vue
<Article
    :content="content"
    :linkWhitelist="['example.com', '*.example.com']"
    :linkStrict="true"
/>
```

## 7. iframe 白名单

`iframeWhitelist` 同样按 URL 的 `hostname` 匹配，规则与 `linkWhitelist` 一致。

```vue
<Article
    :content="content"
    :iframeWhitelist="['player.bilibili.com', '*.youtube.com']"
/>
```

`iframeWhitelist` 为空时，不启用 iframe 白名单过滤。配置白名单后，非白名单 iframe 的 `src` 会被置空。

## 8. 分页与目录

默认 `pageable=true`，组件会根据正文分页标记把文章拆成多个分页块，并自动显示分页器和“加载全部”按钮。

```vue
<Article :content="content" :pageable="false" />
```

关闭分页后，正文会作为一个整体渲染。

目录由 `directorybox` 指定外部容器：

```html
<aside id="directory"></aside>
```

```vue
<Article :content="content" directorybox="#directory" />
```

分页开启时，目录默认只基于当前页生成；点击“加载全部”后，会基于全文重新生成。

## 9. 样式

组件会自动引入：

```less
@import "../assets/css/article.less";
```

渲染根节点包含以下类名，业务侧可以基于这些类做局部样式覆盖：

```html
<div class="c-article-tinymce c-article-box">
    <div class="c-article"></div>
</div>
```

不建议直接覆盖全局标签样式。需要定制文章正文样式时，优先限制在 `.c-article-tinymce` 或 `.c-article` 下。
