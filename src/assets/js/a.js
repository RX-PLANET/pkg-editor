// formatLink.js
import { load } from "cheerio";

/** 规范化 whitelist：统一小写、去空格、允许传入带协议的域名 */
function normalizeWhitelist(list = []) {
  return (Array.isArray(list) ? list : [])
    .map((x) => String(x || "").trim().toLowerCase())
    .filter(Boolean)
    .map((x) => {
      // 允许用户写 https://xxx.com
      try {
        if (/^https?:\/\//i.test(x)) return new URL(x).hostname.toLowerCase();
      } catch {
        console.warn(`formatLink: 无法解析 whitelist 域名 "${x}"，已忽略该项`);
      }
      return x;
    });
}

/** 是否相对链接（默认认为站内，视为白名单） */
function isRelativeHref(href = "") {
  const s = href.trim();
  if (!s) return true;
  if (s.startsWith("#") || s.startsWith("?") || s.startsWith("/")) return true;
  if (s.startsWith("./") || s.startsWith("../")) return true;
  // 没有 scheme 且不是 //xxx，通常是相对路径（如 a/b）
  return !/^[a-zA-Z][a-zA-Z0-9+\-.]*:/.test(s) && !s.startsWith("//");
}

/** 从 href 里提取 hostname（只处理 http/https/协议相对 //） */
function getHostnameFromHref(href = "") {
  const s = href.trim();
  if (!s) return "";

  if (s.startsWith("//")) {
    try {
      return new URL("https:" + s).hostname.toLowerCase();
    } catch {
      return "";
    }
  }

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
 * whitelist 规则：
 * - "xxx.com" 只匹配根域
 * - "*.xxx.com" 只匹配子域（a.xxx.com），不匹配根域（xxx.com）
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

/**
 * @param {string} html - HTML 字符串（可为片段）
 * @param {string[]} whitelist - 例如 ["xxx.com", "*.xxx.com"]
 * @param {boolean} strict - true 时，非白名单链接 href 强制置空
 */
export default function formatLink(html, whitelist = [], strict = false) {
  if (!html) return html;

  const wl = normalizeWhitelist(whitelist);
  const hasWhitelist = wl.length > 0;

  // cheerio 用 root 包一下，保证片段也能正常选取
  const $ = load(`<root>${html}</root>`, { decodeEntities: false });

  $("a[href]").each((_, el) => {
    const a = $(el);
    const hrefRaw = a.attr("href") ?? "";
    const href = String(hrefRaw).trim();
    if (!href) return;

    // markdown 锚点：强制 _self
    if (href.startsWith("#")) {
      a.attr("target", "_self");
      return;
    }

    // 安全兜底：javascript: 一律干掉
    if (/^javascript:/i.test(href)) {
      a.attr("href", "");
      return;
    }

    // mailto/tel 等不参与白名单判断（你也可以按 strict 强行置空，这里先按常见做法放行）
    if (/^(mailto:|tel:|sms:)/i.test(href)) {
      return;
    }

    // 相对链接默认视为站内
    let isWhite = true;

    if (!isRelativeHref(href)) {
      const host = getHostnameFromHref(href);
      isWhite = matchHost(host, wl);
    } else {
      isWhite = true;
    }

    // 只有设置了 whitelist 才触发“非白名单处理”
    if (hasWhitelist && !isWhite) {
      if (strict) {
        a.attr("href", "");
        return;
      }

      // 如果本身就是 _blank，就不管；否则强制 _blank
      const target = String(a.attr("target") || "").toLowerCase();
      if (target !== "_blank") {
        a.attr("target", "_blank");
      }
    }
  });

  // 取出 root 里原始内容
  return $("root").html() || "";
}
