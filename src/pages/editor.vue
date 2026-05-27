<template>
    <div class="c-editor-page">
        <h1>Editor 组合编辑器</h1>

        <div class="m-mode">
            <span>上传接口</span>
            <el-radio-group v-model="uploadMode" size="small">
                <el-radio-button label="local">本地模拟</el-radio-button>
                <el-radio-button label="remote">线上测试</el-radio-button>
            </el-radio-group>
        </div>

        <Editor
            ref="editor"
            v-model="content"
            :upload="upload"
            :height="640"
            :uploadMax="10"
            :uploadSizeLimit="200"
            uploadText="上传附件"
            @insert="onInsert"
            @uploadUpdate="onUploadUpdate"
        />
    </div>
</template>

<script>
import axios from "axios";
import Editor from "../components/Editor.vue";

export default {
    name: "EditorPage",
    components: {
        Editor,
    },
    data: function () {
        return {
            content: "",
            uploadMode: "local",
            uploadUrl: "https://dev.api.iruxu.com/api/cms/admin/upload/tinymce",
            uploadList: [],
        };
    },
    methods: {
        upload: function (file) {
            return this.uploadMode === "remote" ? this.remoteUpload(file) : this.localUpload(file);
        },
        localUpload: function (file) {
            return Promise.resolve({
                data: {
                    url: URL.createObjectURL(file),
                },
            });
        },
        remoteUpload: function (file) {
            const formData = file instanceof FormData ? file : new FormData();
            if (!(file instanceof FormData)) formData.append("file", file);
            return axios.post(this.uploadUrl, formData);
        },
        onInsert: function (payload) {
            console.log("Editor 插入事件触发，payload:", payload);
        },
        onUploadUpdate: function (list) {
            this.uploadList = Array.isArray(list) ? list : [];
            console.log("Editor 上传列表更新:", this.uploadList);
        },
    },
    async mounted() {
        const res = await fetch("/demo/article_basic.html");
        this.content = await res.text();
    },
};
</script>

<style lang="less">
html {
    padding: 20px;
}

.c-editor-page {

    h1 {
        margin: 0 0 20px;
        font-size: 24px;
        font-weight: 600;
    }

    .m-mode {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 20px;

        span {
            color: #606266;
        }
    }

    .m-preview {
        margin-top: 24px;

        h2 {
            margin: 0 0 10px;
            font-size: 16px;
            font-weight: 600;
        }

        pre {
            max-height: 260px;
            margin: 0;
            padding: 12px;
            overflow: auto;
            border: 1px solid #dcdfe6;
            border-radius: 4px;
            background: #fafafa;
            white-space: pre-wrap;
            word-break: break-word;
        }
    }
}
</style>
