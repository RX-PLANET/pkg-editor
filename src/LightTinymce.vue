<template>
    <div class="c-editor-tinymce">
        <slot name="prepend"></slot>

        <div class="c-editor-header">
            <Upload v-if="attachmentEnable" @insert="insertAttachments" :uploadFn="uploadFn" :domain="domain" />
        </div>

        <slot></slot>

        <editor
            id="tinymce"
            v-model="data"
            :init="init"
            class="c-tinymce"
            placeholder="✔ 图片可右键粘贴或拖拽至编辑器内自动上传 ✔ 支持word/excel内容一键粘贴"
        />
        <el-alert class="u-tutorial" type="warning" show-icon v-if="showTips"
            >进入特殊区域（代码块，折叠块等等）脱离或使用工具栏触发后，请使用键盘方向 → ↓
            键进行脱离，回车只是正常在区块内换行。去掉样式点击第二行第一个&lt;清除格式&gt;即可复位。
            <!-- <a href="" target="_blank">[编辑器使用指南]</a> -->
        </el-alert>

        <slot name="append"></slot>
    </div>
</template>

<script>
import Editor from "@tinymce/tinymce-vue";
import Upload from "./Upload";
import hljs_languages from "../assets/js/hljs_languages.js";

export default {
    name: "LightTinymce",
    props: {
        modelValue: {
            type: String,
            default: "",
        },
        height: {
            type: Number,
            default: 800,
        },
        attachmentEnable: {
            type: Boolean,
            default: true,
        },
        showTips: {
            type: Boolean,
            default: true,
        },
        uploadFn: {
            type: Function,
            default: () => {},
        },
        domain: {
            type: String,
            default: "",
        },
        uploadUrl: {
            type: String,
            default: "",
            required: true,
        },
    },
    emits: ["update:modelValue"],
    data: function () {
        return {
            data: "",
            init: {
                // 选择器
                selector: "#tinymce",

                // 语言
                language: "zh_CN",

                // 设置
                convert_urls: false,

                // 样式
                // TODO:
                content_css: `${this.domain}/static/tinymce/skins/content/default/content.min.css`,
                // content_css: `http://localhost:5000/skins/content/default/content.min.css`,
                body_class: "c-article c-article-editor c-article-tinymce",
                height: this.height || 800,
                autosave_ask_before_unload: false,

                // UI
                icons: "custom",
                menubar: false,
                branding: false,
                contextmenu: "",
                plugins: [
                    "link autolink",
                    "hr lists advlist table codeinline codesample checklist foldtext latex",
                    "image emoticons media",
                    "code fullscreen wordcount powerpaste pagebreak printpage", // template anchor jx3icon autosave
                ],
                toolbar: [
                    "undo | forecolor backcolor | bold italic underline strikethrough | fullscreen", //restoredraft
                    // "removeformat | hr alignleft aligncenter alignright alignjustify indent outdent | bullist numlist checklist table blockquote foldtext codeinline codesample latex | image media", // template anchor jx3icon
                ],
                mobile: {
                    toolbar_drawer: true,
                    toolbar: [
                        "undo emoticons bold forecolor backcolor removeformat pagebreak fullscreen",
                        // "hr alignleft aligncenter alignright alignjustify indent outdent bullist numlist checklist table blockquote codesample latex media",
                    ],
                },
                block_formats: "段落=p;一级标题=h1;二级标题=h2;三级标题=h3;四级标题=h4;五级标题=h5;六级标题=h6;",
                fontsize_formats: "12px 14px 16px 18px 22px 24px 26px 28px 32px 48px 72px",
                color_map: [
                    "FF99CC",
                    "浅粉",
                    "FF3399",
                    "深粉",
                    "FF0000",
                    "正红",
                    "CC99FF",
                    "紫色",
                    "9933ff",
                    "深紫",

                    "FFFF99",
                    "浅黄",
                    "FFFF00",
                    "金黄",
                    "FFCC00",
                    "亮黄",
                    "FFCC99",
                    "浅桃",
                    "FF6600",
                    "橘色",

                    "CCFFCC",
                    "浅绿",
                    "9bf915",
                    "荧光绿",
                    "00FF00",
                    "辣眼绿",
                    "49c10f",
                    "深绿",
                    "008080",
                    "深青",

                    "CCFFFF",
                    "浅蓝",
                    "00FFFF",
                    "参考线",
                    "00CCFF",
                    "天蓝",
                    "99CCFF",
                    "蔚蓝",
                    "0000FF",
                    "辣眼蓝",

                    "CC0000",
                    "深红",
                    "000000",
                    "黑色",
                ],

                codesample_languages: hljs_languages,

                // Image
                image_advtab: true,
                file_picker_types: "file image",
                // images_upload_url: this.uploadUrl,
                automatic_uploads: true,
                // images_upload_credentials: true,
                images_upload_handler: this.image_upload_handler,
                valid_children: "+body[style]",
            },
            mode: "tinymce",
        };
    },
    watch: {
        data: function (val) {
            this.$emit("update:modelValue", val);
        },
        modelValue: {
            immediate: true,
            handler: function (val) {
                this.data = val;
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
            tinyMCE.editors["tinymce"].insertContent(data.html);
        },
        insertResource: function (data) {
            // eslint-disable-next-line no-undef
            tinyMCE.editors["tinymce"].insertContent(data);
        },
        image_upload_handler: function (blobInfo, success, failure) {
            const formData = new FormData();
            formData.append("file", blobInfo.blob(), blobInfo.filename());

            this.tinymceUploadFn(formData)
                .then((res) => {
                    const json = res.data;

                    success(json.location);
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
    mounted: function () {},
    components: {
        Editor,
        Upload,
    },
};
</script>

<style lang="less">
@import "../assets/css/tinymce.less";
</style>
