# Article

## Usage

```js
import Article from '@2kog/pkg-editor/src/components/Article.vue'

<Article
    :content="content"

    @directoryRendered="afterRenderDirectory"
    directorybox="#directory"

    @contentRendered="afterLoad"
    :cdnDomain="cdnDomain"

    :linkWhitelist="linkWhitelist"
    :linkStrict="linkStrict"

    :iframeWhitelist="iframeWhitelist"
></Article>
```

## Props

| 字段              | 含义                                       | 类型      | 默认值  | 必填 | 备注                                                          |
| ----------------- | ------------------------------------------ | --------- | ------- | ---- | ------------------------------------------------------------- |
| `content`         | 内容                                       | `String`  | `""`    | 否   |                                                               |
| `cdnDomain`       | 拼接相对路径地址的图片域名（需自带协议）   | `String`  | `""`    | 否   | 例如 `https://cdn.xxx.com`                                    |
| `linkWhitelist`   | 链接白名单检查（不在白名单则新窗跳转）     | `Array`   | `[]`    | 否   | 字符串数组，支持如 `xxx.com`、`*.xxx.com`，详见下方白名单规则 |
| `linkStrict`      | 链接白名单强制模式                         | `Boolean` | `false` | 否   | 开启后非白名单链接 `href` 置空，不允许跳转                    |
| `iframeWhitelist` | iframe 白名单检查（不在白名单移除 iframe） | `Array`   | `[]`    | 否   | 字符串数组，支持如 `xxx.com`、`*.xxx.com`，详见下方白名单规则 |
| `directorybox`    | 目录容器选择器                             | `String`  | —       | 否   | 例如 `#toc` / `.toc`                                          |
| `pageable`        | 是否开启分页                               | `Boolean` | `true`  | 否   |                                                               |

## Whitelist

`linkWhitelist` 与 `iframeWhitelist` 都按 URL 的 `hostname` 做域名匹配，支持两种写法：

-   `xxx.com`：只精确匹配根域 `xxx.com`
-   `*.xxx.com`：只匹配子域，例如 `a.xxx.com`、`a.b.xxx.com`，不匹配根域 `xxx.com`

如果要同时放行根域和所有子域，需要同时配置两项：

```js
["xxx.com", "*.xxx.com"];
```

白名单项可以带 `http://` 或 `https://` 协议，组件会取其中的 hostname 参与匹配。例如 `https://docs.qq.com` 等价于 `docs.qq.com`。

`linkWhitelist` 为空时，不启用外链白名单处理。配置白名单后，非白名单链接默认会被强制加上 `target="_blank"`；当 `linkStrict` 为 `true` 时，非白名单链接的 `href` 会被置空。

`iframeWhitelist` 为空时，不启用 iframe 白名单过滤。配置白名单后，非白名单 iframe 不会被删除节点，但 `src` 会被置空。
