# TinyMCE

## 引用
```html
<script src="https://cdn-path/static/tinymce/tinymce.min.js"></script>
```

## 构建
`npm run build`更新css构建

## 特性
+ 基于tinymce v5.2.2扩展
+ 保留v4版本分割线规则
+ 内置powerpaste&checklist插件
+ 增加插入B站视频插件
+ 增加插入折叠文本插件
+ 增加mathjax支持latex


## 插件添加步骤
1. icons/custom/icons.js 添加svg图标,需设置尺寸,注意视口大小,移除换行符等
2. plugins目录，复制videox(input),foldtext(null)目录作为参考新建插件目录，替换videox为新插件名
3. 编辑器配置中激活插件和添加工具栏项

## 版本迭代

### 新增功能
https://cdn-path/static/tinymce/tinymce.min.js


### 更新样式
npm run update  
npm run build  
https://cdn-path/static/tinymce/skins/content/default/content.min.css


## Fork事项
+ package.json
+ skins/content/default/content.less
+ .github/workflows/deploy.yml