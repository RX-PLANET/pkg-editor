# iruxu-editor

## 使用逻辑
+ 如果是内部项目，使用npm安装模式即可
+ 如果是外部项目，拷贝整个项目到外部项目中，一些常见的定制修改config下的配置即可，如配色、插件调用等

## 前端人员组件使用文档
+ [Article](./docs/usage/article.md)
+ [Editor](./docs/usage/editor.md)
+ [Tinymce](./docs/usage/tinymce.md)
+ [Upload](./docs/usage/upload.md)

## 供Agents阅读的逻辑文档
+ [Article](./docs/agents/article.md)
+ [Tinymce](./docs/agents/tinymce.md)
+ [Upload](./docs/agents/upload.md)

## 开发
```
$ npm install
$ npm run dev //本地调试
```

## 刷新缓存
```
https://static.2kog.com/static/tinymce/tinymce.min.js
https://static.2kog.com/static/tinymce/skins/content/default/content.min.css
```


## Tinymce本体补充说明

### 特性
+ 基于tinymce v5.2.2扩展
+ 保留v4版本分割线规则
+ 内置powerpaste&checklist插件
+ 增加插入B站视频插件
+ 增加插入折叠文本插件
+ 增加mathjax支持latex

### 插件添加步骤
1. tinymce/icons/custom/icons.js 添加svg图标,需设置尺寸,注意视口大小,移除换行符等
2. tinymce/plugins目录，复制videox(input),foldtext(null)目录作为参考新建插件目录，替换videox为新插件名
3. 编辑器配置中激活插件和添加工具栏项


