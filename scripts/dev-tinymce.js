const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawn } = require("child_process");

const root = path.resolve(__dirname, "..");
const envPath = path.join(root, ".env");
const tinymceDir = path.join(root, "tinymce");
const tmpRoot = path.join(os.tmpdir(), "pkg-editor-dev-tinymce");

function loadEnv(file) {
    if (!fs.existsSync(file)) return;

    const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
    lines.forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) return;

        const index = trimmed.indexOf("=");
        if (index === -1) return;

        const key = trimmed.slice(0, index).trim();
        const value = trimmed
            .slice(index + 1)
            .trim()
            .replace(/^['"]|['"]$/g, "");

        if (key && process.env[key] === undefined) process.env[key] = value;
    });
}

function normalizePath(value) {
    return String(value || "")
        .trim()
        .replace(/\\/g, "/")
        .replace(/\/+$/, "");
}

function getPort(cdnRoot) {
    try {
        const url = new URL(cdnRoot);
        return url.port || (url.protocol === "https:" ? "443" : "80");
    } catch (error) {
        return process.env.VUE_APP_TINYMCE_PORT || "5120";
    }
}

function setupServeRoot(tinymcePath) {
    fs.rmSync(tmpRoot, { force: true, recursive: true });
    fs.mkdirSync(tmpRoot, { recursive: true });

    const normalizedPath = normalizePath(tinymcePath).replace(/^\/+/, "");
    const linkPath = normalizedPath ? path.join(tmpRoot, normalizedPath) : tmpRoot;

    fs.mkdirSync(path.dirname(linkPath), { recursive: true });
    fs.symlinkSync(tinymceDir, linkPath, "dir");
}

loadEnv(envPath);
process.env.NODE_ENV = "development";

const GlobalConf = require(path.join(root, "config/global.js"));
const tinymcePath = normalizePath(GlobalConf.tinymcePath);
const port = getPort(GlobalConf.cdnRoot);

setupServeRoot(tinymcePath);

const urlPath = tinymcePath || "";
console.log(`Tinymce dev server: http://localhost:${port}${urlPath}/tinymce.min.js`);

const child = spawn("npx", ["serve", "-l", port, tmpRoot], {
    cwd: root,
    stdio: "inherit",
});

child.on("exit", (code, signal) => {
    if (signal) process.kill(process.pid, signal);
    process.exit(code || 0);
});
