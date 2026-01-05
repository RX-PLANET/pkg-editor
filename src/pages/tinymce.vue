<template>
    <div>
        <Tinymce
            v-model="content"
            height="800"

            :tinymceUploadFn="tinymceUploadFn"
            :tinymceCdnDomain="tinymceCdnDomain"

            :attachmentEnable="true"
            :uploadFn="uploadFn"
            :uploadDomain="uploadDomain"
        />
    </div>
</template>

<script>
import Tinymce from "../components/Tinymce.vue";
export default {
    name: "T",
    data: function () {
        return {
            content: "",
            domain: "https://cdn.iruxu.com",
            uploadUrl: "https://dev.api.iruxu.com/api/cms/admin/upload/tinymce",
        };
    },
    components: {
        Tinymce,
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
</style>
