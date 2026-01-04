# Article

## Usage

```vue
import Article from 'iruxu-editor/src/components/Article.vue

<Article
    :content="content"
    @contentRendered="afterLoad"
    
    :linkWhitelist="linkWhitelist"
    :linkStrict="linkStrict"
    
    :iframeWhitelist="iframeWhitelist"

    :cdnDomain="cdnDomain"

    @directoryRendered="afterRenderDirectory"
    directorybox="#directory"
></Article>
```

## Props

| 字段              | 含义                                       | 类型      | 默认值  | 必填 | 备注                                                    |
| ----------------- | ------------------------------------------ | --------- | ------- | ---- | ------------------------------------------------------- |
| `content`         | 内容                                       | `String`  | —       | 否   |                                                         |
| `cdnDomain`       | 拼接相对路径地址的图片域名（需自带协议）   | `String`  | `""`    | 否   | 例如 `https://cdn.xxx.com`                              |
| `linkWhitelist`   | 链接白名单检查（不在白名单则新窗跳转）     | `Array`   | `[]`    | 否   | 字符串数组，支持如 `xxx.com`、`*.xxx.com`（按实现而定） |
| `linkStrict`      | 链接白名单强制模式                         | `Boolean` | `false` | 否   | 开启后非白名单链接 `href` 置空，不允许跳转              |
| `iframeWhitelist` | iframe 白名单检查（不在白名单移除 iframe） | `Array`   | `[]`    | 否   | 字符串数组，支持通配符时需按实现而定                    |
| `directorybox`    | 目录容器选择器                             | `String`  | —       | 否   | 例如 `#toc` / `.toc`                                    |
| `pageable`        | 是否开启分页                               | `Boolean` | `true`  | 否   |                                                         |
