<template>
    <div class="c-editor-tinymce">
        <div class="c-editor-tinymce-header">
            <slot name="prepend"></slot>
        </div>

        <slot></slot>

        <editor
            :id="id"
            :tinymce-script-src="tinymce_script_src"
            v-model="data"
            :init="init"
            class="c-tinymce"
            placeholder="✔ 图片可右键粘贴或拖拽至编辑器内自动上传 ✔ 支持word/excel内容一键粘贴"
        />

        <div class="c-editor-tinymce-footer">
            <el-alert class="u-tutorial" type="warning" show-icon v-if="showTips"
                >进入特殊区域（代码块，折叠块等等）脱离或使用工具栏触发后，请使用键盘方向 → ↓
                键进行脱离，回车只是正常在区块内换行。去掉样式点击第二行第一个&lt;清除格式&gt;即可复位。
            </el-alert>

            <slot name="append"></slot>
        </div>
    </div>
</template>

<script>
import Editor from "@tinymce/tinymce-vue";
import hljs_languages from "../assets/js/hljs_languages.js";
import GlobalConf from "../../config/global.js";

export default {
    name: "Tinymce",
    props: {
        // 内容
        modelValue: {
            type: String,
        },
        // 内容，兼容旧的 :content / v-model:content 用法
        content: {
            type: String,
            default: "",
        },
        // 默认高度
        height: {
            type: Number,
            default: 800,
        },
        // Tinymce右键粘贴上传函数
        upload: {
            type: Function,
            default: () => {},
        },
        // 是否显示编辑器使用提示
        showTips: {
            type: Boolean,
            default: true,
        },
    },
    emits: ["update:modelValue", "update:content", "update"],
    data: function () {
        const id = "rx-tinymce-editor";
        const tinymceRoot = GlobalConf.cdnRoot + GlobalConf.tinymcePath;
        return {
            data: this.modelValue ?? this.content ?? "",

            // 启动路径
            tinymce_script_src: `${tinymceRoot}/tinymce.min.js`,
            id,

            init: {

                // JS插件路径
                base_url: tinymceRoot,
                suffix: ".min",

                // CSS加载路径
                content_css: `${tinymceRoot}/skins/content/default/content.min.css`,

                // 选择器
                selector: `#${id}`,

                // 语言
                language: GlobalConf.tinymce.language || "zh_CN",

                // 样式
                body_class: "c-article c-article-editor c-article-tinymce",
                height: this.height || 800,
                autosave_ask_before_unload: false,
                content_style: "",

                // UI
                icons: "custom",
                menubar: false,
                branding: false,
                contextmenu: "",
                plugins: GlobalConf.tinymce.plugins,
                toolbar: GlobalConf.tinymce.toolbar,
                mobile: GlobalConf.tinymce.mobile,
                block_formats: "段落=p;一级标题=h1;二级标题=h2;三级标题=h3;四级标题=h4;五级标题=h5;六级标题=h6;",
                fontsize_formats: "12px 14px 16px 18px 22px 24px 26px 28px 32px 48px 72px",
                color_map: GlobalConf.tinymce.color_map,
                codesample_languages: hljs_languages,

                // Image
                image_advtab: true,
                file_picker_types: "file image",
                // images_upload_url: this.uploadUrl,
                automatic_uploads: true,
                paste_data_images: true,
                // images_upload_credentials: true,
                images_upload_handler: this.image_upload_handler,
                valid_children: "+body[style]",

                // 设置（禁止转化插入的URL）
                convert_urls: false,
            },
        };
    },
    watch: {
        data: function (val) {
            this.$emit("update:modelValue", val);
            this.$emit("update:content", val);
            this.$emit("update", val);
        },
        modelValue: {
            immediate: true,
            handler: function (val) {
                if (val !== undefined && val !== this.data) this.data = val ?? "";
            },
        },
        content: {
            immediate: true,
            handler: function (val) {
                if (this.modelValue === undefined && val !== this.data) this.data = val ?? "";
            },
        },
    },
    methods: {
        setup: function (editor) {
            console.log("ID为: " + editor.id + " 的编辑器即将初始化.");
        },
        ready: function (editor) {
            console.log("ID为: " + editor.id + " 的编辑器已初始化完成.");
        },
        insertAttachments: function (data) {
            // eslint-disable-next-line no-undef
            tinyMCE.editors[this.id].insertContent(data.html);
        },
        insertResource: function (data) {
            // eslint-disable-next-line no-undef
            tinyMCE.editors[this.id].insertContent(data);
        },
        resolveUploadUrl: function (res) {
            const payload = res?.data || res || {};
            const url =
                payload.location ||
                payload.url ||
                payload.name ||
                (payload.data &&
                    (Array.isArray(payload.data)
                        ? payload.data[0]
                        : payload.data.url || payload.data.location || payload.data.name || payload.data));

            if (!url) return "";

            const normalizedUrl = String(url);
            if (/^https?:\/\//i.test(normalizedUrl)) return normalizedUrl;

            const cdnRoot = String(GlobalConf.cdnRoot || "").replace(/\/+$/, "");
            if (!cdnRoot) return normalizedUrl;

            return `${cdnRoot}/${normalizedUrl.replace(/^\/+/, "")}`;
        },
        image_upload_handler: function (blobInfo, success, failure, progress) {
            const formData = new FormData();
            formData.append("file", blobInfo.blob(), blobInfo.filename());

            Promise.resolve(this.upload(formData))
                .then((res) => {
                    const payload = res?.data || {};
                    if (payload.code) {
                        failure(payload.msg || payload.message || "上传失败");
                        return;
                    }

                    const url = this.resolveUploadUrl(res);
                    if (!url) {
                        failure("上传成功但未返回图片地址");
                        return;
                    }

                    progress && progress(100);
                    success(url);
                })
                .catch((error) => {
                    if (error.response) {
                        // 请求已发出，但服务器响应的状态码不在 2xx 范围内
                        failure("Image upload failed. Status: " + error.response.status);
                    } else if (error.request) {
                        // 请求已发出，但没有收到响应
                        failure("Image upload failed. No response received.");
                    } else {
                        // 发送请求时出了some问题
                        failure("Image upload failed. Error: " + error.message);
                    }
                });
        },
    },
    mounted: function () {
    },
    components: {
        Editor,
    },
};
</script>

<style lang="less">
@import "../assets/css/tinymce.less";
</style>
