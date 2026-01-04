<template>
    <div class="c-upload">
        <!-- 上传触发按钮 -->
        <el-button type="primary" @click="dialogVisible = true" :disabled="!enable">
            <el-icon class="u-icon">
                <UploadFilled />
            </el-icon>
            {{ btn_txt }}
        </el-button>

        <!-- 弹出界面 -->
        <el-dialog class="c-large-dialog" title="上传" v-model="dialogVisible" @close="closeUpload">
            <!-- 清空按钮 -->
            <el-button class="u-upload-clear" plain size="small" @click="clear"
                ><el-icon> <Delete /> </el-icon>清空</el-button
            >

            <!-- 限制提示 -->
            <el-alert class="u-upload-tip" :title="tip" type="info" show-icon :closable="false"></el-alert>

            <!-- 文件区 -->
            <el-upload
                list-type="picture-card"
                :auto-upload="false"
                :limit="limit"
                multiple
                :file-list="fileList"
                :on-change="change"
                ref="uploadbox"
                :accept="accept"
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
                        @click="select(file)"
                        :class="{
                            isSelected: file.selected,
                            disabled: file.status != 'success',
                        }"
                        v-loading="file.status === 'uploading'"
                    >
                        <span style="display: none">{{ fileList }}</span>
                        <!-- 图片类型 -->
                        <img v-if="file.is_img" class="el-upload-list__item-thumbnail u-imgbox" :src="file.url" alt />
                        <!-- 其他类型 -->
                        <div v-else class="u-filebox">
                            <img class="u-fileplaceholder" svg-inline src="../assets/img/file.svg" />
                            <span class="u-filename">{{ file.name }}</span>
                        </div>
                        <!-- 勾选角标 -->
                        <label v-show="file.selected" class="u-file-select-label">
                            <el-icon class="el-icon-upload-success el-icon-check" color="#fff">
                                <Check />
                            </el-icon>
                        </label>
                    </div>
                </template>
            </el-upload>

            <!-- 插入按钮 -->
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="dialogVisible = false">取 消</el-button>
                    <el-button type="primary" @click="insert">
                        {{ buttonTXT }}
                    </el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script>
import { uniqBy } from "lodash";
import { ElButton, ElDialog, ElIcon } from "element-plus";
import { Plus, UploadFilled, Delete, Check } from "@element-plus/icons-vue";

const imgtypes = ["jpg", "png", "gif", "bmp", "webp", "jpeg", "JPG", "PNG", "GIF", "BMP", "WEBP", "JPEG"];
const videoTypes = [
    "mp4",
    "MP4",
    "mov",
    "MOV",
    "avi",
    "AVI",
    "rmvb",
    "RMVB",
    "rm",
    "RM",
    "flv",
    "FLV",
    "3gp",
    "3GP",
    "wmv",
    "WMV",
    "mkv",
    "MKV",
];

export default {
    name: "Upload",
    components: {
        "el-button": ElButton,
        "el-dialog": ElDialog,
        "el-icon": ElIcon,
        Plus,
        UploadFilled,
        Delete,
        Check,
    },
    props: {
        text: {
            type: String,
        },
        onlyImage: {
            type: Boolean,
        },
        desc: {
            type: String,
        },
        accept: {
            type: String,
        },
        enable: {
            type: Boolean,
            default: true,
        },
        limit: {
            type: Number,
            default: 10,
        },
        uploadFn: {
            type: Function,
            required: true,
        },
        domain: {
            type: String,
            default: "",
        },
    },
    data: function () {
        return {
            dialogVisible: false,
            tip: this.desc || "一次最多同时上传10个文件（单个文件不超过20M），格式限常见的图片、文档、数据表及压缩包",
            btn_txt: this.text || "上传附件",

            fileList: [],
            selectedCount: 0,
            insertList: "",

            // accept: allow_types.accept,
            // sizeLimit: allow_types.sizeLimit,
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
        buttonTXT: function () {
            return this.selectedCount ? "插 入" : "确 定";
        },
    },
    methods: {
        change: function (file) {
            if (file.status != "success") {
                // 判断大小
                // if (file.size > this.sizeLimit) {
                //     this.$message.error("文件超出大小限制");
                //     this.removeFile(fileList, file.uid);
                //     return;
                // }

                // 分析文件类型
                let ext = file.name.split(".").pop();
                const is_img = imgtypes.includes(ext);
                const is_video = videoTypes.includes(ext);

                if (this.onlyImage && !is_img) return;

                // 构建数据
                let fdata = new FormData();
                fdata.append("file", file.raw);

                file.status = "uploading";
                this.uploadFn(file.raw)
                    .then((res) => {
                        // 提醒
                        this.$message({
                            message: "上传成功",
                            type: "success",
                        });

                        // 修改path
                        file.url = res?.name && this.domain + "/" + res.name;

                        // 额外赋值
                        file.is_img = is_img;
                        file.is_video = is_video;
                        file.selected = true;

                        // 修改状态加入仓库
                        file.status = "success";
                        this.fileList.push(file);
                        this.fileList = uniqBy(this.fileList, "url");
                        this.selectedCount++;

                        this.$forceUpdate();
                    })
                    .catch((err) => {
                        if (err.response.data.code) {
                            this.$message.error(`[${err.response.data.code}] ${err.response.data.message}`);
                        } else {
                            this.$message.error("请求异常");
                        }

                        file.status = "fail";
                    });
            }
        },
        select: function (file) {
            if (file.status == "success") {
                file.selected = !file.selected;
                file.selected ? this.selectedCount++ : this.selectedCount--;
            }
        },
        buildHTML: function () {
            let list = [];
            this.fileList.forEach((file) => {
                if (file.selected) {
                    file.is_img
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
            this.fileList.forEach((file, i) => {
                this.fileList[i].selected = false;
            });
            this.selectedCount = 0;
        },
        clear: function () {
            this.$refs.uploadbox.clearFiles();
            this.fileList = [];
        },
        removeFile: function (fileList, uid) {
            fileList.forEach((file, i) => {
                if (file.uid == uid) {
                    fileList.splice(i, 1);
                }
            });
        },
        isImage(file) {
            let ext = file.name.split(".").pop();
            return imgtypes.includes(ext);
        },
        closeUpload() {
            this.fileList = [];
            this.$refs.uploadbox.clearFiles();
        },
    },
};
</script>

<style lang="less">
@import "../assets/css/upload.less";
</style>
