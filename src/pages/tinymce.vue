<template>
    <div>
        <Tinymce
            v-model="content"

            :upload="uploadFn"
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
