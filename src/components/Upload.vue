<template>
    <div class="c-upload">
        <!-- 上传触发按钮 -->
        <el-button type="primary" @click="dialogVisible = true" size="large">
            <el-icon class="c-upload-trigger">
                <UploadFilled />
            </el-icon>
            <span>{{ text }}</span>
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
                :limit="max"
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
                            <el-icon class="u-file-select-icon"><CircleCheckFilled /></el-icon>
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
import { Plus, UploadFilled, Delete, ZoomIn, CircleCheckFilled } from "@element-plus/icons-vue";
import GlobalConf from "../../config/global.js";
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
        CircleCheckFilled,
    },
    props: {
        // 按钮文字
        text: {
            type: String,
            default: "上传附件",
        },
        // 上传约束提示
        desc: {
            type: String,
            default: "",
        },
        // 上传数量限制
        max: {
            type: Number,
            default: GlobalConf.uploadMax,
        },
        // 文件大小限制，单位 MB。
        sizeLimit: {
            type: Number,
            default: GlobalConf.uploadSizeLimit,
        },
        // 上传文件类型
        accept: {
            type: String,
            default: GlobalConf.uploadAccept,
        },
        // 上传方法
        upload: {
            type: Function,
            required: true,
        },
    },
    data: function () {
        return {
            dialogVisible: false,

            // Element Plus 文件对象列表。上传成功后会补充 url、selected、is_img、is_video 等业务字段。
            fileList: [],
            // 最近一次点击“插入”时，根据选中文件拼接出的 HTML 字符串。
            insertHtml: "",
        };
    },
    watch: {
        fileList: {
            deep: true,
            handler: function (newval) {
                // update 表示内部文件列表变化，不等同于单个文件上传成功。
                this.$emit("update", newval);
            },
        },
        insertHtml: function (newval) {
            // htmlUpdate 只在 buildHTML 或 clear 改写 insertHtml 时触发。
            this.$emit("htmlUpdate", newval);
        },
    },
    computed: {
        uploadAccept: function () {
            return this.accept === "*" ? "" : this.accept;
        },
        tipText: function () {
            return this.desc || `一次最多同时上传${this.max}个文件（单个文件不超过${this.sizeLimit}M）`;
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
                // el-upload 只负责选择文件；真实上传在这里交给外部传入的 upload(file.raw)。
                const sizeInMB = (file.size || 0) / 1024 / 1024;
                if (sizeInMB > this.sizeLimit) {
                    this.$message.error(`文件超出大小限制（${this.sizeLimit}M）`);
                    this.removeFileByUid(file.uid);
                    return;
                }

                file.status = "uploading";
                this.upload(file.raw)
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
                            // 类型判断基于浏览器提供的 MIME，不再维护固定后缀白名单。
                            is_img: this.isImageFile(file),
                            is_video: this.isVideoFile(file),
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
            // 复用现有图片预览逻辑，需要从卡片内找到真实 img 节点。
            const wrapper = e?.currentTarget?.closest?.(".u-file-wrapper");
            const img = wrapper?.querySelector?.("img.u-imgbox");
            if (!img) return;
            showImgPreview(img);
        },
        buildHTML: function () {
            // HTML 只在点击“插入”时按当前 selected 状态生成。
            let list = [];
            this.fileList.forEach((file) => {
                if (file.selected) {
                    this.isImageFile(file)
                        ? list.push(`<img src="${file.url}" />`)
                        : this.isVideoFile(file)
                        ? list.push(`<video src="${file.url}" controls />`)
                        : list.push(`<a target="_blank" href="${file.url}">${file.name}</a>`);
                }
            });
            this.insertHtml = list.join(" \n");
            return this.insertHtml;
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
            this.insertHtml = "";
        },
        removeFile: function (fileList, uid) {
            fileList.forEach((file, i) => {
                if (file.uid == uid) {
                    fileList.splice(i, 1);
                }
            });
        },
        onExceed: function () {
            this.$message.warning(`一次最多上传 ${this.max} 个文件`);
        },
        isImageFile(file) {
            if (!file) return false;
            if (typeof file.is_img === "boolean") return file.is_img;
            return this.getFileMime(file).startsWith("image/");
        },
        isVideoFile(file) {
            if (!file) return false;
            if (typeof file.is_video === "boolean") return file.is_video;
            return this.getFileMime(file).startsWith("video/");
        },
        getFileMime(file) {
            // 优先读原始 File.type；已上传对象回填时也兼容顶层 type。
            return String(file?.raw?.type || file?.type || "").toLowerCase();
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

            const normalizedUrl = String(name);
            // 绝对 URL、data/blob 等带 scheme 的地址直接使用；只有相对路径才拼 CDN。
            if (/^https?:\/\//i.test(normalizedUrl)) return normalizedUrl;
            if (/^[a-z][a-z\d+\-.]*:/i.test(normalizedUrl) || normalizedUrl.startsWith("//")) return normalizedUrl;

            const cdnRoot = String(GlobalConf.cdnRoot || "").replace(/\/+$/, "");
            if (!cdnRoot) return normalizedUrl;

            return `${cdnRoot}/${normalizedUrl.replace(/^\/+/, "")}`;
        },
        upsertFile(file) {
            const index = this.fileList.findIndex(
                (item) => item.uid === file.uid || (file.url && item.url === file.url)
            );
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
