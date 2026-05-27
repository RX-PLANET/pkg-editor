# Vite 源码引入兼容说明

`@2kog/pkg-editor` 本仓当前仍用 Vue CLI / webpack 构建，但业务项目可能直接引入 `src/components/*.vue` 源码。维护组件源码时，需要同时兼容 webpack 和 Vite。

## 资源加载

- 组件源码里的本地图片、SVG 等资源使用 ESM 静态 `import`。
- 不要使用 webpack 专属的 `require.context`。
- 不要使用 Vite 专属的 `import.meta.glob`。
- 新增文件类型图标时，同步补充 `src/components/Upload.vue` 里的静态 import 和 `fileIconMap`。

## 运行时配置

组件源码使用 `config/runtime.js`，不要直接引入 `config/global.js`。

- `config/runtime.js` 是浏览器侧 ESM 配置，兼容 webpack 和 Vite。
- `config/global.js` 保留给本仓 Vue CLI / Node 脚本使用，里面的 `module.exports` 和 `process.env` 不适合被 Vite 项目源码链路直接打包。
- Vite 业务项目默认只暴露 `VITE_*` 环境变量；如未额外配置 `envPrefix`，应使用：

```env
VITE_STATIC_ROOT=https://static.2kog.com/
VITE_CDN_ROOT=https://cdn.2kog.com/
VITE_TINYMCE_PATH=/static/tinymce
```

如果 Vite 业务项目配置了 `envPrefix: ["VITE_", "VUE_APP_"]`，也可以继续使用旧的 `VUE_APP_*` 名称。

## 当前扫描结论

截至本说明添加时，`src/` 组件链路中未发现剩余的 `require.context`、`import.meta.glob`、`module.exports` 或未保护的 `process.env`。

`src/assets/js/tex-mml-chtml.js` 中的 `CONFIG.require` 是 MathJax 内部代码，不是 CommonJS `require` 调用。
