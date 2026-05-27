<template>
    <Tinymce
        ref="tinymce"
        v-bind="$attrs"
        :modelValue="editorValue"
        :content="content"
        :height="height"
        :upload="effectiveUpload"
        :showTips="showTips"
        @update:modelValue="updateValue"
        @update:content="updateContent"
    >
        <template #prepend>
            <slot name="prepend-before"></slot>
            <Upload
                v-if="attachmentEnable"
                v-bind="$attrs"
                :upload="effectiveUpload"
                :text="effectiveUploadText"
                :desc="effectiveUploadDesc"
                :max="effectiveUploadMax"
                :sizeLimit="effectiveUploadSizeLimit"
                :accept="effectiveUploadAccept"
                @insert="insertUpload"
                @update="updateUploadList"
                @htmlUpdate="updateUploadHtml"
            />
            <slot name="prepend"></slot>
        </template>

        <slot></slot>

        <template #append>
            <slot name="append"></slot>
        </template>
    </Tinymce>
</template>

<script>
import Tinymce from "./Tinymce.vue";
import Upload from "./Upload.vue";

export default {
    name: "Editor",
    inheritAttrs: false,
    components: {
        Tinymce,
        Upload,
    },
    props: {
        modelValue: {
            type: String,
        },
        content: {
            type: String,
            default: "",
        },
        height: {
            type: Number,
            default: 800,
        },
        upload: {
            type: Function,
            default: null,
        },
        tinymceUploadFn: {
            type: Function,
            default: null,
        },
        attachmentUploadFn: {
            type: Function,
            default: null,
        },
        showTips: {
            type: Boolean,
            default: true,
        },
        uploadEnable: {
            type: Boolean,
            default: true,
        },
        attachmentEnable: {
            type: Boolean,
            default: true,
        },
        uploadText: {
            type: String,
            default: "上传附件",
        },
        attachmentText: {
            type: String,
            default: "",
        },
        uploadDesc: {
            type: String,
            default: "",
        },
        attachmentDesc: {
            type: String,
            default: "",
        },
        uploadMax: {
            type: Number,
            default: 10,
        },
        attachmentMax: {
            type: Number,
            default: undefined,
        },
        uploadSizeLimit: {
            type: Number,
            default: 200,
        },
        attachmentSizeLimit: {
            type: Number,
            default: undefined,
        },
        uploadAccept: {
            type: String,
            default: "*",
        },
        attachmentAccept: {
            type: String,
            default: "",
        },
    },
    emits: [
        "update:modelValue",
        "update:content",
        "update",
        "insert",
        "uploadUpdate",
        "uploadHtmlUpdate",
    ],
    computed: {
        editorValue: function () {
            return this.modelValue ?? this.content ?? "";
        },
        effectiveUpload: function () {
            return this.upload || this.tinymceUploadFn || this.attachmentUploadFn || (() => {});
        },
        effectiveUploadText: function () {
            return this.attachmentText || this.uploadText;
        },
        effectiveUploadDesc: function () {
            return this.attachmentDesc || this.uploadDesc;
        },
        effectiveUploadMax: function () {
            return this.attachmentMax ?? this.uploadMax;
        },
        effectiveUploadSizeLimit: function () {
            return this.attachmentSizeLimit ?? this.uploadSizeLimit;
        },
        effectiveUploadAccept: function () {
            return this.attachmentAccept || this.uploadAccept;
        },
    },
    methods: {
        updateValue: function (val) {
            this.$emit("update:modelValue", val);
            this.$emit("update", val);
        },
        updateContent: function (val) {
            this.$emit("update:content", val);
        },
        insertUpload: function (payload) {
            this.$refs.tinymce?.insertAttachments?.(payload);
            this.$emit("insert", payload);
        },
        updateUploadList: function (list) {
            this.$emit("uploadUpdate", list);
        },
        updateUploadHtml: function (html) {
            this.$emit("uploadHtmlUpdate", html);
        },
        insertResource: function (html) {
            this.$refs.tinymce?.insertResource?.(html);
        },
    },
};
</script>

<style lang="less">
.c-editor-tinymce-header{
    margin-bottom:10px;
}
</style>
