/*
 * @Author: iRuxu
 * @Date: 2026-01-04
 * @LastEditTime: 2026-01-04
 * @Description:config
 */
const path = require("path");
const { spawn } = require("child_process");

let chokidar = null;
try {
    chokidar = require("chokidar");
} catch (e) {
    chokidar = null;
}

class RunBuildOnCssChangePlugin {
    constructor(options = {}) {
        this.paths = options.paths || [];
        this.debounceMs = Number.isFinite(options.debounceMs) ? options.debounceMs : 400;
        this.command = options.command || ["npm", ["run", "build"]];
        this.enabled = options.enabled !== false;
    }

    apply() {
        if (!this.enabled) return;
        if (!process.env.WEBPACK_SERVE) return;
        if (!chokidar) return;

        const watchTargets = this.paths.filter(Boolean);
        if (!watchTargets.length) return;

        let timer = null;
        let running = false;
        let queued = false;

        const run = () => {
            if (running) {
                queued = true;
                return;
            }

            running = true;
            queued = false;

            const npmBin = process.platform === "win32" ? "npm.cmd" : "npm";
            const [cmd, args] = this.command;
            const realCmd = cmd === "npm" ? npmBin : cmd;

            const child = spawn(realCmd, args, {
                stdio: "inherit",
                env: process.env,
            });

            child.on("exit", () => {
                running = false;
                if (queued) run();
            });
        };

        const schedule = () => {
            if (timer) clearTimeout(timer);
            timer = setTimeout(run, this.debounceMs);
        };

        const watcher = chokidar.watch(watchTargets, {
            ignoreInitial: true,
        });

        watcher.on("add", schedule);
        watcher.on("change", schedule);
        watcher.on("unlink", schedule);
    }
}

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

    configureWebpack: {
        plugins: [
            new RunBuildOnCssChangePlugin({
                paths: [path.resolve(__dirname, "src/assets/css")],
                command: ["npm", ["run", "build"]],
                debounceMs: 500,
            }),
        ],
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
