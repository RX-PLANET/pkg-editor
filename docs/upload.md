# Upload

## Usage
```js
import Upload from 'iruxu-editor/src/components/Upload.vue

<Upload 
    :uploadFn="uploadFn" 
    :domain="cdnDomain" 
    @insert="insertAttachments" 
/>
```

## Props

| 字段 | 含义 | 类型 | 默认值 | 必填 | 备注 |
|---|---|---|---|---|---|
| `enable` | 是否启用 | `Boolean` | `true` | 否 |  |
| `text` | 按钮文字 | `String` | — | 否 |  |
| `onlyImage` | 仅图片上传 | `Boolean` | — | 否 |  |
| `desc` | 上传约束提示 | `String` | — | 否 |  |
| `limit` | 上传数量限制 | `Number` | `10` | 否 |  |
| `uploadFn` | 上传方法 | `Function` | — | 是 | `required: true` |
| `domain` | CDN 拼接域名 | `String` | `""` | 否 |  |
