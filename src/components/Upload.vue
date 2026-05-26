<template>
    <div class="c-upload">
        <!-- 上传触发按钮 -->
        <el-button type="primary" @click="dialogVisible = true" :disabled="!enable" size="large">
            <el-icon class="c-upload-trigger">
                <UploadFilled />
            </el-icon>
            <span>{{ buttonText }}</span>
        </el-button>

        <!-- 弹出界面 -->
        <el-dialog class="c-large-dialog" title="上传" v-model="dialogVisible" @close="closeUpload">
            <div class="c-upload-toolbar">
                <!-- 清空按钮 -->
                <el-button class="u-upload-clear" plain size="small" @click="clear"
                    ><el-icon> <Delete /> </el-icon><span>清空</span></el-button
                >
                <!-- 限制提示 -->
                <div class="u-upload-tip" :title="tipText" type="info" show-icon :closable="false">
                    <span>{{ tipText }}</span>
                </div>
            </div>

            <!-- 文件区 -->
            <el-upload
                list-type="picture-card"
                :auto-upload="false"
                :limit="uploadLimit"
                multiple
                :file-list="fileList"
                :on-change="change"
                ref="uploadbox"
                :accept="uploadAccept"
                :on-exceed="onExceed"
            >
                <template #default>
                    <el-icon>
                        <Plus />
                    </el-icon>
                </template>

                <!-- 文件项 -->
                <template #file="{ file }">
                    <div
                        class="u-file-wrapper"
                        @click.stop="select(file)"
                        :class="{
                            isSelected: !!file.selected,
                            isUnselected: !file.selected,
                            isPending: !!file.status && file.status !== 'success',
                        }"
                        v-loading="file.status === 'uploading'"
                    >
                        <span style="display: none">{{ fileList }}</span>
                        <!-- 图片类型 -->
                        <template v-if="isImageFile(file)">
                            <img class="el-upload-list__item-thumbnail u-imgbox" :src="file.url" alt />
                            <i class="u-mask"></i>
                            <span class="u-op u-preview-btn" @click.stop="preview(file, $event)">
                                <el-icon><ZoomIn /></el-icon>
                            </span>
                        </template>
                        <span
                            class="u-op u-delete-btn"
                            :class="{ 'is-single': !isImageFile(file) }"
                            @click.stop="deleteFile(file)"
                        >
                            <el-icon><Delete /></el-icon>
                        </span>
                        <!-- 其他类型 -->
                        <div v-if="!isImageFile(file)" class="u-filebox">
                            <img class="u-fileplaceholder" :src="getFileIcon(file)" alt="" />
                            <span class="u-filename">{{ file.name }}</span>
                        </div>
                        <!-- 勾选角标 -->
                        <label class="u-file-select-label" :class="{ 'is-unselected': !file.selected }">
                            <span class="u-file-select-icon">✓</span>
                        </label>
                    </div>
                </template>
            </el-upload>

            <!-- 插入按钮 -->
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="dialogVisible = false" plain>取 消</el-button>
                    <el-button type="primary" @click="insert">
                        {{ buttonTXT }}
                    </el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script>
import { ElButton, ElDialog, ElIcon } from "element-plus";
import { Plus, UploadFilled, Delete, ZoomIn } from "@element-plus/icons-vue";
import { imgTypes, videoTypes } from "../../config/global.js";
import { showImgPreview } from "../assets/js/renderImgPreview.js";

const fallbackFileIcon = require("../assets/img/file.svg");
const fileIconContext = require.context("../assets/img/files", false, /\.svg$/);
const fileIconMap = fileIconContext.keys().reduce((map, key) => {
    const ext = key.replace("./", "").replace(".svg", "");
    map[ext] = fileIconContext(key);
    return map;
}, {});

export default {
    name: "Upload",
    components: {
        "el-button": ElButton,
        "el-dialog": ElDialog,
        "el-icon": ElIcon,
        Plus,
        UploadFilled,
        Delete,
        ZoomIn,
    },
    props: {
        // 是否启用
        enable: {
            type: Boolean,
            default: true,
        },
        // 按钮文字
        text: {
            type: String,
        },
        // 仅图片上传
        onlyImage: {
            type: Boolean,
            default: false,
        },
        // 上传约束提示
        desc: {
            type: String,
        },
        // 上传数量限制
        limit: {
            type: Number,
            default: 10,
        },
        // 新字段名，兼容隔壁基础交互；未传时继续使用 limit。
        max: {
            type: Number,
        },
        accept: {
            type: String,
            default: "",
        },
        // 文件大小限制，单位 MB。
        sizeLimit: {
            type: Number,
            default: 200,
        },
        // 上传方法
        uploadFn: {
            type: Function,
            required: true,
        },
        // CDN拼接域名
        domain: {
            type: String,
            default: "",
        },
    },
    data: function () {
        return {
            dialogVisible: false,

            fileList: [],
            insertList: "",
        };
    },
    watch: {
        fileList: {
            deep: true,
            handler: function (newval) {
                this.$emit("update", newval);
            },
        },
        insertList: function (newval) {
            this.$emit("htmlUpdate", newval);
        },
    },
    computed: {
        uploadLimit: function () {
            return this.max || this.limit;
        },
        uploadAccept: function () {
            if (this.accept) return this.accept;
            return this.onlyImage ? imgTypes.map((type) => `.${type}`).join(",") : "";
        },
        tipText: function () {
            return this.desc || `一次最多同时上传${this.uploadLimit}个文件（单个文件不超过${this.sizeLimit}M）`;
        },
        buttonText: function () {
            return this.text || "上传附件";
        },
        selectedCount: function () {
            return this.fileList.filter((file) => file.selected).length;
        },
        buttonTXT: function () {
            return this.selectedCount ? "插 入" : "确 定";
        },
    },
    methods: {
        change: function (file) {
            if (file && file.status != "success") {
                // 判断大小
                const sizeInMB = (file.size || 0) / 1024 / 1024;
                if (sizeInMB > this.sizeLimit) {
                    this.$message.error(`文件超出大小限制（${this.sizeLimit}M）`);
                    this.removeFileByUid(file.uid);
                    return;
                }

                // 分析文件类型
                let ext = file.name?.toLowerCase().split(".").pop();
                const is_img = imgTypes.includes(ext);
                const is_video = videoTypes.includes(ext);

                if (this.onlyImage && !is_img) {
                    this.$message.warning("当前仅允许上传图片");
                    this.removeFileByUid(file.uid);
                    return;
                }

                file.status = "uploading";
                this.uploadFn(file.raw)
                    .then((res) => {
                        // 提醒
                        this.$message({
                            message: "上传成功",
                            type: "success",
                        });

                        const url = this.resolveUploadUrl(res);
                        if (!url) {
                            this.$message.error("上传成功但未返回文件地址");
                            this.removeFileByUid(file.uid);
                            return;
                        }

                        this.upsertFile({
                            ...file,
                            url,
                            is_img,
                            is_video,
                            selected: true,
                            status: "success",
                        });
                    })
                    .catch((err) => {
                        if (err?.response?.data?.code) {
                            this.$message.error(`[${err.response.data.code}] ${err.response.data.message}`);
                        } else {
                            this.$message.error("请求异常");
                        }

                        this.removeFileByUid(file.uid);
                    });
            }
        },
        select: function (file) {
            if (file.status && file.status !== "success") return;
            this.fileList = this.fileList.map((item) =>
                item.uid === file.uid ? { ...item, selected: !item.selected } : item
            );
        },
        preview: function (file, e) {
            if (!this.isImageFile(file) || !file.url) return;
            const wrapper = e?.currentTarget?.closest?.(".u-file-wrapper");
            const img = wrapper?.querySelector?.("img.u-imgbox");
            if (!img) return;
            showImgPreview(img);
        },
        buildHTML: function () {
            let list = [];
            this.fileList.forEach((file) => {
                if (file.selected) {
                    this.isImageFile(file)
                        ? list.push(`<img src="${file.url}" />`)
                        : file.is_video
                        ? list.push(`<video src="${file.url}" controls />`)
                        : list.push(`<a target="_blank" href="${file.url}">${file.name}</a>`);
                }
            });
            this.insertList = list.join(" \n");
            return this.insertList;
        },
        insert: function () {
            // 关闭窗口
            this.dialogVisible = false;

            //为空不执行插入
            if (!this.selectedCount) return;

            // 传递值
            this.$emit("insert", {
                list: this.fileList,
                html: this.buildHTML(),
            });

            //移除所有选择状态
            this.resetSelectStatus();
        },
        resetSelectStatus: function () {
            this.fileList = this.fileList.map((file) => ({ ...file, selected: false }));
        },
        clear: function () {
            this.$refs.uploadbox?.clearFiles?.();
            this.fileList = [];
            this.insertList = "";
        },
        removeFile: function (fileList, uid) {
            fileList.forEach((file, i) => {
                if (file.uid == uid) {
                    fileList.splice(i, 1);
                }
            });
        },
        onExceed: function () {
            this.$message.warning(`一次最多上传 ${this.uploadLimit} 个文件`);
        },
        isImageFile(file) {
            if (!file) return false;
            if (typeof file.is_img === "boolean") return file.is_img;
            if (file.raw?.type?.startsWith("image/")) return true;
            return imgTypes.includes(this.getFileExt(file));
        },
        getFileExt(file) {
            const origin = file?.name || file?.url || "";
            return origin.split("?")[0].split("#")[0].toLowerCase().split(".").pop() || "";
        },
        getFileIcon(file) {
            const ext = this.getFileExt(file);
            return fileIconMap[ext] || fallbackFileIcon;
        },
        resolveUploadUrl(res) {
            const payload = res?.data || res || {};
            const name =
                payload.location ||
                payload.url ||
                payload.name ||
                (payload.data &&
                    (Array.isArray(payload.data)
                        ? payload.data[0]
                        : payload.data.url || payload.data.location || payload.data.name || payload.data));
            if (!name) return "";
            if (/^(https?:)?\/\//.test(name) || name.startsWith("data:") || !this.domain) return name;
            return `${this.domain.replace(/\/$/, "")}/${String(name).replace(/^\//, "")}`;
        },
        upsertFile(file) {
            const index = this.fileList.findIndex((item) => item.uid === file.uid || (file.url && item.url === file.url));
            if (index > -1) {
                const list = [...this.fileList];
                list.splice(index, 1, file);
                this.fileList = list;
            } else {
                this.fileList = [...this.fileList, file];
            }
        },
        removeFileByUid(uid) {
            if (!uid) return;
            this.fileList = this.fileList.filter((file) => file.uid !== uid);
            this.$refs.uploadbox?.handleRemove?.({ uid });
        },
        deleteFile(file) {
            if (!file) return;
            this.removeFileByUid(file.uid);
        },
        closeUpload() {
            this.fileList = [];
            this.$refs.uploadbox?.clearFiles?.();
        },
    },
};
</script>

<style lang="less">
@import "../assets/css/upload.less";
</style>
