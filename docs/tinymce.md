# Tinymce

## Usage
```import Tinymce from 'iruxu-editor/src/components/Tinymce.vue```


## Props

| 字段 | 含义 | 类型 | 默认值 | 必填 | 备注 |
|---|---|---|---|---|---|
| `modelValue` | 内容 | `String` | `""` | 否 | 通常配合 `v-model` 使用 |
| `height` | 默认高度 | `Number` | `800` | 否 | 一般单位为 px（以组件实现为准） |
| `tinymceUploadFn` | Tinymce 右键粘贴上传函数 | `Function` | `() => {}` | 否 | 默认空函数，避免未传时报错 |
| `tinymceCdnDomain` | Tinymce资源CDN拼接域名 | `String` | "" | 是 | 加载tinymce js&css |
| `showTips` | 是否显示编辑器使用提示 | `Boolean` | `true` | 否 |  |
| `attachmentEnable` | 是否启用附件上传 | `Boolean` | `true` | 否 |  |
| `uploadFn` | 附件上传函数 | `Function` | `() => {}` | 否 | 附件开启时才有用 |
| `uploadDomain` | 附件CDN拼接域名 | `String` | `""` | 否 | 附件开启时才有用 |


## Tinymce特性
+ 基于tinymce v5.2.2扩展
+ 保留v4版本分割线规则
+ 内置powerpaste&checklist插件
+ 增加插入B站视频插件
+ 增加插入折叠文本插件
+ 增加mathjax支持latex

## Tinymce插件添加步骤
1. tinymce/icons/custom/icons.js 添加svg图标,需设置尺寸,注意视口大小,移除换行符等
2. tinymce/plugins目录，复制videox(input),foldtext(null)目录作为参考新建插件目录，替换videox为新插件名
3. 编辑器配置中激活插件和添加工具栏项
