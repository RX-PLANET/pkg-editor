<template>
    <div class="c-upload-page">
        <h1>Upload 上传组件</h1>

        <Upload
            :upload="upload"
            :max="10"
            :sizeLimit="200"
            text="上传附件"
            @insert="onInsert"
            @update="onUpdate"
            @htmlUpdate="onHtmlUpdate"
        />

        <section class="m-preview">
            <h2>插入结果</h2>
            <pre>{{ insertedHtml || "暂无插入内容" }}</pre>
        </section>

        <section class="m-preview">
            <h2>当前文件</h2>
            <ul v-if="fileList.length">
                <li v-for="file in fileList" :key="file.uid || file.url">
                    <span>{{ file.name }}</span>
                    <a v-if="file.url" :href="file.url" target="_blank" rel="noopener noreferrer">{{ file.url }}</a>
                </li>
            </ul>
            <p v-else>暂无文件</p>
        </section>
    </div>
</template>

<script>
import Upload from "../components/Upload.vue";

export default {
    name: "UploadPage",
    components: {
        Upload,
    },
    data: function () {
        return {
            insertedHtml: "",
            fileList: [],
        };
    },
    methods: {
        upload: function (file) {
            return Promise.resolve({
                data: {
                    url: URL.createObjectURL(file),
                },
            });
        },
        onInsert: function (payload) {
            this.insertedHtml = payload?.html || "";
            console.log("插入事件触发，payload:", payload);
        },
        onUpdate: function (list) {
            this.fileList = Array.isArray(list) ? list : [];
            console.log("更新事件触发，当前文件列表:", this.fileList);
        },
        onHtmlUpdate: function (html) {
            this.insertedHtml = html || "";
            console.log("HTML更新事件触发，当前HTML内容:", this.insertedHtml);
        },
    },
};
</script>

<style lang="less">
html {
    padding: 20px;
}

.c-upload-page {
    max-width: 960px;

    h1 {
        margin: 0 0 20px;
        font-size: 24px;
        font-weight: 600;
    }

    .m-preview {
        margin-top: 24px;

        h2 {
            margin: 0 0 10px;
            font-size: 16px;
            font-weight: 600;
        }

        pre {
            min-height: 44px;
            margin: 0;
            padding: 12px;
            border: 1px solid #dcdfe6;
            border-radius: 4px;
            background: #fafafa;
            white-space: pre-wrap;
            word-break: break-word;
        }

        ul {
            margin: 0;
            padding-left: 18px;
            line-height: 1.8;
        }

        p {
            margin: 0;
            color: #909399;
        }

        span {
            margin-right: 8px;
            color: #303133;
        }

        a {
            color: #409eff;
            word-break: break-all;
        }
    }
}
</style>
