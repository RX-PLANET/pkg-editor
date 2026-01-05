<template>
    <div>
        <Tinymce
            v-model="content"

            :tinymceUploadFn="uploadFn"
            :tinymceAssetsDomain="domain"

            :attachmentEnable="true"
            :attachmentUploadFn="uploadFn"
            :attachmentCdnDomain="domain"
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
            domain: "https://cdn.2kog.com",
            uploadUrl: "https://dev.api.iruxu.com/api/cms/admin/upload/tinymce",
        };
    },
    components: {
        Tinymce,
    },
    methods:{
        uploadFn(){

        }
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
