import sanitizeHtml from "sanitize-html";

const FORBID = new Set(["script", "object", "embed", "applet", "base", "meta", "link"]);

export default function sanitizeRichText(html) {
    if (!html) return html;

    return sanitizeHtml(html, {
        disallowedTagsMode: "discard",

        // 关键：标签白名单（在默认基础上禁掉危险标签）
        allowedTags: sanitizeHtml.defaults.allowedTags.filter(t => !FORBID.has(t)),

        allowedAttributes: {
            "*": ["class", "style", "title", "id", "data-*"],
            a: ["href", "target", "rel", "title", "class", "style"],
            img: ["src", "alt", "title", "width", "height", "class", "style", "loading", "decoding"],
        },

        allowedSchemes: ["http", "https", "mailto", "tel"],
        allowProtocolRelative: false,
        allowedSchemesByTag: { img: ["http", "https", "data"] },

        transformTags: {
            "*": (tagName, attribs) => {
                const out = { ...attribs };

                // 移除 on*
                for (const k of Object.keys(out)) if (/^on/i.test(k)) delete out[k];

                // 清理 style 里的 @import / url(
                if (typeof out.style === "string" && out.style) {
                    let s = out.style;
                    s = s.replace(/@import\s+[^;]+;?/gi, "");
                    s = s.replace(/url\s*\(\s*[^)]+\s*\)/gi, "");
                    s = s.replace(/;;+/g, ";").trim();
                    if (!s) delete out.style;
                    else out.style = s;
                }

                // 兜底禁 javascript:
                for (const key of ["href", "src"]) {
                    if (out[key] && /^\s*javascript:/i.test(out[key])) out[key] = "";
                }

                // 仅允许 data:image/*
                if (tagName === "img" && typeof out.src === "string" && out.src.startsWith("data:")) {
                    if (!/^data:image\/(png|jpe?g|gif|webp|avif|bmp|svg\+xml);/i.test(out.src)) {
                        out.src = "";
                    }
                }

                return { tagName, attribs: out };
            },
        },
    });
}
