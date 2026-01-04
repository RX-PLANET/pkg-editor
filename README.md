# iruxu-editor

## 组件文档
+ [Article](./docs/article.md)
+ [Tinymce](./docs/tinymce.md)
+ [Upload](./docs/upload.md)

## 开发
```
$ npm install
$ npm run dev //本地调试
$ npm run serve //使用线上tinymce资源和接口
```


## Fork&构建流程
### 构建发布
本地执行`npm run build`，需要将文章与编辑器共用样式在tinymce进行生成静态css


## Tinymce
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


