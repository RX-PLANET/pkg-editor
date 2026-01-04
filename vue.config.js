/*
 * @Author: iRuxu
 * @Date: 2026-01-04
 * @LastEditTime: 2026-01-04
 * @Description:config
 */
const path = require("path");
module.exports = {
    //❤️ Multiple pages ~
    pages: {
        index:{
            title: "导航",
            entry: "src/pages/index.js",
            template: "public/index.html",
            filename: "index.html",
        },
        article: {
            title: "Article渲染",
            entry: "src/pages/article.js",
            template: "public/article.html",
            filename: "article/index.html",
        },
        tinymce: {
            title: "Tinymce编辑器",
            entry: "src/pages/tinymce.js",
            template: "public/tinymce.html",
            filename: "tinymce/index.html",
        },
    },

    //⚛️ Proxy ~
    devServer: {
        proxy: {
        },
    },

    //❤️ Webpack configuration
    chainWebpack: (config) => {

        //💝 in-line small imgs ~
        config.module.rule("images").set("parser", {
            dataUrlCondition: {
                maxSize: 4 * 1024, // 4KiB
            },
        });

        //💝 in-line svg imgs ~
        config.module.rule("vue").use("vue-svg-inline-loader").loader("vue-svg-inline-loader");

        //💖 import common less var * mixin ~
        const types = ["vue-modules", "vue", "normal-modules", "normal"];
        types.forEach((type) => addStyleResource(config.module.rule("less").oneOf(type)));
    },
};

function addStyleResource(rule) {
    var preload_styles = [];
    preload_styles.push(
        path.resolve(__dirname, "./node_modules/csslab/base.less"),
        path.resolve(__dirname, "./assets/css/var.less")
    );
    rule.use("style-resource").loader("style-resources-loader").options({
        patterns: preload_styles,
    });
}
