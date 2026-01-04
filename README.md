# iruxu-editor

## fork&构建流程
### 构建发布
1. 执行`npm run build`，需要将文章与编辑器共用样式在tinymce进行生成静态css





# Dev

```
$ npm install
$ npm run serve
$ open http://localhost:8080  //文章渲染
$ open http://localhost:8080/tinymce  //tinymce编辑器
$ open http://localhost:8080/light  //轻量tinymce编辑器
$ tinymce http://localhost:3000
```

## Step.1 Install

```
npm install iruxu-editor
```

## Step.2 Import

-   指定模块

```javascript
import Article from "iruxu-editor/src/Article.vue";
import Tinymce from "iruxu-editor/src/Tinymce.vue";
```

## Step.3 Usage

文章

```html
<article :content="content" directorybox="#directory" />
```

编辑器

```html
<script src="path/to/static/tinymce/tinymce.min.js?v=0.1.0"></script>
<Tinymce v-model="content" :attachmentEnable="true" :resourceEnable="true" :height="300" />
```

批量附件上传插入/资源快捷查询插入

```html
<Upload @insert="insertWhere" @update="getList" @htmlUpdate="getHTML" />
```

## 使用说明

需要在引用的库内用 `<script src="path/to/static/**"></script>`, 一般是在 index.html 内引用。
