<template>
    <div>
        <ArticleRender
            :content="content"
            directorybox="#directory"
            style="padding: 20px"
            @contentRendered="test1"
            @directoryRendered="test2"
            :domain="domain"
        ></ArticleRender>
        <div id="directory"></div>
    </div>
</template>

<script>
import ArticleRender from "../src/Article.vue";
import demohtml from "../demo/content_1";

export default {
    name: "APage",
    props: [],
    data: function () {
        return {
            content: demohtml,
            domain: "https://cdn.iruxu.com",
        };
    },
    components: {
        ArticleRender,
    },
    methods: {
        test1() {
            console.log("contentRendered");
        },
        test2() {
            console.log("directoryRendered");
        },
    },
};
</script>

<style lang="less">
html {
    padding: 20px;
}
</style>
