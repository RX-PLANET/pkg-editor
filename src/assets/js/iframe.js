// iframeFilter.js
import { load } from "cheerio";

function normalizeWhitelist(list = []) {
    return (Array.isArray(list) ? list : [])
        .map((x) => String(x || "").trim().toLowerCase())
        .filter(Boolean)
        .map((x) => {
            // 允许传入带协议的，如 https://docs.qq.com
            try {
                if (/^https?:\/\//i.test(x)) return new URL(x).hostname.toLowerCase();
            } catch {
                console.warn(`iframeFilter: 无法解析 whitelist 域名 "${x}"，已忽略该项`);
            }
            return x;
        });
}

/**
 * 规则：
 * - "docs.qq.com" 精确匹配
 * - "*.qq.com" 只匹配子域（a.qq.com），不匹配根域（qq.com）
 */
function matchHost(hostname, whitelist) {
    const host = (hostname || "").toLowerCase();
    if (!host) return false;

    for (const rule of whitelist) {
        if (!rule) continue;

        if (rule.startsWith("*.")) {
            const root = rule.slice(2);
            if (root && host.endsWith("." + root)) return true;
            continue;
        }

        if (host === rule) return true;
    }
    return false;
}

function normalizeSrcForParse(src = "") {
    const s = src.trim();
    if (!s) return "";
    // 协议相对：//xxx.com/...
    if (s.startsWith("//")) return "https:" + s;
    return s;
}

function getHostnameFromSrc(src = "") {
    const s = normalizeSrcForParse(src);
    if (!s) return "";

    // 只对白名单校验 http/https 或 // 这种
    if (/^https?:\/\//i.test(s)) {
        try {
            return new URL(s).hostname.toLowerCase();
        } catch {
            return "";
        }
    }
    return "";
}

/**
 * @param {string} html - 含 iframe 的 HTML 字符串（片段也行）
 * @param {string[]} whitelist - 域名白名单，支持 "*.qq.com"
 * @param {object} [options]
 * @param {boolean} [options.keepNonHttpSrc=false] - src 不是 http/https（如 about:blank、data:）是否保留
 */
export default function iframeFilter(html, whitelist, options = {}) {
    if (!html) return html;

    const { keepNonHttpSrc = false } = options;

    // 没传 whitelist 或传空数组，都视为“不启用白名单过滤”
    const wl = normalizeWhitelist(whitelist || []);
    const enableWhitelist = wl.length > 0;

    const $ = load(`<root>${html}</root>`, { decodeEntities: false });

    $("iframe").each((_, el) => {
        const iframe = $(el);
        const srcRaw = iframe.attr("src") ?? "";
        const src = String(srcRaw).trim();
        if (!src) return;

        // 不启用过滤：直接放行（可选：仍然处理非 http src）
        if (!enableWhitelist) {
            if (!keepNonHttpSrc) {
                const isHttpLike = src.startsWith("//") || /^https?:\/\//i.test(src);
                if (!isHttpLike) iframe.attr("src", "");
            }
            return;
        }

        // ======= 启用白名单过滤的逻辑（和之前一样） =======
        const isHttpLike = src.startsWith("//") || /^https?:\/\//i.test(src);
        if (!isHttpLike) {
            if (!keepNonHttpSrc) iframe.attr("src", "");
            return;
        }

        const host = getHostnameFromSrc(src);
        const ok = matchHost(host, wl);

        if (!ok) iframe.attr("src", "");
        else iframe.attr("src", src);
    });

    return $("root").html() || "";
}
