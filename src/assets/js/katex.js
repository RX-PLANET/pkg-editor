import $ from 'jquery';
import katex from 'katex';
import 'katex/dist/katex.min.css';

function renderKatexBlock(selector = ".w-latex") {
    try {
        // eslint-disable-next-line no-unused-vars
        $(selector).each(function(i, ele) {
            let $katex = $(this);

            // 获取原始HTML内容
            let raw = $katex.html();

            // 处理各种换行组合：
            // 1. \\<br /> 或 \\<br> -> \\
            raw = raw.replace(/\\\\\s*<br\s*\/?>/gi, '\\\\');
            // 2. \<br /> 或 \<br> -> \\
            raw = raw.replace(/\\\s*<br\s*\/?>/gi, '\\\\');
            // 3. 单独的 <br /> -> \\
            raw = raw.replace(/<br\s*\/?>/gi, '\\\\');

            // 移除其他HTML标签但保留内容
            raw = raw.replace(/<[^>]+>/g, '');

            // 解码HTML实体（如 &nbsp; -> 空格）
            raw = $('<div>').html(raw).text();

            // 清理多余的空白字符
            raw = raw.trim();

            console.log('Original HTML:', $katex.html());
            console.log('Processed LaTeX:', raw);

            katex.render(raw, $katex.get(0), { displayMode: true });
        });
    } catch (e) {
        console.error('KaTeX render error:', e);
        console.error('Failed content:', $(this).html());
    }
}

function renderKatexInline(container = document.body) {
    // 支持 \(...\) 和 $...$ 两种行内语法
    // 改进正则表达式，更好地匹配单美元符号
    const inlineRegex = /(\\\((.+?)\\\)|\$([^$]+?)\$)/g;

    const walker = document.createTreeWalker(
        container,
        NodeFilter.SHOW_TEXT,
        {
            acceptNode: function (node) {
                if (
                    node.parentNode &&
                    !node.parentNode.closest("pre") &&
                    (node.nodeValue.includes("\\(") || node.nodeValue.includes("$"))
                ) {
                    return NodeFilter.FILTER_ACCEPT;
                }
                return NodeFilter.FILTER_REJECT;
            },
        }
    );

    const nodesToReplace = [];
    while (walker.nextNode()) {
        nodesToReplace.push(walker.currentNode);
    }

    console.log('Inline processing nodes:', nodesToReplace.length);

    nodesToReplace.forEach((node) => {
        const text = node.nodeValue;
        const frag = document.createDocumentFragment();
        let lastIndex = 0;
        let match;

        console.log('Processing text:', text);

        while ((match = inlineRegex.exec(text))) {
            const fullMatch = match[0];
            const parenContent = match[2]; // \(...\)的内容
            const dollarContent = match[3]; // $...$的内容
            const raw = parenContent || dollarContent;
            const matchStart = match.index;

            console.log('Found inline match:', fullMatch, 'Raw:', raw);

            // 添加匹配前文本
            frag.appendChild(document.createTextNode(text.slice(lastIndex, matchStart)));

            try {
                const span = document.createElement("span");
                // 处理JavaScript字符串中的双反斜杠转义
                const processedRaw = raw.replace(/\\\\/g, '\\');
                console.log('Rendering inline:', processedRaw);
                // 添加更多选项确保正确渲染
                span.innerHTML = katex.renderToString(processedRaw, {
                    displayMode: false,
                    throwOnError: false,
                    strict: false,
                    trust: true
                });
                frag.appendChild(span);
            } catch (e) {
                frag.appendChild(document.createTextNode(fullMatch));
                console.error("Inline render error:", raw, e);
            }

            lastIndex = inlineRegex.lastIndex;
        }

        // 剩余文本
        if (lastIndex < text.length) {
            frag.appendChild(document.createTextNode(text.slice(lastIndex)));
        }

        if (frag.hasChildNodes()) {
            node.parentNode.replaceChild(frag, node);
        }
    });
}

function renderKatexDisplayBlock(container = document.body) {
    // 支持 $$...$$ 和 \[...\] 两种块语法
    const blockRegex = /(\$\$\s*([\s\S]+?)\s*\$\$|\\\[\s*([\s\S]+?)\s*\\\])/g;

    const walker = document.createTreeWalker(
        container,
        NodeFilter.SHOW_TEXT,
        {
            acceptNode: function (node) {
                if (
                    node.parentNode &&
                    !node.parentNode.closest("pre") &&
                    (node.nodeValue.includes("$$") || node.nodeValue.includes("\\["))
                ) {
                    return NodeFilter.FILTER_ACCEPT;
                }
                return NodeFilter.FILTER_REJECT;
            },
        }
    );

    const nodesToReplace = [];
    while (walker.nextNode()) {
        nodesToReplace.push(walker.currentNode);
    }

    nodesToReplace.forEach((node) => {
        const text = node.nodeValue;
        const frag = document.createDocumentFragment();
        let lastIndex = 0;
        let match;

        while ((match = blockRegex.exec(text))) {
            const fullMatch = match[0];
            const dollarContent = match[2]; // $$...$$的内容
            const bracketContent = match[3]; // \[...\]的内容
            const raw = dollarContent || bracketContent;
            const matchStart = match.index;

            // 添加匹配前文本
            frag.appendChild(document.createTextNode(text.slice(lastIndex, matchStart)));

            try {
                const div = document.createElement("div");
                // 处理JavaScript字符串中的双反斜杠转义
                const processedRaw = raw.replace(/\\\\/g, '\\');
                div.innerHTML = katex.renderToString(processedRaw, { displayMode: true });
                frag.appendChild(div);
            } catch (e) {
                frag.appendChild(document.createTextNode(fullMatch));
                console.error("Block render error:", raw, e);
            }

            lastIndex = blockRegex.lastIndex;
        }

        // 添加剩余文本
        if (lastIndex < text.length) {
            frag.appendChild(document.createTextNode(text.slice(lastIndex)));
        }

        node.parentNode.replaceChild(frag, node);
    });
}

export default function renderKatexAll(container = document.body) {
    renderKatexBlock(".w-latex");
    renderKatexDisplayBlock(container);
    renderKatexInline(container);
}
