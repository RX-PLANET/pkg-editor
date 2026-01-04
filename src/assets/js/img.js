import { load } from "cheerio";

function joinDomain(domain, path) {
    const d = String(domain || "").replace(/\/+$/, "");
    const p = String(path || "").replace(/^\/+/, "/");
    return d ? d + p : path;
}

function isAbsoluteLike(src) {
    // 不需要拼 domain 的情况
    return (
        /^(https?:)?\/\//i.test(src) ||
        /^(data:|blob:|mailto:|tel:|javascript:)/i.test(src)
    );
}

function normalizeImgSrc(src, domain) {
    const s = String(src || "").trim();
    if (!s || !domain) return s;
    if (isAbsoluteLike(s)) return s;

    // 最常见：/uploads/xxx
    if (s.startsWith("/")) return joinDomain(domain, s);

    // 其它相对路径：uploads/a.png、./a.png
    // 用 URL 做更准确的拼接（domain 需要是带协议的，如 https://cdn.xxx.com）
    try {
        if (/^https?:\/\//i.test(domain)) {
            const base = domain.endsWith("/") ? domain : domain + "/";
            return new URL(s, base).toString();
        }
    } catch {
        console.warn("URL 拼接图片路径失败：", domain, s);
    }

    // 兜底：简单拼到根路径
    return joinDomain(domain, "/" + s.replace(/^\.\/+/, ""));
}

/**
 * @param {string} html 富文本HTML
 * @param {string} domain 可选：CDN/站点域名（如 https://cdn.xxx.com）
 */
export default function lazyLoad(html, domain = "") {
    if (!html) return html;

    const $ = load(`<root>${html}</root>`, { decodeEntities: false });

    $("img").each((_, el) => {
        const img = $(el);

        // 固定懒加载：无论如何都加/覆盖
        img.attr("loading", "lazy");

        // 只有传了 domain 才处理 src 拼接
        if (domain) {
            const src = img.attr("src");
            if (src) img.attr("src", normalizeImgSrc(src, domain));

            // 如果你有用 data-src 之类，也可以一起处理（可删）
            const dataSrc = img.attr("data-src");
            if (dataSrc) img.attr("data-src", normalizeImgSrc(dataSrc, domain));
        }
    });

    return $("root").html() || "";
}
