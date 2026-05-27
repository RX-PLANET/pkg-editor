# Article 底层链路维护说明

本文记录 `src/components/Article.vue` 的渲染链路。后续改文章渲染、安全过滤、目录、分页、图片预览、代码高亮或 LaTeX 时，优先按这里的顺序核对影响面。

## 组件定位

`Article.vue` 是富文本阅读端组件，用于渲染 Tinymce 保存后的 HTML。它不是纯 `v-html` 容器，而是分成两段处理：

1. 字符串阶段：对原始 HTML 做分页、安全过滤、资源地址和白名单处理。
2. DOM 阶段：HTML 写入页面后，再初始化交互能力和视觉增强。

入口文件：

```text
src/components/Article.vue
```

主要依赖：

```text
src/assets/js/xss.js
src/assets/js/iframe.js
src/assets/js/img.js
src/assets/js/a.js
src/assets/js/nextpage.js
src/assets/js/fold.js
src/assets/js/directory.js
src/assets/js/katex.js
src/assets/js/code.js
src/assets/js/renderImgPreview.js
config/global.js
```

## 核心数据流

`content` 是唯一内容来源。组件内部不会修改父级传入的 `content`，只会把处理后的结果写入本地 `data`：

```js
origin -> chunks -> doReg(chunk) -> data -> v-html
```

字段含义：

- `origin`：直接返回 `this.content`。
- `chunks`：当 `pageable=true` 时由 `execSplitPages(origin)` 拆分；否则返回 `[origin]`。
- `data`：每个 chunk 经过 `doReg()` 后的 HTML 数组。
- `page`：当前分页页码，从 `1` 开始。
- `all`：是否展示全文；点击“加载全部”后为 `true`。

`content` 变化会触发 `run()`，因此外部异步加载文章正文后只需要更新 `content`。

## render/run 执行顺序

`run()` 是完整渲染入口：

```js
run() {
    this.render();
    this.$nextTick(() => {
        this.$emit("contentLoaded");
        this.doDOM(this.$refs.article);
        this.$emit("contentRendered");
        this.doDir();
    });
}
```

顺序不能随意调整：

1. `render()` 先把字符串处理好，写入 `data`。
2. Vue 根据 `data` 完成 `v-html` 更新。
3. `$nextTick()` 后才可以访问真实 DOM。
4. 先触发 `contentLoaded`，表示 HTML 已进入页面。
5. `doDOM()` 初始化折叠、代码、LaTeX、图片预览。
6. 再触发 `contentRendered`，表示 DOM 增强完成。
7. 最后 `doDir()` 生成目录，并触发 `directoryRendered`。

维护事件语义时要保持：

- `contentLoaded`：只表示 HTML 已挂载。
- `contentRendered`：表示 DOM 增强已完成。
- `directoryRendered`：表示目录处理已完成，参数是 `renderDirectory()` 的返回值。

## 字符串阶段：doReg

`doReg(data)` 的顺序固定为：

```js
data = execFilterXSS(data);
data = execFilterIframe(data, this.iframeWhitelist);
data = execLazyload(data, GlobalConf.cdnRoot);
data = execFilterLink(data, this.linkWhitelist, this.linkStrict);
```

### 1. XSS 过滤

文件：

```text
src/assets/js/xss.js
```

使用 `sanitize-html` 做白名单过滤。默认禁止：

```text
script / object / embed / applet / base / meta / link
```

额外允许阅读端需要的富文本标签：

```text
img / h1-h6 / table / blockquote / pre / code / hr / video / source / iframe
```

关键规则：

- 移除所有 `on*` 事件属性。
- `style` 会移除 `@import` 和 `url(...)`。
- `href` / `src` 中的 `javascript:` 会被置空。
- `img` 允许 `data:image/*`，但不允许任意 `data:`。
- `iframe` 只允许 `http/https` scheme。

不要在后续 helper 里重新放宽脚本、事件属性或任意 URL scheme，否则会绕开这里的安全边界。

### 2. iframe 白名单

文件：

```text
src/assets/js/iframe.js
```

`iframeWhitelist` 为空时，视为“不启用域名白名单”，但仍会把非 `http/https` 或协议相对地址的 `src` 置空。

`iframeWhitelist` 非空时：

- 只校验 `http://`、`https://`、`//` 形式的地址。
- 通过 `hostname` 匹配白名单。
- 非白名单 iframe 不删除节点，只把 `src` 置空。

白名单规则：

- `example.com` 只匹配根域。
- `*.example.com` 只匹配子域，不匹配根域。
- 可以传带协议的地址，内部会取 `hostname`。

### 3. 图片懒加载与 CDN 拼接

文件：

```text
src/assets/js/img.js
```

对所有 `img` 固定设置：

```html
loading="lazy"
```

`Article.vue` 不再从组件 prop 读取 CDN 域名，而是统一读取：

```text
config/global.js -> cdnRoot
```

`cdnRoot` 来自 `VUE_APP_CDN_ROOT`，默认是 `https://cdn.2kog.com/`。它只用于上传文件、正文图片等业务资源的相对路径补全；TinyMCE 的 JS、CSS、插件和皮肤等代码资源使用 `VUE_APP_STATIC_ROOT`。

当 `GlobalConf.cdnRoot` 存在时，才会处理 `src` 和 `data-src` 的相对路径：

- `http://`、`https://`、`//`、`data:`、`blob:`、`mailto:`、`tel:`、`javascript:` 不拼接。
- `/uploads/a.png` 拼为 `cdnRoot + /uploads/a.png`。
- `uploads/a.png`、`./a.png` 会尽量用 `new URL(path, cdnRoot + "/")` 拼接。
- 如果 `cdnRoot` 不是合法 URL，会兜底做字符串拼接。

`cdnRoot` 应该带协议。旧版 `cdnDomain` prop 只保留调用兼容，不再参与渲染链路。

### 4. 链接白名单

文件：

```text
src/assets/js/a.js
```

处理范围是 `a[href]`。

基础规则：

- `href="#xxx"` 强制 `target="_self"`。
- `javascript:` 一律置空。
- `mailto:`、`tel:`、`sms:` 放行，不参与白名单判断。
- 相对链接默认视为站内白名单。

只有 `linkWhitelist` 非空时，才会处理“非白名单外链”：

- `linkStrict=false`：非白名单链接强制 `target="_blank"`。
- `linkStrict=true`：非白名单链接 `href` 置空。

白名单匹配规则与 iframe 一致。

## 分页链路

文件：

```text
src/assets/js/nextpage.js
```

分页只按固定注释拆分：

```html
<!--nextpage-->
```

`pageable=true` 时：

```js
content.split("<!--nextpage-->")
```

渲染结构是多个 `.c-article-chunk`：

```html
<div id="c-article-part1" class="c-article-chunk on"></div>
<div id="c-article-part2" class="c-article-chunk"></div>
```

当前页通过 `.on` 控制显示。点击“加载全部”后：

- `all=true`
- 所有 chunk 都会加上显示条件
- 目录目标从当前页切换到 `#c-article`

`pageable=false` 时不会拆分分页，只渲染 `data[0]`。

注意：`splitPages("")` 当前会返回空字符串而不是数组。调用链依赖空内容不进入正常分页渲染，维护时如果改成始终返回数组，需要同步检查 `total`、`hasPages` 和模板分支。

## DOM 阶段：doDOM

`doDOM($root)` 在 HTML 挂载后执行：

```js
renderFoldBlock($root);
renderCode("code[class=^'language-']");
renderKatex();
renderImgPreview();
```

### 折叠块

文件：

```text
src/assets/js/fold.js
```

在 `$root` 内查找 `.e-summary`，点击后切换紧邻的 `.e-details`：

```html
<div class="e-summary">标题</div>
<div class="e-details">详情</div>
```

依赖结构是“summary 后面紧跟 details”。如果 Tinymce 插件输出结构变化，这里也要同步。

### 代码高亮

文件：

```text
src/assets/js/code.js
```

使用 `highlight.js`，并引入：

```text
highlight.js/styles/github.css
```

当前调用 `renderCode("code[class=^'language-']")`，但 helper 内部最终仍执行 `hljs.highlightAll()`。如果后续需要精确限制范围，应先修正 `renderCode()` 内部 `hljs.configure()` 的条件。

### LaTeX

文件：

```text
src/assets/js/katex.js
```

支持三类来源：

- `.w-latex` 块级容器。
- 行内公式：`\(...\)` 或 `$...$`。
- 块级公式：`\[...\]` 或 `$$...$$`。

渲染时会跳过 `pre`、`code` 和已渲染的 `.katex`，避免代码块和重复渲染被误处理。

### 图片预览

文件：

```text
src/assets/js/renderImgPreview.js
```

默认在 `.c-article` 内为 `src` 非空的 `img` 初始化 `viewerjs`：

```js
new Viewer(ele, {
    toolbar: false,
    navbar: false,
});
```

`Upload.vue` 也复用了这里导出的 `showImgPreview(ele)`。改 viewer 初始化参数时，需要同时考虑阅读端和上传弹窗预览。

## 目录链路

文件：

```text
src/assets/js/directory.js
```

`Article.vue` 中 `doDir()` 会根据当前状态决定目录扫描范围：

- 分页模式且未加载全部：扫描 `#c-article-part${page}`。
- 加载全部或无分页：扫描 `#c-article`。

`renderDirectory(from, directorybox)` 会扫描：

```text
h1,h2,h3,h4,h5,h6
```

只有标题数量大于 `1` 才会生成目录。

目录层级规则：

- 统计当前扫描范围内出现过的标题级别。
- 只取前 3 个出现过的级别。
- 分别标记为 `lv1`、`lv2`、`lv3`。
- 不在前三层内的标题标记为 `lv0`。

目录点击行为：

- 点击目录项滚动到原始标题 `offset().top - 112`。
- 原始标题临时加 `isScrollFocus`，约 3.5 秒后移除。

维护注意：

- `directorybox` 必须指向已经存在的 DOM 容器。
- 目录 helper 使用 jQuery 直接写入外部 DOM，不受 Vue 管理。
- 多次渲染会重新写入目录容器，并重新绑定目录内部事件。

## mode 参数

`mounted()` 会读取 URL query：

```js
const params = new URLSearchParams(location.search);
this.mode = params.get("mode") || "";
```

当前 `mode` 没有参与渲染逻辑。它是保留字段，后续如果要接入 WebView、打印或其它模式，需要先确认旧消费端是否已经依赖这个字段。

## 维护边界

改动时优先按以下边界拆分：

- 安全标签/属性/scheme：改 `xss.js`。
- iframe 放行域名或 src 处理：改 `iframe.js`。
- 图片相对路径和懒加载：改 `img.js`。
- 外链跳转策略：改 `a.js`。
- 分页标记：改 `nextpage.js`，并同步 `Article.vue` 模板和目录目标。
- 目录结构与滚动：改 `directory.js`。
- 折叠块结构：改 `fold.js`。
- 代码高亮范围或主题：改 `code.js`。
- 公式语法和渲染策略：改 `katex.js`。
- 图片预览能力：改 `renderImgPreview.js`。

不要把业务项目的特殊域名、特殊栏目规则或鉴权逻辑写进 `Article.vue`。这个包是基础编辑器库，业务差异应通过 props 或消费端包装层处理。

## 快速排查清单

文章内容显示异常：

1. 先确认原始 `content` 是否为空。
2. 检查是否被 `<!--nextpage-->` 拆成了多个 chunk。
3. 检查 `xss.js` 是否过滤了目标标签或属性。
4. 检查图片是否因 `config/global.js` 的 `cdnRoot` 拼接变成错误 URL。
5. 检查 iframe/link 是否被白名单置空。

目录不显示：

1. 确认 `directorybox` 对应 DOM 已存在。
2. 确认当前页或全文内标题数量大于 1。
3. 分页模式下确认标题是否在当前页，而不是其它分页 chunk。
4. 检查 `directory.js` 是否能在目标范围内找到 `h1-h6`。

图片预览不工作：

1. 确认图片最终 `src` 非空。
2. 确认 DOM 阶段已触发 `contentRendered`。
3. 检查 `viewerjs` 样式是否被引入或被业务侧覆盖。

LaTeX 不渲染：

1. 确认公式不在 `pre` 或 `code` 内。
2. 确认块级 `.w-latex` 内没有被 XSS 过滤掉关键内容。
3. 检查控制台是否有 `KaTeX render error`。
